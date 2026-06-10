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
    w.studyState.tab = 'pushfold'; w.rerender();
    ok(doc.querySelectorAll('.hand-grid .cell').length === 169, 'pushfold grid has 169 cells');
    w.studyState.tab = 'types'; w.rerender();
    ok(doc.body.textContent.indexOf('Calling Station') >= 0, 'player types render');

    // RFI drill, 20 random answers
    w.navTo('train');
    w.startDrill('rfi');
    for (var i = 0; i < 20; i++) {
      var btns = doc.querySelectorAll('.btn.answer');
      if (!btns.length) break;
      btns[Math.floor(Math.random() * btns.length)].click();
    }
    ok(w.trainState.done === true, 'drill completes after 20 questions');
    ok(w.STATE.drills.length === 20, '20 drill attempts recorded');
    ok(!!doc.querySelector('.big-score'), 'summary score shown');

    // math drill
    w.startDrill('math');
    for (var m = 0; m < 20; m++) {
      var mb = doc.querySelectorAll('.btn.answer');
      if (!mb.length) break;
      mb[0].click();
    }
    ok(w.trainState.done === true, 'math drill completes');

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

    // end session (prompt stub: cashout 900 default)
    findBtn(doc, '.btn', 'End session').click();
    ok(w.STATE.liveSession === null, 'session ended');
    ok(w.STATE.sessions.length === 1, 'session recorded');

    // hands review
    w.navTo('hands');
    doc.querySelector('.hand-head').click();
    ok(doc.body.textContent.indexOf('GTO preflop check') >= 0, 'GTO check panel renders');
    findBtn(doc, '.chip', 'Missed value').click();
    ok(w.STATE.hands[0].leaks.length === 1, 'leak tagged');
    findBtn(doc, '.btn', 'Mark reviewed').click();
    ok(w.STATE.hands[0].reviewed === true, 'hand marked reviewed');

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
