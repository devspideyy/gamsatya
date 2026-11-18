/*
  GramSatya sensor node for ESP32
  --------------------------------
  Reads one village sensor, signs the reading with HMAC-SHA256 and sends it
  to the GramSatya server (POST /api/ingest). The server rejects any reading
  whose signature does not match, so fake devices cannot add data.

  Board: "ESP32 Dev Module" (Arduino IDE, ESP32 core by Espressif)
  No extra libraries needed: WiFi, HTTPClient and mbedtls ship with the ESP32 core.

  Wiring
    Tank or bin level  JSN-SR04T ultrasonic   TRIG -> GPIO 5, ECHO -> GPIO 18 (use a divider on ECHO), 5V, GND
    Handpump flow      YF-S201 flow sensor    signal -> GPIO 27, 5V, GND
    Streetlight        ACS712 or LDR divider  analog out -> GPIO 34

  No Wi-Fi in the village? Replace sendHttp() with a LoRa send (SX1278 + the
  "LoRa" library by Sandeep Mistry) to a gateway at the panchayat office, which
  forwards the same signed JSON to /api/ingest. The signature stays valid end to end.
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <time.h>
#include "mbedtls/md.h"

// ---------- Configure these ----------
const char* WIFI_SSID     = "YOUR_WIFI";
const char* WIFI_PASS     = "YOUR_PASSWORD";
const char* SERVER_URL    = "http://192.168.1.10:3000/api/ingest";  // laptop IP when running `npm run dev`, or your https Vercel URL
const char* DEVICE_SECRET = "gramsatya-demo-secret";                // must match DEVICE_SECRET on the server
const char* DEVICE_ID     = "node-07";
const char* SENSOR_ID     = "radhaganj-handpump-1";                 // copy from the Devices page

#define KIND_TANK        1
#define KIND_HANDPUMP    2
#define KIND_STREETLIGHT 3
#define KIND_BIN         4
#define SENSOR_KIND      KIND_HANDPUMP

const unsigned long SEND_EVERY_MS = 10000;
const float CONTAINER_DEPTH_CM = 150.0;  // sensor to bottom of tank or bin
// -------------------------------------

const int TRIG_PIN = 5, ECHO_PIN = 18, FLOW_PIN = 27, LIGHT_PIN = 34;
volatile unsigned long flowPulses = 0;
unsigned long lastSend = 0;

void IRAM_ATTR onFlowPulse() { flowPulses++; }

String hmacSha256(const char* key, const String& msg) {
  unsigned char out[32];
  mbedtls_md_context_t ctx;
  mbedtls_md_init(&ctx);
  mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(MBEDTLS_MD_SHA256), 1);
  mbedtls_md_hmac_starts(&ctx, (const unsigned char*)key, strlen(key));
  mbedtls_md_hmac_update(&ctx, (const unsigned char*)msg.c_str(), msg.length());
  mbedtls_md_hmac_finish(&ctx, out);
  mbedtls_md_free(&ctx);
  char hex[65];
  for (int i = 0; i < 32; i++) sprintf(hex + i * 2, "%02x", out[i]);
  hex[64] = 0;
  return String(hex);
}

float readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(20);
  digitalWrite(TRIG_PIN, LOW);
  unsigned long us = pulseIn(ECHO_PIN, HIGH, 30000);
  return us == 0 ? -1 : us * 0.0343 / 2.0;
}

float readValue() {
#if SENSOR_KIND == KIND_TANK
  float d = readDistanceCm();                       // tank: % full
  if (d < 0) return 0;
  return constrain((CONTAINER_DEPTH_CM - d) / CONTAINER_DEPTH_CM * 100.0, 0, 100);
#elif SENSOR_KIND == KIND_BIN
  float d = readDistanceCm();                       // bin: % full
  if (d < 0) return 0;
  return constrain((CONTAINER_DEPTH_CM - d) / CONTAINER_DEPTH_CM * 100.0, 0, 100);
#elif SENSOR_KIND == KIND_HANDPUMP
  noInterrupts();                                   // YF-S201: L/min = pulse Hz / 7.5
  unsigned long pulses = flowPulses; flowPulses = 0;
  interrupts();
  float hz = pulses / (SEND_EVERY_MS / 1000.0);
  return hz / 7.5;
#elif SENSOR_KIND == KIND_STREETLIGHT
  int raw = analogRead(LIGHT_PIN);                  // calibrate the threshold for your lamp
  return raw > 1500 ? 18.0 : 0.0;                   // watts drawn: about 18 W when on
#endif
}

bool sendHttp(const String& body) {
  HTTPClient http;
  bool https = String(SERVER_URL).startsWith("https");
  WiFiClientSecure secure;
  if (https) { secure.setInsecure(); http.begin(secure, SERVER_URL); }  // prototype only: pin the certificate in production
  else { http.begin(SERVER_URL); }
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(body);
  Serial.printf("POST %d %s\n", code, http.getString().c_str());
  http.end();
  return code == 200;
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(FLOW_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FLOW_PIN), onFlowPulse, FALLING);

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.printf("\nConnected, IP %s\n", WiFi.localIP().toString().c_str());

  configTime(0, 0, "pool.ntp.org", "time.google.com");  // UTC epoch for the signed timestamp
  while (time(nullptr) < 1700000000) delay(200);
}

void loop() {
  if (millis() - lastSend < SEND_EVERY_MS) return;
  lastSend = millis();

  float value = readValue();
  long ts = (long)time(nullptr);
  String v = String(value, 2);
  String msg = String(DEVICE_ID) + "|" + SENSOR_ID + "|" + v + "|" + String(ts);
  String sig = hmacSha256(DEVICE_SECRET, msg);

  String body = String("{\"deviceId\":\"") + DEVICE_ID + "\",\"sensorId\":\"" + SENSOR_ID +
                "\",\"value\":" + v + ",\"ts\":" + String(ts) + ",\"sig\":\"" + sig + "\"}";
  if (WiFi.status() == WL_CONNECTED) sendHttp(body);
  else WiFi.reconnect();
}
