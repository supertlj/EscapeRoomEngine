# Cipher 1892 — 20-Room Campaign Plan

**Working title:** Cipher 1892 (store listing: *Cipher 1892 — Escape Room Mystery*)
**Format:** single connected campaign, persistent inventory & flags across rooms.
**Art budget:** tiered — 5 hero rooms, 15 lighter rooms remixing 6 environment kits.
**Mechanics:** current set + 4 new puzzle types (rotating dial, sliding tile, timed sequence, audio sequence).
**Difficulty:** curved across 4 acts (tutorial → standard → hard → expert).
**Platforms:** iOS + Android (Capacitor wrap of HTML5 + Canvas).
**Monetization:** ads + optional IAP, no content gating. See [MONETIZATION.md](MONETIZATION.md).

---

## Premise

You are **Sam Reyes**, an investigative journalist. Eighteen months ago you went undercover inside **Project MERIDIAN** — a private intelligence firm running illegal surveillance and targeted-elimination ops on civilian targets. Three nights ago, your cover blew. They drugged you. You don't remember the last 72 hours.

You wake in a safehouse apartment that isn't yours. The clothes fit. The fake ID in the wallet is yours. The laptop boots to a locked terminal. A scrap of paper in the drawer reads **"TAKI — password?"** When you guess right, the screen shows **1892** and unlocks file **#0042 — PROJECT MERIDIAN**.

You know who you are. You know the mission. You don't know what you did in those 72 hours, or why a person called **T** has been seeding clues across the city for whoever cracked Meridian's grid first.

The 20 rooms are the trail T left, the truth Meridian buried, and the answer to what happened in the missing days.

---

## The cast

### Sam Reyes — protagonist
Investigative journalist. Award-winning before "the breakdown" two years ago that everyone except you thinks was real. You know it was a cover-up — your old editor protected you from blowback after the original Meridian leak, and let everyone believe you'd cracked. You went undercover to finish what the leak started.

### The Director — antagonist
Your former editor. The man who recruited you, taught you the craft, signed off on your original Meridian story, and then — you'll discover — orchestrated everything. He left journalism years before you knew him; the newsroom was his cover. He runs Meridian. The reveal lands in Act 4.

### Talia ("T") — the ghost who's been guiding you
Your **older sister**, taken from your family at age four by an organization that became Meridian's predecessor. Trained, raised, eventually defected. She's been seeding clues across the city for six months — not for you, for whoever cracked Meridian's surveillance first. Act 4 reveals she's dead. Act 4 reveals she was your sister. The clues weren't aimed at you specifically; you happened to be the one who solved them.

### Marcus — the Watcher
Your old reporting partner from your first newspaper job. Vanished five years ago covering a story; everyone assumed Meridian killed him. He's alive — captured, "turned," used as Meridian's tracker for journalists who get too close. He's been following you the entire campaign, conflicted. The choice you make in Room 14 determines whether he surfaces as ally or enforcer in the finale.

### Lena Cho — recurring NPC
Your former editor's protégé, took over your beat after your "breakdown." Thinks you're paranoid. Appears in Rooms 4 (cubicle), 10 (subway tail), 18 (mausoleum). The Room 4 ethics-file choice determines whether she'll publish your story in the Expose ending.

### Kenji "Ken" Park — recurring NPC
Your photographer partner. Disappeared six months ago — you assumed Meridian got him. He's the anonymous source who tipped Talia to your existence. Appears in Rooms 7 (train), 13 (pirate bar), and the finale.

---

## Recurring narrative threads

- **T's notes** — handwritten cards in every room. Each is a partial cipher. All 20 → final vault code.
- **Keycard ladder** — file #0042 → #0043 → ... each room hands off the next clearance level.
- **The Watcher (Marcus)** — recurring shadow figure glimpsed in backgrounds (rooms 6, 11, 14, 17). Reveal in finale depends on Room 14 choice.
- **Project MERIDIAN dossier** — redacted pages reassembled across the campaign.
- **1892** — established as the laptop password. Acts 3 and 5 reveal it's the year of the **Homestead Strike** (Pinkerton mercenaries killed striking steelworkers, July 6, 1892) — the Director's ideological origin point. He sees Meridian as continuing a 130-year tradition of "private order keeping public order."

---

## Player choices (3 binary, 3 endings)

| # | Room | Choice | Effect |
|---|---|---|---|
| 1 | 4 | Read your old ethics-violation file, or shred it | Determines whether Lena Cho publishes your story in Expose ending |
| 2 | 14 | Surrender the bartender to save yourself, or save them | Determines whether Marcus surfaces as ally or enforcer in finale |
| 3 | 19 | Accept the Director's offer of safety, or reject it | Locks ending into Expose vs Burn |

### The three endings

- **Expose** — Release every file. Talia's identity becomes public posthumously; tabloids weaponize her work. You testify, you survive. The Director goes to prison. **Cost:** Marcus is killed in the raid; you'll testify for years.

- **Burn** — Kill the Director on his way to court. Meridian dissolves but its tools scatter to four other private intelligence firms. You become the thing you hunted. **Cost:** Marcus survives but never speaks to you again.

- **Vanish** (secret) — Take Talia's identity. Continue her infiltration. Erase Sam Reyes from existence. **Cost:** everyone you knew thinks you're dead. Marcus is the only one who knows. **Requires:** all 20 cipher notes collected + saving the bartender in Room 14 + rejecting the Director's offer in Room 19.

---

## Act 1 — The Missing Days (rooms 1–4)
Tutorial. Establish mechanics, voice, mystery. You're rebuilding the lost 72 hours.

| # | Room | Kit | Story beat | Mechanic intro |
|---|------|-----|-----------|----------------|
| 1 | The Apartment ✅ | wood | Wake in safehouse, find laptop + Talia's first note, escape | tap, code, key |
| 2 | Hotel Room | wood/neon | The hotel you blacked out in. Find a burner phone with one missed call from "K" | combine |
| 3 | Garden Shed | garden | Stash from before you went under; recover go-bag, passport, photo of you and Marcus from 5 years ago | pattern lock |
| 4 | Office Cubicle | lab | Your old workplace at night. Find the original Meridian leak draft + your ethics file. **Choice 1: read or shred.** Lena Cho appears (suspicious of you) | code lock |

**Act 1 reveal:** The "breakdown" two years ago was a cover. Your editor — the man you trust — built it for you so you could go under. (Not yet revealed: he built it because you were getting too close to *him*.)

---

## Act 2 — The Trail (rooms 5–10)
Standard. Following Talia's breadcrumbs, retracing what she found.

| # | Room | Kit | Story beat | New mechanic |
|---|------|-----|-----------|--------------|
| 5 | Library | wood | Talia worked here under an alias. Book-cipher reveals a meet location | bookshelf cipher |
| 6 | Antique Shop | wood | Shopkeeper dead — recently. Clock-dial code on his safe. **Watcher #1 glimpsed in shop window** | **rotating dial** |
| 7 | Train Cabin | metal | Ken Park appears, slips you a USB, exits at next stop without speaking | timed dialogue |
| 8 | Greenhouse | garden | Ken's contact (a botanist) decrypts the USB. Light/water sequence to retrieve key | sequence |
| 9 | Recording Studio | lab | Hidden audio confession on a master tape: a Meridian operative on his deathbed naming the Director's predecessor | **audio sequence** |
| 10 | Subway Car | metal | Tail a Meridian agent. Lena Cho is on the same train (coincidence?). Read agent's briefcase before his stop | map cipher |

**Act 2 reveal:** Project MERIDIAN is a kill list. Your name is on it. So is Talia's. So was Ken's, six months ago.

---

## Act 3 — Going Underground (rooms 11–14)
Hard. Stealth & evasion. Rooms 12 and 14 introduce timer pressure.

| # | Room | Kit | Story beat | New mechanic |
|---|------|-----|-----------|--------------|
| 11 | Magician's Dressing Room | neon | A friend of Talia's hides you. Mirror reflections puzzle. **Watcher #2: Marcus is in the audience** | mirror reflection |
| 12 | Dentist's Office | lab | Tracker-chip removal, racing the clock. **Reveal: 1892 = Homestead Strike. The Director's worldview.** | timed extraction |
| 13 | Pirate-themed Bar | wood | Speakeasy front. Map fragments lead to a buried microfilm. Ken meets you here, won't stay long | combine fragments |
| 14 | Speakeasy | wood | Meridian raids the bar. **Choice 2: surrender the bartender or save them.** **Watcher #3: Marcus leads the raid** | timed escape |

**Act 3 reveal:** The Director isn't your father. The Director is **your old editor** — the man who taught you journalism, who you trust completely. The leak two years ago. The "breakdown." Going under. He was orchestrating all of it.

---

## Act 4 — Striking Back (rooms 15–18)
Hard. Player goes on offense.

| # | Room | Kit | Story beat | New mechanic |
|---|------|-----|-----------|--------------|
| 15 | Forensics Lab | lab | Break into police evidence. Recover a suppressed report — the Director's name on a redacted witness list from 2003 | fingerprint match |
| 16 | Satellite Uplink Station | metal | Sabotage Meridian's surveillance grid | **timed sequence** + airlock |
| 17 | Clocktower | stone | Signal-repeater jam. Gear assembly. **Watcher #4: Marcus is here, watching, doesn't intervene** | **sliding tile** |
| 18 | Mausoleum | stone | T's hiding spot. **T is dead — body in the crypt.** Recover her final cache + the vault address. Lena Cho appears, having followed you, asking if she should run the story | Roman numeral cipher |

**Act 4 reveal:** T was **Talia, your older sister**. Taken from your family before you can remember. Adopted records sealed by Meridian's predecessor. She defected, hid in plain sight, left clues for whoever could read them. The clues weren't for you specifically — you happened to be the one who solved them. She didn't know it was her brother.

---

## Act 5 — The Vault (rooms 19–20)
Expert. Multi-area, real consequences.

### Room 19 — The Editor's House (3 sub-rooms)
The Director's home. Ghost-light puzzles map onto memories of the newsroom — late nights, mentorship moments, the first story he sent you on. He appears in person.

**Choice 3:** he offers safety, a quiet life, no more running, in exchange for the files. Accept or reject.

| Sub-room | Beat |
|---|---|
| 19a — The Study | Read his journals. Discover he picked you because you reminded him of himself at 25 |
| 19b — The Library | Find the original Homestead Strike research. He's been writing a book justifying Meridian for a decade |
| 19c — The Roof | Confrontation. The choice |

### Room 20 — The Vault (4 sub-rooms)
Meridian HQ. Final heist. The 20 collected T-notes spell the vault code.

| Sub-room | Beat | Mechanic |
|---|---|---|
| 20a — Lobby | Pose as Director's guest using his keycard | social puzzle |
| 20b — Server Floor | Plant the data dump | timed sequence |
| 20c — Operations | The Watcher reveal: **Marcus.** Ally or enforcer per Room 14 choice. If ally, Ken Park arrives to extract you both | **meta cipher** |
| 20d — The Director's Office | Final puzzle: open the vault using the 20 T-notes. Inside: the killswitch for the entire surveillance grid + the Director's confessions on tape + the truth about Talia's death (the Director ordered it personally) |

---

## Environment kits (shared SVG modules)

Six reusable kits define wall/floor gradients, common hotspot frames, hardware metals.

| Kit | Rooms |
|-----|-------|
| **woodKit** | 1, 2, 5, 6, 13, 14, 19 |
| **metalKit** | 7, 10, 16, 20 |
| **stoneKit** | 17, 18 |
| **labKit** | 4, 9, 12, 15 |
| **gardenKit** | 3, 8 |
| **neonKit** | 2 (accent), 11 |

Each kit exports gradients (`kitWood-floor`, `kitWood-wall`), hardware presets (`kitWood-brass`, `kitMetal-chrome`), and stock hotspot shells (drawer, cabinet, door, vent).

---

## Engine work needed

### Gameplay modules

| Module | Lines (est.) | Notes |
|--------|-------------|-------|
| `RotatingDial.js` | ~80 | drag-to-rotate, snap to clicks, target angle |
| `SlidingTile.js` | ~150 | n×n grid, hit-test for adjacent swaps |
| `TimedSequence.js` | ~60 | tap order under countdown, fail = reset |
| `AudioSequence.js` | ~100 | WebAudio tone playback + tap-back |
| `CampaignSave.js` | ~80 | extends StateManager: room completion, flags, notes, chapter, choices |
| `RoomHub.js` | ~120 | room selection screen, completion tracking, save slots |
| `NoteCollector.js` | ~50 | inventory tab for the 20 T-notes; reveals when full |
| `WatcherSprite.js` | ~30 | shared Marcus shadow-figure asset rendered into 4 backgrounds |
| **Cipher helpers** | ~80 | book cipher, Roman numeral, map cipher utilities |
| `AudioManager.js` | ~120 | BGM crossfade, SFX pool, volume settings, mute toggle |
| Settings menu additions | ~30 | BGM/SFX volume sliders, mute |

### Mobile + monetization modules

See [MONETIZATION.md](MONETIZATION.md) for full breakdown. Adds ~860 lines across 10 modules (`MonetizationManager`, `EntitlementsStore`, `TokenWallet`, `RoomGateUI`, `AdGate`, `RewardedHooks`, `HintShopUI`, `TipJarUI`, `Telemetry`, `ConsentManager`).

### Capacitor wrap

| Plugin | Purpose |
|---|---|
| `@capacitor/preferences` | Persistent save data (replaces localStorage on native) |
| `@capacitor/app` | Lifecycle events (pause/resume) |
| `@capacitor/splash-screen` | Native splash on launch |
| RevenueCat SDK | IAP receipt validation, restore purchases |
| AdMob plugin (Capgo / official) | Ad SDK bridge |

---

## Production order

| Phase | Work | Estimate |
|-------|------|----------|
| **A. Engine** | 4 puzzle types + campaign save + hub + AudioManager | ~1.5 weeks |
| **B. Kits** | 6 environment kits | ~3 days |
| **C. Tier 1 rooms** | Rooms 2–4 | ~3 days |
| **D. Tier 2 rooms** | Rooms 5–10 (incl. 1 hero room: 6 or 9) | ~1.5 weeks |
| **E. Tier 3 rooms** | Rooms 11–14 | ~1 week |
| **F. Tier 4 rooms** | Rooms 15–18 (incl. 1 hero room: 17 or 18) | ~1.5 weeks |
| **G. Finale** | Rooms 19–20 multi-area, branching, endings | ~1.5 weeks |
| **H. Audio** | License 6 BGM tracks + ~36 SFX, integrate, balance | ~1 week |
| **I. Polish** | Hint scripts, balance pass, save slots, hub UI | ~1 week |
| **J. Mobile wrap** | Capacitor setup, AdMob + RevenueCat integration, gate UX, consent flow | ~2 weeks |
| **K. Marketing assets** | Icon, screenshots, store preview video, store copy | ~1 week |
| **L. Soft launch** | Closed beta + soft launch in PH + VN, 2 weeks tuning | ~3 weeks |
| **M. Global launch** | Address top complaints from soft launch, 1.0.1 build, ship | ~1 week |

**Total: ~16 weeks dev + launch.**

Hero rooms (full custom art): **1 (apartment, done), 6 (antique shop), 9 (recording studio), 17 (clocktower), 19 (editor's house finale)** — 5 total.

---

## Deliverables per room

Every room ships with:
- `assets/rooms/<id>/main/*.svg` (background + props, kit-derived)
- `assets/rooms/<id>/zoom/*.svg` (interactive close-ups)
- `js/data/rooms/<id>.json` (hotspots, items, puzzles, hints, story beats)
- `js/data/notes/<id>.json` (Talia's note text + cipher fragment)
- 2–3 progressive hints
- 1 lore drop (letter / phone / overheard)
- 1 ambient SFX loop appropriate to the room

## Audio

| Asset | Count | Source for v1 |
|---|---|---|
| BGM tracks (main theme, tense ambient, action, investigation, finale, victory) | 6 | Royalty-free library (Epidemic Sound / Artlist / Pixabay) |
| UI SFX (taps, dialogs, pickups) | ~10 | freesound.org (CC0) or bundled SFX pack |
| Puzzle SFX (lock-click, drawer, key-turn) | ~12 | same |
| Ambient room loops (clock, traffic, hum, wind) | ~6 | same |
| Story moment SFX (phone ring, paper rustle, lighter, flashlight) | ~8 | same |

License all assets for commercial use before integration. Settings menu exposes BGM and SFX volume sliders + mute toggle.

---

## Open decisions

- Protagonist gender / pronouns — Sam Reyes is gender-neutral by design; player can be read as either. Confirm or pin to specific pronouns?
- Tone — current default: noir-thriller (alt: grounded mystery, or pulpy)
- Voice acting — none in v1 (text only). Revisit for sequel.
- Localization — English-only v1, JSON structured for later l10n
- App name — **Cipher 1892** (working). Pre-launch availability checks pending.

---

## Status

- [x] Apartment hero room art
- [x] Campaign narrative outline (5 acts, 20 rooms, 3 endings)
- [x] Story polish (Sam Reyes / Director / Talia / Marcus / 1892 Homestead)
- [x] Monetization plan ([MONETIZATION.md](MONETIZATION.md))
- [ ] App name availability checks (App Store / Google Play / USPTO / domain)
- [ ] Engine: 4 new puzzle types
- [ ] Engine: campaign save + hub
- [ ] Engine: AudioManager + settings
- [ ] 6 environment kits
- [ ] Rooms 2–20
- [ ] Story content (40 narrative beats + 30 letters/notes)
- [ ] 20 cipher fragments → final vault code
- [ ] 3 endings + branching logic
- [ ] Audio: 6 BGM tracks + ~36 SFX licensed and integrated
- [ ] Capacitor wrap (iOS + Android)
- [ ] AdMob + RevenueCat integration
- [ ] Soft launch in PH + VN
- [ ] Global launch
