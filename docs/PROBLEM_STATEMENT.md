# GramSatya: Verified Village Data for Panchayats

**One-line pitch:** A village whose data cannot be faked. GramSatya turns low-cost sensors and citizen reports into a live, tamper-proof scorecard for every Gram Panchayat. Block and district officers can then see real conditions, catch false reports and send funds where they are needed most.

**Theme:** Rural governance, civic tech and disaster resilience
**Focus state:** West Bengal (coastal and flood-prone blocks first)

---

## 1. Problem statement

Gram Panchayats are now ranked on how well they serve villagers. The Ministry of Panchayati Raj's **Panchayat Advancement Index (PAI)** scores every Gram Panchayat across **9 Localised SDG themes** (water-sufficient, clean and green, self-sufficient infrastructure, good governance and more), using **435 local indicators**. These rankings feed planning (GPDP), awards and fund decisions.

The weak link is the data underneath. Most indicators are entered by the panchayat itself or by line departments through a portal: on paper, by self-declaration, once a year. Nobody checks them independently in between. This causes three problems:

1. **Inflated or stale data.** A panchayat can report "all handpumps working, all streetlights on" while half of them have failed. Officers have no cheap way to check, so the best reporters, not the neediest villages, get attention and money.
2. **Public works that stop working.** Ponds and check dams built under MGNREGA and Amrit Sarovar are inaugurated, photographed and marked complete. Many dry up within a year. Nobody tracks whether the money created something that lasts.
3. **No warning when it matters.** In cyclones and floods (Aila, Amphan, Yaas), mobile networks fail exactly when villages in coastal Bengal and the Sundarbans need warnings. Rising water often goes unnoticed until it is too late.

**Who is affected**
- **Villagers:** especially women, the elderly and BPL households, who depend most on handpumps, streetlights and early warnings.
- **Panchayat secretaries and Pradhans:** honest panchayats have no way to prove their performance.
- **Block (BDO) and district officers:** they allocate funds and audit schemes based on unverified paper data.
- **CSR funders and auditors:** they need proof of outcomes, not proof of spending.

**Current gaps**

| Today | Gap |
|---|---|
| Self-reported annual indicators | No independent, continuous verification |
| Geo-tagged photo at completion of a work | No proof it still works months later |
| Paper or WhatsApp complaints | Not linked to any data, easy to ignore, no closure tracking |
| SMS or app alerts | Fail when the network fails; often not in Bengali |
| Fund allocation by formula and lobbying | No live "need" signal per village |

---

## 2. Proposed solution: GramSatya

One platform with three modules, sharing one data layer:

### Module A: Gram Scorecard (core)
- Low-cost solar sensor nodes (ESP32 + LoRa/GSM) measure **water tank level, handpump flow, streetlight status, waste-bin fill** and send readings automatically.
- The software converts readings into a **live 0–100 village score** mapped to PAI themes (Water-sufficient, Clean and green, Infrastructure, Good governance).
- **Self-report vs sensor check:** if the panchayat claims 100% streetlights working but sensors show 60%, the system flags a **mismatch** automatically.

### Module B: Public Asset Verification
- Water-level sensors on ponds and check dams built under MGNREGA and Amrit Sarovar.
- A public map shows each asset as **Working / At risk / Dried up**, with 12-month history and **cost per working month**, so auditors see whether the money created something that lasts.

### Module C: Offline Disaster Alerts
- River and tank level sensors **auto-trigger alerts** when water crosses a danger line.
- The panchayat broadcasts **Bengali voice alerts** to LoRa sirens across the village with no internet needed. Each siren node confirms delivery.
- Villagers can send an **SOS back** through the same network.

### Added features (beyond the base idea)

| Feature | What it does | Why it matters |
|---|---|---|
| **Monthly declaration check** | The panchayat submits its monthly figures in the app and they are compared with sensor readings right away | Over-reporting is caught before it reaches the portal or the ranking |
| **Citizen reports** | Villagers report a broken handpump, dark streetlight or overflowing bin with photo and GPS | Reports are **cross-checked with sensors** ("Confirmed by sensor" or "Needs field check"), so complaints cannot be ignored or faked |
| **Tamper-proof ledger** | Every reading is hash-chained (SHA-256) and devices sign data with HMAC keys | If anyone edits a past record, the chain breaks and the record is flagged red |
| **Data trust score** | Shows what share of a village's score comes from verified sensors and what share from self-reporting | Officers know how far to trust each number |
| **AI insights** | Plain-language summary and action plan for the panchayat, in Bengali and English | Turns data into "fix these 3 things this week" |
| **Public QR page** | Every village gets a QR code to put on the panchayat office wall, opening its live public scorecard | Transparency for citizens and social audits (Gram Sabha) |
| **Fund priority ranking** | The district view ranks villages by need (low score, high population, disaster risk) and suggests how to split a budget | Fairer, explainable fund allocation |
| **Role-based views** | Separate views for Citizen, Panchayat, Block officer and District officer | Each user sees only what they need |
| **Works offline (PWA)** | Installs on a phone; reports are saved offline and synced later | Built for weak rural networks |
| **Hardware path** | ESP32 firmware with signed uploads, plus a device simulator | Shows the hardware is real and cheap |

---

## 3. What makes it different

- **A data layer, not a single gadget.** Most projects build one sensor for one problem. GramSatya is one system with many indicators and one live village score.
- **Accountability built in.** Sensor data, citizen reports and self-reports check each other. Tampering is visible.
- **Built for real rural conditions:** low cost, solar powered, works offline, speaks Bengali.

**Honest positioning:** Some programmes already use sensors (for example, IoT water-supply monitoring pilots under Jal Jeevan Mission). GramSatya does not claim to be the first sensor in a village. It claims to be **cheaper, multi-indicator and unified**, with verification and transparency as the core purpose.

---

## 4. Impact and alignment

- **Panchayat Advancement Index and Localised SDGs:** gives verified, continuous data for PAI themes instead of yearly self-declaration.
- **MGNREGA and Amrit Sarovar social audits:** proof of outcome for public works.
- **Disaster preparedness:** last-mile, network-independent warnings for coastal Bengal.
- **Fairer funds:** need-based ranking makes allocation explainable.

**Measurable outcomes for a pilot (1 block, 10 villages, 6 months):**
- Share of indicators verified by sensors (target above 60%)
- Self-report mismatches found and corrected
- Median days to fix a citizen-reported fault
- Water assets confirmed working after 12 months
- Alert delivery time to sirens during drills (target under 60 seconds)

---

## 5. Cost and business model (estimates, to be validated)

- **Sensor node:** ESP32 + sensor + LoRa + small solar panel, roughly ₹1,500–3,000 per node.
- **Starter kit:** 6–10 nodes per village.
- **Model:** hardware at cost; software as a yearly subscription for block and district offices; impact-verification reports for CSR funders.

---

## 6. Prototype scope (this hackathon)

Working web app with simulated sensors (so the demo never fails), plus ESP32 firmware and a device simulator for the hardware path:
- 5 demo villages in one block in West Bengal, with live scores and trends
- Asset map with 12-month pond history
- Alert console with auto-trigger, Bengali voice playback and siren delivery status
- Citizen report form with photo, GPS and sensor cross-check
- Ledger with "simulate tampering" and "verify chain"
- Fund priority ranking with budget split
- Public QR page per village
- Installable PWA with offline report queue

*All village names and figures in the prototype are simulated demo data. Verify current scheme names and figures before presenting, since programmes get renamed and updated.*

**Sources:** Ministry of Panchayati Raj, Panchayat Advancement Index 2.0 report (PIB, April 2026); pai.gov.in.
