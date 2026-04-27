# Monetization Plan

**Model:** Free-to-play, ad-supported, with optional comfort/convenience IAP. **Zero content gating** — every room, ending, and hint is reachable without spending money.

**Platforms:** iOS + Android via Capacitor wrap of the existing HTML5 + Canvas game.

---

## 1. Revenue streams

### A. Room-gate ads (primary revenue)

After a player completes a room, an ad gate auto-launches.

- **Format:** Rewarded interstitial (AdMob). High eCPM ($15–25), guaranteed completion.
- **Starts at:** Room 4. Rooms 1–3 are gate-free to protect onboarding retention.
- **Frequency:** Once per room transition. No mid-puzzle interstitials.
- **Skipped if:** Remove Ads IAP owned.

#### Auto-play gate UX

```
┌──────────────────────────────────┐
│   Room N Complete                │
│                                  │
│   Loading next room…             │
│   ●●●○○○○○○○  Ad starts in 3s    │
│                                  │
│   [Remove Ads — $2.99]           │
│   [Back to hub]                  │
└──────────────────────────────────┘
```

- 3-second countdown auto-launches the ad.
- During the 3s countdown only: Remove Ads + Back-to-hub visible.
- During the ad itself: no UI overlays (ad SDK policy).
- After ad: next room loads automatically.

#### Failure fallback (invisible)

```
ad ready    → play ad → next room
ad not ready → invisible 40s wait → next room
```

The 40s wait is never offered as a visible option (would cannibalize ad views). Surfaces only when ad SDK fails to load. Player sees a persistent loading state, then auto-advances.

### B. Rewarded video for tokens (secondary revenue)

Player-initiated. From the hint screen: "Watch ad for +1 hint token."

- **Format:** Rewarded video (AdMob).
- **Cooldown:** 2 minutes between watches.
- **Reward:** +1 hint token.
- **eCPM:** $15–35.
- **Cap:** none (player can grind tokens via ads if they prefer that to IAP).

### C. Hint Tokens IAP

| Pack | Tokens | Price | $/token |
|---|---|---|---|
| Small | 20 | $0.99 | $0.050 |
| Medium | 60 | $1.99 | $0.033 |
| Large | 200 | $4.99 | $0.025 |

Standard mobile pricing curve. Larger pack = better value, anchors the medium pack as "best deal."

### D. Remove Ads IAP

- **Price:** $2.99 one-time.
- **Effect:** Disables room-gate ad and banner. Rewarded video for tokens stays available (player choice).
- **Visible at:** Every room-gate countdown, plus settings menu and a one-time prompt after completing room 4 (the first ad gate).

### E. Tip Jar (community/cosmetic)

| Tier | Price | Bonus tokens | Recognition |
|---|---|---|---|
| Coffee | $0.99 | +10 | "Thank you" in credits |
| Lunch | $4.99 | +50 | Name in credits scroll |
| Dinner | $9.99 | +100 | Name in special-thanks splash |

Token bonuses give the tip jar a non-charity rationale; recognition tiers reward genuine supporters.

---

## 2. Hint Token economy

**Currency:** Hint Tokens. 1 token = 1 hint reveal in any puzzle.

### Earning

| Source | Tokens | Notes |
|---|---|---|
| Starting balance | 3 | New player gift |
| Daily login | +1 | Encourages D2+ retention |
| Rewarded video | +1 | 2-min cooldown |
| Tip jar | +10 / +50 / +100 | Per tier |
| Token packs (IAP) | +20 / +60 / +200 | Per pack |

A player who never spends still has reliable paths to hints: starting balance covers early rooms; daily login + rewarded video cover the rest. Removing the per-room reward sharpens the rewarded-video / IAP funnel without locking content.

### Spending

| Action | Cost |
|---|---|
| Reveal hint | 1 token |
| Skip puzzle (after 3 failed attempts) | 5 tokens |

Single-tier hints (no vague/specific/near-solution split) — keeps logic and UI simple.

---

## 3. Ad placement summary

| Placement | Frequency | Format | Notes |
|---|---|---|---|
| **Room-gate** | After every room from #4 onward | Rewarded interstitial, auto-play | Primary ad revenue |
| **Rewarded video for tokens** | Player-initiated, 4-min cooldown | Rewarded video | Hint economy fuel |
| **Banner** | Bottom of room-select hub only | 320×50 adaptive | Hidden inside rooms |
| ~~App-open~~ | — | — | Removed |
| ~~Mid-puzzle interstitial~~ | — | — | Never |

---

## 4. Ad network & IAP backend

| Layer | Service | Why |
|---|---|---|
| **Ads** | Google AdMob | Standard mobile SDK, easy store compliance, primary at launch |
| **Mediation** | Deferred | Add AppLovin MAX post-launch when DAU > 1k |
| **IAP** | RevenueCat | Handles receipt validation, cross-platform sync, restore purchases. Free up to $10k MTR, then 1% |
| **Analytics** | RevenueCat dashboards + AdMob reports + custom Telemetry.js events | |

---

## 5. Engine modules

| Module | Lines | Purpose |
|---|---|---|
| `MonetizationManager.js` | ~110 | AdMob wrapper: rewarded interstitial, rewarded video, banner |
| `EntitlementsStore.js` | ~70 | Tracks owned SKUs (`remove_ads`, tip-jar tiers) via RevenueCat |
| `TokenWallet.js` | ~80 | Token balance, earn/spend, persistence, daily login check |
| `RoomGateUI.js` | ~100 | The 3s countdown + IAP/back-to-hub + invisible fallback |
| `AdGate.js` | ~70 | Ad load orchestration, fallback timing, paid-user skip |
| `RewardedHooks.js` | ~70 | Rewarded-ad-for-tokens flow from hint screen |
| `HintShopUI.js` | ~120 | Token pack store + purchase UX (powered by RevenueCat) |
| `TipJarUI.js` | ~60 | Tip jar in settings menu |
| `Telemetry.js` | ~80 | Event logging: room-start/complete, ad-shown, ad-completed, IAP-tap, IAP-purchase |
| `ConsentManager.js` | ~100 | GDPR (UMP) + ATT prompts |
| **Total** | **~860** | |

---

## 6. Compliance

| Item | iOS | Android |
|---|---|---|
| Developer account | $99/yr | $25 one-time |
| Privacy policy URL | required | required |
| Data Safety form | — | required |
| ATT prompt (iOS 14.5+) | required for personalized ads | — |
| GDPR consent (UMP) | required for EU traffic | required for EU traffic |
| Age rating | self-declared (12+ recommended) | IARC questionnaire |
| Store listing disclosure | "Free, supported by ads. Remove Ads available as IAP." | same |

Apple requires that ads-supported apps disclose the model in store description and provide a clear opt-out IAP. Both are covered.

---

## 7. Revenue projection

Hybrid ads + IAP, no content gating, room-gate ads start at room 4.

| Metric | Conservative | Realistic | Optimistic |
|---|---|---|---|
| Total downloads (first 6 mo) | 10,000 | 50,000 | 200,000 |
| DAU (D30 5%) | 500 | 2,500 | 10,000 |
| Rewarded interstitials/DAU | 4 | 6 | 8 |
| Rewarded videos (hints)/DAU | 1.5 | 2.5 | 3.5 |
| ARPDAU | $0.18 | $0.28 | $0.42 |
| Token-pack conversion | 2% | 3% | 5% |
| Remove-Ads conversion | 3% | 4% | 6% |
| Tip-jar conversion | 0.3% | 0.5% | 1% |
| **Monthly revenue** | **$2,700** | **$23,000** | **$130,000** |

Splits: ~65% ads (mostly room-gate), ~25% token packs, ~10% Remove Ads + tip jar.

---

## 8. Soft launch

**Markets:** Philippines + Vietnam.
**Duration:** 2 weeks.
**Goals:**
- Validate D1, D7, D30 retention against benchmarks (D1 ≥ 35%, D7 ≥ 12%, D30 ≥ 5% for free puzzle games)
- Tune room-gate frequency and ad-load reliability
- Confirm Remove Ads conversion ≥ 2% (gate working as IAP driver)
- Confirm crash-free sessions ≥ 99.5%

**After soft launch:** address top 3 player complaints, ship 1.0.1 build, then global launch.

---

## 9. What we're NOT doing in v1

Explicitly cut to keep scope tight:

- ~~Tiered hints (vague/specific/near-solution)~~
- ~~Achievements~~
- ~~Bonus lore unlocks via rewarded ads~~
- ~~App-open ads~~
- ~~Mid-puzzle interstitials~~
- ~~Subscriptions~~
- ~~Story Pass / paid room unlocks~~
- ~~Mediation networks beyond AdMob~~
- ~~Daily puzzle mode~~ (deferred to v1.1)

---

## 10. Roadmap beyond v1

| Version | Add |
|---|---|
| **1.1** | Daily puzzle mode (extra rewarded-ad surface), AppLovin MAX mediation, achievements |
| **1.2** | Localization (ES, PT, JA, KO, DE, FR) |
| **1.3** | DLC pack: 5 new rooms, $4.99 — first paid content, optional |
| **2.0** | Sequel campaign |
