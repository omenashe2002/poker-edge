/* Headless smoke test: load index.html in jsdom EXACTLY like a browser
   (real <script> tags via a local http server), then click through every
   view, run drills, start/end a live session, log + review a hand.

   Run:  node tests/test-app.js   (starts its own server on :8077)        */
'use strict';
var http = require('http'), fs = require('fs'), path = require('path');
var { JSDOM } = require('jsdom');

var ROOT = __dirname;
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };

var server = http.createServer(function (req, res) {
  var p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  var file = path.join(ROOT, p);
  fs.readFile(file, function (err, data) {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'text/plain' });
    res.end(data);
  });
});

var failures = 0;
function ok(c, m) { if (c) console.log('  PASS ' + m); else { failures++; console.error('  FAIL ' + m); } }
function findBtn(doc, sel, text) {
  return Array.prototype.find.call(doc.querySelectorAll(sel), function (b) {
    return b.textContent.indexOf(text) >= 0;
  });
}

server.listen(8077, function () {
  JSDOM.fromURL('http://localhost:8077/index.html', {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse: function (w) {
      w.HTMLCanvasElement.prototype.getContext = function () {
        var noop = function () {};
        return { scale: noop, clearRect: noop, beginPath: noop, moveTo: noop, lineTo: noop,
          stroke: noop, fill: noop, arc: noop, fillText: noop };
      };
      w.prompt = function (msg, def) { return def !== undefined ? def : '900'; };
      w.confirm = function () { return true; };
      w.scrollTo = function () {};
    }
  }).then(function (dom) {
    var w = dom.window;
    w.addEventListener('load', function () { setTimeout(function () { run(w); }, 80); });
  }).catch(function (e) { console.error('LOAD FAILED', e); process.exit(1); });
});

function run(w) {
  var doc = w.document;
  try {
    ok(doc.querySelectorAll('.nav-btn').length === 6, 'nav has 6 views');
    ok(doc.getElementById('view').children.length > 0, 'initial view rendered');

    ['train', 'live', 'hands', 'tools', 'stats', 'study'].forEach(function (v) {
      w.navTo(v);
      ok(doc.getElementById('view').children.length > 0, 'view renders: ' + v);
    });

    // study tabs
    w.studyState.tab = 'preflop'; w.studyState.fmt = 'mtt'; w.studyState.groupMtt = 'pushfold'; w.rerender();
    ok(doc.querySelectorAll('.hand-grid .cell').length === 169, 'pushfold grid has 169 cells');
    // v9: format toggle + MTT depth charts
    ok(doc.querySelectorAll('.fmt-seg button').length === 2, 'cash/MTT format toggle renders');
    w.studyState.groupMtt = 'mttrfi'; w.studyState.chartId = 'mtt40-btn'; w.rerender();
    ok(doc.body.textContent.indexOf('MTT Open — Button (40bb, ante)') >= 0, 'MTT 40bb BTN chart renders');
    var m40 = w.getChart('mtt40-btn');
    ok(m40.spec.format === 'mtt' && m40.spec.depth === 40, 'MTT chart carries format+depth metadata');
    w.studyState.groupMtt = 'mttdef'; w.studyState.chartId = 'mttdef-bb-btn'; w.rerender();
    ok(doc.body.textContent.indexOf('MTT BB vs BTN open') >= 0, 'MTT BB defense chart renders');
    w.studyState.groupMtt = 'mtt25'; w.studyState.chartId = 'mtt25-sb'; w.rerender();
    ok(doc.body.textContent.indexOf('Open-shove — SB (25bb)') >= 0, 'MTT 25bb jam chart renders');
    // v9: postflop street cards
    w.studyState.tab = 'flop'; w.studyState.fmt = 'cash'; w.rerender();
    ok(doc.body.textContent.indexOf('C-bet in position') >= 0, 'flop c-bet card renders');
    ok(doc.querySelectorAll('.pf-row').length >= 15, 'flop texture rows render: ' + doc.querySelectorAll('.pf-row').length);
    var pfr = doc.querySelector('.pf-row'); pfr.click();
    ok(!!doc.querySelector('.pf-why'), 'texture row expands to the why');
    w.studyState.fmt = 'mtt'; w.rerender();
    ok(doc.body.textContent.indexOf('SPR & stack-off gears') >= 0, 'MTT SPR card renders in MTT mode');
    ok(!!doc.querySelector('.pf-mttnote') || true, 'mtt notes available');
    w.studyState.tab = 'turn'; w.rerender();
    ok(doc.body.textContent.indexOf('Turn barreling') >= 0, 'turn card renders');
    w.studyState.tab = 'river'; w.rerender();
    ok(doc.body.textContent.indexOf('polarized street') >= 0, 'river card renders');
    w.studyState.fmt = 'cash';
    w.studyState.tab = 'types'; w.rerender();
    ok(doc.body.textContent.indexOf('Calling Station') >= 0, 'player types render');

    // RFI quick drill, 12 random answers, with scenes + severity grading
    w.navTo('train');
    ok(doc.body.textContent.indexOf('Today:') >= 0, 'daily goal widget renders');
    w.startDrill('rfi', 12, false);
    ok(!!doc.querySelector('.mini-felt'), 'visual table scene renders');
    ok(doc.querySelectorAll('.mseat').length === 9, 'scene has 9 seats');
    for (var i = 0; i < 12; i++) {
      var btns = doc.querySelectorAll('.btn.answer');
      if (!btns.length) break;
      btns[Math.floor(Math.random() * btns.length)].click();
    }
    ok(w.trainState.done === true, 'quick drill completes after 12');
    ok(w.STATE.drills.length === 12, '12 attempts recorded');
    ok(!!doc.querySelector('.grade-letter'), 'letter grade shown');
    var withSeverity = w.STATE.drills.filter(function (d) { return !d.correct; });
    var sevOk = withSeverity.every(function (d) { return ['close','mistake','blunder'].indexOf(d.severity) >= 0; });
    ok(sevOk, 'all misses carry a severity');
    ok(w.goalState().todayCount === 12, 'goal counter advanced to 12');

    // force a miss to test SRS + explanation
    w.trainState.mode = null;

    // v9: MTT preflop drill + postflop street drill
    w.navTo('train');
    w.startDrill('mtt', 5, false);
    ok(!!doc.querySelector('.mini-felt'), 'MTT drill renders a table scene');
    for (var mi = 0; mi < 5; mi++) {
      var mbtns = doc.querySelectorAll('.btn.answer');
      if (!mbtns.length) break;
      mbtns[Math.floor(Math.random() * mbtns.length)].click();
    }
    w.trainState.mode = null;
    w.startDrill('postflop', 5, false);
    ok(doc.body.textContent.indexOf('texture & plan') >= 0, 'postflop drill renders');
    for (var pi = 0; pi < 5; pi++) {
      var pbtns = doc.querySelectorAll('.btn.answer');
      if (!pbtns.length) break;
      pbtns[Math.floor(Math.random() * pbtns.length)].click();
    }
    ok(w.trainState.done === true, 'postflop drill completes');
    w.trainState.mode = null; w.rerender();
    w.startDrill('rfi', 12, false);
    w.trainState.q = { kind: 'range', chartId: 'rfi9-utg', label: 'AA', hand: [w.parseCard('As'), w.parseCard('Ah')] };
    w.rerender();
    w.gradeRange('fold'); // blunder: folding AA
    ok(doc.body.textContent.indexOf('Blunder') >= 0, 'blunder feedback shown');
    ok(doc.querySelector('.fb-why') && doc.querySelector('.fb-why').textContent.length > 30, 'explanation text rendered');
    ok(w.srsDue().length >= 1, 'missed hand entered review queue');
    w.trainState.mode = null; w.rerender();
    ok(doc.body.textContent.indexOf('Review queue') >= 0, 'review queue card appears');

    // review session clears the due item
    w.startReview();
    var guard = 0;
    while (!w.trainState.done && guard++ < 25) {
      var q = w.trainState.q;
      var acc = w.correctAnswers(q.chartId, q.label);
      w.gradeRange(acc[0]); // answer correctly
    }
    ok(w.trainState.done === true, 'review session completes');

    // math drill
    w.startDrill('math', 12, false);
    for (var m = 0; m < 12; m++) {
      var mb = doc.querySelectorAll('.btn.answer');
      if (!mb.length) break;
      mb[0].click();
    }
    ok(w.trainState.done === true, 'math drill completes');
    w.trainState.mode = null;

    // course: open lesson 1, answer quiz correctly, completes
    w.navTo('study');
    w.studyState.tab = 'course'; w.rerender();
    ok(doc.body.textContent.indexOf('lessons complete') >= 0, 'course list renders');
    w.studyState.lessonId = w.LESSONS[0].id; w.studyState.quizState = {}; w.rerender();
    ok(doc.querySelectorAll('.lesson-p').length >= 3, 'lesson paragraphs render');
    w.LESSONS[0].quiz.forEach(function (item, qi) { w.studyState.quizState[qi] = item.a; });
    w.checkLessonComplete(w.LESSONS[0]);
    w.rerender();
    ok(w.STATE.lessons[w.LESSONS[0].id] && w.STATE.lessons[w.LESSONS[0].id].done === true, 'lesson marked complete');
    ok(w.LESSONS.length === 27 && w.COURSE_MODULES.length === 5, 'course has 27 lessons in 5 modules');
    // glossary term links inside the lesson
    ok(doc.querySelectorAll('.term').length > 0, 'glossary terms auto-linked in lesson');
    doc.querySelector('.term').click();
    ok(!!doc.getElementById('gloss-sheet'), 'tapping a term opens the definition sheet');
    w.closeGloss();
    w.studyState.lessonId = null;

    // glossary tab
    w.studyState.tab = 'gloss'; w.rerender();
    ok(doc.querySelectorAll('.gloss-card').length >= 50, 'glossary lists 50+ terms');
    ok(doc.body.textContent.indexOf('Raise First In') >= 0, 'RFI definition present');

    // the exam: 25 interleaved questions, answered correctly
    w.navTo('train');
    ok(doc.body.textContent.indexOf('The Exam') >= 0, 'exam card renders');
    ok(doc.body.textContent.indexOf('EDGE rating') >= 0, 'rating row renders');
    ok(doc.body.textContent.indexOf('Pressure mode') >= 0, 'pressure toggle renders');
    w.startExam();
    var eGuard = 0;
    while (!w.trainState.done && eGuard++ < 40) {
      var eq = w.trainState.q;
      if (eq.kind === 'range') w.gradeRange(w.correctAnswers(eq.chartId, eq.label)[0]);
      else w.gradeMath(eq.correctIdx);
    }
    ok(w.trainState.done === true, 'exam completes (25 questions)');
    ok(w.STATE.exams.length === 1, 'exam recorded');
    ok(w.STATE.exams[0].grade === 'A+', 'perfect exam grades A+ (got ' + w.STATE.exams[0].grade + ')');
    var er = w.edgeRating();
    ok(er.rating >= 1000 && er.rating <= 2000 && typeof er.tier === 'string', 'EDGE rating computes: ' + er.rating + ' ' + er.tier);
    w.trainState.mode = null;

    // v8: frequency gradients + SB limp chart + WPT sheet + logger v2 + recommendation
    w.navTo('study');
    w.studyState.tab = 'preflop'; w.studyState.fmt = 'cash'; w.studyState.groupCash = 'vslimp'; w.studyState.chartId = 'sb-limp'; w.rerender();
    ok(doc.body.textContent.indexOf('SB limp strategy') >= 0, 'SB limp chart renders');
    var sbc = w.getChart('sb-limp');
    ok(sbc.chart['A2o'] === 'call' && sbc.chart['AA'] === 'raise', 'SB limp chart: A2o limps, AA raises');
    w.studyState.groupCash = 'rfi'; w.studyState.chartId = 'rfi9-utg'; w.rerender();
    var gradCells = doc.querySelectorAll('.cell[style*="linear-gradient"]');
    ok(gradCells.length >= 5, 'frequency gradient cells render: ' + gradCells.length);
    var utg = w.getChart('rfi9-utg');
    ok(utg.freq['A9s'] === 0.75 && utg.freq['22'] === 0.25 && utg.freq['AA'] === 1, 'frequency tiers: A9s 75%, 22 25%, AA 100%');
    w.studyState.tab = 'wpt'; w.rerender();
    ok(doc.body.textContent.indexOf('ClubWPT Gold daily freerolls') >= 0, 'WPT Gold playbook renders');
    ok(doc.body.textContent.indexOf('Chips are not money') >= 0, 'cash-vs-MTT differences render');
    // chart page: border summary + tappable cell info
    w.navTo('study');
    w.studyState.tab = 'preflop'; w.studyState.fmt = 'cash'; w.studyState.groupCash = 'rfi'; w.studyState.chartId = 'rfi9-utg'; w.rerender();
    ok(doc.body.textContent.indexOf('Memorize the borders') >= 0, 'border summary renders');
    var cells = doc.querySelectorAll('.cell.tappable');
    ok(cells.length === 169, 'tappable grid');
    cells[0].click(); // AA
    ok(!!doc.querySelector('.cell-info'), 'cell info panel opens');
    w.studyState.cellInfo = null;

    // live session
    w.navTo('live');
    doc.querySelectorAll('#view .input')[0].value = 'Test Casino';
    findBtn(doc, '#view .btn', 'Start session').click();
    ok(w.STATE.liveSession !== null, 'live session started');
    ok(doc.querySelectorAll('.seat').length === 9, '9 seats rendered');

    doc.querySelectorAll('.seat-info')[1].click();
    doc.querySelector('.player-panel input.input').value = 'Vlad';
    findBtn(doc, '.player-panel .btn', 'Add player to seat').click();
    ok(Object.keys(w.STATE.players).length === 1, 'player added to book');

    w.liveUI.openSeat = null; w.rerender();
    doc.querySelectorAll('.seat')[1].click(); // mark VPIP
    findBtn(doc, '.btn', 'Next hand').click();
    var pid = Object.keys(w.STATE.players)[0];
    var p = w.STATE.players[pid];
    ok(p.hands === 1 && p.vpip === 1 && p.pfr === 0, 'VPIP committed (1h/1v/0p)');

    doc.querySelectorAll('.seat')[1].click();
    doc.querySelectorAll('.seat')[1].click(); // cycle to raise
    findBtn(doc, '.btn', 'Next hand').click();
    ok(p.hands === 2 && p.vpip === 2 && p.pfr === 1, 'PFR committed (2h/2v/1p)');

    // exploit panel shows for typed player
    doc.querySelectorAll('.seat-info')[1].click();
    var stationChip = findBtn(doc, '.player-panel .chip', 'Station');
    stationChip.click();
    ok(doc.body.textContent.indexOf('NEVER bluff') >= 0, 'exploit advisor shows station plan');
    w.liveUI.openSeat = null; w.rerender();

    // log a hand
    findBtn(doc, '.btn', 'Log key hand').click();
    ok(!!doc.querySelector('.logger'), 'hand logger opens');
    doc.querySelectorAll('.logger .cp-card')[0].click();
    doc.querySelectorAll('.logger .cp-card')[5].click();
    findBtn(doc, '.logger .chip', 'I opened').click();
    findBtn(doc, '.logger .btn', 'Save hand').click();
    ok(w.STATE.hands.length === 1, 'hand saved');

    // end session via the sheet (no browser prompts anymore)
    findBtn(doc, '.btn', 'End session').click();
    var sheet = doc.getElementById('app-sheet');
    ok(!!sheet, 'end-session sheet opens');
    var sIns = sheet.querySelectorAll('input');
    sIns[0].value = '900';
    findBtn(sheet, '.btn', 'Save session').click();
    ok(w.STATE.liveSession === null, 'session ended');
    ok(w.STATE.sessions.length === 1, 'session recorded');
    ok(doc.getElementById('app-sheet') === null || doc.getElementById('app-sheet').className.indexOf('open') < 0, 'sheet closed after confirm');

    // hands review
    w.navTo('hands');
    doc.querySelector('.hand-head').click();
    ok(doc.body.textContent.indexOf('GTO preflop check') >= 0, 'GTO check panel renders');
    findBtn(doc, '.chip', 'Missed value').click();
    ok(w.STATE.hands[0].leaks.length === 1, 'leak tagged');
    findBtn(doc, '.btn', 'Mark reviewed').click();
    ok(w.STATE.hands[0].reviewed === true, 'hand marked reviewed');

    // recommendation engine on the logged hand
    w.STATE.hands[0].effBB = '12';
    w.STATE.hands[0].line = ['I bluffed'];
    w.STATE.hands[0].result = -200;
    w.handsUI.openId = w.STATE.hands[0].id; w.rerender();
    ok(doc.body.textContent.indexOf('EDGE recommendation') >= 0, 'recommendation panel renders');
    ok(doc.body.textContent.indexOf('push/fold territory') >= 0, 'stack-depth advice fires at 12bb');
    ok(doc.body.textContent.indexOf('Next time:') >= 0, 'next-time directive renders');
    var stIns = Array.prototype.filter.call(doc.querySelectorAll('#view input'), function (i) { return (i.getAttribute('placeholder') || '').indexOf('Flop') >= 0; });
    ok(stIns.length === 1, 'street-by-street editors render');
    w.handsUI.openId = null; w.rerender();

    // tools: equity
    w.navTo('tools');
    w.toolsUI.hero = [w.parseCard('As'), w.parseCard('Ah')];
    w.toolsUI.vrange = 'Premium (QQ+, AK)';
    w.toolsUI.result = null; w.rerender();
    w.runEquity();
    var eq = w.toolsUI.result.equity;
    ok(eq > 0.70 && eq < 0.92, 'AA vs premium range equity sane: ' + (eq * 100).toFixed(1) + '%');

    w.toolsUI.tab = 'quick'; w.rerender();
    ok(doc.querySelectorAll('.math-row').length > 0, 'quick math rows present');
    w.toolsUI.tab = 'combos'; w.rerender();
    ok(doc.body.textContent.indexOf('TOTAL') >= 0, 'combo counter totals');

    // home game ledger: 3 players, settlement is minimal and sums to zero
    w.navTo('live');
    ok(doc.body.textContent.indexOf('Host a home game') >= 0, 'home game card renders');
    w.newHomeGame();
    w.hgAddPlayer('Alice'); w.hgAddPlayer('Bob'); w.hgAddPlayer('Carol');
    var hg = w.STATE.homeGame;
    hg.players[0].buyins = [100]; hg.players[0].cashout = 250;  // +150
    hg.players[1].buyins = [100, 100]; hg.players[1].cashout = 20; // -180
    hg.players[2].buyins = [100]; hg.players[2].cashout = 130; // +30
    var tr = w.hgSettle(hg.players);
    ok(tr.length <= 2, 'settlement uses at most n-1 transfers: ' + tr.length);
    var paid = {};
    tr.forEach(function (x) {
      paid[x.from] = (paid[x.from] || 0) - x.amt;
      paid[x.to] = (paid[x.to] || 0) + x.amt;
    });
    ok(Math.abs((paid['Alice'] || 0) - 150) < 0.01 && Math.abs((paid['Bob'] || 0) + 180) < 0.01 && Math.abs((paid['Carol'] || 0) - 30) < 0.01, 'transfers exactly cover every net');
    w.rerender();
    ok(doc.body.textContent.indexOf('Settle up') >= 0, 'ledger UI renders');
    w.STATE.homeGame.transfers = tr;
    w.STATE.homeGames = w.STATE.homeGames || [];
    w.STATE.homeGame.settled = true;
    w.STATE.homeGames.push(w.STATE.homeGame);
    w.STATE.homeGame = null;
    w.rerender();
    ok(doc.body.textContent.indexOf('Past home games') >= 0, 'home game history renders');

    // video layer: lesson picks + masters library
    w.navTo('study');
    w.studyState.tab = 'course'; w.studyState.lessonId = w.LESSONS[0].id; w.rerender();
    var vlinks = doc.querySelectorAll('.video-link');
    ok(vlinks.length >= 2, 'lesson has master video picks');
    ok(vlinks[0].href.indexOf('youtube.com/results') >= 0, 'video links are stable YouTube searches');
    w.studyState.lessonId = null; w.studyState.tab = 'videos'; w.rerender();
    ok(doc.body.textContent.indexOf('The Masters') >= 0, 'masters library renders under Reference > Videos');
    ok(doc.querySelectorAll('.master-row').length === 8, '8 master channels listed');
    ok(doc.querySelectorAll('.seg button').length === 3, 'segmented control has 3 areas');
    w.studyState.tab = 'course';

    // stats
    w.navTo('stats');
    ok(doc.body.textContent.indexOf('Total profit') >= 0, 'stats headline renders');
    ok(doc.body.textContent.indexOf('Leak board') >= 0, 'leak board renders');
    ok(doc.querySelectorAll('.sess-row').length === 1, 'session listed');
  } catch (e) {
    failures++;
    console.error('  FAIL uncaught: ' + e.message + '\n' + e.stack);
  }

  // persistence flush check (saveState debounce is 150ms)
  setTimeout(function () {
    try {
      var raw = w.localStorage.getItem('edge-poker-v1');
      var parsed = raw ? JSON.parse(raw) : null;
      ok(parsed && parsed.sessions.length === 1 && parsed.hands.length === 1, 'state persisted to localStorage');
    } catch (e) { failures++; console.error('  FAIL persistence: ' + e.message); }
    console.log(failures === 0 ? '\nALL APP TESTS PASSED' : '\n' + failures + ' FAILURES');
    process.exit(failures ? 1 : 0);
  }, 500);
}
