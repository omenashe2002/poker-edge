/* Validate every range chart: tokens parse, labels are legal, sizes sane. */
'use strict';
var fs = require('fs'), path = require('path'), vm = require('vm');

// load browser-style globals into one context
var ctx = { console: console, module: undefined };
vm.createContext(ctx);
['cards.js', 'ranges.js', 'exploits.js'].forEach(function (f) {
  var src = fs.readFileSync(path.join(__dirname, f), 'utf8');
  vm.runInContext(src, ctx, { filename: f });
});

var failures = 0;
function ok(c, m) { if (c) console.log('  PASS ' + m); else { failures++; console.error('  FAIL ' + m); } }

var legal = {};
ctx.allClasses().forEach(function (l) { legal[l] = true; });
ok(Object.keys(legal).length === 169, '169 legal classes');

var charts = ctx.RANGE_CHARTS;
ok(charts.length >= 30, charts.length + ' charts defined');

var pctBands = { // expected % of all combos in chart (raise+mixed+call), loose sanity bands
  'rfi9-utg': [8, 18], 'rfi9-utg1': [9, 20], 'rfi9-mp': [11, 23], 'rfi9-lj': [13, 27],
  'rfi9-hj': [16, 32], 'rfi9-co': [21, 38], 'rfi9-btn': [35, 55], 'rfi9-sb': [38, 60],
  // v9 MTT charts: 40bb opens widen positionally; defense scales with opener width
  'mtt40-utg': [14, 22], 'mtt40-utg1': [16, 25], 'mtt40-lj': [20, 29], 'mtt40-hj': [25, 36],
  'mtt40-co': [33, 46], 'mtt40-btn': [52, 68], 'mtt40-sb': [36, 50],
  'mttdef-bb-ep': [36, 50], 'mttdef-bb-hj': [46, 60], 'mttdef-bb-co': [58, 72], 'mttdef-bb-btn': [66, 82],
  'mtt25-co': [18, 28], 'mtt25-btn': [36, 50], 'mtt25-sb': [30, 44]
};

// v9: every chart declares format + depth; MTT groups exist
var fmtOk = true, mttCount = 0;
charts.forEach(function (s) {
  if (s.format !== 'cash' && s.format !== 'mtt') { fmtOk = false; console.error('  FAIL ' + s.id + ' missing format'); }
  if (typeof s.depth !== 'number') { fmtOk = false; console.error('  FAIL ' + s.id + ' missing depth'); }
  if (s.format === 'mtt') mttCount++;
});
ok(fmtOk, 'every chart carries format + depth metadata');
ok(mttCount >= 30, mttCount + ' MTT-format charts (push/fold + 40bb + 25bb + defense)');
ok(ctx.GROUP_ANSWERS.mttrfi && ctx.GROUP_ANSWERS.mttdef && ctx.GROUP_ANSWERS.mtt25, 'MTT drill answer sets registered');

charts.forEach(function (spec) {
  var compiled = ctx.COMPILED_CHARTS[spec.id];
  ok(!!compiled, spec.id + ' compiled');
  var combos = 0, labels = 0;
  for (var lbl in compiled.chart) {
    if (!legal[lbl]) { failures++; console.error('  FAIL ' + spec.id + ' illegal label: ' + lbl); }
    combos += ctx.classComboCount(lbl);
    labels++;
  }
  ok(labels > 0 && combos <= 1326, spec.id + ': ' + labels + ' classes, ' + (100 * combos / 1326).toFixed(1) + '% of combos');
  var band = pctBands[spec.id];
  if (band) {
    var pct = 100 * combos / 1326;
    ok(pct >= band[0] && pct <= band[1], spec.id + ' % in band [' + band + ']');
  }
});

// monotonicity: later positions open wider
function chartPct(id) {
  var c = ctx.COMPILED_CHARTS[id].chart, n = 0;
  for (var l in c) n += ctx.classComboCount(l);
  return n;
}
var order = ['rfi9-utg', 'rfi9-utg1', 'rfi9-mp', 'rfi9-lj', 'rfi9-hj', 'rfi9-co', 'rfi9-btn'];
for (var i = 1; i < order.length; i++) {
  ok(chartPct(order[i]) >= chartPct(order[i - 1]), order[i] + ' >= ' + order[i - 1]);
}
// push/fold widens as stacks shrink (same position)
['ep', 'mp', 'co', 'btn', 'sb'].forEach(function (p) {
  ok(chartPct('pf5-' + p) >= chartPct('pf8-' + p) && chartPct('pf8-' + p) >= chartPct('pf10-' + p) &&
     chartPct('pf10-' + p) >= chartPct('pf12-' + p) && chartPct('pf12-' + p) >= chartPct('pf15-' + p),
     'push/fold monotone in stack for ' + p.toUpperCase());
});

// drills: AA always aggressive, 72o always fold
charts.forEach(function (spec) {
  var ans = ctx.correctAnswers(spec.id, 'AA');
  ok(ans.indexOf('fold') < 0 || ans.length > 1, spec.id + ' AA not pure fold');
  var ans72 = ctx.correctAnswers(spec.id, '72o');
  ok(ans72.length === 1 && ans72[0] === 'fold', spec.id + ' 72o folds');
});

// availableAnswers sanity
ok(ctx.availableAnswers('rfi9-utg').join() === 'fold,raise', 'RFI answers fold/raise');
ok(ctx.availableAnswers('def-bb-btn').join() === 'fold,call,threebet', 'BB defend answers');
ok(ctx.availableAnswers('def-sb-ep').join() === 'fold,threebet', 'SB 3bet-or-fold answers (no call)');
ok(ctx.availableAnswers('v3b-ep').join() === 'fold,call,fourbet', 'vs 3-bet answers');
ok(ctx.availableAnswers('pf10-btn').join() === 'fold,shove', 'push/fold answers');

// classifier
var cl = ctx.classifyFromStats(50, 40, 60);
ok(cl.type === 'maniac', 'classify maniac');
ok(ctx.classifyFromStats(40, 8, 60).type === 'station', 'classify station');
ok(ctx.classifyFromStats(15, 12, 60).type === 'nit', 'classify nit');
ok(ctx.classifyFromStats(22, 18, 60).type === 'tag', 'classify tag');
ok(ctx.classifyFromStats(30, 24, 60).type === 'lag', 'classify lag');
ok(ctx.classifyFromStats(50, 9, 60).type === 'whale', 'classify whale');
ok(ctx.classifyFromStats(30, 24, 5).type === 'unknown', 'small sample -> unknown');

console.log(failures === 0 ? '\nALL RANGE TESTS PASSED' : '\n' + failures + ' FAILURES');
process.exit(failures ? 1 : 0);
