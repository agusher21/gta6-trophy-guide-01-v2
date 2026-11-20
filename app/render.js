// Leonida Trophy Ledger — rendering: checklist, detail, roadmap, missables, sources.
import { KIND_LABELS, ROADMAP_STAGES, SOURCE_CARDS, isMissable, isStory } from './state.js';

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function gradeChip(grade) {
  return `<span class="t-grade grade-${esc(grade)}">${esc(grade)}</span>`;
}

function trophyVisibleName(t, earned, hideSpoilers) {
  if (hideSpoilers && isStory(t) && !earned.has(t.id)) return 'Hidden story trophy';
  return t.name;
}

function trophyVisibleDesc(t, earned, hideSpoilers) {
  if (hideSpoilers && isStory(t) && !earned.has(t.id)) return 'Earn this trophy in the story to reveal its name and description.';
  return t.description;
}

export function renderList(root, trophies, state) {
  const { earned, kind, grade, query, hideSpoilers, selectedId } = state;
  const q = query.trim().toLowerCase();
  const filtered = trophies.filter((t) => {
    if (kind !== 'all' && t.kind !== kind) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
  if (filtered.length === 0) {
    root.innerHTML = '<p class="empty">No trophies match these filters.</p>';
    return;
  }
  const groups = new Map();
  for (const t of filtered) {
    if (!groups.has(t.stage)) groups.set(t.stage, []);
    groups.get(t.stage).push(t);
  }
  let html = '';
  for (const stage of [...groups.keys()].sort((a, b) => a - b)) {
    const meta = ROADMAP_STAGES.find((s) => s.n === stage);
    html += `<div class="stage-group"><h3>${esc(meta ? meta.title : 'Stage ' + stage)}</h3>`;
    for (const t of groups.get(stage)) {
      const isEarned = earned.has(t.id);
      const hidden = hideSpoilers && isStory(t) && !isEarned;
      html += `<button type="button" class="trophy-row${isEarned ? ' earned' : ''}${t.id === selectedId ? ' selected' : ''}" data-id="${t.id}">
        <input type="checkbox" ${isEarned ? 'checked' : ''} tabindex="-1" aria-label="Earned: ${esc(t.name)}">
        <span><span class="t-name">${esc(trophyVisibleName(t, earned, hideSpoilers))}</span>
        <span class="t-desc">${esc(trophyVisibleDesc(t, earned, hideSpoilers))}</span>
        ${isMissable(t) ? '<span class="flag-missable">MISSABLE</span>' : ''}
        ${hidden ? '<span class="flag-hidden">Hidden until earned</span>' : ''}</span>
        ${gradeChip(t.grade)}</button>`;
    }
    html += '</div>';
  }
  root.innerHTML = html;
}

export function renderDetail(root, trophies, state) {
  const { earned, hideSpoilers, selectedId, tab } = state;
  if (tab === 'roadmap') {
    root.innerHTML = roadmapHtml(trophies, earned);
    return;
  }
  if (tab === 'missables') {
    root.innerHTML = missablesHtml(trophies, earned);
    return;
  }
  if (tab === 'sources') {
    root.innerHTML = sourcesHtml();
    return;
  }
  const t = trophies.find((x) => x.id === selectedId) || trophies[0];
  if (!t) { root.innerHTML = '<p class="empty">No trophy selected.</p>'; return; }
  const isEarned = earned.has(t.id);
  const hidden = hideSpoilers && isStory(t) && !isEarned;
  const steps = t.steps.map((s) => `<li>${esc(s)}</li>`).join('');
  const sources = t.sources.map((s) => esc(s)).join(' · ');
  root.innerHTML = `<article class="detail-card">
    <div class="detail-meta">${gradeChip(t.grade)}
      <span class="muted">${esc(KIND_LABELS[t.kind] || t.kind)} · Stage ${t.stage}</span>
      ${isMissable(t) ? '<span class="flag-missable">MISSABLE</span>' : ''}
      ${isEarned ? '<span class="flag-missable" style="border-color:var(--gold);color:var(--gold-soft)">EARNED ✓</span>' : ''}
    </div>
    <h2>${esc(hidden ? 'Hidden story trophy' : t.name)}</h2>
    <div class="official"><span class="label">Official description · PlayStation</span>
      <p>${esc(hidden ? 'Earn this trophy in the story to reveal its official description.' : t.description)}</p></div>
    ${isMissable(t) ? `<p class="warn"><b>Missable — read this first.</b> This trophy can be missed if its moment passes. ${esc(missableNote(t))}</p>` : ''}
    <h3>Guide — in our own words</h3>
    <p class="guide-text">${esc(t.guide)}</p>
    <h3>Steps</h3>
    <ol class="steps">${steps}</ol>
    <p class="source-line"><b>Sources:</b> ${sources}</p>
    <p class="source-line">Total steps cited on this page: ${t.steps.length} · Guide written for this ledger, not copied.</p>
  </article>`;
}

function missableNote(t) {
  if (t.kind === 'coop') return 'Do it while your partner is with you — the window is the co-op moment itself.';
  if (t.name === 'Sneakthief' || t.name === 'A Classic Blitz Play') return 'If the attempt is spotted or the escape fails, it does not count — leave and try another target.';
  if (t.name === 'Capital Offense' || t.name === 'Ten Pin') return 'A one-shot story moment: if it passes, it is gone for this playthrough.';
  return 'The moment is the trigger — set it up deliberately rather than hoping it happens.';
}

function roadmapHtml(trophies, earned) {
  let html = '<article class="detail-card"><h2>Roadmap to the platinum</h2>'
    + '<p class="guide-text">Play the stages in order. Story first, then strangers, then activities and collectibles, then heists — and the platinum last. Missables are flagged in stage 7 and wherever their moment falls.</p>';
  for (const stage of ROADMAP_STAGES) {
    const list = trophies.filter((t) => t.stage === stage.n);
    const done = list.filter((t) => earned.has(t.id)).length;
    html += `<div class="roadmap-stage"><h3>${esc(stage.title)} — ${done}/${list.length} earned</h3>
      <p>${esc(stage.blurb)}</p><ul>`;
    for (const t of list) {
      html += `<li>${earned.has(t.id) ? '✓ ' : '○ '}${esc(t.name)} <span class="muted">(${esc(t.grade)}${isMissable(t) ? ' · MISSABLE' : ''})</span></li>`;
    }
    html += '</ul></div>';
  }
  return html + '</article>';
}

function missablesHtml(trophies, earned) {
  const list = trophies.filter(isMissable);
  let html = '<article class="detail-card"><h2>Missable trophies — 10 to watch</h2>'
    + '<p class="guide-text">These ten can be missed if their moment passes. Do them the first time their window opens; everything else can be cleaned up in free roam after the story.</p><ul class="steps">';
  for (const t of list) {
    html += `<li><b>${esc(t.name)}</b> — ${esc(t.description)} <span class="muted">${earned.has(t.id) ? '✓ earned' : 'not yet earned'}</span></li>`;
  }
  return html + '</ul></article>';
}

function sourcesHtml() {
  let html = '<article class="detail-card"><h2>Sources</h2>'
    + '<p class="guide-text">Every guide here is written in our own words. We drew on these guides and cite them per trophy — never copying their text. Official names and descriptions are shown as PlayStation publishes them.</p><ol class="source-cards">';
  for (const s of SOURCE_CARDS) {
    html += `<li><b>${esc(s.name)}</b><span class="muted">${esc(s.note)}</span></li>`;
  }
  return html + '</ol></article>';
}

export function renderNextUp(root, trophies, earned) {
  const next = trophies.filter((t) => !earned.has(t.id)).sort((a, b) => (a.stage - b.stage) || (a.id - b.id)).slice(0, 5);
  root.innerHTML = next.map((t) => `<li>${esc(t.name)}<span class="muted">Stage ${t.stage} · ${esc(t.grade)}${isMissable(t) ? ' · MISSABLE' : ''}</span></li>`).join('')
    || '<li>All 55 earned — Leonida Legend!</li>';
}

export function renderSourceCards(root) {
  root.innerHTML = SOURCE_CARDS.map((s) => `<li><b>${esc(s.name)}</b><span class="muted">${esc(s.note)}</span></li>`).join('');
}
