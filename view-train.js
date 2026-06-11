/* ============================================================
   EDGE — view-train.js  (v2)
   The trainer: border-focused sampling, severity-weighted
   grading with real explanations, spaced repetition of misses,
   daily goals + streaks, per-chart mastery, quick & deep modes.
   ============================================================ */
'use strict';

var DRILL_MODES = [
  { id: 'rfi', label: 'Opening (RFI)', desc: 'Folded to you → Raise or Fold', group: 'rfi' },
  { id: 'vsrfi', label: 'Defending & 3-Betting', desc: 'Facing an open → Fold / Call / 3-Bet', group: 'vsrfi' },
  { id: 'vslimp', label: 'vs Limpers', desc: 'Limpers in front → Fold / Over-limp / Iso-raise', group: 'vslimp' },
  { id: 'vs3bet', label: 'vs 3-Bet', desc: 'You opened, got 3-bet → Fold / Call / 4-Bet', group: 'vs3bet' },
  { id: 'pushfold', label: 'Push/Fold', desc: 'Short-stack MTT → Shove or Fold', group: 'pushfold' },
  { id: 'math', label: 'Poker Math', desc: 'Pot odds · MDF · bluff break-even · outs', group: null }
];

var trainState = {
  mode: null, length: 12, q: null, qNum: 0, done: false,
  results: [], lastFeedback: null, review: false, reviewItems: [],
  examQs: null, examSaved: false,
  pressure: localStorage.getItem('edge-pressure') === '1'
};
var pressureTimer = null;
function clearPressure() {
  if (pressureTimer) { clearInterval(pressureTimer); pressureTimer = null; }
}

function renderTrain(root) {
  clear(root);
  if (!trainState.mode) {
    root.appendChild(sectionTitle('Train', 'Border-zone drills with real explanations. Misses come back via spaced repetition until they stick.'));
    root.appendChild(goalWidget());
    renderReviewCard(root);
    renderExamCard(root);
    renderDrillPicker(root);
    return;
  }
  if (trainState.done) return renderDrillSummary(root);
  renderQuestion(root);
}

/* ---------- goal + streak widget ---------- */
function goalWidget() {
  var g = goalState();
  var pct = Math.min(1, g.todayCount / g.dailyTarget);
  var streak = currentStreak();
  var er = edgeRating();
  var card = el('div', { class: 'card hero goal-card' });
  card.appendChild(el('div', { class: 'hero-top' }, [
    el('div', {}, [
      el('div', { class: 'rating-row' }, [
        el('span', { class: 'rating-num', text: er.rating }),
        el('span', { class: 'rating-tier', text: er.tier })
      ]),
      el('div', { class: 'rating-hint', style: 'text-align:left;margin-top:4px', text: 'EDGE rating \u00b7 mastery + course + exams' })
    ]),
    el('button', {
      class: 'btn ghost sm', text: 'Goal',
      onclick: function () {
        showSheet({
          title: 'Daily goal', sub: 'Answers per day that keep the streak alive.',
          fields: [{ key: 'n', type: 'money', value: g.dailyTarget }],
          quick: [10, 20, 30],
          confirmText: 'Set goal',
          onConfirm: function (v) {
            var n = parseInt(v.n, 10);
            if (n > 0) { g.dailyTarget = n; saveState(); rerender(); }
          }
        });
      }
    })
  ]));
  card.appendChild(el('div', { class: 'goal-row', style: 'margin-top:12px' }, [
    el('div', { class: 'chart-sub', text: 'Today: ' + g.todayCount + ' / ' + g.dailyTarget + ' answers' }),
    el('div', { class: 'chart-sub', text: streak > 0 ? streak + '-day streak' + (g.bestStreak > streak ? ' \u00b7 best ' + g.bestStreak : '') : 'no active streak' })
  ]));
  card.appendChild(masteryBar(pct, ''));
  return card;
}

/* ---------- the Exam: 25 interleaved questions ---------- */
function renderExamCard(root) {
  var card = el('div', { class: 'card exam-card' });
  var last = STATE.exams.length ? STATE.exams[STATE.exams.length - 1] : null;
  card.appendChild(el('div', { class: 'chart-title', text: '\ud83c\udf93 The Exam' }));
  card.appendChild(el('div', { class: 'chart-sub', text: '25 questions, every topic interleaved \u2014 the honest benchmark. ' + (last ? 'Last: ' + last.grade + ' (' + Math.round(last.score * 100) + '%)' : 'Never taken.') }));
  if (STATE.exams.length > 1) {
    var hist = STATE.exams.slice(-6).map(function (e) { return e.grade; }).join(' \u00b7 ');
    card.appendChild(el('div', { class: 'exam-hist', text: 'History: ' + hist }));
  }
  card.appendChild(el('button', { class: 'btn primary block', text: 'Sit the exam', onclick: startExam }));
  root.appendChild(card);
}

function startExam() {
  var qs = [];
  ['rfi', 'vsrfi', 'vs3bet', 'pushfold'].forEach(function (group) {
    var charts = chartsByGroup(group);
    if (group === 'vs3bet') charts = charts.concat(chartsByGroup('vs4bet'));
    for (var i = 0; i < 5; i++) {
      var compiled = charts[randInt(charts.length)];
      var pool = interestingLabels(compiled.spec.id);
      var label = Math.random() < 0.7 ? pool[randInt(pool.length)] : comboClass.apply(null, sampleHand());
      qs.push({ kind: 'range', chartId: compiled.spec.id, label: label, hand: comboForLabel(label) });
    }
  });
  for (var m = 0; m < 5; m++) qs.push(makeMathQuestion());
  shuffleInPlace(qs);
  trainState.examQs = qs;
  trainState.examSaved = false;
  startDrill('exam', qs.length, false);
}

/* ---------- review queue card ---------- */
function renderReviewCard(root) {
  var due = srsDue();
  if (!due.length) return;
  var card = el('div', { class: 'card review-card', onclick: function () { startReview(); } });
  card.appendChild(el('div', { class: 'chart-title', text: 'Review queue: ' + due.length + ' hand' + (due.length > 1 ? 's' : '') + ' due' }));
  card.appendChild(el('div', { class: 'chart-sub', text: 'Hands you missed, scheduled by spaced repetition (1→3→7→14→30 days). Clear these first — this is where ranges become permanent.' }));
  root.appendChild(card);
}

/* ---------- picker ---------- */
function renderDrillPicker(root) {
  root.appendChild(el('div', { class: 'lab', text: 'Drills' }));
  var grid = el('div', { class: 'drill-grid' });
  DRILL_MODES.forEach(function (m) {
    var card = el('div', { class: 'card drill-pick' });
    card.appendChild(el('div', { class: 'chart-title', text: m.label }));
    card.appendChild(el('div', { class: 'chart-sub', text: m.desc }));
    if (m.group) {
      card.appendChild(masteryBar(groupMastery(m.group), 'mastery'));
    } else {
      var s = drillStats('math');
      card.appendChild(masteryBar(s.n ? s.acc : null, 'accuracy'));
    }
    var btns = el('div', { class: 'btn-row' });
    btns.appendChild(el('button', { class: 'btn primary grow sm', text: 'Quick · 12', onclick: function () { startDrill(m.id, 12, false); } }));
    btns.appendChild(el('button', { class: 'btn ghost grow sm', text: 'Deep · 30', onclick: function () { startDrill(m.id, 30, false); } }));
    card.appendChild(btns);
    grid.appendChild(card);
  });
  root.appendChild(grid);
  // pressure mode toggle
  var pr = el('div', { class: 'card pressure-card' });
  pr.appendChild(el('div', { class: 'panel-head' }, [
    el('div', {}, [
      el('div', { class: 'chart-title', text: 'Pressure mode' }),
      el('div', { class: 'chart-sub', text: '10-second shot clock per question. Stakes sharpen focus — timeouts count as misses.' })
    ]),
    el('button', {
      class: 'btn sm ' + (trainState.pressure ? 'primary' : 'ghost'),
      text: trainState.pressure ? 'ON' : 'OFF',
      onclick: function () {
        trainState.pressure = !trainState.pressure;
        localStorage.setItem('edge-pressure', trainState.pressure ? '1' : '0');
        rerender();
      }
    })
  ]));
  root.appendChild(pr);
}

function startDrill(modeId, length, review) {
  trainState.mode = modeId;
  trainState.length = length;
  trainState.review = review;
  trainState.qNum = 0;
  trainState.done = false;
  trainState.results = [];
  trainState.lastFeedback = null;
  nextQuestion();
  rerender();
}

function startReview() {
  var due = srsDue();
  shuffleInPlace(due);
  trainState.reviewItems = due.slice(0, 20);
  startDrill('review', trainState.reviewItems.length, true);
}

/* ---------- question generation ---------- */
function nextQuestion() {
  clearPressure();
  trainState.qNum++;
  if (trainState.qNum > trainState.length) {
    trainState.done = true;
    if (trainState.mode === 'exam' && !trainState.examSaved) {
      var s = 0;
      trainState.results.forEach(function (r) { s += r.credit; });
      var pct = trainState.results.length ? s / trainState.results.length : 0;
      STATE.exams.push({ ts: Date.now(), score: pct, grade: gradeLetter(pct) });
      if (STATE.exams.length > 40) STATE.exams = STATE.exams.slice(-30);
      trainState.examSaved = true;
      saveState();
    }
    return;
  }
  if (trainState.mode === 'exam') {
    trainState.q = trainState.examQs[trainState.qNum - 1];
    return;
  }
  if (trainState.review) {
    var item = trainState.reviewItems[trainState.qNum - 1];
    if (!item) { trainState.done = true; return; }
    trainState.q = { kind: 'range', chartId: item.chartId, label: item.label, hand: comboForLabel(item.label), fromReview: true };
    return;
  }
  if (trainState.mode === 'math') { trainState.q = makeMathQuestion(); return; }
  var group = trainState.mode;
  var charts = chartsByGroup(group);
  if (group === 'vs3bet') charts = charts.concat(chartsByGroup('vs4bet'));
  // adaptive: weight charts toward low mastery
  var weights = charts.map(function (c) {
    var m = chartMastery(c.spec.id);
    return m === null ? 1.2 : (1.25 - m.mastery);
  });
  var compiled = charts[weightedPick(weights)];
  var label;
  if (Math.random() < 0.65) {
    // border-zone hand: where the actual decisions live
    var pool = interestingLabels(compiled.spec.id);
    label = pool[randInt(pool.length)];
  } else {
    var h = sampleHand();
    label = comboClass(h[0], h[1]);
  }
  trainState.q = { kind: 'range', chartId: compiled.spec.id, label: label, hand: comboForLabel(label) };
}

function weightedPick(weights) {
  var total = 0, i;
  for (i = 0; i < weights.length; i++) total += weights[i];
  var r = Math.random() * total;
  for (i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

/* ---------- question rendering ---------- */
function renderQuestion(root) {
  var q = trainState.q;
  var bar = el('div', { class: 'drill-bar' }, [
    el('span', { text: (trainState.review ? '🔁 ' : '') + 'Q' + trainState.qNum + '/' + trainState.length }),
    el('span', { class: 'drill-score', text: sessionScoreText() }),
    el('button', { class: 'btn ghost sm', text: 'Quit', onclick: function () { trainState.mode = null; rerender(); } })
  ]);
  root.appendChild(bar);
  root.appendChild(el('div', { class: 'drill-progress' }, [
    el('div', { class: 'drill-progress-fill', style: 'width:' + (100 * (trainState.qNum - 1) / trainState.length) + '%' })
  ]));

  if (trainState.lastFeedback) root.appendChild(trainState.lastFeedback);

  var card = el('div', { class: 'card drill-q' });
  if (trainState.pressure) {
    var pbar = el('div', { class: 'pressure-bar' }, [el('div', { class: 'pressure-fill' })]);
    card.appendChild(pbar);
    clearPressure();
    var deadline = Date.now() + 10000;
    var fill = pbar.firstChild;
    pressureTimer = setInterval(function () {
      var left = deadline - Date.now();
      if (left <= 0) {
        clearPressure();
        if (trainState.q && trainState.q.kind === 'range') gradeRange('__timeout');
        else gradeMath(-1);
        return;
      }
      fill.style.width = (100 * left / 10000) + '%';
      if (left < 3000) fill.className = 'pressure-fill hot';
    }, 100);
  }
  if (q.kind === 'range') {
    var compiled = getChart(q.chartId);
    var spec = compiled.spec;
    card.appendChild(tableScene(sceneForSpec(spec)));
    var situation = spec.group === 'pushfold'
      ? 'MTT · ' + spec.stack + 'bb effective · folded to you'
      : (spec.sub || '');
    card.appendChild(el('div', { class: 'chart-sub center-text', text: spec.title + (situation ? ' — ' + situation : '') }));
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
      row.appendChild(el('button', { class: 'btn answer neutral', text: opt, onclick: function () { gradeMath(idx); } }));
    });
    card.appendChild(row);
  }
  root.appendChild(card);
}

function sessionScoreText() {
  if (!trainState.results.length) return '';
  var s = 0;
  trainState.results.forEach(function (r) { s += r.credit; });
  return Math.round(100 * s / trainState.results.length) + '%';
}

/* ---------- grading ---------- */
function gradeRange(answer) {
  clearPressure();
  var q = trainState.q;
  var accepted = correctAnswers(q.chartId, q.label);
  var exp = explainAnswer(q.chartId, q.label, answer, accepted);
  var credit = exp.correct ? 1 : SEVERITY_META[exp.severity].credit;

  // spaced repetition bookkeeping
  if (!exp.correct) srsRecordMiss(q.chartId, q.label);
  else if (q.fromReview) srsRecordPass(q.chartId, q.label);

  recordAnswerForGoal();
  STATE.drills.push({
    ts: Date.now(), mode: trainState.review ? 'review' : trainState.mode,
    chartId: q.chartId, label: q.label, answer: answer,
    correct: exp.correct, severity: exp.severity, credit: credit
  });
  saveState();

  trainState.results.push({ label: q.label, chartId: q.chartId, correct: exp.correct, severity: exp.severity, credit: credit });
  trainState.lastFeedback = buildFeedback(q, answer, accepted, exp);
  nextQuestion();
  rerender();
}

function buildFeedback(q, answer, accepted, exp) {
  var compiled = getChart(q.chartId);
  var cls = exp.correct ? 'good' : exp.severity === 'close' ? 'closecall' : 'bad';
  var box = el('div', { class: 'card feedback ' + cls });
  var head;
  if (exp.correct) {
    head = '✓ ' + q.label + ' — correct';
  } else {
    var names = accepted.map(function (a) { return ACTION_META[a].label; }).join(' or ');
    var sev = SEVERITY_META[exp.severity];
    var prefix = answer === '__timeout' ? '⏱ Time! ' : (exp.severity === 'close' ? '≈ ' : exp.severity === 'blunder' ? '✗✗ ' : '✗ ');
    head = prefix + sev.label + ' — chart says ' + names;
  }
  box.appendChild(el('div', { class: 'fb-verdict', text: head }));
  if (!exp.correct) box.appendChild(el('div', { class: 'fb-sev ' + SEVERITY_META[exp.severity].cls, text: SEVERITY_META[exp.severity].blurb }));
  box.appendChild(el('div', { class: 'fb-why', text: exp.text }));
  if (!exp.correct) {
    var details = el('details', {}, [el('summary', { text: 'Show chart: ' + compiled.spec.title })]);
    details.appendChild(renderHandGrid(compiled, q.label));
    details.appendChild(renderChartLegend(compiled));
    box.appendChild(details);
    box.appendChild(el('div', { class: 'fb-note', text: '→ Added to your review queue.' }));
  }
  return box;
}

/* ---------- math questions (count toward the daily goal too) ---------- */
function makeMathQuestion() {
  var kinds = ['potodds', 'mdf', 'be', 'outs'];
  var kind = kinds[randInt(kinds.length)];
  var pot = (randInt(16) + 4) * 10;
  var betChoices = [0.33, 0.5, 0.66, 0.75, 1, 1.25];
  var bet = Math.round(pot * betChoices[randInt(betChoices.length)]);
  var q = { kind: 'math', mathKind: kind };
  var answer, prompt, detail;
  if (kind === 'potodds') {
    prompt = 'Villain bets ' + bet + ' into a pot of ' + pot + '. What equity do you need to call?';
    detail = 'call ÷ (pot + bet + call)';
    answer = bet / (pot + bet + bet);
  } else if (kind === 'mdf') {
    prompt = 'Villain bets ' + bet + ' into ' + pot + '. What is your Minimum Defense Frequency?';
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
    detail = street === 'flop' ? 'two cards to come (Rule of 4)' : 'one card to come (Rule of 2)';
    answer = PokerMath.outsToEquity(outs, street);
  }
  q.prompt = prompt; q.detail = detail;
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
  clearPressure();
  var q = trainState.q;
  var correct = idx === q.correctIdx;
  recordAnswerForGoal();
  STATE.drills.push({ ts: Date.now(), mode: 'math', chartId: q.mathKind, label: '', answer: idx >= 0 ? q.options[idx] : 'timeout', correct: correct, credit: correct ? 1 : 0 });
  saveState();
  trainState.results.push({ label: q.mathKind, chartId: 'math', correct: correct, severity: correct ? null : 'mistake', credit: correct ? 1 : 0 });
  var box = el('div', { class: 'card feedback ' + (correct ? 'good' : 'bad') });
  box.appendChild(el('div', { class: 'fb-verdict', text: (correct ? '✓ Correct — ' : '✗ Answer: ' + q.options[q.correctIdx] + ' — ') + q.explain }));
  trainState.lastFeedback = box;
  nextQuestion();
  rerender();
}

/* ---------- summary ---------- */
function gradeLetter(pct) {
  return pct >= 0.97 ? 'A+' : pct >= 0.9 ? 'A' : pct >= 0.8 ? 'B' : pct >= 0.65 ? 'C' : pct >= 0.5 ? 'D' : 'F';
}

function renderDrillSummary(root) {
  var rs = trainState.results;
  var score = 0, perfect = 0, close = 0, mistakes = 0, blunders = 0;
  rs.forEach(function (r) {
    score += r.credit;
    if (r.correct) perfect++;
    else if (r.severity === 'close') close++;
    else if (r.severity === 'blunder') blunders++;
    else mistakes++;
  });
  var pct = rs.length ? score / rs.length : 0;
  var card = el('div', { class: 'card center' });
  card.appendChild(el('div', { class: 'grade-letter', text: gradeLetter(pct) }));
  card.appendChild(el('div', { class: 'big-score sm', text: Math.round(pct * 100) + '%' }));
  card.appendChild(el('div', { class: 'chart-sub', text: 'severity-weighted: close calls cost half, blunders cost full' }));
  var breakdown = el('div', { class: 'sum-breakdown' });
  breakdown.appendChild(sumPill('✓ ' + perfect, 'good'));
  if (close) breakdown.appendChild(sumPill('≈ ' + close + ' close', 'closep'));
  if (mistakes) breakdown.appendChild(sumPill('✗ ' + mistakes + ' mistake' + (mistakes > 1 ? 's' : ''), 'bad'));
  if (blunders) breakdown.appendChild(sumPill('✗✗ ' + blunders + ' blunder' + (blunders > 1 ? 's' : ''), 'worst'));
  card.appendChild(breakdown);

  var misses = rs.filter(function (r) { return !r.correct && r.chartId !== 'math'; });
  if (misses.length) {
    card.appendChild(el('div', { class: 'lab', text: 'What to study' }));
    misses.slice(0, 6).forEach(function (m) {
      var c = getChart(m.chartId);
      card.appendChild(el('div', { class: 'miss-row', text: m.label + ' — ' + (c ? c.spec.title : m.chartId) + (m.severity === 'blunder' ? '  ⚠ blunder' : '') }));
    });
    card.appendChild(el('p', { class: 'note', text: 'Misses are queued for spaced review (1→3→7→14→30 days). Clear the queue daily and these become automatic.' }));
  }

  var g = goalState();
  if (g.todayCount >= g.dailyTarget && currentStreak() > 0) {
    card.appendChild(el('div', { class: 'fb-verdict good', text: '🔥 Daily goal hit — streak: ' + currentStreak() }));
  }

  var row = el('div', { class: 'btn-row' });
  row.appendChild(el('button', { class: 'btn primary grow', text: 'Again', onclick: function () { trainState.review ? startReview() : (trainState.mode === 'exam' ? startExam() : startDrill(trainState.mode, trainState.length, false)); } }));
  var due = srsDue();
  if (due.length && !trainState.review) {
    row.appendChild(el('button', { class: 'btn accent grow', text: 'Review · ' + due.length, onclick: function () { startReview(); } }));
  }
  row.appendChild(el('button', { class: 'btn ghost', text: 'Done', onclick: function () { trainState.mode = null; rerender(); } }));
  card.appendChild(row);
  root.appendChild(card);
}

function sumPill(text, cls) { return el('span', { class: 'sum-pill ' + cls, text: text }); }
