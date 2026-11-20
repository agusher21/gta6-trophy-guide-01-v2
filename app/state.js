// Leonida Trophy Ledger — app state, storage and boot.
// State: earned trophy ids in localStorage, plus filters, tab, selection and spoiler setting.
export const STORAGE_KEY = 'leonida-trophy-ledger-v1';
export const TOTAL = 55;

export const ROADMAP_STAGES = [
  { n: 1, title: 'S1 · Arrival — Chapters 1–2', blurb: 'Open the story, learn Leonida, grab the early story trophies.' },
  { n: 2, title: 'S2 · Vice City Rising — Chapters 3–4', blurb: 'The map opens up. Finish the middle chapters and their mission trophies.' },
  { n: 3, title: 'S3 · Endgame Story', blurb: 'Final mission, 100% completion and the story-moment trophies.' },
  { n: 4, title: 'S4 · Strangers & Side Stories', blurb: 'Eight stranger strands, hunting, fishing and meditation.' },
  { n: 5, title: 'S5 · Activities & Mastery', blurb: 'Stunts, races, shooting range, drone races and combat feats.' },
  { n: 6, title: 'S6 · Collectibles, Cars & Cash', blurb: 'Cards, WAiNK tags, vehicles, exploration and money.' },
  { n: 7, title: 'S7 · Heists, Heat & Platinum', blurb: 'Vaults, trucks, gangs — then the platinum.' },
];

export const KIND_LABELS = {
  story: 'Story', stranger: 'Strangers', activity: 'Activities',
  collectible: 'Collectibles', coop: 'Co-op', exploration: 'Exploration',
  money: 'Money', heist: 'Heists',
};

export const SOURCE_CARDS = [
  { name: 'PowerPyx — GTA 6 Trophy Guide', note: 'Step-by-step trophy roadmap and per-trophy methods; cited for story, activity and heist trophies.' },
  { name: 'PlayStationTrophies.org — GTA VI Trophy Guide', note: 'Community-written guide with per-trophy strategies; cited for story and stranger trophies.' },
  { name: 'PSNProfiles — GTA 6 Trophy Guide', note: 'Roadmap, difficulty notes and collectible counts; cited across story, collectible and money trophies.' },
  { name: 'TrueTrophies — GTA VI Trophy Guide', note: 'Trophy tracking data and completion notes; cited for 100% and challenge trophies.' },
  { name: 'Exophase — Grand Theft Auto VI Trophies', note: 'Official trophy list cross-check (names, descriptions, grades); cited for list verification.' },
];

export function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((x) => Number.isInteger(x)) : []);
  } catch {
    return new Set();
  }
}

export function saveStored(earned) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

export function parseHash() {
  // Deep links for real app states, e.g. #tab=roadmap, #select=17,
  // #earned=2,3,4 (pre-tick trophies), #spoilers=off
  const out = {};
  const hash = location.hash.replace(/^#/, '');
  for (const part of hash.split('&')) {
    const [k, v] = part.split('=');
    if (k) out[decodeURIComponent(k)] = v ? decodeURIComponent(v) : '';
  }
  return out;
}

export function gradeOf(t) { return t.grade; }
export function isMissable(t) { return t.missable === true; }
export function isStory(t) { return t.kind === 'story'; }
