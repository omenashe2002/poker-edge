/* ============================================================
   EDGE — view-train.js
   Drill engine: range drills graded against the charts, plus
   poker-math drills (pot odds, MDF, bluff break-even, outs).
   Every attempt is stored for the improvement analytics.
   ============================================================ */
'use strict';

var DRILL_MODES = [
  { id: 'rfi', label: 'Opening (RFI)', desc: 'Position + hand → Raise or Fold', group: 'rfi' },
  { id: 'vsrfi', label: 'Defending', desc: 'Facing an open → Fold / Call / 3-Bet', group: 'vsrfi' },
  { id: 'vs3bet', label: 'vs 3-Bet', desc: 'You opened, got 3-bet → Fold / Call / 4-Bet', group: 'vs3bet' },
  { id: 'pushfold', label: 'Push/Fold', desc: 'Short stack MTT → Shove or Fold', group: 'pushfold' },
  { id: 'math', label: 'Poker Math', desc: 'Pot odds · MDF · bluff break-even · outs', group: null }
];

var trainState = { mode: null, q: null, qNum: 0, right: 0, total: 20, done: false, lastFeedback: null };

function renderTrain(root) {
  clear(root);
  root.appendChild(sectionTitle('Train', 'Drill until the charts are instinct. Accuracy is tracked per drill type over time.'));

  if (!trainState.mode) return renderDrillPicker(root);
  if (trainState.done) return renderDrillSummary(root);
  renderQuestion(root);
}

function renderDrillPicker(root) {
  DRILL_MODES.forEach(function (m) {
    var s = drillStats(m.id);
    var s7 = drillStats(m.id, Date.now() - 7 * 864e5);
    var card = el('div', { class: 'card drill-pick', onclick: function () { startDrill(m.id); } });
    card.appendChild(el('div', { class: 'chart-title', text: m.label }));
    card.appendChild(el('div', { class: 'chart-sub', text: m.desc }));
    card.appendChild(el('div', {
      class: 'drill-acc',
      text: s.n ? ('All-time ' + fmtPct(s.acc, 0) + ' over ' + s.n + ' answers' + (s7.n ? ' · last 7 days ' + fmtPct(s7.acc, 0) : '')) : 'Not attempted yet'
    }));
    root.appendChild(card);
  });
}

function startDrill(modeId) {
  trainState.mode = modeId;
  trainState.qNum = 0; trainState.right = 0; trainState.done = false; trainState.lastFeedback = null;
  nextQuestion();
  rerender();
}

function nextQuestion() {
  trainState.qNum++;
  if (trainState.qNum > trainState.total) { trainState.done = true; return; }
  if (trainState.mode === 'math') { trainState.q = makeMathQuestion(); return; }
  var group = trainState.mode;
  var charts = chartsByGroup(group);
  if (group === 'vs3bet') charts = charts.concat(chartsByGroup('vs4bet'));
  var compiled = charts[randInt(charts.length)];
  // sample a concrete hand: bias toward decision-relevant hands (in-chart or near)
  var hand = sampleHand();
  if (Math.random() < 0.55) { // resample until in-chart ~55% of the time
    var tries = 0;
    while (compiled.chart[comboClass(hand[0], hand[1])] === undefined && tries < 30) { hand = sampleHand(); tries++; }
  }
  trainState.q = { kind: 'range', chartId: compiled.spec.id, hand: hand, label: comboClass(hand[0], hand[1]) };
}

function renderQuestion(root) {
  var q = trainState.q;
  var bar = el('div', { class: 'drill-bar' }, [
    el('span', { text: 'Q' + trainState.qNum + '/' + trainState.total }),
    el('span', { text: trainState.right + ' correct' }),
    el('button', { class: 'btn ghost sm', text: 'Quit', onclick: function () { trainState.mode = null; rerender(); } })
  ]);
  root.appendChild(bar);

  if (trainState.lastFeedback) {
    root.appendChild(trainState.lastFeedback);
  }

  var card = el('div', { class: 'card drill-q' });
  if (q.kind === 'range') {
    var compiled = getChart(q.chartId);
    var spec = compiled.spec;
    var situation = '';
    if (spec.group === 'rfi') situation = 'Folded to you at ' + spec.pos + '. (' + (spec.title.indexOf('6-max') >= 0 ? '6-max' : '9-max') + ')';
    else if (spec.group === 'vsrfi') situation = 'You are in the ' + spec.pos + '. ' + spec.vs + ' in front of you.';
    else if (spec.group === 'vs3bet') situation = spec.title + '.';
    else if (spec.group === 'vs4bet') situation = 'You 3-bet and face a 4-bet.';
    else if (spec.group === 'pushfold') situation = 'MTT, ' + spec.stack + 'bb effective, you are ' + spec.pos + '. Folded to you.';
    card.appendChild(el('div', { class: 'chart-sub', text: situation }));
    var hd = el('div', { class: 'drill-hand' });
    hd.appendChild(cardChip(q.hand[0], true));
    hd.appendChild(cardChip(q.hand[1], true));
    card.appendChild(hd);
    var answers = availableAnswers(q.chartId);
    var btnRow = el('div', { class: 'btn-row' });
    answers.forEach(function (a) {
      btnRow.appendChild(el('button', {
        class: 'btn answer ' + ACTION_META[a].cls,
        text: ACTION_META[a].label,
        onclick: function () { gradeRange(a); }
      }));
    });
    card.appendChild(btnRow);
  } else {
    card.appendChild(el('div', { class: 'chart-sub', text: q.prompt }));
    if (q.detail) card.appendChild(el('div', { class: 'drill-mathline', text: q.detail }));
    var row = el('div', { class: 'btn-row wrap' });
    q.options.forEach(function (opt, idx) {
      row.appendChild(el('button', {
        class: 'btn answer neutral',
        text: opt,
        onclick: function () { gradeMath(idx); }
      }));
    });
    card.appendChild(row);
  }
  root.appendChild(card);
}

function gradeRange(answer) {
  var q = trainState.q;
  var good = correctAnswers(q.chartId, q.label);
  var correct = good.indexOf(answer) >= 0;
  if (correct) trainState.right++;
  STATE.drills.push({ ts: Date.now(), mode: trainState.mode, chartId: q.chartId, label: q.label, answer: answer, correct: correct });
  saveState();
  trainState.lastFeedback = buildRangeFeedback(q, answer, good, correct);
  nextQuestion();
  rerender();
}

function buildRangeFeedback(q, answer, good, correct) {
  var compiled = getChart(q.chartId);
  var act = compiled.chart[q.label];
  var box = el('div', { class: 'card feedback ' + (correct ? 'good' : 'bad') });
  var verdict = correct ? '✓ ' + q.label + ' — correct' : '✗ ' + q.label + ' — chart says: ' + describeAnswer(q, good);
  box.appendChild(el('div', { class: 'fb-verdict', text: verdict }));
  if (act === 'mixed') {
    box.appendChild(el('div', { class: 'fb-note', text: 'This hand is a mixed-frequency play — EV is close between actions, so several answers are accepted.' }));
  }
  if (!correct) {
    var details = el('details', {}, [el('summary', { text: 'Show chart: ' + compiled.spec.title })]);
    details.appendChild(renderHandGrid(compiled, q.label));
    details.appendChild(renderChartLegend(compiled));
    box.appendChild(details);
  }
  return box;
}
function describeAnswer(q, good) {
  var names = good.map(function (a) { return ACTION_META[a].label; });
  return names.join(' or ');
}

/* ---------- math questions ---------- */
function makeMathQuestion() {
  var kinds = ['potodds', 'mdf', 'be', 'outs'];
  var kind = kinds[randInt(kinds.length)];
  var pot = (randInt(16) + 4) * 10;     // 40..190
  var betChoices = [0.33, 0.5, 0.66, 0.75, 1, 1.25];
  var bet = Math.round(pot * betChoices[randInt(betChoices.length)]);
  var q = { kind: 'math', mathKind: kind };
  var answer, prompt, detail;
  if (kind === 'potodds') {
    prompt = 'Villain bets ' + bet + ' into a pot of ' + pot + '. What equity do you need to call?';
    detail = 'call ÷ (pot + bet + call)';
    answer = bet / (pot + bet + bet);
  } else if (kind === 'mdf') {
    prompt = 'Villain bets ' + bet + ' into ' + pot + '. What is your Minimum Defense Frequency (how much of your range must continue)?';
    detail = 'MDF = pot ÷ (pot + bet)';
    answer = pot / (pot + bet);
  } else if (kind === 'be') {
    prompt = 'You bluff ' + bet + ' into a pot of ' + pot + '. How often must it work to break even?';
    detail = 'risk ÷ (risk + reward)';
    answer = bet / (pot + bet);
  } else {
    var outsOpts = [4, 8, 9, 12, 15];
    var outs = outsOpts[randInt(outsOpts.length)];
    var street = Math.random() < 0.5 ? 'flop' : 'turn';
    prompt = 'You have ' + outs + ' outs on the ' + street + '. Chance to improve by the river?';
    detail = street === 'flop' ? 'two cards to come' : 'one card to come';
    answer = PokerMath.outsToEquity(outs, street);
  }
  q.prompt = prompt; q.detail = detail;
  // build 4 options around the answer
  var correctPct = Math.round(answer * 100);
  var opts = [correctPct];
  var deltas = [-12, -7, -4, 4, 7, 12, 18];
  while (opts.length < 4) {
    var cand = correctPct + deltas[randInt(deltas.length)];
    if (cand > 1 && cand < 99 && opts.indexOf(cand) < 0) opts.push(cand);
  }
  shuffleInPlace(opts);
  q.options = opts.map(function (o) { return o + '%'; });
  q.correctIdx = opts.indexOf(correctPct);
  q.explain = detail + ' → ' + correctPct + '%';
  return q;
}

function gradeMath(idx) {
  var q = trainState.q;
  var correct = idx === q.correctIdx;
  if (correct) trainState.right++;
  STATE.drills.push({ ts: Date.now(), mode: 'math', chartId: q.mathKind, label: '', answer: q.options[idx], correct: correct });
  saveState();
  var box = el('div', { class: 'card feedback ' + (correct ? 'good' : 'bad') });
  box.appendChild(el('div', { class: 'fb-verdict', text: (correct ? '✓ Correct — ' : '✗ Answer: ' + q.options[q.correctIdx] + ' — ') + q.explain }));
  trainState.lastFeedback = box;
  nextQuestion();
  rerender();
}

function renderDrillSummary(root) {
  var acc = trainState.right / trainState.total;
  var card = el('div', { class: 'card center' });
  card.appendChild(el('div', { class: 'big-score', text: trainState.right + ' / ' + trainState.total }));
  card.appendChild(el('div', { class: 'chart-sub', text: acc >= 0.9 ? 'Crushing it.' : acc >= 0.7 ? 'Solid — keep drilling the misses.' : 'The charts disagree. Study tab, then run it back.' }));
  var row = el('div', { class: 'btn-row' });
  row.appendChild(el('button', { class: 'btn primary', text: 'Again', onclick: function () { startDrill(trainState.mode); } }));
  row.appendChild(el('button', { class: 'btn ghost', text: 'All drills', onclick: function () { trainState.mode = null; rerender(); } }));
  card.appendChild(row);
  root.appendChild(card);
}
