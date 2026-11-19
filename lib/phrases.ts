// Bengali and Hindi for every user-facing phrase. English text is the key.
// L() returns the phrase in the current language and falls back to English.
import type { Village } from "./data";
import type { Lang } from "./types";

let current: Lang = "en";
/** Called by SimProvider on every render, so L() always follows the language picker. */
export function setPhraseLang(l: Lang) { current = l; }
export function phraseLang() { return current; }

const P: Record<string, { bn: string; hi: string }> = {
 "Listen in English": {
  "bn": "ইংরেজিতে শুনুন",
  "hi": "अंग्रेज़ी में सुनें"
 },
 "River gauges": {
  "bn": "নদীর জলমাপক",
  "hi": "नदी जलमापी"
 },
 "Storm surge running: the water rises every 4 seconds and should cross the line in about 20 seconds.": {
  "bn": "ঝড়ের জলোচ্ছ্বাস চলছে: প্রতি ৪ সেকেন্ডে জল বাড়ছে, প্রায় ২০ সেকেন্ডে বিপদসীমা পেরোবে।",
  "hi": "तूफ़ानी लहर चल रही है: हर 4 सेकंड में पानी बढ़ता है, लगभग 20 सेकंड में ख़तरे की रेखा पार होगी।"
 },
 "Send an alert": {
  "bn": "সতর্কবার্তা পাঠান",
  "hi": "चेतावनी भेजें"
 },
 "Send to": {
  "bn": "কাকে পাঠাবেন",
  "hi": "किसे भेजें"
 },
 "Message in Bengali (you can edit it)": {
  "bn": "বাংলায় বার্তা (বদলাতে পারেন)",
  "hi": "बांग्ला में संदेश (आप बदल सकते हैं)"
 },
 "Listen first": {
  "bn": "আগে শুনুন",
  "hi": "पहले सुनें"
 },
 "None yet. Send one above, or start the storm simulation and watch the river gauge send one by itself.": {
  "bn": "এখনও নেই। উপরে থেকে পাঠান, বা ঝড়ের সিমুলেশন চালান, নদীর জলমাপক নিজেই পাঠাবে।",
  "hi": "अभी कोई नहीं। ऊपर से भेजें, या तूफ़ान सिमुलेशन चलाएँ और नदी जलमापी खुद भेजेगा।"
 },
 "No SOS messages. Villagers can send one from the citizen view, even over radio.": {
  "bn": "কোনো জরুরি বার্তা নেই। গ্রামবাসী নাগরিক পাতা থেকে পাঠাতে পারেন, রেডিওতেও।",
  "hi": "कोई SOS नहीं। गाँव वाले नागरिक पेज से भेज सकते हैं, रेडियो से भी।"
 },
 "Mark help sent": {
  "bn": "সাহায্য পাঠানো হয়েছে",
  "hi": "मदद भेजी गई"
 },
 "Help sent": {
  "bn": "সাহায্য পাঠানো হয়েছে",
  "hi": "मदद भेजी गई"
 },
 "Disaster alerts": {
  "bn": "দুর্যোগ সতর্কতা",
  "hi": "आपदा चेतावनी"
 },
 "Alert type": {
  "bn": "সতর্কতার ধরন",
  "hi": "चेतावनी का प्रकार"
 },
 "Alerts for your village": {
  "bn": "আপনার গ্রামের সতর্কবার্তা",
  "hi": "आपके गाँव की चेतावनियाँ"
 },
 "No alerts right now.": {
  "bn": "এখন কোনো সতর্কবার্তা নেই।",
  "hi": "अभी कोई चेतावनी नहीं।"
 },
 "If a storm or flood is coming, the warning shows here and plays on the sirens.": {
  "bn": "ঝড় বা বন্যা এলে সতর্কবার্তা এখানে দেখাবে এবং সাইরেনে বাজবে।",
  "hi": "तूफ़ान या बाढ़ आने पर चेतावनी यहाँ दिखेगी और सायरन पर बजेगी।"
 },
 "Need help now?": {
  "bn": "এখনই সাহায্য দরকার?",
  "hi": "अभी मदद चाहिए?"
 },
 "Your SOS goes to the panchayat office, over radio if the mobile network is down.": {
  "bn": "আপনার বার্তা পঞ্চায়েত অফিসে যাবে, নেটওয়ার্ক না থাকলে রেডিওতে।",
  "hi": "आपका SOS पंचायत कार्यालय जाएगा, नेटवर्क न हो तो रेडियो से।"
 },
 "What happened and where are you? (optional)": {
  "bn": "কী হয়েছে, কোথায় আছেন? (ঐচ্ছিক)",
  "hi": "क्या हुआ और आप कहाँ हैं? (वैकल्पिक)"
 },
 "Send SOS": {
  "bn": "জরুরি সাহায্য চান",
  "hi": "मदद माँगें"
 },
 "Your SOS reached the panchayat office.": {
  "bn": "আপনার বার্তা পঞ্চায়েত অফিসে পৌঁছেছে।",
  "hi": "आपका SOS पंचायत कार्यालय पहुँच गया।"
 },
 "Water-level sensors on ponds and check dams built under MGNREGA and Amrit Sarovar.": {
  "bn": "MGNREGA ও অমৃত সরোবরে তৈরি পুকুর ও চেক ড্যামে জলস্তর সেন্সর।",
  "hi": "मनरेगा और अमृत सरोवर में बने तालाबों और चेक डैम पर जल-स्तर सेंसर।"
 },
 "Structure": {
  "bn": "কাঠামো",
  "hi": "संरचना"
 },
 "Now": {
  "bn": "এখন",
  "hi": "अभी"
 },
 "Last 12 months": {
  "bn": "শেষ ১২ মাস",
  "hi": "पिछले 12 महीने"
 },
 "Cost": {
  "bn": "খরচ",
  "hi": "लागत"
 },
 "Cost per month with water": {
  "bn": "জল থাকা প্রতি মাসের খরচ",
  "hi": "पानी वाले हर महीने की लागत"
 },
 "Social audit": {
  "bn": "সামাজিক নিরীক্ষা",
  "hi": "सामाजिक अंकेक्षण"
 },
 "Never held water": {
  "bn": "কখনও জল ধরেনি",
  "hi": "कभी पानी नहीं रुका"
 },
 "Each bar is one month, December to November. Below the dashed line (25% full) the structure counts as dry.": {
  "bn": "প্রতিটি দণ্ড এক মাস, ডিসেম্বর থেকে নভেম্বর। ড্যাশ রেখার নিচে (২৫%) কাঠামোটি শুকনো ধরা হয়।",
  "hi": "हर पट्टी एक महीना है, दिसंबर से नवंबर। डैश रेखा (25%) से नीचे संरचना सूखी मानी जाती है।"
 },
 "Map": {
  "bn": "মানচিত্র",
  "hi": "नक्शा"
 },
 "Did the money create something that lasts?": {
  "bn": "টাকায় কি টেকসই কিছু তৈরি হল?",
  "hi": "क्या पैसे से कुछ टिकाऊ बना?"
 },
 "Readings from devices": {
  "bn": "ডিভাইসের রিডিং",
  "hi": "उपकरणों की रीडिंग"
 },
 "Try it from this browser": {
  "bn": "এই ব্রাউজার থেকে চেষ্টা করুন",
  "hi": "इस ब्राउज़र से आज़माएँ"
 },
 "Start a virtual ESP32 on a broken sensor. It sends a signed reading every 5 seconds, and the village scorecard and ledger switch to its data.": {
  "bn": "একটি খারাপ সেন্সরে ভার্চুয়াল ESP32 চালু করুন। এটি প্রতি ৫ সেকেন্ডে স্বাক্ষরিত রিডিং পাঠাবে, স্কোরকার্ড ও খতিয়ান সেটাই ব্যবহার করবে।",
  "hi": "किसी ख़राब सेंसर पर वर्चुअल ESP32 चलाएँ। यह हर 5 सेकंड हस्ताक्षरित रीडिंग भेजेगा, स्कोरकार्ड और खाता उसी डेटा पर चलेंगे।"
 },
 "Send a forged reading": {
  "bn": "জাল রিডিং পাঠান",
  "hi": "नकली रीडिंग भेजें"
 },
 "No device has sent data yet. Start the virtual device above, run the device simulator, or flash the ESP32 firmware. Readings show up here within 5 seconds.": {
  "bn": "কোনো ডিভাইস এখনও তথ্য পাঠায়নি। উপরের ভার্চুয়াল ডিভাইস চালু করুন বা ESP32 ফার্মওয়্যার দিন। ৫ সেকেন্ডের মধ্যে রিডিং আসবে।",
  "hi": "अभी किसी उपकरण ने डेटा नहीं भेजा। ऊपर वर्चुअल उपकरण चलाएँ या ESP32 फ़र्मवेयर डालें। 5 सेकंड में रीडिंग दिखेगी।"
 },
 "Connect a real device": {
  "bn": "আসল ডিভাইস যুক্ত করুন",
  "hi": "असली उपकरण जोड़ें"
 },
 "Test without hardware": {
  "bn": "হার্ডওয়্যার ছাড়া পরীক্ষা",
  "hi": "बिना हार्डवेयर परीक्षण"
 },
 "From the project folder, run the device simulator. It signs readings exactly like the ESP32 does.": {
  "bn": "প্রজেক্ট ফোল্ডার থেকে ডিভাইস সিমুলেটর চালান। এটি ESP32-এর মতোই রিডিং স্বাক্ষর করে।",
  "hi": "प्रोजेक्ट फ़ोल्डर से डिवाइस सिम्युलेटर चलाएँ। यह ESP32 की तरह ही रीडिंग पर हस्ताक्षर करता है।"
 },
 "Copied": {
  "bn": "কপি হয়েছে",
  "hi": "कॉपी हुआ"
 },
 "Flash the ESP32": {
  "bn": "ESP32-এ ফার্মওয়্যার দিন",
  "hi": "ESP32 में फ़र्मवेयर डालें"
 },
 "Open": {
  "bn": "খুলুন",
  "hi": "खोलें"
 },
 "Watch it take over": {
  "bn": "দেখুন কীভাবে বদলায়",
  "hi": "देखें कैसे बदलता है"
 },
 "What a device sends": {
  "bn": "ডিভাইস কী পাঠায়",
  "hi": "उपकरण क्या भेजता है"
 },
 "Use the sensor ID in the firmware or simulator. Click an ID to copy it.": {
  "bn": "ফার্মওয়্যার বা সিমুলেটরে সেন্সর আইডি দিন। কপি করতে আইডিতে ক্লিক করুন।",
  "hi": "फ़र्मवेयर या सिम्युलेटर में सेंसर आईडी डालें। कॉपी करने के लिए आईडी पर क्लिक करें।"
 },
 "Sensor ID": {
  "bn": "সেন্সর আইডি",
  "hi": "सेंसर आईडी"
 },
 "Village": {
  "bn": "গ্রাম",
  "hi": "गाँव"
 },
 "Reading": {
  "bn": "রিডিং",
  "hi": "रीडिंग"
 },
 "Status": {
  "bn": "অবস্থা",
  "hi": "स्थिति"
 },
 "Source": {
  "bn": "উৎস",
  "hi": "स्रोत"
 },
 "ESP32 signed": {
  "bn": "ESP32 স্বাক্ষরিত",
  "hi": "ESP32 हस्ताक्षरित"
 },
 "Sensors and devices": {
  "bn": "সেন্সর ও ডিভাইস",
  "hi": "सेंसर और उपकरण"
 },
 "A sensor node is an ESP32 with one or two sensors and a small solar panel, about ₹2,000 to ₹3,000 in parts. It signs every reading, so a fake device cannot add data.": {
  "bn": "একটি সেন্সর নোড হল ESP32, এক-দুটি সেন্সর আর ছোট সোলার প্যানেল, খরচ প্রায় ₹২,০০০–৩,০০০। প্রতিটি রিডিং স্বাক্ষরিত, তাই জাল ডিভাইস তথ্য ঢোকাতে পারে না।",
  "hi": "एक सेंसर नोड में ESP32, एक-दो सेंसर और छोटा सोलर पैनल होता है, लगभग ₹2,000–3,000 का। हर रीडिंग पर हस्ताक्षर होता है, इसलिए नकली उपकरण डेटा नहीं डाल सकता।"
 },
 "Download CSR report (CSV)": {
  "bn": "CSR রিপোর্ট ডাউনলোড (CSV)",
  "hi": "CSR रिपोर्ट डाउनलोड (CSV)"
 },
 "Budget to allocate": {
  "bn": "বরাদ্দের বাজেট",
  "hi": "आवंटन का बजट"
 },
 "On hold until data is checked:": {
  "bn": "তথ্য যাচাই না হওয়া পর্যন্ত আটকে:",
  "hi": "डेटा जाँच तक रोका गया:"
 },
 "Where the money goes": {
  "bn": "টাকা কোথায় যাচ্ছে",
  "hi": "पैसा कहाँ जा रहा है"
 },
 "Bigger circle, bigger share. Ringed villages have money on hold.": {
  "bn": "বড় বৃত্ত মানে বেশি ভাগ। রিং দেওয়া গ্রামের টাকা আটকে আছে।",
  "hi": "बड़ा घेरा, बड़ा हिस्सा। घेरे वाले गाँवों का पैसा रुका है।"
 },
 "Score": {
  "bn": "স্কোর",
  "hi": "स्कोर"
 },
 "Release in full": {
  "bn": "পুরোটা ছাড়ুন",
  "hi": "पूरा जारी करें"
 },
 "Where should the next rupee go?": {
  "bn": "পরের টাকা কোথায় যাওয়া উচিত?",
  "hi": "अगला रुपया कहाँ जाना चाहिए?"
 },
 "Villages are ranked by verified need. If a village's data trust is below 70%, part of its money waits until a field check confirms the data.": {
  "bn": "যাচাই করা প্রয়োজন অনুযায়ী গ্রামের ক্রম। তথ্যের বিশ্বাসযোগ্যতা ৭০%-এর কম হলে, সরেজমিন যাচাই পর্যন্ত কিছু টাকা আটকে থাকে।",
  "hi": "गाँवों को सत्यापित ज़रूरत के हिसाब से क्रम दिया गया है। डेटा भरोसा 70% से कम हो तो कुछ पैसा ज़मीनी जाँच तक रुका रहता है।"
 },
 "Verify again": {
  "bn": "আবার যাচাই করুন",
  "hi": "फिर से जाँचें"
 },
 "Download audit (CSV)": {
  "bn": "নিরীক্ষা ডাউনলোড (CSV)",
  "hi": "ऑडिट डाउनलोड (CSV)"
 },
 "Simulate tampering": {
  "bn": "কারচুপি করে দেখুন",
  "hi": "छेड़छाड़ आज़माएँ"
 },
 "Restore from device copies": {
  "bn": "ডিভাইসের কপি থেকে ফেরান",
  "hi": "उपकरण की प्रतियों से बहाल करें"
 },
 "Register, newest first": {
  "bn": "নথি, নতুনটি আগে",
  "hi": "रजिस्टर, नया पहले"
 },
 "All villages": {
  "bn": "সব গ্রাম",
  "hi": "सभी गाँव"
 },
 "No.": {
  "bn": "নং",
  "hi": "क्र."
 },
 "Time": {
  "bn": "সময়",
  "hi": "समय"
 },
 "Sensor": {
  "bn": "সেন্সর",
  "hi": "सेंसर"
 },
 "Fingerprint": {
  "bn": "ফিঙ্গারপ্রিন্ট",
  "hi": "फ़िंगरप्रिंट"
 },
 "Check": {
  "bn": "যাচাই",
  "hi": "जाँच"
 },
 "ESP32, signed": {
  "bn": "ESP32, স্বাক্ষরিত",
  "hi": "ESP32, हस्ताक्षरित"
 },
 "Fingerprint mismatch": {
  "bn": "ফিঙ্গারপ্রিন্ট মেলেনি",
  "hi": "फ़िंगरप्रिंट मेल नहीं खाता"
 },
 "Built on an edited record": {
  "bn": "বদলানো নথির উপর তৈরি",
  "hi": "बदले गए रिकॉर्ड पर बना"
 },
 "Verified": {
  "bn": "যাচাই হয়েছে",
  "hi": "सत्यापित"
 },
 "Data ledger": {
  "bn": "তথ্য খতিয়ান",
  "hi": "डेटा खाता"
 },
 "Each device signs its readings, and every reading's fingerprint includes the one before it. Change one old number and the chain breaks, so nobody can quietly rewrite a village's history.": {
  "bn": "প্রতিটি ডিভাইস রিডিং স্বাক্ষর করে, আর প্রতিটি রিডিংয়ের ফিঙ্গারপ্রিন্টে আগেরটি থাকে। একটি পুরনো সংখ্যা বদলালেই শিকল ভাঙে, তাই কেউ চুপচাপ গ্রামের ইতিহাস বদলাতে পারে না।",
  "hi": "हर उपकरण रीडिंग पर हस्ताक्षर करता है, और हर रीडिंग के फ़िंगरप्रिंट में पिछली शामिल होती है। एक पुराना अंक बदलते ही कड़ी टूटती है, इसलिए कोई चुपचाप गाँव का इतिहास नहीं बदल सकता।"
 },
 "Filter by village": {
  "bn": "গ্রাম অনুযায়ী দেখুন",
  "hi": "गाँव से छाँटें"
 },
 "All": {
  "bn": "সব",
  "hi": "सभी"
 },
 "Sensor check": {
  "bn": "সেন্সর যাচাই",
  "hi": "सेंसर जाँच"
 },
 "Confirmed by sensor": {
  "bn": "সেন্সর নিশ্চিত করেছে",
  "hi": "सेंसर ने पुष्टि की"
 },
 "Needs a site visit": {
  "bn": "সরেজমিন দেখা দরকার",
  "hi": "मौके पर जाँच ज़रूरी"
 },
 "No reports match these filters.": {
  "bn": "এই ফিল্টারে কোনো অভিযোগ নেই।",
  "hi": "इन फ़िल्टरों में कोई शिकायत नहीं।"
 },
 "See location": {
  "bn": "অবস্থান দেখুন",
  "hi": "स्थान देखें"
 },
 "Problem type": {
  "bn": "সমস্যার ধরন",
  "hi": "समस्या का प्रकार"
 },
 "Citizen reports": {
  "bn": "নাগরিক অভিযোগ",
  "hi": "नागरिक शिकायतें"
 },
 "Sensors show this working, needs a site visit": {
  "bn": "সেন্সরে ঠিক দেখাচ্ছে, সরেজমিন দেখা দরকার",
  "hi": "सेंसर इसे ठीक दिखाता है, मौके पर जाँच ज़रूरी"
 },
 "No sensor covers this, needs a site visit": {
  "bn": "এর সেন্সর নেই, সরেজমিন দেখা দরকার",
  "hi": "इसका सेंसर नहीं है, मौके पर जाँच ज़रूरी"
 },
 "Fixed and closed": {
  "bn": "সমাধান হয়েছে",
  "hi": "ठीक करके बंद"
 },
 "Finding your location…": {
  "bn": "অবস্থান খোঁজা হচ্ছে…",
  "hi": "स्थान खोजा जा रहा है…"
 },
 "Location was blocked, so the village centre is used instead.": {
  "bn": "অবস্থান পাওয়া যায়নি, গ্রামের কেন্দ্র ব্যবহার করা হল।",
  "hi": "स्थान नहीं मिला, गाँव का केंद्र लिया गया।"
 },
 "Report a problem": {
  "bn": "সমস্যা জানান",
  "hi": "समस्या बताएँ"
 },
 "What is the problem?": {
  "bn": "কী সমস্যা?",
  "hi": "क्या समस्या है?"
 },
 "Details (optional)": {
  "bn": "বিস্তারিত (ঐচ্ছিক)",
  "hi": "विवरण (वैकल्पिक)"
 },
 "Change photo": {
  "bn": "ছবি বদলান",
  "hi": "फ़ोटो बदलें"
 },
 "Add a photo": {
  "bn": "ছবি যোগ করুন",
  "hi": "फ़ोटो जोड़ें"
 },
 "Location added": {
  "bn": "অবস্থান যোগ হয়েছে",
  "hi": "स्थान जुड़ गया"
 },
 "Add my location": {
  "bn": "আমার অবস্থান যোগ করুন",
  "hi": "मेरा स्थान जोड़ें"
 },
 "Send report": {
  "bn": "অভিযোগ পাঠান",
  "hi": "शिकायत भेजें"
 },
 "Pick the type of problem first": {
  "bn": "আগে সমস্যার ধরন বেছে নিন",
  "hi": "पहले समस्या का प्रकार चुनें"
 },
 "Report saved on this phone. It will sync when you are back online.": {
  "bn": "অভিযোগ এই ফোনে জমা আছে, অনলাইন হলে পাঠানো হবে।",
  "hi": "शिकायत इस फ़ोन में सहेजी गई, ऑनलाइन होने पर भेजी जाएगी।"
 },
 "Report sent to the panchayat.": {
  "bn": "অভিযোগ পঞ্চায়েতে পাঠানো হয়েছে।",
  "hi": "शिकायत पंचायत को भेजी गई।"
 },
 "Mark safe": {
  "bn": "নিরাপদ চিহ্নিত করুন",
  "hi": "सुरक्षित चिह्नित करें"
 },
 "Send a test SOS": {
  "bn": "পরীক্ষামূলক জরুরি বার্তা পাঠান",
  "hi": "परीक्षण SOS भेजें"
 },
 "No SOS yet. Send a test from a 2G village to see the fallback path.": {
  "bn": "এখনও কোনো জরুরি বার্তা নেই। 2G গ্রাম থেকে পরীক্ষা পাঠিয়ে বিকল্প পথ দেখুন।",
  "hi": "अभी कोई SOS नहीं। 2G गाँव से परीक्षण भेजकर वैकल्पिक रास्ता देखें।"
 },
 "Safe routes after dark": {
  "bn": "রাতে নিরাপদ পথ",
  "hi": "अँधेरे के बाद सुरक्षित रास्ते"
 },
 "Each route is checked against the live streetlight sensors along it.": {
  "bn": "প্রতিটি পথ তার পাশের পথবাতি সেন্সর দিয়ে যাচাই করা হয়।",
  "hi": "हर रास्ता उसके किनारे लगे स्ट्रीटलाइट सेंसर से जाँचा जाता है।"
 },
 "Moderation queue": {
  "bn": "পর্যালোচনার তালিকা",
  "hi": "समीक्षा कतार"
 },
 "Villager safety tags are checked before they count. Anything naming a person is rejected.": {
  "bn": "গ্রামবাসীর নিরাপত্তা তথ্য গণনার আগে যাচাই হয়। কারও নাম থাকলে বাতিল।",
  "hi": "गाँव वालों की सुरक्षा सूचनाएँ गिनती से पहले जाँची जाती हैं। किसी का नाम हो तो अस्वीकार।"
 },
 "Approve": {
  "bn": "অনুমোদন",
  "hi": "स्वीकार करें"
 },
 "Reject": {
  "bn": "বাতিল",
  "hi": "अस्वीकार करें"
 },
 "Safety": {
  "bn": "নিরাপত্তা",
  "hi": "सुरक्षा"
 },
 "An SOS reaches help even without internet: it falls back to LoRa radio and SMS. Safety data is shown only as area counts, never names or exact locations.": {
  "bn": "ইন্টারনেট ছাড়াও জরুরি বার্তা পৌঁছায়: LoRa রেডিও ও SMS দিয়ে। নিরাপত্তা তথ্য শুধু এলাকার সংখ্যা হিসেবে দেখানো হয়, নাম বা সঠিক জায়গা নয়।",
  "hi": "SOS बिना इंटरनेट के भी पहुँचता है: LoRa रेडियो और SMS से। सुरक्षा डेटा सिर्फ़ इलाक़े की गिनती के रूप में दिखता है, नाम या सटीक जगह नहीं।"
 },
 "Village sending the SOS": {
  "bn": "কোন গ্রাম থেকে",
  "hi": "किस गाँव से"
 },
 "Download ranking (CSV)": {
  "bn": "ক্রম তালিকা ডাউনলোড (CSV)",
  "hi": "रैंकिंग डाउनलोड (CSV)"
 },
 "Data trust": {
  "bn": "তথ্যের বিশ্বাসযোগ্যতা",
  "hi": "डेटा भरोसा"
 },
 "Other blocks and districts use fixed demo figures. Only this block is live.": {
  "bn": "অন্য ব্লক ও জেলার সংখ্যা স্থির ডেমো। শুধু এই ব্লক লাইভ।",
  "hi": "दूसरे प्रखंड और ज़िले स्थिर डेमो आँकड़े हैं। सिर्फ़ यह प्रखंड लाइव है।"
 },
 "Rules that stop gaming": {
  "bn": "কারচুপি আটকানোর নিয়ম",
  "hi": "हेरफेर रोकने के नियम"
 },
 "Citizen reporters": {
  "bn": "নাগরিক রিপোর্টার",
  "hi": "नागरिक रिपोर्टर"
 },
 "Only villagers who opt in appear here, under a code instead of a name.": {
  "bn": "যাঁরা রাজি, শুধু তাঁরাই এখানে, নামের বদলে কোডে।",
  "hi": "सिर्फ़ सहमति देने वाले गाँव वाले यहाँ दिखते हैं, नाम की जगह कोड से।"
 },
 "Rankings": {
  "bn": "র‍্যাঙ্কিং",
  "hi": "रैंकिंग"
 },
 "Villages ranked on evidence, not on paperwork. Scores update live, so rows move when a flood hits or a fault is fixed.": {
  "bn": "কাগজ নয়, প্রমাণের ভিত্তিতে গ্রামের ক্রম। স্কোর লাইভ বদলায়, বন্যা বা মেরামতে সারি সরে যায়।",
  "hi": "गाँवों का क्रम काग़ज़ नहीं, सबूत पर। स्कोर लाइव बदलते हैं, बाढ़ या मरम्मत पर पंक्तियाँ खिसकती हैं।"
 },
 "Level": {
  "bn": "স্তর",
  "hi": "स्तर"
 },
 "No village with this ID": {
  "bn": "এই আইডির কোনো গ্রাম নেই",
  "hi": "इस आईडी का कोई गाँव नहीं"
 },
 "Check the link, or open the block dashboard to pick a village.": {
  "bn": "লিংক দেখুন, বা ব্লক ড্যাশবোর্ড থেকে গ্রাম বাছুন।",
  "hi": "लिंक जाँचें, या प्रखंड डैशबोर्ड से गाँव चुनें।"
 },
 "Open dashboard": {
  "bn": "ড্যাশবোর্ড খুলুন",
  "hi": "डैशबोर्ड खोलें"
 },
 "No asset with this tag": {
  "bn": "এই ট্যাগের কোনো সম্পদ নেই",
  "hi": "इस टैग की कोई संपत्ति नहीं"
 },
 "The QR code may be damaged. Ask the panchayat office for the asset number.": {
  "bn": "QR কোড নষ্ট হতে পারে। পঞ্চায়েত অফিসে সম্পদ নম্বর জিজ্ঞেস করুন।",
  "hi": "QR कोड ख़राब हो सकता है। पंचायत कार्यालय से संपत्ति संख्या पूछें।"
 },
 "Asset record. Anyone who scans the tag on this asset lands here.": {
  "bn": "সম্পদের নথি। এই ট্যাগ স্ক্যান করলে যে কেউ এখানে আসবেন।",
  "hi": "संपत्ति रिकॉर्ड। इस टैग को स्कैन करने वाला कोई भी यहाँ पहुँचता है।"
 },
 "Signed readings": {
  "bn": "স্বাক্ষরিত রিডিং",
  "hi": "हस्ताक्षरित रीडिंग"
 },
 "Verify chain": {
  "bn": "শিকল যাচাই করুন",
  "hi": "कड़ी जाँचें"
 },
 "No recent records for this sensor in the ledger window.": {
  "bn": "এই সেন্সরের সাম্প্রতিক কোনো নথি নেই।",
  "hi": "इस सेंसर का कोई हालिया रिकॉर्ड नहीं।"
 },
 "Photo check": {
  "bn": "ছবি দিয়ে যাচাই",
  "hi": "फ़ोटो जाँच"
 },
 "A villager can add a photo with location. It backs up or questions what the sensor says.": {
  "bn": "গ্রামবাসী অবস্থানসহ ছবি দিতে পারেন। এটি সেন্সরের তথ্য সমর্থন করে বা প্রশ্ন তোলে।",
  "hi": "गाँव वाले स्थान सहित फ़ोटो जोड़ सकते हैं। यह सेंसर की बात की पुष्टि करता है या सवाल उठाता है।"
 },
 "Skip to content": {
  "bn": "মূল অংশে যান",
  "hi": "मुख्य भाग पर जाएँ"
 },
 "The formula": {
  "bn": "সূত্র",
  "hi": "सूत्र"
 },
 "Indicators and weights": {
  "bn": "সূচক ও গুরুত্ব",
  "hi": "संकेतक और भार"
 },
 "Indicator": {
  "bn": "সূচক",
  "hi": "संकेतक"
 },
 "Weight": {
  "bn": "গুরুত্ব",
  "hi": "भार"
 },
 "How it is measured": {
  "bn": "কীভাবে মাপা হয়",
  "hi": "कैसे मापा जाता है"
 },
 "Panchayat Advancement Index theme": {
  "bn": "পঞ্চায়েত অগ্রগতি সূচকের থিম",
  "hi": "पंचायत उन्नति सूचकांक विषय"
 },
 "Evidence factor": {
  "bn": "প্রমাণের গুণক",
  "hi": "सबूत गुणक"
 },
 "A village is flagged when its declared figure is more than 15 points above what the sensors measure.": {
  "bn": "ঘোষিত সংখ্যা সেন্সরের মাপের চেয়ে ১৫-র বেশি হলে গ্রামটি চিহ্নিত হয়।",
  "hi": "घोषित आँकड़ा सेंसर माप से 15 अंक से ज़्यादा हो तो गाँव चिह्नित होता है।"
 },
 "Value": {
  "bn": "মান",
  "hi": "मान"
 },
 "Evidence": {
  "bn": "প্রমাণ",
  "hi": "सबूत"
 },
 "Points": {
  "bn": "পয়েন্ট",
  "hi": "अंक"
 },
 "Village score": {
  "bn": "গ্রাম স্কোর",
  "hi": "गाँव स्कोर"
 },
 "How the score works": {
  "bn": "স্কোর কীভাবে হয়",
  "hi": "स्कोर कैसे बनता है"
 },
 "Every number on a scorecard can be traced back to a reading, and every reading counts according to how it was collected.": {
  "bn": "স্কোরকার্ডের প্রতিটি সংখ্যা একটি রিডিংয়ে ফেরানো যায়, আর প্রতিটি রিডিং কীভাবে সংগ্রহ হয়েছে সেই অনুযায়ী গণ্য হয়।",
  "hi": "स्कोरकार्ड का हर अंक किसी रीडिंग तक जाता है, और हर रीडिंग इस हिसाब से गिनी जाती है कि वह कैसे जुटाई गई।"
 },
 "What one sensor node costs": {
  "bn": "একটি সেন্সর নোডের খরচ",
  "hi": "एक सेंसर नोड की लागत"
 },
 "Part": {
  "bn": "যন্ত্রাংশ",
  "hi": "पुर्ज़ा"
 },
 "Approx. price": {
  "bn": "আনুমানিক দাম",
  "hi": "अनुमानित दाम"
 },
 "Sixteen weeks": {
  "bn": "ষোলো সপ্তাহ",
  "hi": "सोलह हफ़्ते"
 },
 "How we will know it worked": {
  "bn": "কীভাবে বুঝব কাজ হল",
  "hi": "कैसे जानेंगे कि काम हुआ"
 },
 "Pilot plan": {
  "bn": "পাইলট পরিকল্পনা",
  "hi": "पायलट योजना"
 },
 "What each badge proves": {
  "bn": "প্রতিটি চিহ্ন কী প্রমাণ করে",
  "hi": "हर बैज क्या साबित करता है"
 },
 "How someone might try to cheat": {
  "bn": "কেউ কীভাবে ঠকাতে পারে",
  "hi": "कोई कैसे धोखा देने की कोशिश कर सकता है"
 },
 "Attempt": {
  "bn": "চেষ্টা",
  "hi": "कोशिश"
 },
 "What gives it away": {
  "bn": "কীভাবে ধরা পড়ে",
  "hi": "कैसे पकड़ में आता है"
 },
 "Defence": {
  "bn": "প্রতিরক্ষা",
  "hi": "बचाव"
 },
 "Limitations": {
  "bn": "সীমাবদ্ধতা",
  "hi": "सीमाएँ"
 },
 "Trust and limits": {
  "bn": "ভরসা ও সীমা",
  "hi": "भरोसा और सीमाएँ"
 },
 "What a badge proves, how someone could try to fool the system, and what this prototype does not do yet.": {
  "bn": "চিহ্ন কী প্রমাণ করে, কেউ কীভাবে ঠকাতে পারে, আর এই প্রোটোটাইপ এখনও কী করে না।",
  "hi": "बैज क्या साबित करता है, कोई सिस्टम को कैसे धोखा दे सकता है, और यह प्रोटोटाइप अभी क्या नहीं करता।"
 },
 "A village whose data cannot be faked.": {
  "bn": "যে গ্রামের তথ্য জাল করা যায় না।",
  "hi": "ऐसा गाँव जिसका डेटा झूठा नहीं हो सकता।"
 },
 "See Radhaganj's scorecard": {
  "bn": "রাধাগঞ্জের স্কোরকার্ড দেখুন",
  "hi": "राधागंज का स्कोरकार्ड देखें"
 },
 "Monthly self-declaration": {
  "bn": "মাসিক স্ব-ঘোষণা",
  "hi": "मासिक स्व-घोषणा"
 },
 "Declared": {
  "bn": "ঘোষিত",
  "hi": "घोषित"
 },
 "Sensors": {
  "bn": "সেন্সর",
  "hi": "सेंसर"
 },
 "Live demo data. The sensor figures update every 4 seconds.": {
  "bn": "লাইভ ডেমো তথ্য। সেন্সরের সংখ্যা প্রতি ৪ সেকেন্ডে বদলায়।",
  "hi": "लाइव डेमो डेटा। सेंसर के आँकड़े हर 4 सेकंड बदलते हैं।"
 },
 "Prototype for the BharatSeva state hackathon. Village names, sensors and figures are simulated.": {
  "bn": "ভারতসেবা রাজ্য হ্যাকাথনের প্রোটোটাইপ। গ্রামের নাম, সেন্সর ও সংখ্যা সিমুলেটেড।",
  "hi": "भारतसेवा राज्य हैकथॉन का प्रोटोटाइप। गाँवों के नाम, सेंसर और आँकड़े सिम्युलेटेड हैं।"
 },
 "Open GramSatya as": {
  "bn": "কোন ভূমিকায় খুলবেন",
  "hi": "किस भूमिका में खोलें"
 },
 "This village page does not exist": {
  "bn": "এই গ্রামের পাতা নেই",
  "hi": "इस गाँव का पेज मौजूद नहीं"
 },
 "The QR code or link may be wrong. Ask the panchayat office for the correct one.": {
  "bn": "QR কোড বা লিংক ভুল হতে পারে। পঞ্চায়েত অফিসে সঠিকটি জিজ্ঞেস করুন।",
  "hi": "QR कोड या लिंक ग़लत हो सकता है। पंचायत कार्यालय से सही पूछें।"
 },
 "Go to GramSatya": {
  "bn": "গ্রামসত্যে যান",
  "hi": "ग्रामसत्य पर जाएँ"
 },
 "GramSatya prototype for the BharatSeva state hackathon. All village data on this page is simulated.": {
  "bn": "ভারতসেবা রাজ্য হ্যাকাথনের জন্য গ্রামসত্য প্রোটোটাইপ। এই পাতার সব তথ্য সিমুলেটেড।",
  "hi": "भारतसेवा राज्य हैकथॉन के लिए ग्रामसत्य प्रोटोटाइप। इस पेज का सारा डेटा सिम्युलेटेड है।"
 },
 "Officer login": {
  "bn": "আধিকারিক লগইন",
  "hi": "अधिकारी लॉगिन"
 },
 "Public page. Anyone can see this, no login needed.": {
  "bn": "সর্বজনীন পাতা, লগইন ছাড়াই সবাই দেখতে পারেন।",
  "hi": "सार्वजनिक पेज, बिना लॉगिन कोई भी देख सकता है।"
 },
 "All public services are working": {
  "bn": "সব পরিষেবা ঠিক আছে",
  "hi": "सभी सार्वजनिक सेवाएँ चालू हैं"
 },
 "Live from sensors, not from paper forms": {
  "bn": "কাগজের ফর্ম নয়, সরাসরি সেন্সর থেকে",
  "hi": "काग़ज़ी फ़ॉर्म नहीं, सीधे सेंसर से"
 },
 "Warning": {
  "bn": "সতর্কতা",
  "hi": "चेतावनी"
 },
 "Listen": {
  "bn": "শুনুন",
  "hi": "सुनें"
 },
 "Public services today": {
  "bn": "আজকের পরিষেবা",
  "hi": "आज की सार्वजनिक सेवाएँ"
 },
 "Someone changed this village's past data. It is being checked.": {
  "bn": "এই গ্রামের পুরনো তথ্য বদলানো হয়েছে। যাচাই চলছে।",
  "hi": "इस गाँव का पुराना डेटा बदला गया है। जाँच चल रही है।"
 },
 "The panchayat's own report does not match the sensors.": {
  "bn": "পঞ্চায়েতের ঘোষিত তথ্য সেন্সরের সাথে মেলেনি।",
  "hi": "पंचायत की अपनी रिपोर्ट सेंसर से मेल नहीं खाती।"
 },
 "The panchayat's own report matches what the sensors measure.": {
  "bn": "পঞ্চায়েতের ঘোষিত তথ্য সেন্সরের সাথে মিলছে।",
  "hi": "पंचायत की अपनी रिपोर्ट सेंसर माप से मेल खाती है।"
 },
 "Alerts and SOS": {
  "bn": "সতর্কবার্তা ও জরুরি সাহায্য",
  "hi": "चेतावनी और SOS"
 },
 "No open complaints.": {
  "bn": "কোনো খোলা অভিযোগ নেই।",
  "hi": "कोई खुली शिकायत नहीं।"
 },
 "Prototype for the BharatSeva state hackathon. All village data is simulated.": {
  "bn": "ভারতসেবা রাজ্য হ্যাকাথনের প্রোটোটাইপ। সব তথ্য সিমুলেটেড।",
  "hi": "भारतसेवा राज्य हैकथॉन का प्रोटोटाइप। सारा डेटा सिम्युलेटेड है।"
 },
 "Language": {
  "bn": "ভাষা",
  "hi": "भाषा"
 },
 "Sort": {
  "bn": "সাজান",
  "hi": "क्रम"
 },
 "Lowest score first": {
  "bn": "কম স্কোর আগে",
  "hi": "कम स्कोर पहले"
 },
 "Lowest data trust first": {
  "bn": "কম বিশ্বাসযোগ্যতা আগে",
  "hi": "कम भरोसा पहले"
 },
 "Name": {
  "bn": "নাম",
  "hi": "नाम"
 },
 "Declared against measured": {
  "bn": "ঘোষিত বনাম মাপা",
  "hi": "घोषित बनाम मापा गया"
 },
 "Sensor faults": {
  "bn": "সেন্সর ত্রুটি",
  "hi": "सेंसर ख़राबी"
 },
 "Open reports": {
  "bn": "খোলা অভিযোগ",
  "hi": "खुली शिकायतें"
 },
 "Matches": {
  "bn": "মিলছে",
  "hi": "मेल खाता है"
 },
 "Needs review": {
  "bn": "পর্যালোচনা দরকার",
  "hi": "समीक्षा ज़रूरी"
 },
 "Nothing needs review right now.": {
  "bn": "এখন কিছু পর্যালোচনার দরকার নেই।",
  "hi": "अभी किसी समीक्षा की ज़रूरत नहीं।"
 },
 "Replay the last 72 hours": {
  "bn": "শেষ ৭২ ঘণ্টা আবার দেখুন",
  "hi": "पिछले 72 घंटे दोबारा देखें"
 },
 "Colour shows the score. A dark ring means the village's data needs checking.": {
  "bn": "রং স্কোর দেখায়। গাঢ় রিং মানে গ্রামের তথ্য যাচাই দরকার।",
  "hi": "रंग स्कोर दिखाता है। गहरा घेरा मतलब गाँव के डेटा की जाँच ज़रूरी।"
 },
 "Hours ago": {
  "bn": "কত ঘণ্টা আগে",
  "hi": "कितने घंटे पहले"
 },
 "Demo console": {
  "bn": "ডেমো কনসোল",
  "hi": "डेमो कंसोल"
 },
 "Close": {
  "bn": "বন্ধ করুন",
  "hi": "बंद करें"
 },
 "Runs the scripted scenarios. Nothing real is sent: sirens, SMS and calls are simulated.": {
  "bn": "সাজানো দৃশ্য চালায়। কিছুই আসলে পাঠানো হয় না: সাইরেন, SMS ও কল সিমুলেটেড।",
  "hi": "तय परिदृश्य चलाता है। असल में कुछ नहीं भेजा जाता: सायरन, SMS और कॉल सिम्युलेटेड हैं।"
 },
 "Live sensor feed": {
  "bn": "লাইভ সেন্সর ফিড",
  "hi": "लाइव सेंसर फ़ीड"
 },
 "Scenarios": {
  "bn": "দৃশ্য",
  "hi": "परिदृश्य"
 },
 "Fire": {
  "bn": "আগুন",
  "hi": "आग"
 },
 "SOS from a 2G village": {
  "bn": "2G গ্রাম থেকে জরুরি বার্তা",
  "hi": "2G गाँव से SOS"
 },
 "Watch them on": {
  "bn": "দেখুন এখানে",
  "hi": "यहाँ देखें"
 },
 "Alerts": {
  "bn": "সতর্কবার্তা",
  "hi": "चेतावनी"
 },
 "Any sensor node": {
  "bn": "যেকোনো সেন্সর নোড",
  "hi": "कोई भी सेंसर नोड"
 },
 "Edit a reading": {
  "bn": "একটি রিডিং বদলান",
  "hi": "एक रीडिंग बदलें"
 },
 "Restore": {
  "bn": "ফেরান",
  "hi": "बहाल करें"
 },
 "Power loss marks the node unverified. If every sensor behind an indicator is offline, that indicator falls back to the declared figure at 45% weight.": {
  "bn": "বিদ্যুৎ না থাকলে নোড অযাচাই হয়। কোনো সূচকের সব সেন্সর বন্ধ হলে ঘোষিত সংখ্যা ৪৫% গুরুত্বে ধরা হয়।",
  "hi": "बिजली जाने पर नोड असत्यापित हो जाता है। किसी संकेतक के सभी सेंसर बंद हों तो घोषित आँकड़ा 45% भार पर गिना जाता है।"
 },
 "Reset all demo data": {
  "bn": "সব ডেমো তথ্য রিসেট করুন",
  "hi": "सारा डेमो डेटा रीसेट करें"
 },
 "Village for the fire": {
  "bn": "আগুন কোন গ্রামে",
  "hi": "आग किस गाँव में"
 },
 "Sensor node": {
  "bn": "সেন্সর নোড",
  "hi": "सेंसर नोड"
 },
 "Incidents": {
  "bn": "ঘটনা",
  "hi": "घटनाएँ"
 },
 "Download incident log (CSV)": {
  "bn": "ঘটনার তালিকা ডাউনলোড (CSV)",
  "hi": "घटना लॉग डाउनलोड (CSV)"
 },
 "No incidents. Open the demo console and run Flood or Fire to see the four stages fill in.": {
  "bn": "কোনো ঘটনা নেই। ডেমো কনসোল খুলে বন্যা বা আগুন চালান, চারটি ধাপ দেখুন।",
  "hi": "कोई घटना नहीं। डेमो कंसोल खोलकर बाढ़ या आग चलाएँ, चारों चरण देखें।"
 },
 "Watch to emergency": {
  "bn": "নজর থেকে জরুরি অবস্থা",
  "hi": "निगरानी से आपातकाल तक"
 },
 "What to fix first": {
  "bn": "আগে যা সারাতে হবে",
  "hi": "पहले क्या ठीक करें"
 },
 "Nothing needs fixing right now.": {
  "bn": "এখন কিছু সারানোর দরকার নেই।",
  "hi": "अभी कुछ ठीक करने की ज़रूरत नहीं।"
 },
 "Low-data mode: map tiles are off. Areas listed by count.": {
  "bn": "কম ডেটা মোড: মানচিত্র বন্ধ। এলাকাগুলি সংখ্যা অনুযায়ী তালিকা।",
  "hi": "कम डेटा मोड: नक्शा बंद। इलाक़े गिनती के हिसाब से सूचीबद्ध।"
 },
 "Low-data mode: map tiles are off.": {
  "bn": "কম ডেটা মোড: মানচিত্র বন্ধ।",
  "hi": "कम डेटा मोड: नक्शा बंद।"
 },
 "Square": {
  "bn": "বর্গ",
  "hi": "वर्ग"
 },
 "fewer than 3 reports": {
  "bn": "৩টির কম অভিযোগ",
  "hi": "3 से कम शिकायतें"
 },
 "reports": {
  "bn": "অভিযোগ",
  "hi": "शिकायतें"
 },
 "near": {
  "bn": "কাছে",
  "hi": "पास"
 },
 "Safety reports on the map": {
  "bn": "মানচিত্রে নিরাপত্তা অভিযোগ",
  "hi": "नक्शे पर सुरक्षा शिकायतें"
 },
 "Counts in squares of about 2 km. Squares with fewer than 3 reports stay blank so nobody can be identified. Sample data.": {
  "bn": "প্রায় ২ কিমি বর্গে গণনা। ৩টির কম অভিযোগের বর্গ ফাঁকা থাকে, যাতে কাউকে চেনা না যায়। নমুনা তথ্য।",
  "hi": "लगभग 2 किमी के वर्गों में गिनती। 3 से कम शिकायत वाले वर्ग ख़ाली रहते हैं ताकि किसी की पहचान न हो। नमूना डेटा।"
 },
 "Type": {
  "bn": "ধরন",
  "hi": "प्रकार"
 },
 "All types": {
  "bn": "সব ধরন",
  "hi": "सभी प्रकार"
 },
 "Period": {
  "bn": "সময়কাল",
  "hi": "अवधि"
 },
 "Last 30 days": {
  "bn": "শেষ ৩০ দিন",
  "hi": "पिछले 30 दिन"
 },
 "Last 90 days": {
  "bn": "শেষ ৯০ দিন",
  "hi": "पिछले 90 दिन"
 },
 "Whole block": {
  "bn": "পুরো ব্লক",
  "hi": "पूरा प्रखंड"
 },
 "Fewer": {
  "bn": "কম",
  "hi": "कम"
 },
 "More reports": {
  "bn": "বেশি অভিযোগ",
  "hi": "ज़्यादा शिकायतें"
 },
 "Tap a square for details.": {
  "bn": "বিস্তারিত দেখতে বর্গে চাপুন।",
  "hi": "विवरण के लिए वर्ग पर टैप करें।"
 },
 "Fewer than 3": {
  "bn": "৩টির কম",
  "hi": "3 से कम"
 },
 "last 30 days": {
  "bn": "শেষ ৩০ দিন",
  "hi": "पिछले 30 दिन"
 },
 "last 90 days": {
  "bn": "শেষ ৯০ দিন",
  "hi": "पिछले 90 दिन"
 },
 "of reports were after dark (6 pm to 6 am).": {
  "bn": "অভিযোগ সন্ধ্যার পরে (সন্ধ্যা ৬টা থেকে সকাল ৬টা)।",
  "hi": "शिकायतें अँधेरे के बाद की थीं (शाम 6 से सुबह 6)।"
 },
 "Streetlights in this village right now": {
  "bn": "এই গ্রামে এখন জ্বলা পথবাতি",
  "hi": "इस गाँव में अभी जलती स्ट्रीटलाइट"
 },
 "Suggested action": {
  "bn": "প্রস্তাবিত পদক্ষেপ",
  "hi": "सुझाया गया कदम"
 },
 "Fix dark streetlights first and add one near the busiest path.": {
  "bn": "আগে বন্ধ পথবাতি সারান, ব্যস্ত পথে একটি নতুন বসান।",
  "hi": "पहले बंद स्ट्रीटलाइट ठीक करें और व्यस्त रास्ते पर एक नई लगाएँ।"
 },
 "Ask the beat officer for evening patrols and put up the helpline number.": {
  "bn": "সন্ধ্যায় টহলের জন্য বিট অফিসারকে বলুন, হেল্পলাইন নম্বর লাগান।",
  "hi": "शाम की गश्त के लिए बीट अधिकारी से कहें और हेल्पलाइन नंबर लगाएँ।"
 },
 "No square has 3 or more reports for this filter.": {
  "bn": "এই ফিল্টারে কোনো বর্গে ৩টি বা বেশি অভিযোগ নেই।",
  "hi": "इस फ़िल्टर में किसी वर्ग में 3 या ज़्यादा शिकायतें नहीं।"
 },
 "Busiest squares": {
  "bn": "সবচেয়ে বেশি অভিযোগের বর্গ",
  "hi": "सबसे ज़्यादा शिकायत वाले वर्ग"
 },
 "Live sensors": {
  "bn": "লাইভ সেন্সর",
  "hi": "लाइव सेंसर"
 },
 "Connect a device": {
  "bn": "ডিভাইস যুক্ত করুন",
  "hi": "उपकरण जोड़ें"
 },
 "Loading village data…": {
  "bn": "গ্রামের তথ্য আসছে…",
  "hi": "गाँव का डेटा लोड हो रहा है…"
 },
 "This month's declaration": {
  "bn": "এই মাসের ঘোষণা",
  "hi": "इस महीने की घोषणा"
 },
 "Enter the figures you will report on the portal. GramSatya checks them against the sensors as soon as you submit.": {
  "bn": "পোর্টালে যে সংখ্যা দেবেন তা লিখুন। জমা দিলেই গ্রামসত্য সেন্সরের সাথে মিলিয়ে দেখবে।",
  "hi": "पोर्टल पर जो आँकड़े देंगे वे लिखें। जमा करते ही ग्रामसत्य सेंसर से मिलान करेगा।"
 },
 "Submit declaration": {
  "bn": "ঘোষণা জমা দিন",
  "hi": "घोषणा जमा करें"
 },
 "Cancel": {
  "bn": "বাতিল",
  "hi": "रद्द करें"
 },
 "Print this for the panchayat office wall. Villagers scan it to see this scorecard in Bengali, no login needed.": {
  "bn": "পঞ্চায়েত অফিসের দেওয়ালে ছাপিয়ে লাগান। গ্রামবাসী স্ক্যান করে লগইন ছাড়াই স্কোরকার্ড দেখবেন।",
  "hi": "इसे पंचायत कार्यालय की दीवार पर छापकर लगाएँ। गाँव वाले स्कैन करके बिना लॉगिन स्कोरकार्ड देखेंगे।"
 },
 "Download QR code": {
  "bn": "QR কোড ডাউনলোড",
  "hi": "QR कोड डाउनलोड"
 },
 "Public page": {
  "bn": "সর্বজনীন পাতা",
  "hi": "सार्वजनिक पेज"
 },
 "QR code": {
  "bn": "QR কোড",
  "hi": "QR कोड"
 },
 "Hide QR code": {
  "bn": "QR কোড লুকান",
  "hi": "QR कोड छिपाएँ"
 },
 "Measured": {
  "bn": "মাপা",
  "hi": "मापा गया"
 },
 "Not declared": {
  "bn": "ঘোষিত নয়",
  "hi": "घोषित नहीं"
 },
 "Ledger edited": {
  "bn": "খতিয়ান বদলানো হয়েছে",
  "hi": "खाता बदला गया"
 },
 "Ledger intact": {
  "bn": "খতিয়ান অক্ষত",
  "hi": "खाता सुरक्षित"
 },
 "Submit this month's declaration": {
  "bn": "এই মাসের ঘোষণা জমা দিন",
  "hi": "इस महीने की घोषणा जमा करें"
 },
 "Gram Panchayat": {
  "bn": "গ্রাম পঞ্চায়েত",
  "hi": "ग्राम पंचायत"
 },
 "people": {
  "bn": "জন",
  "hi": "लोग"
 },
 "Live at": {
  "bn": "লাইভ, সময়",
  "hi": "लाइव, समय"
 },
 "marks the declared figure": {
  "bn": "ঘোষিত সংখ্যা চিহ্নিত করে",
  "hi": "घोषित आँकड़ा दिखाता है"
 },
 "points in 30 days": {
  "bn": "পয়েন্ট, ৩০ দিনে",
  "hi": "अंक, 30 दिनों में"
 },
 "Up": {
  "bn": "বেড়েছে",
  "hi": "बढ़ा"
 },
 "Down": {
  "bn": "কমেছে",
  "hi": "घटा"
 },
 "The panchayat declares more than the sensors measure.": {
  "bn": "পঞ্চায়েত সেন্সরের মাপের চেয়ে বেশি ঘোষণা করছে।",
  "hi": "पंचायत सेंसर माप से ज़्यादा घोषित कर रही है।"
 },
 "Someone edited this village's past readings. Its data is no longer trusted.": {
  "bn": "কেউ এই গ্রামের পুরনো রিডিং বদলেছে। এর তথ্য আর বিশ্বাসযোগ্য নয়।",
  "hi": "किसी ने इस गाँव की पुरानी रीडिंग बदली है। इसका डेटा अब भरोसेमंद नहीं।"
 },
 "Declared figures match the sensors.": {
  "bn": "ঘোষিত সংখ্যা সেন্সরের সাথে মিলছে।",
  "hi": "घोषित आँकड़े सेंसर से मेल खाते हैं।"
 },
 "Good": {
  "bn": "ভালো",
  "hi": "अच्छा"
 },
 "Needs work": {
  "bn": "উন্নতি দরকার",
  "hi": "सुधार ज़रूरी"
 },
 "Critical": {
  "bn": "সংকটজনক",
  "hi": "गंभीर"
 },
 "Water supply working": {
  "bn": "জল সরবরাহ চালু",
  "hi": "जल आपूर्ति चालू"
 },
 "Streetlights working": {
  "bn": "পথবাতি চালু",
  "hi": "स्ट्रीटलाइट चालू"
 },
 "Waste bins cleared": {
  "bn": "ডাস্টবিন পরিষ্কার",
  "hi": "कूड़ेदान साफ़"
 },
 "Handpumps": {
  "bn": "নলকূপ",
  "hi": "हैंडपंप"
 },
 "Streetlights": {
  "bn": "পথবাতি",
  "hi": "स्ट्रीटलाइट"
 },
 "Water tanks": {
  "bn": "জলের ট্যাঙ্ক",
  "hi": "पानी की टंकी"
 },
 "Waste bins": {
  "bn": "ডাস্টবিন",
  "hi": "कूड़ेदान"
 },
 "River gauge": {
  "bn": "নদীর জলমাপক",
  "hi": "नदी जलमापी"
 },
 "flowing": {
  "bn": "চালু",
  "hi": "चालू"
 },
 "on": {
  "bn": "জ্বলছে",
  "hi": "जल रही"
 },
 "above 25%": {
  "bn": "২৫%-এর বেশি",
  "hi": "25% से ऊपर"
 },
 "not overflowing": {
  "bn": "উপচে পড়ছে না",
  "hi": "भरा नहीं"
 },
 "below danger line": {
  "bn": "বিপদসীমার নিচে",
  "hi": "ख़तरे की रेखा से नीचे"
 },
 "of": {
  "bn": "এর মধ্যে",
  "hi": "में से"
 },
 "Offline": {
  "bn": "বন্ধ",
  "hi": "बंद"
 },
 "days": {
  "bn": "দিন",
  "hi": "दिन"
 },
 "Panchayat secretary": {
  "bn": "পঞ্চায়েত সচিব",
  "hi": "पंचायत सचिव"
 },
 "Block officer": {
  "bn": "ব্লক আধিকারিক",
  "hi": "प्रखंड अधिकारी"
 },
 "District officer": {
  "bn": "জেলা আধিকারিক",
  "hi": "ज़िला अधिकारी"
 },
 "Villager": {
  "bn": "গ্রামবাসী",
  "hi": "ग्रामीण"
 },
 "Live scorecard, what to fix first, citizen reports, siren alerts.": {
  "bn": "লাইভ স্কোরকার্ড, কী আগে সারাতে হবে, নাগরিক অভিযোগ, সাইরেন সতর্কতা।",
  "hi": "लाइव स्कोरकार्ड, पहले क्या ठीक करें, नागरिक शिकायतें, सायरन चेतावनी।"
 },
 "Every village side by side, over-reporting flagged, ponds audited.": {
  "bn": "সব গ্রাম পাশাপাশি, বাড়িয়ে বলা চিহ্নিত, পুকুর নিরীক্ষিত।",
  "hi": "सभी गाँव साथ-साथ, बढ़ा-चढ़ाकर बताना चिह्नित, तालाबों का अंकेक्षण।"
 },
 "Rank villages by verified need and split a budget.": {
  "bn": "যাচাই করা প্রয়োজনে গ্রাম সাজান, বাজেট ভাগ করুন।",
  "hi": "सत्यापित ज़रूरत से गाँवों का क्रम और बजट बँटवारा।"
 },
 "See your village, report a broken handpump, get flood alerts.": {
  "bn": "নিজের গ্রাম দেখুন, খারাপ নলকূপ জানান, বন্যার সতর্কতা পান।",
  "hi": "अपना गाँव देखें, ख़राब हैंडपंप बताएँ, बाढ़ की चेतावनी पाएँ।"
 },
 "Secretary": {
  "bn": "সচিব",
  "hi": "सचिव"
 },
 "Sign in": {
  "bn": "সাইন ইন",
  "hi": "साइन इन"
 },
 "Sign in as": {
  "bn": "কোন ভূমিকায় সাইন ইন",
  "hi": "किस भूमिका में साइन इन"
 },
 "Back": {
  "bn": "ফিরে যান",
  "hi": "वापस"
 },
 "Panchayat code": {
  "bn": "পঞ্চায়েত কোড",
  "hi": "पंचायत कोड"
 },
 "Password": {
  "bn": "পাসওয়ার্ড",
  "hi": "पासवर्ड"
 },
 "Employee ID": {
  "bn": "কর্মচারী আইডি",
  "hi": "कर्मचारी आईडी"
 },
 "Mobile number": {
  "bn": "মোবাইল নম্বর",
  "hi": "मोबाइल नंबर"
 },
 "Send OTP": {
  "bn": "OTP পাঠান",
  "hi": "OTP भेजें"
 },
 "Enter OTP": {
  "bn": "OTP দিন",
  "hi": "OTP डालें"
 },
 "Demo login filled in. Press Sign in.": {
  "bn": "ডেমো লগইন ভরা আছে। সাইন ইন চাপুন।",
  "hi": "डेमो लॉगिन भरा है। साइन इन दबाएँ।"
 },
 "Wrong details. Use the demo login shown below.": {
  "bn": "ভুল তথ্য। নিচের ডেমো লগইন ব্যবহার করুন।",
  "hi": "ग़लत जानकारी। नीचे दिया डेमो लॉगिन इस्तेमाल करें।"
 },
 "Demo login": {
  "bn": "ডেমো লগইন",
  "hi": "डेमो लॉगिन"
 },
 "OTP sent. For the demo, use 1234.": {
  "bn": "OTP পাঠানো হয়েছে। ডেমোর জন্য 1234 দিন।",
  "hi": "OTP भेजा गया। डेमो के लिए 1234 डालें।"
 },
 "Your village": {
  "bn": "আপনার গ্রাম",
  "hi": "आपका गाँव"
 },
 "Your block": {
  "bn": "আপনার ব্লক",
  "hi": "आपका प्रखंड"
 },
 "Your district": {
  "bn": "আপনার জেলা",
  "hi": "आपका ज़िला"
 },
 "Choose how you sign in. Each role sees the same verified data, shaped for its job.": {
  "bn": "কীভাবে সাইন ইন করবেন বেছে নিন। প্রতিটি ভূমিকা একই যাচাই করা তথ্য দেখে, নিজের কাজ অনুযায়ী।",
  "hi": "साइन इन का तरीका चुनें। हर भूमिका वही सत्यापित डेटा देखती है, अपने काम के हिसाब से।"
 },
 "Water": {
  "bn": "জল",
  "hi": "पानी"
 },
 "Sanitation": {
  "bn": "পরিচ্ছন্নতা",
  "hi": "स्वच्छता"
 },
 "Water assets": {
  "bn": "জলাশয়",
  "hi": "जल संपत्तियाँ"
 },
 "Responsiveness": {
  "bn": "সাড়া",
  "hi": "तत्परता"
 },
 "Water-sufficient panchayat": {
  "bn": "জল-স্বয়ংসম্পূর্ণ পঞ্চায়েত",
  "hi": "जल-पर्याप्त पंचायत"
 },
 "Self-sufficient infrastructure": {
  "bn": "স্বয়ংসম্পূর্ণ পরিকাঠামো",
  "hi": "आत्मनिर्भर बुनियादी ढाँचा"
 },
 "Clean and green panchayat": {
  "bn": "পরিচ্ছন্ন ও সবুজ পঞ্চায়েত",
  "hi": "स्वच्छ और हरित पंचायत"
 },
 "Good governance": {
  "bn": "সুশাসন",
  "hi": "सुशासन"
 },
 "Citizen": {
  "bn": "নাগরিক",
  "hi": "नागरिक"
 },
 "Declared only": {
  "bn": "শুধু ঘোষিত",
  "hi": "केवल घोषित"
 },
 "Unverified": {
  "bn": "অযাচাই",
  "hi": "असत्यापित"
 },
 "counted at": {
  "bn": "গণ্য হয়",
  "hi": "गिना गया"
 },
 "pts": {
  "bn": "পয়েন্ট",
  "hi": "अंक"
 },
 "Panchayats are ranked on numbers they report themselves. GramSatya checks those numbers against low-cost solar sensors, every few seconds, and keeps a record nobody can quietly rewrite.": {
  "bn": "পঞ্চায়েতের ক্রম ঠিক হয় তাদের নিজের দেওয়া সংখ্যায়। গ্রামসত্য সেই সংখ্যা সস্তা সোলার সেন্সর দিয়ে প্রতি কয়েক সেকেন্ডে যাচাই করে, আর এমন নথি রাখে যা কেউ চুপচাপ বদলাতে পারে না।",
  "hi": "पंचायतों का क्रम उनके खुद बताए आँकड़ों पर तय होता है। ग्रामसत्य उन आँकड़ों को सस्ते सोलर सेंसर से हर कुछ सेकंड में जाँचता है, और ऐसा रिकॉर्ड रखता है जिसे कोई चुपचाप नहीं बदल सकता।"
 },
 "For the Gram Panchayat office. Sign in with your panchayat code.": {
  "bn": "গ্রাম পঞ্চায়েত অফিসের জন্য। পঞ্চায়েত কোড দিয়ে সাইন ইন করুন।",
  "hi": "ग्राम पंचायत कार्यालय के लिए। पंचायत कोड से साइन इन करें।"
 },
 "For the Block Development Office. Sign in with your employee ID.": {
  "bn": "ব্লক উন্নয়ন অফিসের জন্য। কর্মচারী আইডি দিয়ে সাইন ইন করুন।",
  "hi": "प्रखंड विकास कार्यालय के लिए। कर्मचारी आईडी से साइन इन करें।"
 },
 "For the District Magistrate's office. Sign in with your employee ID.": {
  "bn": "জেলাশাসকের অফিসের জন্য। কর্মচারী আইডি দিয়ে সাইন ইন করুন।",
  "hi": "ज़िलाधिकारी कार्यालय के लिए। कर्मचारी आईडी से साइन इन करें।"
 },
 "For villagers. Sign in with your mobile number and a one-time code.": {
  "bn": "গ্রামবাসীর জন্য। মোবাইল নম্বর ও এককালীন কোড দিয়ে সাইন ইন করুন।",
  "hi": "गाँव वालों के लिए। मोबाइल नंबर और एक बार के कोड से साइन इन करें।"
 },
 "Or open your village's public page without signing in": {
  "bn": "অথবা সাইন ইন ছাড়াই গ্রামের সর্বজনীন পাতা খুলুন",
  "hi": "या बिना साइन इन गाँव का सार्वजनिक पेज खोलें"
 },
 "Signing in…": {
  "bn": "সাইন ইন হচ্ছে…",
  "hi": "साइन इन हो रहा है…"
 },
 "Other ways to sign in": {
  "bn": "অন্যভাবে সাইন ইন",
  "hi": "साइन इन के अन्य तरीके"
 },
 "Speak your report": {
  "bn": "মুখে বলে অভিযোগ জানান",
  "hi": "बोलकर शिकायत करें"
 },
 "Speaking language": {
  "bn": "কোন ভাষায় বলবেন",
  "hi": "बोलने की भाषा"
 },
 "Tap and speak": {
  "bn": "চাপুন ও বলুন",
  "hi": "दबाएँ और बोलें"
 },
 "Stop": {
  "bn": "থামান",
  "hi": "रोकें"
 },
 "Record again": {
  "bn": "আবার রেকর্ড করুন",
  "hi": "फिर से रिकॉर्ड करें"
 },
 "Remove": {
  "bn": "মুছুন",
  "hi": "हटाएँ"
 },
 "Voice note": {
  "bn": "ভয়েস নোট",
  "hi": "वॉइस नोट"
 },
 "Your words appear in the box as you speak. The recording is attached as a voice note.": {
  "bn": "বলার সাথে সাথে কথা বাক্সে লেখা হবে। রেকর্ডিং ভয়েস নোট হিসেবে যুক্ত হবে।",
  "hi": "बोलते ही शब्द बॉक्स में लिखे जाएँगे। रिकॉर्डिंग वॉइस नोट के रूप में जुड़ेगी।"
 },
 "This browser cannot turn speech into text, but your voice note will be attached.": {
  "bn": "এই ব্রাউজার কথাকে লেখায় বদলাতে পারে না, তবে ভয়েস নোট যুক্ত হবে।",
  "hi": "यह ब्राउज़र बोली को लिखावट में नहीं बदल सकता, पर वॉइस नोट जुड़ जाएगा।"
 },
 "Microphone permission was denied. Allow the microphone in your browser settings to record.": {
  "bn": "মাইক্রোফোনের অনুমতি দেওয়া হয়নি। রেকর্ড করতে ব্রাউজার সেটিংসে অনুমতি দিন।",
  "hi": "माइक्रोफ़ोन की अनुमति नहीं मिली। रिकॉर्ड करने के लिए ब्राउज़र सेटिंग में अनुमति दें।"
 },
 "Speech to text needs internet. Your voice note is still saved.": {
  "bn": "কথা থেকে লেখার জন্য ইন্টারনেট লাগে। ভয়েস নোট তবুও জমা আছে।",
  "hi": "बोली से लिखावट के लिए इंटरनेट चाहिए। वॉइस नोट फिर भी सहेजा गया है।"
 },
 "Could not turn speech into text. Your voice note is still saved.": {
  "bn": "কথা থেকে লেখা করা গেল না। ভয়েস নোট তবুও জমা আছে।",
  "hi": "बोली को लिखावट में नहीं बदल सके। वॉइस नोट फिर भी सहेजा गया है।"
 }
};

export function L(en: string): string {
  if (current === "en") return en;
  return P[en]?.[current] ?? en;
}

export function villageName(v: Pick<Village, "name" | "nameBn" | "nameHi">, lang: Lang = current) {
  return lang === "bn" ? v.nameBn : lang === "hi" ? v.nameHi ?? v.name : v.name;
}
