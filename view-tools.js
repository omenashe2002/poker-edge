/* ============================================================
   EDGE — view-tools.js
   Equity calculator (Monte Carlo) + table-side math tools.
   ============================================================ */
'use strict';

var toolsUI = {
  tab: 'equity',
  hero: [], board: [], vmode: 'range', vhand: [],
  vrange: 'Button open', picking: 'hero', result: null, custom: '22+,A2s+,KTs+,QJs'
};

var RANGE_PRESETS = {
  'Random hand': null,
  'Premium (QQ+, AK)': 'QQ+,AKs,AKo',
  'Tight (TT+, AQ+)': 'TT+,AQs+,AQo+',
  'EP open': 'rfi9-utg',
  'CO open': 'rfi9-co',
  'Button open': 'rfi9-btn',
  'BB defend vs BTN': 'def-bb-btn',
  'Loose passive (any pair, any suited, Ax, faces)': '22+,A2s+,A2o+,K2s+,Q2s+,J2s+,T2s+,92s+,82s+,72s+,62s+,52s+,42s+,32s,KTo+,QTo+,JTo',
  'Custom…': 'CUSTOM'
};

function renderTools(root) {
  clear(root);
  root.appendChild(sectionTitle('Tools', 'The math, on demand.'));

  var tabs = el('div', { class: 'pill-row' });
  [['equity', 'Equity'], ['quick', 'Quick math'], ['combos', 'Combos']].forEach(function (t) {
    tabs.appendChild(el('button', {
      class: 'pill' + (toolsUI.tab === t[0] ? ' on' : ''), text: t[1],
      onclick: function () { toolsUI.tab = t[0]; rerender(); }
    }));
  });
  root.appendChild(tabs);

  if (toolsUI.tab === 'equity') return renderEquity(root);
  if (toolsUI.tab === 'quick') return renderQuickMath(root);
  renderCombos(root);
}

/* ---------- equity calculator ---------- */
function renderEquity(root) {
  var card = el('div', { class: 'card' });

  // hero
  card.appendChild(el('div', { class: 'lab', text: 'Your hand (tap to remove)' }));
  var hrow = el('div', { class: 'drill-hand sm' });
  toolsUI.hero.forEach(function (c, i) {
    var chip = cardChip(c, true);
    chip.addEventListener('click', function () { toolsUI.hero.splice(i, 1); toolsUI.result = null; rerender(); });
    hrow.appendChild(chip);
  });
  card.appendChild(hrow);

  // villain mode
  card.appendChild(el('div', { class: 'lab', text: 'Villain' }));
  var vrow = el('div', { class: 'chip-row' });
  vrow.appendChild(el('button', { class: 'chip' + (toolsUI.vmode === 'range' ? ' on' : ''), text: 'Range', onclick: function () { toolsUI.vmode = 'range'; toolsUI.result = null; rerender(); } }));
  vrow.appendChild(el('button', { class: 'chip' + (toolsUI.vmode === 'hand' ? ' on' : ''), text: 'Exact hand', onclick: function () { toolsUI.vmode = 'hand'; toolsUI.result = null; rerender(); } }));
  card.appendChild(vrow);

  if (toolsUI.vmode === 'range') {
    var sel = el('select', { class: 'select' });
    Object.keys(RANGE_PRESETS).forEach(function (k) {
      sel.appendChild(el('option', { value: k, text: k }));
    });
    sel.value = toolsUI.vrange;
    sel.addEventListener('change', function () { toolsUI.vrange = sel.value; toolsUI.result = null; rerender(); });
    card.appendChild(sel);
    if (toolsUI.vrange === 'Custom…') {
      var inp = el('input', { class: 'input', value: toolsUI.custom, placeholder: 'e.g., 22+,A2s+,KTs+,QJs,T9s' });
      inp.addEventListener('change', function () { toolsUI.custom = inp.value; toolsUI.result = null; });
      card.appendChild(inp);
    }
  } else {
    var vh = el('div', { class: 'drill-hand sm' });
    toolsUI.vhand.forEach(function (c, i) {
      var chip = cardChip(c, true);
      chip.addEventListener('click', function () { toolsUI.vhand.splice(i, 1); toolsUI.result = null; rerender(); });
      vh.appendChild(chip);
    });
    card.appendChild(vh);
  }

  // board
  card.appendChild(el('div', { class: 'lab', text: 'Board (0–5 cards)' }));
  var brow = el('div', { class: 'drill-hand sm' });
  toolsUI.board.forEach(function (c, i) {
    var chip = cardChip(c, true);
    chip.addEventListener('click', function () { toolsUI.board.splice(i, 1); toolsUI.result = null; rerender(); });
    brow.appendChild(chip);
  });
  card.appendChild(brow);

  // picker target
  var prow = el('div', { class: 'chip-row' });
  [['hero', 'Pick: my hand'], ['vhand', 'Pick: villain'], ['board', 'Pick: board']].forEach(function (t) {
    if (t[0] === 'vhand' && toolsUI.vmode !== 'hand') return;
    prow.appendChild(el('button', { class: 'chip' + (toolsUI.picking === t[0] ? ' on' : ''), text: t[1], onclick: function () { toolsUI.picking = t[0]; rerender(); } }));
  });
  card.appendChild(prow);

  var used = toolsUI.hero.concat(toolsUI.board, toolsUI.vhand);
  card.appendChild(cardPicker(function (c) {
    if (used.indexOf(c) >= 0) return;
    if (toolsUI.picking === 'hero' && toolsUI.hero.length < 2) toolsUI.hero.push(c);
    else if (toolsUI.picking === 'vhand' && toolsUI.vhand.length < 2) toolsUI.vhand.push(c);
    else if (toolsUI.picking === 'board' && toolsUI.board.length < 5) toolsUI.board.push(c);
    toolsUI.result = null;
    rerender();
  }, used));

  card.appendChild(el('button', {
    class: 'btn primary block', text: '▶ Run 50,000 simulations',
    onclick: function () { runEquity(); }
  }));

  if (toolsUI.result) {
    var r = toolsUI.result;
    if (r.error) {
      card.appendChild(el('div', { class: 'fb-verdict bad', text: r.error }));
    } else {
      var box = el('div', { class: 'equity-out' });
      box.appendChild(el('div', { class: 'big-score', text: fmtPct(r.equity, 1) }));
      box.appendChild(el('div', { class: 'chart-sub', text: 'win ' + fmtPct(r.win, 1) + ' · tie ' + fmtPct(r.tie, 1) + ' · lose ' + fmtPct(r.lose, 1) + ' (±0.5%)' }));
      var needPot = el('p', { class: 'note', text: equityContext(r.equity) });
      box.appendChild(needPot);
      card.appendChild(box);
    }
  }
  root.appendChild(card);
}

function equityContext(eq) {
  // helpful translations of equity into action thresholds
  var msgs = [];
  msgs.push('Calling a pot-size bet needs 33% — you ' + (eq >= 1 / 3 ? 'HAVE it' : 'do not') + '.');
  msgs.push('Half-pot needs 25% — ' + (eq >= 0.25 ? 'yes' : 'no') + '.');
  msgs.push('Getting it in for stacks needs ~50% — ' + (eq >= 0.5 ? 'yes' : 'no') + '.');
  return msgs.join(' ');
}

function runEquity() {
  if (toolsUI.hero.length < 2) { toolsUI.result = { error: 'Pick your two cards first.' }; rerender(); return; }
  var villainCombos = null;
  if (toolsUI.vmode === 'hand') {
    if (toolsUI.vhand.length < 2) { toolsUI.result = { error: 'Pick villain\'s two cards (or switch to Range).' }; rerender(); return; }
    villainCombos = [toolsUI.vhand.slice()];
  } else {
    var preset = RANGE_PRESETS[toolsUI.vrange];
    if (preset === null) villainCombos = null; // random
    else {
      var rangeObj;
      if (preset === 'CUSTOM') {
        try { rangeObj = parseRange(toolsUI.custom); } catch (e) { rangeObj = null; }
        if (!rangeObj || !Object.keys(rangeObj).length) { toolsUI.result = { error: 'Could not parse that range string.' }; rerender(); return; }
      } else if (COMPILED_CHARTS[preset]) {
        rangeObj = COMPILED_CHARTS[preset].chart;
      } else {
        rangeObj = parseRange(preset);
      }
      villainCombos = rangeToCombos(rangeObj, toolsUI.hero.concat(toolsUI.board));
      if (!villainCombos.length) { toolsUI.result = { error: 'Range is empty after removing dead cards.' }; rerender(); return; }
    }
  }
  toolsUI.result = mcEquity(toolsUI.hero, villainCombos, toolsUI.board, 50000);
  rerender();
}

/* ---------- quick math ---------- */
function renderQuickMath(root) {
  var card = el('div', { class: 'card' });
  var pot = inputRow('Pot (before the bet)', 'number', 100);
  var bet = inputRow('Bet size', 'number', 66);
  var out = el('div', { class: 'math-out' });
  function recalc() {
    var P = parseFloat(pot.input.value) || 0, B = parseFloat(bet.input.value) || 0;
    if (P <= 0 || B <= 0) { clear(out); return; }
    clear(out);
    var rows = [
      ['Caller needs equity', fmtPct(PokerMath.potOddsEquity(P + B, B), 1), 'call ÷ (pot+bet+call)'],
      ['Your MDF vs this bet', fmtPct(PokerMath.mdf(P, B), 1), 'defend at least this much of range'],
      ['Bluff break-even', fmtPct(PokerMath.bluffBreakeven(P, B), 1), 'how often the bluff must work'],
      ['Balanced bluff share', fmtPct(PokerMath.optimalBluffShare(P, B), 1), 'bluffs in a balanced river betting range'],
      ['Bet is % of pot', fmtPct(B / P, 0), '']
    ];
    rows.forEach(function (r) {
      out.appendChild(el('div', { class: 'math-row' }, [
        el('span', { text: r[0] }),
        el('b', { text: r[1] }),
        el('i', { text: r[2] })
      ]));
    });
  }
  pot.input.addEventListener('input', recalc);
  bet.input.addEventListener('input', recalc);
  card.appendChild(pot.row); card.appendChild(bet.row); card.appendChild(out);
  recalc();
  root.appendChild(card);

  // outs table
  var card2 = el('div', { class: 'card' });
  card2.appendChild(el('div', { class: 'chart-title', text: 'Outs → equity' }));
  var tbl = el('table', { class: 'tbl' });
  tbl.appendChild(el('tr', {}, [th('Draw'), th('Outs'), th('Flop→River'), th('Turn→River')]));
  [['Gutshot', 4], ['Two overcards', 6], ['Open-ender', 8], ['Flush draw', 9], ['Flush + gutshot', 12], ['Flush + OESD', 15]].forEach(function (r) {
    tbl.appendChild(el('tr', {}, [
      td(r[0]), td(String(r[1])),
      td(fmtPct(PokerMath.outsToEquity(r[1], 'flop'), 0)),
      td(fmtPct(PokerMath.outsToEquity(r[1], 'turn'), 0))
    ]));
  });
  card2.appendChild(tbl);
  root.appendChild(card2);

  // SPR
  var card3 = el('div', { class: 'card' });
  card3.appendChild(el('div', { class: 'chart-title', text: 'SPR (stack-to-pot ratio)' }));
  var stack = inputRow('Effective stack', 'number', 500);
  var pot2 = inputRow('Pot on flop', 'number', 60);
  var sprOut = el('div', { class: 'math-out' });
  function recalcSpr() {
    var S = parseFloat(stack.input.value) || 0, P = parseFloat(pot2.input.value) || 0;
    clear(sprOut);
    if (S <= 0 || P <= 0) return;
    var spr = PokerMath.spr(S, P);
    var advice = spr < 3 ? 'Low SPR: top pair+ is committed; plan to get it in.' :
      spr < 6 ? 'Medium SPR: top pair good kicker usually stacks off vs aggression with caution.' :
        spr < 13 ? 'High SPR: need two pair+ to stack off comfortably; position and equity matter more.' :
          'Very high SPR: implied-odds hands (sets, suited connectors) gain hugely.';
    sprOut.appendChild(el('div', { class: 'math-row' }, [el('span', { text: 'SPR' }), el('b', { text: spr.toFixed(1) }), el('i', { text: '' })]));
    sprOut.appendChild(el('p', { class: 'note', text: advice }));
  }
  stack.input.addEventListener('input', recalcSpr);
  pot2.input.addEventListener('input', recalcSpr);
  card3.appendChild(stack.row); card3.appendChild(pot2.row); card3.appendChild(sprOut);
  recalcSpr();
  root.appendChild(card3);
}

/* ---------- combo counter ---------- */
function renderCombos(root) {
  var card = el('div', { class: 'card' });
  card.appendChild(el('div', { class: 'chart-title', text: 'Combo counter' }));
  card.appendChild(el('p', { class: 'note', text: 'How many combinations of a range remain, given known (dead) cards. Combinatorics = the engine of hand reading.' }));
  var rng = inputRow('Range', 'text', 'AA,KK,AKs,AKo');
  var dead = inputRow('Dead cards', 'text', 'Ah Kd 2c');
  var out = el('div', { class: 'math-out' });
  function recalc() {
    clear(out);
    var deadCards = [];
    (dead.input.value.match(/[2-9TJQKA][cdhs]/gi) || []).forEach(function (s) {
      var c = parseCard(s);
      if (c >= 0) deadCards.push(c);
    });
    var rangeObj;
    try { rangeObj = parseRange(rng.input.value); } catch (e) { rangeObj = {}; }
    var labels = Object.keys(rangeObj);
    if (!labels.length) { out.appendChild(el('p', { class: 'note', text: 'Enter a range like “TT+, AQs+, AKo”.' })); return; }
    var total = 0;
    labels.sort();
    labels.forEach(function (l) {
      var n = classToCombos(l, deadCards).length;
      total += n;
      out.appendChild(el('div', { class: 'math-row' }, [el('span', { text: l }), el('b', { text: n + ' combos' }), el('i', { text: 'of ' + classComboCount(l) })]));
    });
    out.appendChild(el('div', { class: 'math-row total' }, [el('span', { text: 'TOTAL' }), el('b', { text: total + ' combos' }), el('i', { text: '' })]));
  }
  rng.input.addEventListener('input', recalc);
  dead.input.addEventListener('input', recalc);
  card.appendChild(rng.row); card.appendChild(dead.row); card.appendChild(out);
  recalc();
  root.appendChild(card);
}
