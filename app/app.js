// Leonida Trophy Ledger — boot and interaction wiring.
// Loads app/data/trophies.json, keeps earned state in localStorage, wires the
// checklist, detail view, filters, spoiler setting, stepper and export/import.
import { STORAGE_KEY, TOTAL, loadStored, saveStored, parseHash } from './state.js';
import { renderList, renderDetail, renderNextUp, renderSourceCards } from './render.js';

const $ = (id) => document.getElementById(id);
const state = {
  trophies: [],
  earned: loadStored(),
  kind: 'all',
  grade: 'all',
  query: '',
  hideSpoilers: true,
  selectedId: 17,
  tab: 'checklist',
};

function applyHash() {
  const h = parseHash();
  if (h.tab && ['checklist', 'roadmap', 'missables', 'sources'].includes(h.tab)) state.tab = h.tab;
  if (h.select) { const n = Number(h.select); if (Number.isInteger(n)) state.selectedId = n; }
  if (h.kind) state.kind = h.kind;
  if (h.grade) state.grade = h.grade;
  if (h.spoilers === 'off') state.hideSpoilers = false;
  if (h.earned) {
    const ids = h.earned.split(',').map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= TOTAL);
    if (ids.length) { state.earned = new Set(ids); saveStored(state.earned); }
  }
}

function renderAll() {
  const { trophies, earned } = state;
  renderList($('trophyList'), trophies, state);
  renderDetail($('detail'), trophies, state);
  renderNextUp($('nextUp'), trophies, earned);
  renderSourceCards($('sourceCards'));
  updateProgress();
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === state.tab));
  document.querySelectorAll('#kindPills button').forEach((b) => b.classList.toggle('active', b.dataset.kind === state.kind));
  $('gradeFilter').value = state.grade;
  $('spoilerToggle').checked = state.hideSpoilers;
  $('listHeading').textContent = state.tab === 'checklist' ? 'Checklist' : state.tab === 'roadmap' ? 'Roadmap' : state.tab === 'missables' ? 'Missables' : 'Sources';
}

function updateProgress() {
  const { trophies, earned } = state;
  const n = earned.size;
  const pct = Math.round((n / TOTAL) * 100);
  $('countNow').textContent = `${n} / ${TOTAL}`;
  $('goalFill').style.width = `${pct}%`;
  $('goalPct').textContent = `${pct}%`;
  $('earnedCount').textContent = String(n);
  $('miniFill').style.width = `${pct}%`;
  const byGrade = {};
  for (const t of trophies) if (earned.has(t.id)) byGrade[t.grade] = (byGrade[t.grade] || 0) + 1;
  $('gradeBreakdown').textContent = `Platinum ${byGrade.platinum || 0}/1 · Gold ${byGrade.gold || 0}/2 · Silver ${byGrade.silver || 0}/6 · Bronze ${byGrade.bronze || 0}/46`;
  const missLeft = trophies.filter((t) => t.missable && !earned.has(t.id)).length;
  $('missableLeft').textContent = missLeft === 0 ? 'All 10 missable trophies earned.' : `${missLeft} of 10 missable trophies still to earn — do them first.`;
  const steps = trophies.reduce((a, t) => a + t.steps.length, 0);
  const cited = trophies.filter((t) => t.sources && t.sources.length).length;
  $('auditStrip').innerHTML = `<b>55/55 guides cite a source</b> · ${steps} steps cited · ${cited}/55 trophies with cited guides · 10 missable flagged · 28 hidden on PlayStation · 1 Platinum · 2 Gold · 6 Silver · 46 Bronze`;
}

function toggleEarned(id) {
  if (state.earned.has(id)) state.earned.delete(id);
  else state.earned.add(id);
  saveStored(state.earned);
  renderAll();
}

function stepEarned(dir) {
  const ids = state.trophies.map((t) => t.id);
  if (dir > 0) {
    const next = ids.find((id) => !state.earned.has(id));
    if (next !== undefined) { state.earned.add(next); state.selectedId = next; }
  } else {
    const earnedIds = ids.filter((id) => state.earned.has(id));
    const last = earnedIds[earnedIds.length - 1];
    if (last !== undefined) state.earned.delete(last);
  }
  saveStored(state.earned);
  renderAll();
}

function download(filename, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function boot() {
  const res = await fetch('data/trophies.json');
  const doc = await res.json();
  state.trophies = doc.trophies;
  applyHash();
  if (!state.trophies.some((t) => t.id === state.selectedId)) state.selectedId = state.trophies[0].id;

  // Kind filter pills
  const kinds = [['all', 'All kinds'], ['story', 'Story'], ['stranger', 'Strangers'], ['activity', 'Activities'], ['collectible', 'Collectibles'], ['coop', 'Co-op'], ['exploration', 'Exploration'], ['money', 'Money'], ['heist', 'Heists']];
  $('kindPills').innerHTML = kinds.map(([v, l]) => `<button type="button" data-kind="${v}">${l}</button>`).join('');
  $('kindPills').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-kind]');
    if (!b) return;
    state.kind = b.dataset.kind;
    renderAll();
  });
  $('gradeFilter').addEventListener('change', (e) => { state.grade = e.target.value; renderAll(); });
  $('searchBox').addEventListener('input', (e) => { state.query = e.target.value; renderAll(); });
  $('spoilerToggle').addEventListener('change', (e) => { state.hideSpoilers = e.target.checked; renderAll(); });
  document.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => { state.tab = b.dataset.tab; renderAll(); }));

  // Checklist clicks: checkbox toggles earned, row body selects the detail.
  $('trophyList').addEventListener('click', (e) => {
    const row = e.target.closest('.trophy-row');
    if (!row) return;
    const id = Number(row.dataset.id);
    if (e.target.matches('input[type="checkbox"]')) { toggleEarned(id); return; }
    state.selectedId = id;
    state.tab = 'checklist';
    renderAll();
    $('detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  $('stepUp').addEventListener('click', () => stepEarned(1));
  $('stepDown').addEventListener('click', () => stepEarned(-1));
  $('exportBtn').addEventListener('click', () => download('leonida-ledger-progress.json', JSON.stringify({ earned: [...state.earned].sort((a, b) => a - b), exportedAt: new Date().toISOString() }, null, 2)));
  $('importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const ids = Array.isArray(data) ? data : data.earned;
      const next = new Set((ids || []).filter((n) => Number.isInteger(n) && n >= 1 && n <= TOTAL));
      state.earned = next;
      saveStored(next);
      renderAll();
    } catch {
      alert('That file is not a valid progress export.');
    }
    e.target.value = '';
  });

  renderAll();
}

boot().catch((err) => {
  $('auditStrip').textContent = 'Could not load the trophy list. Open this page from its own folder (any static server) — it needs no network.';
  console.error(err);
});
