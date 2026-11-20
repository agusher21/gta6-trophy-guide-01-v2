# Leonida Trophy Ledger — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/agusher21/gta6-trophy-guide-01-v2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/agusher21/gta6-trophy-guide-01-v2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

The best offline GTA 6 trophy guide: a tracker over all **55 official PlayStation 5 trophies** (1 Platinum, 2 Gold, 6 Silver, 46 Bronze) with a guide to each in our own words that cites its sources. Dark ledger look, a goal bar to the platinum, a 7-stage roadmap, the 10 missable trophies flagged, and a spoiler setting that hides story trophies until you earn them.

## What it does

- **Checklist** — tick trophies off; progress is saved in the browser (localStorage) and can be exported to a file and imported back.
- **Filters** — by kind (story, strangers, activities, collectibles, co-op, exploration, money, heists), by grade, and by search.
- **Spoiler setting** — hides the names and descriptions of story trophies until they are earned.
- **Roadmap** — seven stages in play order, from arrival in Leonida to the platinum.
- **Missables** — all 10 missable trophies flagged with the moment they can be missed.
- **Sources** — every guide cites its sources (PowerPyx, PlayStationTrophies.org, PSNProfiles, TrueTrophies, Exophase). Guides are written in our own words, never copied. Official trophy names and descriptions are shown as PlayStation publishes them.
- **Offline** — static files under `app/`, no network requests, no external fonts or images. No Rockstar logo or official artwork.

## Run it

```sh
cd app && python3 -m http.server 8080
```

Then open http://localhost:8080 — or open `app/index.html` from any static server. Deep links work: `#tab=roadmap`, `#select=17` (open a trophy), `#earned=2,3,4` (pre-tick trophies), `#spoilers=off`.

## Enter it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/?ref=toni-banzai&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
