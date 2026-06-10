/* ============================================================
   EDGE — view-study.js  (v2)
   Course (lessons + quizzes), interactive GTO charts with
   border summaries and tap-a-cell explanations, live cheatsheet,
   player-type field guide.
   ============================================================ */
'use strict';

var studyState = { tab: 'course', chartId: 'rfi9-lj', cellInfo: null, lessonId: null, quizState: {} };

var STUDY_TABS = [
  { id: 'course', label: '🎓 Course' },
  { id: 'rfi', label: 'Open (RFI)' },
  { id: 'vsrfi', label: 'Defend' },
  { id: 'vs3bet', label: 'vs 3-Bet' },
  { id: 'pushfold', label: 'Push/Fold' },
  { id: 'cheat', label: 'Live Sheet' },
  { id: 'types', label: 'Player Types' }
];

function renderStudy(root) {
  clear(root);
  root.appendChild(sectionTitle('Study', 'Lessons for the logic, charts for the lines. Tap any grid cell to learn why it plays.'));

  var tabs = el('div', { class: 'pill-row' });
  STUDY_TABS.forEach(function (t) {
    tabs.appendChild(el('button', {
      class: 'pill' + (studyState.tab === t.id ? ' on' : ''),
      text: t.label,
      onclick: function () { studyState.tab = t.id; studyState.cellInfo = null; studyState.lessonId = null; rerender(); }
    }));
  });
  root.appendChild(tabs);

  if (studyState.tab === 'course') return renderCourse(root);
  if (studyState.tab === 'cheat') return renderCheatsheet(root);
  if (studyState.tab === 'types') return renderTypes(root);

  var charts = chartsByGroup(studyState.tab);
  if (studyState.tab === 'vs3bet') charts = charts.concat(chartsByGroup('vs4bet'));

  var sel = el('select', { class: 'select', onchange: function (e) { studyState.chartId = e.target.value; studyState.cellInfo = null; rerender(); } });
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
  card.appendChild(interactiveGrid(compiled));
  card.appendChild(renderChartLegend(compiled));

  // tap-a-cell explanation
  if (studyState.cellInfo) {
    var info = studyState.cellInfo;
    var exp = explainAnswer(info.chartId, info.label, '', correctAnswers(info.chartId, info.label));
    var panel = el('div', { class: 'cell-info' });
    panel.appendChild(el('div', { class: 'fb-verdict', text: info.label + ' · ' + (compiled.chart[info.label] ? ACTION_META[compiled.chart[info.label]].label : 'Fold') + ' · ' + classToCombos(info.label, []).length + ' combos · #' + (handRank(info.label) + 1) + '/169 by raw equity' }));
    panel.appendChild(el('div', { class: 'fb-why', text: exp.text }));
    card.appendChild(panel);
  } else {
    card.appendChild(el('p', { class: 'hint', text: '👆 Tap any cell for the why (blockers, playability, border logic).' }));
  }

  // border summary — the memorization shortcut
  var borders = borderSummary(compiled.spec.id);
  if (borders.length) {
    var bs = el('div', { class: 'border-box' });
    bs.appendChild(el('div', { class: 'exploit-h', text: '📏 Memorize the borders, not the grid' }));
    borders.forEach(function (b) {
      bs.appendChild(el('div', { class: 'border-row' }, [
        el('span', { class: 'border-fam', text: b.name }),
        el('b', { text: b.text })
      ]));
    });
    card.appendChild(bs);
  }

  if (compiled.spec.note) card.appendChild(el('p', { class: 'note', text: compiled.spec.note }));
  if (compiled.spec.group === 'pushfold') {
    card.appendChild(el('p', { class: 'note', text: 'Nash-style approximation, no ante. With antes in play, shove noticeably wider.' }));
  }
  root.appendChild(card);

  root.appendChild(el('p', { class: 'fineprint', text: 'Baselines are simplified solver approximations for drilling. Tune them in ranges.js as your study deepens.' }));
}

function interactiveGrid(compiled) {
  var wrap = el('div', { class: 'grid-wrap' });
  var grid = el('div', { class: 'hand-grid' });
  for (var i = 0; i < 13; i++) {
    for (var j = 0; j < 13; j++) {
      (function (label) {
        var act = compiled.chart[label];
        var cls = 'cell tappable ' + (act ? ACTION_META[act].cls : 'act-fold');
        if (i === j) cls += ' pair';
        if (studyState.cellInfo && studyState.cellInfo.label === label) cls += ' hl';
        grid.appendChild(el('div', {
          class: cls, text: label,
          onclick: function () {
            studyState.cellInfo = (studyState.cellInfo && studyState.cellInfo.label === label) ? null : { chartId: compiled.spec.id, label: label };
            rerender();
          }
        }));
      })(gridLabel(i, j));
    }
  }
  wrap.appendChild(grid);
  return wrap;
}

/* ---------- the course ---------- */
function renderCourse(root) {
  if (studyState.lessonId) return renderLesson(root, studyState.lessonId);
  var done = 0;
  LESSONS.forEach(function (L) { if (STATE.lessons[L.id] && STATE.lessons[L.id].done) done++; });
  var head = el('div', { class: 'card' });
  head.appendChild(el('div', { class: 'chart-title', text: 'The logic of winning poker' }));
  head.appendChild(el('div', { class: 'chart-sub', text: done + '/' + LESSONS.length + ' lessons complete · ~2-3 min each · sequenced to pair with Modern Poker Theory' }));
  head.appendChild(masteryBar(LESSONS.length ? done / LESSONS.length : 0, ''));
  root.appendChild(head);

  LESSONS.forEach(function (L, idx) {
    var isDone = STATE.lessons[L.id] && STATE.lessons[L.id].done;
    var card = el('div', {
      class: 'card lesson-row' + (isDone ? ' done' : ''),
      onclick: function () { studyState.lessonId = L.id; studyState.quizState = {}; rerender(); }
    });
    card.appendChild(el('div', { class: 'lesson-head' }, [
      el('span', { class: 'lesson-icon', text: L.icon }),
      el('div', {}, [
        el('div', { class: 'chart-title', text: (idx + 1) + '. ' + L.title }),
        el('div', { class: 'chart-sub', text: L.minutes + ' min · ' + L.quiz.length + ' checkpoint question' + (L.quiz.length > 1 ? 's' : '') })
      ]),
      el('span', { class: 'lesson-check', text: isDone ? '✓' : '›' })
    ]));
    root.appendChild(card);
  });
}

function renderLesson(root, id) {
  var L = null;
  LESSONS.forEach(function (x) { if (x.id === id) L = x; });
  if (!L) { studyState.lessonId = null; return renderCourse(root); }

  var card = el('div', { class: 'card' });
  card.appendChild(el('div', { class: 'panel-head' }, [
    el('div', { class: 'chart-title', text: L.icon + ' ' + L.title }),
    el('button', { class: 'btn ghost sm', text: '✕', onclick: function () { studyState.lessonId = null; rerender(); } })
  ]));
  L.body.forEach(function (p) { card.appendChild(el('p', { class: 'lesson-p', text: p })); });
  root.appendChild(card);

  // checkpoint quiz
  var quiz = el('div', { class: 'card' });
  quiz.appendChild(el('div', { class: 'chart-title', text: 'Checkpoint' }));
  var allRight = true;
  L.quiz.forEach(function (item, qi) {
    var st = studyState.quizState[qi]; // chosen idx
    quiz.appendChild(el('div', { class: 'quiz-q', text: (qi + 1) + '. ' + item.q }));
    var opts = el('div', { class: 'quiz-opts' });
    item.options.forEach(function (opt, oi) {
      var cls = 'quiz-opt';
      if (st !== undefined) {
        if (oi === item.a) cls += ' right';
        else if (oi === st) cls += ' wrong';
        else cls += ' off';
      }
      opts.appendChild(el('button', {
        class: cls, text: opt,
        onclick: function () {
          if (studyState.quizState[qi] !== undefined) return;
          studyState.quizState[qi] = oi;
          checkLessonComplete(L);
          rerender();
        }
      }));
    });
    quiz.appendChild(opts);
    if (st !== undefined) {
      quiz.appendChild(el('div', { class: 'quiz-why ' + (st === item.a ? 'good' : 'bad'), text: (st === item.a ? '✓ ' : '✗ ') + item.why }));
      if (st !== item.a) allRight = false;
    } else allRight = false;
  });

  var isDone = STATE.lessons[L.id] && STATE.lessons[L.id].done;
  if (isDone) {
    quiz.appendChild(el('div', { class: 'fb-verdict good', text: '✓ Lesson complete' }));
  } else if (Object.keys(studyState.quizState).length === L.quiz.length && !allRight) {
    quiz.appendChild(el('button', {
      class: 'btn ghost block', text: 'Retry checkpoint',
      onclick: function () { studyState.quizState = {}; rerender(); }
    }));
  }
  // next lesson nav
  var idx = LESSONS.indexOf(L);
  var row = el('div', { class: 'btn-row' });
  if (idx < LESSONS.length - 1) {
    row.appendChild(el('button', {
      class: 'btn primary grow', text: 'Next lesson →',
      onclick: function () { studyState.lessonId = LESSONS[idx + 1].id; studyState.quizState = {}; rerender(); }
    }));
  }
  row.appendChild(el('button', { class: 'btn ghost', text: 'All lessons', onclick: function () { studyState.lessonId = null; rerender(); } }));
  quiz.appendChild(row);
  root.appendChild(quiz);
}

function checkLessonComplete(L) {
  if (Object.keys(studyState.quizState).length !== L.quiz.length) return;
  var allRight = true;
  L.quiz.forEach(function (item, qi) { if (studyState.quizState[qi] !== item.a) allRight = false; });
  if (allRight) {
    STATE.lessons[L.id] = { done: true, ts: Date.now() };
    saveState();
    toast('Lesson complete ✓');
  }
}

/* ---------- cheatsheet + types (unchanged content) ---------- */
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
