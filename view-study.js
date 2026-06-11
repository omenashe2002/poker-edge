/* ============================================================
   EDGE — view-study.js  (v3)
   Course in modules, glossary with auto-linked terms, lesson
   reader (objectives → body → takeaways → checkpoint),
   interactive charts with borders, cheatsheet, player types.
   ============================================================ */
'use strict';

var studyState = { tab: 'course', chartId: 'rfi9-lj', cellInfo: null, lessonId: null, quizState: {}, glossQuery: '' };

var STUDY_TABS = [
  { id: 'course', label: 'Course' },
  { id: 'gloss', label: 'Glossary' },
  { id: 'rfi', label: 'Open (RFI)' },
  { id: 'vsrfi', label: 'Defend & 3-Bet' },
  { id: 'vslimp', label: 'vs Limpers' },
  { id: 'vs3bet', label: 'vs 3-Bet' },
  { id: 'pushfold', label: 'Push/Fold' },
  { id: 'cheat', label: 'Live Sheet' },
  { id: 'types', label: 'Player Types' }
];

function renderStudy(root) {
  clear(root);
  root.appendChild(sectionTitle('Study', 'The course teaches the why; the charts hold the what. Tap any highlighted term or grid cell for an instant explanation.'));

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
  if (studyState.tab === 'gloss') return renderGlossary(root);
  if (studyState.tab === 'cheat') return renderCheatsheet(root);
  if (studyState.tab === 'types') return renderTypes(root);
  renderCharts(root);
}

/* ---------- glossary: term linking ---------- */
var GLOSS_RE = null;
function glossRe() {
  if (GLOSS_RE) return GLOSS_RE;
  var parts = GLOSSARY_MATCHES.map(function (gm) {
    return gm.m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });
  GLOSS_RE = new RegExp('\\b(' + parts.join('|') + ')(?![\\w-])', 'gi');
  return GLOSS_RE;
}
function glossIndexForMatch(matched) {
  var lower = matched.toLowerCase();
  for (var i = 0; i < GLOSSARY_MATCHES.length; i++) {
    if (GLOSSARY_MATCHES[i].m === lower) return GLOSSARY_MATCHES[i].i;
  }
  return -1;
}
/* paragraph with tappable glossary terms (first hit per term, max 8/para) */
function richPara(text, cls) {
  var p = el('p', { class: cls || 'lesson-p' });
  var re = glossRe();
  re.lastIndex = 0;
  var seen = {}, links = 0, last = 0, m;
  while ((m = re.exec(text)) !== null && links < 8) {
    var gi = glossIndexForMatch(m[1]);
    if (gi < 0 || seen[gi]) continue;
    seen[gi] = true;
    links++;
    if (m.index > last) p.appendChild(txt(text.slice(last, m.index)));
    (function (idx, word) {
      p.appendChild(el('span', { class: 'term', text: word, onclick: function (e) { e.stopPropagation(); showGloss(idx); } }));
    })(gi, m[1]);
    last = m.index + m[1].length;
  }
  p.appendChild(txt(text.slice(last)));
  return p;
}

/* bottom-sheet definition */
function showGloss(idx) {
  var g = GLOSSARY[idx];
  var old = document.getElementById('gloss-sheet');
  if (old) old.parentNode.removeChild(old);
  var sheet = el('div', { id: 'gloss-sheet', class: 'gloss-sheet' }, [
    el('div', { class: 'gloss-grab' }),
    el('div', { class: 'panel-head' }, [
      el('div', {}, [
        el('div', { class: 'chart-title', text: g.t }),
        el('div', { class: 'chart-sub', text: g.full })
      ]),
      el('button', { class: 'btn ghost sm', text: '✕', onclick: closeGloss })
    ]),
    el('p', { class: 'gloss-def', text: g.d }),
    el('button', {
      class: 'btn ghost sm', text: 'Open full glossary →',
      onclick: function () { closeGloss(); studyState.tab = 'gloss'; studyState.lessonId = null; navTo('study'); }
    })
  ]);
  sheet.addEventListener('click', function (e) { e.stopPropagation(); });
  document.body.appendChild(sheet);
  setTimeout(function () { sheet.className = 'gloss-sheet open'; }, 10);
  setTimeout(function () { document.addEventListener('click', closeGloss, { once: true }); }, 50);
}
function closeGloss() {
  var s = document.getElementById('gloss-sheet');
  if (!s) return;
  s.className = 'gloss-sheet';
  setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 250);
}

function renderGlossary(root) {
  var search = el('input', { class: 'input', placeholder: 'Search: RFI, mixed, MDF, blocker…', value: studyState.glossQuery });
  search.addEventListener('input', function () {
    studyState.glossQuery = search.value;
    renderGlossList(listBox);
  });
  root.appendChild(search);
  var listBox = el('div');
  root.appendChild(listBox);
  renderGlossList(listBox);
}
function renderGlossList(box) {
  clear(box);
  var items = studyState.glossQuery ? findGlossary(studyState.glossQuery) : GLOSSARY;
  if (!items.length) box.appendChild(el('p', { class: 'hint', text: 'No matches — try a shorter query.' }));
  items.forEach(function (g) {
    var card = el('div', { class: 'card gloss-card' });
    card.appendChild(el('div', { class: 'gloss-head' }, [
      el('span', { class: 'gloss-term', text: g.t }),
      el('span', { class: 'gloss-full', text: g.full })
    ]));
    card.appendChild(el('p', { class: 'gloss-def', text: g.d }));
    box.appendChild(card);
  });
}

/* ---------- the course (modules) ---------- */
function lessonDone(id) { return STATE.lessons[id] && STATE.lessons[id].done; }

function renderCourse(root) {
  if (studyState.lessonId) return renderLesson(root, studyState.lessonId);

  var done = 0;
  LESSONS.forEach(function (L) { if (lessonDone(L.id)) done++; });
  var head = el('div', { class: 'card' });
  head.appendChild(el('div', { class: 'chart-title', text: 'The EDGE Course' }));
  head.appendChild(el('div', { class: 'chart-sub', text: done + '/' + LESSONS.length + ' lessons complete · 5 modules · built on retrieval, spacing, and interleaving — the highest-evidence learning techniques known' }));
  head.appendChild(masteryBar(LESSONS.length ? done / LESSONS.length : 0, ''));
  // continue card
  var next = null;
  for (var i = 0; i < LESSONS.length; i++) if (!lessonDone(LESSONS[i].id)) { next = LESSONS[i]; break; }
  if (next && done > 0) {
    head.appendChild(el('button', {
      class: 'btn primary block', text: '▶ Continue: ' + next.title,
      onclick: function () { studyState.lessonId = next.id; studyState.quizState = {}; rerender(); }
    }));
  }
  root.appendChild(head);

  COURSE_MODULES.forEach(function (mod, mi) {
    var lessons = lessonsByModule(mod.id);
    var mdone = lessons.filter(function (L) { return lessonDone(L.id); }).length;
    var card = el('div', { class: 'card module-card' });
    card.appendChild(el('div', { class: 'module-head' }, [
      el('div', {}, [
        el('div', { class: 'module-kicker', text: 'MODULE ' + (mi + 1) }),
        el('div', { class: 'chart-title', text: mod.title }),
        el('div', { class: 'chart-sub', text: mod.sub })
      ]),
      el('span', { class: 'module-count' + (mdone === lessons.length ? ' done' : ''), text: mdone + '/' + lessons.length })
    ]));
    lessons.forEach(function (L) {
      var idx = LESSONS.indexOf(L);
      card.appendChild(el('div', {
        class: 'lesson-line' + (lessonDone(L.id) ? ' done' : ''),
        onclick: function () { studyState.lessonId = L.id; studyState.quizState = {}; rerender(); }
      }, [
        el('span', { class: 'lesson-icon sm', text: L.icon }),
        el('span', { class: 'lesson-line-title', text: (idx + 1) + '. ' + L.title }),
        el('span', { class: 'lesson-line-meta', text: L.minutes + 'm' }),
        el('span', { class: 'lesson-check', text: lessonDone(L.id) ? '✓' : '›' })
      ]));
    });
    root.appendChild(card);
  });
  root.appendChild(mastersLibraryCard());
}

function renderLesson(root, id) {
  var L = null, idx = -1;
  LESSONS.forEach(function (x, i) { if (x.id === id) { L = x; idx = i; } });
  if (!L) { studyState.lessonId = null; return renderCourse(root); }
  var modIdx = COURSE_MODULES.findIndex ? COURSE_MODULES.findIndex(function (m) { return m.id === L.module; }) : 0;

  var card = el('div', { class: 'card lesson-reader' });
  card.appendChild(el('div', { class: 'panel-head' }, [
    el('div', {}, [
      el('div', { class: 'module-kicker', text: 'MODULE ' + (modIdx + 1) + ' · LESSON ' + (idx + 1) + '/' + LESSONS.length }),
      el('div', { class: 'lesson-title', text: L.icon + ' ' + L.title })
    ]),
    el('button', { class: 'btn ghost sm', text: '✕', onclick: function () { studyState.lessonId = null; rerender(); } })
  ]));

  if (L.obj && L.obj.length) {
    var ob = el('div', { class: 'obj-box' });
    ob.appendChild(el('div', { class: 'exploit-h', text: 'You will be able to' }));
    var ul = el('ul', { class: 'tips' });
    L.obj.forEach(function (o) { ul.appendChild(el('li', { text: o })); });
    ob.appendChild(ul);
    card.appendChild(ob);
  }

  L.body.forEach(function (p) { card.appendChild(richPara(p)); });

  if (L.take && L.take.length) {
    var tk = el('div', { class: 'take-box' });
    tk.appendChild(el('div', { class: 'exploit-h', text: 'Keep these' }));
    var ul2 = el('ul', { class: 'tips' });
    L.take.forEach(function (o) { ul2.appendChild(el('li', { text: o })); });
    tk.appendChild(ul2);
    card.appendChild(tk);
  }
  var vb = videoBox(L.id);
  if (vb) card.appendChild(vb);
  root.appendChild(card);

  /* checkpoint quiz */
  var quiz = el('div', { class: 'card' });
  quiz.appendChild(el('div', { class: 'chart-title', text: 'Checkpoint' }));
  quiz.appendChild(el('div', { class: 'chart-sub', text: 'Retrieval beats re-reading — answer from memory.' }));
  var allRight = true;
  L.quiz.forEach(function (item, qi) {
    var st = studyState.quizState[qi];
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

  if (lessonDone(L.id)) {
    quiz.appendChild(el('div', { class: 'fb-verdict good', text: '✓ Lesson complete' }));
  } else if (Object.keys(studyState.quizState).length === L.quiz.length && !allRight) {
    quiz.appendChild(el('button', {
      class: 'btn ghost block', text: 'Retry checkpoint',
      onclick: function () { studyState.quizState = {}; rerender(); }
    }));
  }

  var row = el('div', { class: 'btn-row' });
  if (idx > 0) row.appendChild(el('button', {
    class: 'btn ghost', text: '←',
    onclick: function () { studyState.lessonId = LESSONS[idx - 1].id; studyState.quizState = {}; rerender(); }
  }));
  if (idx < LESSONS.length - 1) row.appendChild(el('button', {
    class: 'btn primary grow', text: 'Next: ' + LESSONS[idx + 1].title + ' →',
    onclick: function () { studyState.lessonId = LESSONS[idx + 1].id; studyState.quizState = {}; rerender(); }
  }));
  row.appendChild(el('button', { class: 'btn ghost', text: 'All', onclick: function () { studyState.lessonId = null; rerender(); } }));
  quiz.appendChild(row);
  root.appendChild(quiz);
}

function checkLessonComplete(L) {
  if (Object.keys(studyState.quizState).length !== L.quiz.length) return;
  var allRight = true;
  L.quiz.forEach(function (item, qi) { if (studyState.quizState[qi] !== item.a) allRight = false; });
  if (allRight && !lessonDone(L.id)) {
    STATE.lessons[L.id] = { done: true, ts: Date.now() };
    saveState();
    toast('Lesson complete ✓');
  }
}

/* ---------- charts ---------- */
function renderCharts(root) {
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

  if (studyState.cellInfo) {
    var info = studyState.cellInfo;
    var exp = explainAnswer(info.chartId, info.label, '', correctAnswers(info.chartId, info.label));
    var panel = el('div', { class: 'cell-info' });
    panel.appendChild(el('div', { class: 'fb-verdict', text: info.label + ' · ' + (compiled.chart[info.label] ? ACTION_META[compiled.chart[info.label]].label : 'Fold') + ' · ' + classToCombos(info.label, []).length + ' combos · #' + (handRank(info.label) + 1) + '/169 by raw equity' }));
    panel.appendChild(el('div', { class: 'fb-why', text: exp.text }));
    card.appendChild(panel);
  } else {
    card.appendChild(el('p', { class: 'hint', text: 'Tap any cell for the why \u2014 blockers, playability, border logic.' }));
  }

  var borders = borderSummary(compiled.spec.id);
  if (borders.length) {
    var bs = el('div', { class: 'border-box' });
    bs.appendChild(el('div', { class: 'exploit-h', text: 'Memorize the borders, not the grid' }));
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

/* ---------- cheatsheet + types ---------- */
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
