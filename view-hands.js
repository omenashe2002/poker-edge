/* ============================================================
   EDGE — view-hands.js
   Post-session hand review: detail entry, GTO preflop check,
   leak tagging. Leak counts feed the Stats tab.
   ============================================================ */
'use strict';

var LEAK_TAGS = ['Loose preflop', 'Called too light', 'Folded too much', 'Missed value',
  'Bad bluff spot', 'Overplayed one pair', 'Bad sizing', 'Should have raised',
  'Ignored the read', 'Fancy play', 'Tilt'];

var handsUI = { openId: null, filter: 'all' };

function renderHands(root) {
  clear(root);
  root.appendChild(sectionTitle('Hands', 'Key hands you logged live. Add detail, run the GTO check, tag the leak.'));

  var hands = STATE.hands.slice().reverse();
  if (!hands.length) {
    root.appendChild(el('div', { class: 'card center', html: 'No hands logged yet.<br>Use <b>Log key hand</b> during a live session.' }));
    return;
  }

  // filter pills
  var pills = el('div', { class: 'pill-row' });
  [['all', 'All'], ['todo', 'To review'], ['done', 'Reviewed']].forEach(function (f) {
    pills.appendChild(el('button', {
      class: 'pill' + (handsUI.filter === f[0] ? ' on' : ''), text: f[1],
      onclick: function () { handsUI.filter = f[0]; rerender(); }
    }));
  });
  root.appendChild(pills);

  hands.forEach(function (h) {
    if (handsUI.filter === 'todo' && h.reviewed) return;
    if (handsUI.filter === 'done' && !h.reviewed) return;
    root.appendChild(renderHandRow(h));
  });
}

function renderHandRow(h) {
  var open = handsUI.openId === h.id;
  var card = el('div', { class: 'card hand-row' + (h.reviewed ? ' reviewed' : '') });
  var head = el('div', { class: 'hand-head', onclick: function () { handsUI.openId = open ? null : h.id; rerender(); } });
  var cardsBox = el('span', { class: 'hand-cards' });
  (h.cards || []).forEach(function (c) { cardsBox.appendChild(cardChip(c)); });
  head.appendChild(cardsBox);
  head.appendChild(el('span', { class: 'hand-meta', text: h.position + (h.effBB ? ' · ' + h.effBB + 'bb' : '') + ' · ' + (h.stakes || '') + ' · ' + new Date(h.ts).toLocaleDateString() }));
  head.appendChild(el('span', { class: 'hand-result ' + (h.result >= 0 ? 'pos' : 'neg'), text: (h.result >= 0 ? '+' : '') + fmtMoney(h.result) }));
  card.appendChild(head);
  if (h.line && h.line.length) card.appendChild(el('div', { class: 'hand-line', text: h.line.join(' → ') + (h.vs ? '  (vs ' + h.vs + ')' : '') }));

  if (!open) return card;

  /* ---- expanded editor ---- */
  // GTO preflop check
  var gto = el('div', { class: 'gto-check' });
  gto.appendChild(el('div', { class: 'lab', text: 'GTO preflop check' }));
  var sel = el('select', { class: 'select' });
  sel.appendChild(el('option', { value: '', text: 'Pick the chart that matches the spot…' }));
  RANGE_CHARTS.forEach(function (spec) {
    if (spec.group === 'pushfold') return;
    sel.appendChild(el('option', { value: spec.id, text: spec.title }));
  });
  var suggested = suggestChart(h);
  if (suggested) sel.value = suggested;
  var verdict = el('div', { class: 'gto-verdict' });
  function runCheck() {
    clear(verdict);
    if (!sel.value || !h.cards || h.cards.length < 2) return;
    var compiled = getChart(sel.value);
    var label = comboClass(h.cards[0], h.cards[1]);
    var act = compiled.chart[label];
    var msg, cls;
    if (act === undefined) { msg = label + ' is a FOLD on this chart.'; cls = 'bad'; }
    else if (act === 'mixed') { msg = label + ' is a mixed-frequency hand — close EV either way.'; cls = 'mid'; }
    else { msg = label + ' → ' + ACTION_META[act].label + ' on this chart.'; cls = 'good'; }
    verdict.appendChild(el('div', { class: 'fb-verdict ' + cls, text: msg }));
    var det = el('details', {}, [el('summary', { text: 'Show chart' })]);
    det.appendChild(renderHandGrid(compiled, label));
    det.appendChild(renderChartLegend(compiled));
    verdict.appendChild(det);
  }
  sel.addEventListener('change', runCheck);
  gto.appendChild(sel);
  gto.appendChild(verdict);
  card.appendChild(gto);
  if (suggested) runCheck();

  // EDGE recommendation
  var ptype = null;
  if (h.vs) {
    for (var pid in STATE.players) {
      if (STATE.players[pid].name.toLowerCase() === String(h.vs).toLowerCase()) ptype = STATE.players[pid].type;
    }
  }
  var rec = recommendHand(h, ptype);
  var recBox = el('div', { class: 'obj-box' });
  recBox.appendChild(el('div', { class: 'exploit-h', text: 'EDGE recommendation' }));
  var rul = el('ul', { class: 'tips' });
  rec.bullets.forEach(function (b) { rul.appendChild(el('li', { text: b })); });
  recBox.appendChild(rul);
  recBox.appendChild(el('div', { class: 'fb-verdict mid', text: 'Next time: ' + rec.next }));
  card.appendChild(recBox);

  // stack + streets
  var eff = el('input', { class: 'input', type: 'number', placeholder: 'effective stack (bb)', value: h.effBB || '' });
  eff.addEventListener('change', function () { h.effBB = eff.value; saveState(); rerender(); });
  card.appendChild(el('div', { class: 'lab', text: 'Effective stack (bb)' }));
  card.appendChild(eff);
  h.streets = h.streets || { f: '', t: '', r: '' };
  card.appendChild(el('div', { class: 'lab', text: 'Street-by-street action' }));
  [['f', 'Flop'], ['t', 'Turn'], ['r', 'River']].forEach(function (pair) {
    var sIn = el('input', { class: 'input', placeholder: pair[1] + ' \u2014 e.g., "I bet 30, he called"', value: h.streets[pair[0]] || '' });
    sIn.addEventListener('change', function () { h.streets[pair[0]] = sIn.value; saveState(); });
    card.appendChild(sIn);
  });

  // board + notes
  var board = el('input', { class: 'input', placeholder: 'Board (e.g., Ah 7c 2d / 9s / 2c)', value: h.board || '' });
  board.addEventListener('change', function () { h.board = board.value; saveState(); });
  card.appendChild(el('div', { class: 'lab', text: 'Board' }));
  card.appendChild(board);

  var notes = el('textarea', { class: 'input ta', placeholder: 'Street-by-street: sizings, what villain showed, what you were thinking…' });
  notes.value = h.streetNotes || h.note || '';
  notes.addEventListener('change', function () { h.streetNotes = notes.value; saveState(); });
  card.appendChild(el('div', { class: 'lab', text: 'Review notes' }));
  card.appendChild(notes);

  // result edit
  var res = el('input', { class: 'input', type: 'number', value: h.result });
  res.addEventListener('change', function () { h.result = parseFloat(res.value) || 0; saveState(); rerender(); });
  card.appendChild(el('div', { class: 'lab', text: 'Result (+/-)' }));
  card.appendChild(res);

  // leak tags
  card.appendChild(el('div', { class: 'lab', text: 'Leak tags (what would the best version of you have done differently?)' }));
  var chipRow = el('div', { class: 'chip-row' });
  LEAK_TAGS.forEach(function (L) {
    chipRow.appendChild(el('button', {
      class: 'chip' + ((h.leaks || []).indexOf(L) >= 0 ? ' on bad' : ''), text: L,
      onclick: function () {
        h.leaks = h.leaks || [];
        var ix = h.leaks.indexOf(L);
        if (ix >= 0) h.leaks.splice(ix, 1); else h.leaks.push(L);
        saveState(); rerender();
      }
    }));
  });
  card.appendChild(chipRow);

  var row = el('div', { class: 'btn-row' });
  row.appendChild(el('button', {
    class: 'btn ' + (h.reviewed ? 'ghost' : 'primary'),
    text: h.reviewed ? 'Mark unreviewed' : '✓ Mark reviewed',
    onclick: function () { h.reviewed = !h.reviewed; saveState(); rerender(); }
  }));
  row.appendChild(el('button', {
    class: 'btn ghost', text: 'Delete',
    onclick: function () {
      confirmAction('Delete this hand?', function () {
        STATE.hands = STATE.hands.filter(function (x) { return x.id !== h.id; });
        saveState(); rerender();
      });
    }
  }));
  card.appendChild(row);
  return card;
}

function suggestChart(h) {
  if (!h.line) return '';
  var pos = h.position;
  if (h.line.indexOf('I opened') >= 0) {
    var map = { 'UTG': 'rfi9-utg', 'UTG+1': 'rfi9-utg1', 'MP': 'rfi9-mp', 'LJ': 'rfi9-lj', 'HJ': 'rfi9-hj', 'CO': 'rfi9-co', 'BTN': 'rfi9-btn', 'SB': 'rfi9-sb' };
    return map[pos] || '';
  }
  if (h.line.indexOf('I defended BB') >= 0) return 'def-bb-btn';
  if (h.line.indexOf('I 3-bet') >= 0 || h.line.indexOf('I called open') >= 0) {
    if (pos === 'BB') return 'def-bb-co';
    if (pos === 'SB') return 'def-sb-btn';
    if (pos === 'BTN') return 'def-btn-co';
    return 'def-bb-co';
  }
  if (h.line.indexOf('I faced 3-bet') >= 0) {
    if (pos === 'BTN') return 'v3b-btn-blind';
    if (pos === 'CO') return 'v3b-co-btn';
    if (pos === 'SB') return 'v3b-sb-bb';
    return 'v3b-mp';
  }
  return '';
}
