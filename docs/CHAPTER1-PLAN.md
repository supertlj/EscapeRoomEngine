# Cipher 1892 — Chapter 1 Plan

**Status:** ACTIVE — execution plan for Chapter 1 web release.
**Working title:** Cipher 1892 (Chapter 1 — Awakening)
**Long-term vision:** see [CAMPAIGN.md](CAMPAIGN.md) (20-room arc) and [MONETIZATION.md](MONETIZATION.md) (mobile commercial model). Chapter 1 is the validation gate for both.

---

## The decision

Three-phase plan to commercial mobile launch:

```
PHASE 1                    PHASE 2                    PHASE 3
──────                     ──────                     ──────
Web alpha — Chapter 1      Web alpha — Chapter 2      Mobile public launch
(friends only)             (friends only)             (Chapter 1 + 2 bundled)

~5 weeks                   ~3-4 weeks                 ~6 weeks
4 rooms + foundation       6 rooms (Acts 2-ish)       Capacitor + ads + IAP
AI gate → continue?        AI gate → ship?            + soft launch PH/VN
                                                      + global launch
```

**Total to public: ~14-15 weeks from today.**

The web phases are private playtests (you + ~5-15 friends) for product-quality validation. **The mobile launch is the commercial moment** — chapters 1+2 bundled creates a real product (~90 min content), not a teaser.

This is a deliberate scope reduction from the original 20-room plan. The long-term vision (chapters 3-5, mobile commercial campaign) lives in [CAMPAIGN.md](CAMPAIGN.md) and [MONETIZATION.md](MONETIZATION.md). Chapter 1+2 mobile launch is the gating event.

---

## Decisions locked

| # | Decision | Lock |
|---|---|---|
| 1 | Mode | Scope reduction with platform architecture |
| 2 | Chapter 1 size | 4 rooms |
| 3 | Ship target | Three phases: web c1 (private) → web c2 (private) → mobile c1+c2 (public) |
| 4 | Rooms | Apartment, Hotel, Laundromat, Office |
| 5 | Architecture | Self-contained chapter folders |
| 6 | End screen | Cinematic cliffhanger (Marcus eye-track), no email/share/tip CTAs (private alpha) |
| 7 | Opening | 45s SVG cinematic, skippable, noir tone |
| 8 | Distribution | None for web phases (private to friends). Mobile phase uses MONETIZATION.md plan. |
| 9 | Schedule | Phase 1: ~5 weeks, Phase 2: ~3-4 weeks, Phase 3: ~6 weeks |
| 10 | Hosting | Cloudflare Pages (private URL shared with friends) |
| 10a | Email capture | None |
| 10c | Tip jar | None on web. Mobile uses MONETIZATION.md plan. |
| 11 | Story polish | Strengthen Room 2 — drafted email to Lena about Marcus |
| 12 | Infra | Build chapter 1 as template; ship woodKit, labKit, rotating-dial system |
| 13 | Workflow | First-draft pass (wks 1–3) → chapter-wide polish (wk 4) |
| 14 | Decision tree | AI outside voice with pre-committed prompt template at each gate |
| 14a | Outside voice | Codex (preferred) / ChatGPT / Gemini — never Claude, never edit the prompt |
| E1 | Tests | Smoke tests via Playwright + GitHub Actions |
| E2 | Save forward-compat | Version field + migrations |
| E3 | Chapter manifest | Structured schema with content + behavior; BGM in manifest |
| E4 | Engine refactor | Single path-resolution layer (ChapterIndex.js) |
| E5 | Error handling | Structured errors + recovery paths + manual save-reset |
| E6 | Performance budget | Explicit budget + lazy-load + svgo; preload all rooms in background |
| E7a | Cinematic skip | Auto-skip after first watch; "Replay intro" in settings |
| E7b | Audio licenses | `audio/LICENSES.md` per-track tracking |
| E7c | CI gate | Cloudflare Pages deploy gated on smoke test pass |

---

## Premise (chapter-1 framing)

You are **Sam Reyes**, an investigative journalist. Eighteen months ago you went undercover inside **Project MERIDIAN**. Three nights ago, your cover blew. They drugged you. You don't remember the last 72 hours.

You wake in a safehouse. You know who you are. You know the mission. You don't know what you did in those 72 hours, or why a person called **T** has been seeding clues across the city.

**The chapter-1 arc:** rebuild the missing 72 hours, escape immediate danger, discover that **Marcus — your old reporting partner you thought was dead — is alive, and he's not on your side.**

**End-of-chapter feeling:** complete novella. Discrete twist resolved (Sam knew Marcus was alive, was about to tell Lena, blackout stopped them). Cliffhanger promises chapter 2 (Marcus is hunting).

---

## The 4 rooms

| # | Room | Story beat | Centerpiece puzzle | New mechanic |
|---|------|-----------|---------------------|--------------|
| 1 | Apartment ✅ | Wake in safehouse. Find laptop. "TAKI" → 1892 → File #0042 reveals MERIDIAN. First T-note. Escape via keycard. | Existing | None — already built |
| 2 | Hotel | The blackout hotel. Centerpiece: **drafted email to Lena about Marcus** that Sam wrote and saved but never sent. The blackout interrupted them mid-revelation. | Reconstruct the email's contents from fragments around the room. | None |
| 3 | Laundromat | First contact with T (text-rendered voicemail). First NPC encounter (silent owner who slides Sam a key). | Identify the right washer from clues, retrieve coat with hidden phone. | Animated washers (SVG transform loops) |
| 4 | Office Cubicle | Old workplace at night. Lena Cho appears (suspicious of Sam). **Choice 1 — read or shred your old ethics file.** Original Meridian leak draft. Marcus photo on the wall. | Code lock on filing cabinet derived from Lena's desk artifacts. | None |

**Recurring NPC introductions:**
- **Lena Cho** — physically appears in Room 4. The ethics-file choice carries forward as a flag for future chapters.
- **Marcus** — appears only in the outro cinematic (eye-track moment). Background-Watcher appearances deferred to chapter 2.
- **Ken Park ("K")** — referenced only via the missed call on the Hotel burner phone. No physical appearance in chapter 1.

---

## Bookend cinematics

### Opening (45s, SVG, skippable)

6 sequential scenes with typewriter text overlays:
1. Newsroom desk, Sam at work. *"Sam Reyes, 2024."*
2. Fake ID card with Sam's photo. *"Eighteen months undercover."*
3. Dark hotel room, phone glowing. *"Three nights ago, your cover blew."*
4. Hand reaching for water glass. *"They drugged you."*
5. Fade to white, then to apartment ceiling fan. *"You don't remember the last 72 hours."*
6. Fade to gameplay.

Skip button visible top-right throughout.

### Outro (post-Room 4, ~30s, SVG)

Sam reads the leaked Meridian story on the office computer. Looks up at the photo of Marcus pinned to the cubicle wall. Marcus's eyes track Sam's. Cut to black.

Text fades in:
> *"He's alive."*
> *"And he's not on your side."*
>
> **CHAPTER 2 — THE TRAIL — Coming soon**

Then: primary CTA = email-style "notify me" placeholder (deferred for v1, just shows as static text). Secondary CTAs (smaller, below divider): Share / Replay / Tip ($3 BMAC).

---

## Architecture — chapter folder structure

```
js/data/chapters/
  c01-awakening/
    manifest.json           ← chapter metadata, intro/outro refs, room list
    rooms/
      apartment.json
      hotel.json
      laundromat.json
      office.json
    notes/                  ← Talia's per-room cipher notes
    audio/                  ← chapter-specific BGM (if needed)
  c02-the-trail/            ← future, drops in cleanly
```

**Engine modules touched:**
- `RoomManager.js` — load chapter manifest, resolve room paths through chapter folder
- `StateManager.js` — extend with `completedChapters[]`, `currentChapter`, `chapterFlags{}`, choice flags
- New: `ChapterManifest.js` — validate + load chapter.json
- New: `HubUI.js` — multi-chapter ready (shows Chapter 1 + "Chapter 2 — coming soon" placeholder)
- New: `AudioManager.js` — BGM crossfade + SFX pool, keyed by chapter

**Reusable infrastructure built in chapter 1 for chapter 2+ inheritance:**
- **woodKit** — wood/brass color palettes, hardware shells. Chapter 2 inherits for library, antique shop, speakeasy.
- **labKit** — fluorescent/chrome/concrete palettes. Chapter 2 inherits for recording studio.
- **Rotating-dial puzzle system** — built but unused in chapter 1; ready for chapter 2 antique shop.

---

## Production schedule

### Pre-Week 1 (this week)

- [ ] Confirm **AI outside voice** model selection (Codex / ChatGPT / Gemini — anything but Claude).
- [ ] Buy `cipher1892.com` (fallback: `cipher1892.app`, `playcipher1892.com`).
- [ ] Set up Cloudflare Pages account.
- [ ] Verify Cipher 1892 has no store conflicts (App Store + Play Store + USPTO TESS) — for mobile phase.

(Skipped: Plausible, BMAC, distribution accounts — all unnecessary for private alpha.)

### Week 1 — Foundation

| Day | Deliverable |
|---|---|
| Mon | Chapter folder refactor. Apartment migrates to `js/data/chapters/c01-awakening/`. Engine loads chapter manifest. |
| Tue | Save data + completion tracking. Multi-chapter Hub UI (with c02 placeholder). |
| Wed | End-screen wireframe (cinematic outro placeholder, no email/share/tip CTAs for private alpha). |
| Thu | Smoke test infrastructure — Playwright setup, GitHub Actions workflow, Cloudflare deploy gate config. |
| Fri | Animated intro cinematic — 6 SVG scenes + skip button. |

### Week 2 — Hotel + Laundromat (first-draft)

| Day | Deliverable |
|---|---|
| Mon–Wed | **Hotel room first-draft.** Drafted-email-to-Lena puzzle. Ship-bar checklist hit, then locked. |
| Thu | woodKit refactored from Hotel work. |
| Fri | **Laundromat first-draft** — animated washers, voicemail mechanic, NPC owner. labKit emerges. |

### Week 3 — Office + outro + audio

| Day | Deliverable |
|---|---|
| Mon–Wed | **Office room first-draft.** Lena appearance, ethics-file choice, leak draft, Marcus photo. |
| Thu | Outro cinematic — Marcus eye-track. Rotating-dial puzzle system built (idle, ready for c02). |
| Fri | Audio integration — 2 BGM + ~15 SFX licensed (CC0/Pixabay/freesound). Settings panel. |

### Week 4 — Phase 2 polish

| Day | Deliverable |
|---|---|
| Mon | **Phase 1 gate.** All 4 rooms locked. End-to-end playtest with 3 outside testers. |
| Tue–Thu | Chapter-wide polish: visual consistency, typography, animation timing, audio mix, pacing. Bug fixes. |
| Fri | Second playtest with 2 fresh testers. Final bug pass. |

### Week 5 — Ship to friends

| Day | Deliverable |
|---|---|
| Mon | Final polish. Hosting setup (Cloudflare deploy from `main` branch). |
| Tue | Deploy to `cipher1892.com`. Smoke test live. Verify save round-trip. |
| Wed | Send the URL to ~10 friends with a short personal note. No public posts. |
| Thu–Fri | Friends play. You collect raw feedback (text/DM/in-person). Save it raw — do not summarize. |

### Week 6 — Phase 1 Gate

| Day | Deliverable |
|---|---|
| Mon–Wed | Continue collecting friend feedback. Don't iterate. Save game-state files for completion verification. |
| Thu | **Run the AI outside voice prompt** (template below). Paste raw feedback + completion data. Whatever the AI says (GREEN / YELLOW / RED), commit to the action. |
| Fri | If GREEN: start Chapter 2 prep. If YELLOW: 2-week iterate sprint. If RED: write postmortem, take 2 weeks off, redecide. |

---

## Phase 1 ship-bar checklist (per room)

A room is locked when ALL of these are true:

- [ ] All hotspots wired and triggerable
- [ ] All puzzles solvable end-to-end
- [ ] All story beats present (notes, dialog, items)
- [ ] Art readable (no broken layouts, no missing assets)
- [ ] 30-second visual identity established (the "look" is set, even if rough)
- [ ] All Talia notes placed and discoverable
- [ ] Save/load round-trips correctly mid-room
- [ ] Hint system functions (existing UI)

Once locked, no edits to that room until Phase 2 (Week 4).

---

## Phase 2 polish targets (chapter-wide, Week 4)

- **Visual consistency** — color palettes, lighting, brass/wood tones aligned across all rooms
- **Typography pass** — single type system across all rooms
- **Animation timing pass** — zoom durations, hotspot pulse, transitions consistent
- **Audio mix** — BGM crossfades, SFX leveling, ambient loops at the right volume
- **End-to-end pacing** — does the chapter feel right at ~45 min? Are there boring patches?
- **Apartment-to-rest delta** — bring Hotel/Laundromat/Office to consistent quality with apartment slightly above. Don't push them to apartment level (overbudget).

---

## Gate criteria (pre-committed, do not edit later)

Two gates between you and mobile launch. Each uses the AI outside voice prompt template (below). The criteria below were written *before* any data exists. They are not negotiable in week 6 / week 10.

### Phase 1 Gate (Week 6) — Continue to Chapter 2 web alpha?

**GREEN if ALL of:**
- 5+ friends started Chapter 1
- 4+ friends finished Chapter 1 (saved game state proves it)
- 3+ friends said unprompted (text/DM/in-person, not solicited) that they liked it
- Zero friends got stuck and gave up

**YELLOW (any 1 missed):** iterate 2 weeks, retest.
**RED (3+ missed):** mothball. Write a postmortem. Take 2 weeks off. Redecide.

### Phase 2 Gate (Week 10) — Start mobile production?

**GREEN if ALL of:**
- 5+ friends played Chapters 1 AND 2 end-to-end
- 4+ friends finished Chapter 2 (started AND completed it)
- 3+ friends said unprompted that they want Chapter 3
- You can name 2 specific moments friends reacted positively to (not "they liked it" — actual specific reactions)

**YELLOW (any 1 missed):** iterate Chapter 2 for 2 weeks, retest.
**RED (3+ missed):** mothball commercial mobile plan. Continue as hobby or kill.

## AI outside voice — gate prompt template

Use **Codex (preferred)** / ChatGPT / Gemini at week 6 and week 10. Never Claude (this conversation contaminates the answer). Paste verbatim. Do not edit. Do not pre-summarize the data. Whatever the AI says, you do.

```
You are an honest indie-game advisor reviewing a solo developer's progress.
You have no investment in the outcome. Be terse. No compliments.

THE PROJECT: Cipher 1892, a narrative escape-room game. Web alpha is
private (friends only). Mobile public launch is the commercial vehicle.
The decision today is whether to continue to the next phase or stop.

PRE-COMMITTED CRITERIA (do not negotiate these — they were written
before the data was seen):

PHASE 1 GATE (week 6):
  GREEN if ALL of:
    - 5+ friends started Chapter 1
    - 4+ friends finished Chapter 1 (saved game state proves this)
    - 3+ friends said unprompted (text/DM/in-person, not solicited)
      that they liked it
    - Zero friends got stuck and gave up

PHASE 2 GATE (week 10):
  GREEN if ALL of:
    - 5+ friends played both Chapter 1 AND Chapter 2 end-to-end
    - 4+ friends finished Chapter 2
    - 3+ friends said unprompted that they want Chapter 3
    - Developer can name 2 specific positive reaction moments

THE DATA:

[paste raw friend feedback, screenshots of chats, save data counts,
 anything else relevant — do NOT pre-summarize, paste raw]

YOUR JOB:
1. Check each criterion against the data.
2. State GREEN / YELLOW / RED.
3. If GREEN: state "continue to next phase."
4. If YELLOW (any 1 missed): "iterate 2 weeks, retest."
5. If RED (3+ missed): "mothball. write a postmortem."
6. Do not soften the verdict. Do not add caveats. State the action.

If the developer's data is incomplete or vague (e.g., "I think they
liked it" without specifics), say so explicitly. Do not infer favorably.
```

**Rules:**
1. Paste the prompt verbatim. Do not edit it.
2. Paste the data raw. Do not pre-summarize.
3. Whatever the AI says, you do. Do not ask "are you sure?"
4. Do not use Claude.
5. The impulse to re-ask after a RED verdict is exactly what this framework catches. The verdict stands.

---

## Risks (priority order)

1. **Polish-spiral slippage.** Mitigated by Workflow B discipline. If you slip into per-room polish during Phase 2, schedule slips. Watch for it.
2. **AI outside voice rationalization.** Without a human buddy, the failure mode shifts to "edit the prompt until the AI agrees." Mitigation: prompt template above is locked verbatim. Do not edit. Do not re-prompt. The discipline lives in this commitment now (when honest), not week 6 (when not).
3. **Solo-dev burnout between c1 and c2.** Take 1 full week off after Week 5 ship before c2 prep. Scheduled, not optional.
4. **Friends are kind.** Friend feedback skews positive. The criteria above (4 of 5 finished, 3 unprompted positive reactions) defend against this — but only if you hold the line. If a friend says "yeah it's cool" with no specifics, that does NOT count as "said unprompted they liked it."
5. **Story compression doesn't land.** Sam's 18-month backstory is heavy for 45 min. Watch playtest reactions — if testers don't bond with Sam, the strengthened Hotel room is the lever.
6. **Apartment overbuilt vs other rooms.** In Phase 2 polish, bring others to *consistent* quality, not apartment-level. Visual hierarchy is fine.
7. **Real-world setup friction.** Cloudflare account setup, domain DNS, may eat unexpected time. Do Pre-Week 1.

---

## What's NOT in v1.0 (deferred)

| Deferred | Where it lives later |
|---|---|
| Capacitor mobile wrap | Post-Chapter 2, if signal is green |
| AdMob, RevenueCat, IAP system | Post-Chapter 2, if signal is green |
| ATT/UMP consent flows | Post-Chapter 2, if signal is green |
| 3 of 4 new puzzle types (sliding tile, audio sequence, timed sequence) | Chapters 2+ as needed |
| 4 of 6 environment kits (stoneKit, gardenKit, neonKit, metalKit) | Chapters 2+ as needed |
| Watcher in-room background appearances | Chapter 2 |
| Hint Tokens economy + cooldowns + daily login | Mobile commercial release |
| Achievements | Mobile commercial release |
| Localization | Mobile commercial release |
| Email capture | TBD — possibly add when c2 ships |

---

## What chapter 2+ inherits from chapter 1

- Chapter folder pattern + manifest schema
- woodKit + labKit (chapter 2 antique shop, library, recording studio inherit instantly)
- Rotating-dial puzzle system (built and idle, ready)
- Multi-chapter Hub UI (already shows c02 slot)
- Save data model with chapter scoping
- AudioManager bus
- Plausible analytics + funnel events (events parameterized by chapter)
- Cinematic SVG sequence pattern (proven in c01 intro/outro)
- Cloudflare deploy pipeline
- Distribution playbook (Show HN + Reddit + itch.io + social thread)

---

## Open items requiring action this week

1. **Pick the AI outside voice model** — Codex (preferred) / ChatGPT / Gemini. Confirm access works.
2. **Buy the domain** — `cipher1892.com` if available.
3. **Verify Cipher 1892 brand availability** — App Store + Play Store + USPTO TESS. Not blocking for web phases, blocking for mobile.
4. **Cloudflare Pages account setup.**
5. **Pre-write Phase 1 ship-bar checklist** for each room (in room JSON or inline comments).

---

## Engineering architecture

### New modules to build

| Module | Purpose | Lines (est.) |
|---|---|---|
| `js/core/SaveSchema.js` | Save shape + version contract | ~80 |
| `js/core/SaveMigrations.js` | Migration registry (empty for v1) | ~30 |
| `js/core/ChapterManifest.js` | Manifest schema + validation | ~80 |
| `js/core/ChapterIndex.js` | Path resolution (`resolveRoomPath`) + manifest aggregation | ~70 |
| `js/core/Errors.js` | 7 typed error classes | ~50 |
| `js/core/ErrorBoundary.js` | Top-level handler + recovery dispatch | ~60 |
| `js/game/HubUI.js` | Multi-chapter ready home screen | ~120 |
| `js/game/AudioManager.js` | BGM crossfade + SFX pool | ~120 |
| `js/game/CinematicPlayer.js` | SVG sequence + typewriter overlays | ~100 |
| `tests/smoke/*.spec.js` | 5 Playwright smoke tests | ~150 |

### Modified existing modules

- `js/game/RoomManager.js` — uses `resolveRoomPath()` instead of inline path
- `js/core/StateManager.js` — extends with chapter scope, version-aware load/save
- `js/core/SchemaValidator.js` — adds `validateChapterManifest()`
- `play.html` — uses ChapterIndex, wraps boot in ErrorBoundary
- `tools/gen-apartment.js` — output path → chapter folder

### Tooling additions

- `package.json` — adds `svgo` (build), `@playwright/test` (test), npm scripts: `build`, `test`
- `.github/workflows/smoke.yml` — runs `npm test` on push, gates Cloudflare deploy

## Save data schema (v1)

```json
{
  "version": 1,
  "currentChapter": "c01",
  "currentRoomId": "apartment",
  "completedChapters": [],
  "completedRooms": ["apartment"],
  "inventory": ["keycard"],
  "chapterFlags": {
    "c01": {
      "laptop_unlocked": true,
      "ethics_file_read": false
    }
  },
  "globalFlags": {},
  "settings": { "bgmVolume": 0.7, "sfxVolume": 0.9, "introSeen": true }
}
```

## Chapter manifest schema (v1)

```json
{
  "id": "c01",
  "title": "Awakening",
  "version": 1,
  "schemaVersion": 1,
  "order": 1,
  "status": "released",
  "intro": { "type": "cinematic", "asset": "intro.json", "skippable": true, "skippableAfterFirstView": true },
  "outro": { "type": "cinematic", "asset": "outro.json", "skippable": false },
  "rooms": [
    { "id": "apartment", "file": "rooms/apartment.json", "isStartRoom": true },
    { "id": "hotel",      "file": "rooms/hotel.json" },
    { "id": "laundromat", "file": "rooms/laundromat.json" },
    { "id": "office",     "file": "rooms/office.json", "isEndRoom": true }
  ],
  "audio": {
    "bgm": [
      { "id": "main",  "file": "audio/main_theme.mp3" },
      { "id": "tense", "file": "audio/tense_ambient.mp3" }
    ],
    "defaultBgm": "tense"
  },
  "unlockRequires": [],
  "completion": { "trigger": "endRoomComplete", "endRoomId": "office", "onComplete": ["mark_chapter_complete:c01", "show_outro"] },
  "kits": ["woodKit", "labKit"]
}
```

## Error class taxonomy

| Class | Trigger | User sees | Telemetry |
|---|---|---|---|
| `ChapterIndexLoadError` | Top-level chapter manifest 404/parse | "Site is loading, try refresh" + retry | `event:fatal_boot` |
| `ChapterManifestParseError` | Per-chapter manifest malformed | Same as above + log raw response | `event:fatal_boot` |
| `RoomNotFoundError` | Manifest references missing room file | "This room isn't ready yet, return to hub" | `event:room_404` |
| `AssetLoadError` | SVG asset 404 | Render placeholder + continue | `event:asset_404` |
| `SaveCorruptError` | localStorage parse fails | "Reset Save Data" button (manual) | `event:save_corrupt` |
| `SaveVersionAheadError` | save.version > current | "Please refresh — your save is from a newer version" | `event:save_too_new` |
| `SaveQuotaExceededError` | localStorage write fails | "Storage full — clear browser storage" | `event:save_quota` |

## Performance budget

| Milestone | Transfer | Time on 4G (400 KB/s) |
|---|---|---|
| Boot to Hub UI visible | ≤ 1MB | ≤ 3s |
| Chapter start (intro + Apartment loaded) | ≤ 2.5MB | ≤ 8s |
| Room transition | ≤ 500KB | ≤ 2s |

Enforcement: smoke test asserts apartment.json + apartment SVGs total ≤ 200KB compressed. Build step runs svgo on all SVGs. Lazy-load rooms (preload next room in background while playing current).

## Failure modes registry

All silent-failure paths from initial audit are now rescued. **Critical gaps: 0.**

## Status

- [x] CEO review complete
- [x] Eng review complete
- [x] Three-phase plan locked (web c1 → web c2 → mobile c1+c2)
- [x] AI outside voice mechanism + locked prompt template
- [ ] AI outside voice model selected (Codex / ChatGPT / Gemini — never Claude)
- [ ] Domain bought
- [ ] Cloudflare Pages account
- [ ] Brand availability check (for mobile phase)
- [ ] Week 1 begins

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | CLEAR | 14 decisions locked, 1 open (buddy), 0 critical gaps |
| Eng Review | `/plan-eng-review` | Architecture & tests | 1 | CLEAR | 9 decisions locked, 0 unresolved, 0 critical gaps post-fix |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | not run |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | not run |
| DX Review | `/plan-devex-review` | DX gaps | 0 | — | not run (n/a — not a developer-facing product) |

**VERDICT:** CEO + ENG CLEARED — ready to start Week 1 once buddy is named (14a).
