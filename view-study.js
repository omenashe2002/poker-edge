/* ============================================================
   EDGE — view-study.js
   GTO chart browser + live cheatsheet + player-type field guide.
   ============================================================ */
'use strict';

var studyState = { tab: 'rfi', chartId: 'rfi9-lj' };

var STUDY_TABS = [
  { id: 'rfi', label: 'Open (RFI)' },
  { id: 'vsrfi', label: 'Defend' },
  { id: 'vs3bet', label: 'vs 3-Bet' },
  { id: 'pushfold', label: 'Push/Fold' },
  { id: 'cheat', label: 'Live Sheet' },
  { id: 'types', label: 'Player Types' }
];

function renderStudy(root) {
  clear(root);
  root.appendChild(sectionTitle('Study', 'GTO baselines (100bb cash, no ante). Mixed = solver plays it at partial frequency — either action is fine.'));

  var tabs = el('div', { class: 'pill-row' });
  STUDY_TABS.forEach(function (t) {
    tabs.appendChild(el('button', {
      class: 'pill' + (studyState.tab === t.id ? ' on' : ''),
      text: t.label,
      onclick: function () { studyState.tab = t.id; renderStudy(root); }
    }));
  });
  root.appendChild(tabs);

  if (studyState.tab === 'cheat') return renderCheatsheet(root);
  if (studyState.tab === 'types') return renderTypes(root);

  var charts = chartsByGroup(studyState.tab);
  if (studyState.tab === 'vs3bet') charts = charts.concat(chartsByGroup('vs4bet'));

  // chart selector
  var sel = el('select', { class: 'select', onchange: function (e) { studyState.chartId = e.target.value; renderStudy(root); } });
  var found = false;
  charts.forEach(function (c) {
    if (c.spec.id === studyState.chartId) found = true;
    sel.appendChild(el('option', { value: c.spec.id, text: c.spec.title }));
  });
  if (!found && charts.length) studyState.chartId = charts[0].spec.id;
  sel.value = studyState.chartId;
  root.appendChild(sel);

  var compiled = getChart(studyState.chartId);
  if (!compiled) return;

  var card = el('div', { class: 'card' });
  card.appendChild(el('div', { class: 'chart-title', text: compiled.spec.title }));
  if (compiled.spec.sub) card.appendChild(el('div', { class: 'chart-sub', text: compiled.spec.sub }));
  card.appendChild(renderHandGrid(compiled));
  card.appendChild(renderChartLegend(compiled));
  if (compiled.spec.note) card.appendChild(el('p', { class: 'note', text: compiled.spec.note }));
  if (compiled.spec.group === 'pushfold') {
    card.appendChild(el('p', { class: 'note', text: 'Nash-style approximation, no ante. With antes in play, shove noticeably wider.' }));
  }
  root.appendChild(card);

  root.appendChild(el('p', { class: 'fineprint', text: 'Baselines are simplified solver approximations for drilling. Your solver outputs or MPT charts can be hand-tuned later in js/ranges.js.' }));
}

function renderCheatsheet(root) {
  LIVE_CHEATSHEET.forEach(function (sec) {
    var card = el('div', { class: 'card' });
    card.appendChild(el('div', { class: 'chart-title', text: sec.h }));
    var ul = el('ul', { class: 'tips' });
    sec.items.forEach(function (it) { ul.appendChild(el('li', { text: it })); });
    card.appendChild(ul);
    root.appendChild(card);
  });
}

function renderTypes(root) {
  for (var key in PLAYER_TYPES) {
    if (!PLAYER_TYPES.hasOwnProperty(key)) continue;
    var t = PLAYER_TYPES[key];
    var card = el('div', { class: 'card' });
    card.appendChild(el('div', { class: 'chart-title', text: t.icon + ' ' + t.name }));
    card.appendChild(el('div', { class: 'chart-sub', text: t.signature }));
    card.appendChild(el('p', { class: 'note', text: t.spot }));
    var cols = el('div', { class: 'exploit-cols' });
    cols.appendChild(exploitList('Preflop', t.exploits.preflop));
    cols.appendChild(exploitList('Postflop', t.exploits.postflop));
    cols.appendChild(exploitList('Careful', t.exploits.dangers));
    card.appendChild(cols);
    root.appendChild(card);
  }
}

function exploitList(h, items) {
  var box = el('div', { class: 'exploit-box' });
  box.appendChild(el('div', { class: 'exploit-h', text: h }));
  var ul = el('ul', { class: 'tips' });
  items.forEach(function (i) { ul.appendChild(el('li', { text: i })); });
  box.appendChild(ul);
  return box;
}
