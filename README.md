# EDGE — GTO + Exploit Poker Trainer

A private, personal poker app: study GTO baselines, drill them until they're instinct, profile every player at your live cash table, get exploit advice per player type, log key hands, and track your results with real statistics (confidence intervals, variance, risk-of-ruin bankroll math).

Built to pair with *Modern Poker Theory* (Michael Acevedo): the **Study** and **Train** tabs cover the GTO half; the **Live** tab and player-type field guide cover the exploitative half.

No accounts, no server, no build tools. One folder of files that runs in any browser. **All your data stays on your device.**

---

## Quick start (computer)

1. Download this folder.
2. Double-click `index.html`. That's it — it opens in your browser and works.

## Put it on your phone (recommended)

The Live tab is designed for the table, so you want it on your phone. The easiest way is GitHub Pages — it gives the app a private-ish web address you can open anywhere:

1. Go to your repo on **github.com** → if it's empty, click **uploading an existing file** (or `Add file → Upload files`).
2. Drag **everything in this folder** (not the folder itself — its contents: all the files: `index.html`, the `.js` and `.css` files, `icon.png`, `README.md`) into the upload box. Commit.
3. In the repo: **Settings → Pages → Branch: `main` → folder: `/ (root)` → Save**.
4. Wait ~1 minute. Your app is now at `https://YOUR-USERNAME.github.io/YOUR-REPO/`.
5. Open that link on your phone → Share → **Add to Home Screen**. It now opens full-screen like a native app.

Notes:
- Free GitHub Pages requires the repo to be **public**. That's fine: the repo contains only the app code — **none of your sessions, players, notes, or results ever touch GitHub**. Everything you enter lives in your phone/computer's browser storage.
- If you prefer a fully private repo, keep it private and just open `index.html` from your computer instead (or AirDrop the folder to your phone and open it in a file-manager browser).

## Your data — read this once

- Data is stored in the browser's local storage **per device, per browser**. Your phone and laptop each have their own data.
- **Export a backup** (Stats tab → Your data → Export) regularly. Clearing browser data deletes everything.
- Move data between devices with Export on one + Import on the other.

---

## What's inside

| Tab | What it does |
|---|---|
| 📖 **Study** | A **26-lesson course in 5 modules** (foundations → preflop architecture → the math layer → postflop → the human game), each lesson with learning objectives, first-principles explanations, key takeaways, and a retrieval-practice checkpoint quiz. A **65-term glossary** — every jargon word (RFI, mixed, MDF…) auto-links inside lessons and opens a definition sheet on tap. 51 preflop charts with tap-any-cell explanations and auto-generated border summaries. Plus the live cheat sheet and player-type field guide. |
| 🎓 **Train** | Every question shows a **visual table scene** (button, folds, raiser, your seat). Answers are graded by **severity** — close calls (border/mixed hands) cost half, blunders flagged — and every wrong answer gets a real **explanation**: blockers, playability, where the border sits. Misses enter a **spaced-repetition review queue** (1→3→7→14→30 days). Sampling focuses on range borders, charts adapt to your weakest spots, and daily goals + streaks + mastery meters keep score. **The Exam** (25 questions, all topics interleaved) benchmarks you with a letter grade; **Pressure mode** adds a 10-second shot clock; and the **EDGE Rating** (1000-2000, Fish → Apex) compresses mastery + course + exams into one number to push. |
| ♠️ **Live** | Start a session, lay out the table, tap seats to mark who played/raised each hand (auto VPIP/PFR), tag player types, take notes. The exploit advisor shows the max-EV adjustments vs each type. Players persist across sessions — your private book of regulars. Quick 10-second hand capture between hands. |
| 🃏 **Hands** | Post-session review: add boards and street notes, run the GTO preflop check against the right chart, tag your leaks. |
| 🧮 **Tools** | Monte Carlo equity calculator (hand vs hand, vs range presets, vs your charts, on any board), pot odds/MDF/bluff-share calculator, SPR advisor, outs table, combo counter. |
| 📈 **Stats** | Bankroll curve, $/hr and bb/hr, win-rate **95% confidence interval**, hourly standard deviation, bankroll needed for 5%/1% risk of ruin, results by stakes, weekly drill-accuracy trend, and your leak board. |

## House rules (important)

- **Etiquette/legality:** log between hands only. Most card rooms prohibit phone use while in a hand, and some prohibit it at the table entirely — know your room's rules. The app is built for between-hand taps and post-session review.
- **The ranges are baselines.** They're solver-style approximations (100bb cash, no ante; push/fold ≈ Nash, no ante) good enough to build instincts. As you study MPT, tune them: they're plain text in `ranges.js` — edit a range string, refresh, done.
- **Exploits beat GTO in soft games.** GTO is your unexploitable default; the Live tab's job is to find the deviations that print money. That's the whole point of tracking player types.

## For the curious: tests

The math engine and app are covered by tests (hand evaluator vs known equities like AA vs KK = 82%, range parser, chart sanity — e.g., opens must widen with position — and a full headless click-through of the app).

```
node test-engine.js
node test-ranges.js
node test-teach.js
npm install jsdom && node test-app.js
```

## Roadmap ideas (v2)

- In-browser postflop solver (WASM) for c-bet/turn spots
- Hand-history import & auto-grading vs charts
- Range-vs-range equity and equity graphs
- ICM for tournament decisions
- Per-position win/loss analytics from logged hands
- Configurable open sizes per chart (live 4x/5x variants)

---

*Personal project. Not affiliated with Michael Acevedo or D&B Poker. Play responsibly and within your bankroll.*
