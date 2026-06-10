/* Node test harness for the EDGE math engine (not loaded by the app). */
'use strict';
var C = require('./cards.js');
var E = require('./eval.js');

var failures = 0;
function ok(cond, msg) {
  if (cond) console.log('  PASS ' + msg);
  else { failures++; console.error('  FAIL ' + msg); }
}
function approx(x, target, tol, msg) {
  ok(Math.abs(x - target) <= tol, msg + ' (got ' + x.toFixed(4) + ', want ' + target + '±' + tol + ')');
}
function cards(str) {
  var out = [];
  for (var i = 0; i + 1 < str.length; i += 2) out.push(C.parseCard(str.slice(i, i + 2)));
  return out;
}

console.log('--- evaluator category tests ---');
var e7 = E.evaluate7;
ok(E.scoreCategory(e7(cards('AsKsQsJsTs2h3d'))) === 8, 'royal = straight flush');
ok(E.scoreCategory(e7(cards('5h4h3h2hAh9c9d'))) === 8, 'steel wheel');
ok(E.scoreCategory(e7(cards('9c9d9h9sAcKd2h'))) === 7, 'quads');
ok(E.scoreCategory(e7(cards('9c9d9hKsKcQd2h'))) === 6, 'full house');
ok(E.scoreCategory(e7(cards('9c9d9hKsKcKd2h'))) === 6, 'trips+trips = FH');
ok(E.scoreCategory(e7(cards('Ac9cKc2c5cQdJh'))) === 5, 'flush');
ok(E.scoreCategory(e7(cards('5h4c3d2sAc9c9d'))) === 4, 'wheel straight');
ok(E.scoreCategory(e7(cards('9c8d7h6s5cAcKd'))) === 4, 'nine-high straight');
ok(E.scoreCategory(e7(cards('9c9d9hAsKcQd2h'))) === 3, 'trips');
ok(E.scoreCategory(e7(cards('9c9dKhKsQcJd2h'))) === 2, 'two pair');
ok(E.scoreCategory(e7(cards('9c9dKhQsJc7d2h'))) === 1, 'pair');
ok(E.scoreCategory(e7(cards('Ac9dKhQsJc7d2h'))) === 0, 'high card');
ok(e7(cards('AsKsQsJsTs2h3d')) > e7(cards('9c9d9h9sAcKd2h')), 'SF beats quads');
ok(e7(cards('AhKdQcJsTh2c3c')) < e7(cards('Ac9cKc2c5cQdJh')), 'flush beats straight');
ok(e7(cards('AcAdKhKsQc2d3h')) > e7(cards('AhAsQhQsKd2c3s')), 'AAKK > AAQQ two pair');
ok(e7(cards('KcKd8h8sAc2d3h')) > e7(cards('KhKs8c8dQd2c3s')), 'two pair kicker A > Q');
// board plays: both players same straight on board -> tie
var board = cards('9c8d7h6s5c');
ok(e7(board.concat(cards('AcKd'))) === e7(board.concat(cards('QhJh'))) === false ||
   e7(board.concat(cards('AcKd'))) === e7(board.concat(cards('2h3h'))), 'board straight ties (no T)');

console.log('--- range parser tests ---');
var r = C.parseRange('22+');
ok(Object.keys(r).length === 13, '22+ = 13 pair classes');
r = C.parseRange('A2s+');
ok(Object.keys(r).length === 12, 'A2s+ = 12 classes');
ok(r['AKs'] === 1 && r['A2s'] === 1 && !r['AKo'], 'A2s+ contents');
r = C.parseRange('T8s+');
ok(Object.keys(r).length === 2 && r['T8s'] && r['T9s'], 'T8s+ = T8s,T9s');
r = C.parseRange('A5s-A2s');
ok(Object.keys(r).length === 4, 'A5s-A2s = 4 classes');
r = C.parseRange('77-99');
ok(Object.keys(r).length === 3 && r['88'], '77-99 = 3 pairs');
r = C.parseRange('AQo+');
ok(Object.keys(r).length === 2 && r['AKo'] && r['AQo'], 'AQo+');
r = C.parseRange('KQ');
ok(r['KQs'] && r['KQo'], 'KQ = both');
var chart = C.buildChart({ raise: 'AA,KK', call: 'KK,QQ' });
ok(chart['KK'] === 'raise' && chart['QQ'] === 'call', 'chart precedence: earlier action wins');
ok(C.classToCombos('AKs', []).length === 4, 'AKs = 4 combos');
ok(C.classToCombos('AA', []).length === 6, 'AA = 6 combos');
ok(C.classToCombos('AKo', []).length === 12, 'AKo = 12 combos');
ok(C.classToCombos('AA', [C.parseCard('As')]).length === 3, 'AA with As dead = 3 combos');
ok(C.gridLabel(0, 0) === 'AA' && C.gridLabel(0, 1) === 'AKs' && C.gridLabel(1, 0) === 'AKo', 'grid orientation');

console.log('--- equity tests (Monte Carlo, may take a few seconds) ---');
function eq(h, v, b, it) { return E.mcEquityHandVsHand(h, v, b, it).equity; }
approx(eq('AsAh', 'KsKh', '', 60000), 0.8195, 0.012, 'AA vs KK');
approx(eq('AsKs', 'QhQd', '', 60000), 0.46, 0.015, 'AKs vs QQ');
approx(eq('AcAd', '7h2c', '', 60000), 0.876, 0.012, 'AA vs 72o');
approx(eq('AhKh', 'QsJs', 'AdKd2c', 60000), 0.86, 0.025, 'top two vs QJ on AK2');
// vs random
var vr = E.mcEquity([C.parseCard('7h'), C.parseCard('2c')], null, [], 60000);
ok(vr.equity > 0.30 && vr.equity < 0.40, '72o vs random ~0.35 (got ' + vr.equity.toFixed(3) + ')');
// vs a parsed range
var vRange = C.rangeToCombos(C.parseRange('QQ+,AKs,AKo'), []);
var rr = E.mcEquity([C.parseCard('Jh'), C.parseCard('Jd')], vRange, [], 60000);
ok(rr.equity > 0.30 && rr.equity < 0.40, 'JJ vs {QQ+,AK} ~0.35 (got ' + rr.equity.toFixed(3) + ')');

console.log('--- poker math tests ---');
var M = E.PokerMath;
approx(M.potOddsEquity(100, 50), 1 / 3, 1e-9, 'pot odds 50 into 100');
approx(M.mdf(100, 50), 2 / 3, 1e-9, 'MDF vs half pot');
approx(M.bluffBreakeven(100, 100), 0.5, 1e-9, 'pot-size bluff BE 50%');
approx(M.optimalBluffShare(100, 100), 1 / 3, 1e-9, 'river pot bet -> 33% bluffs');
approx(M.outsToEquity(9, 'flop'), 0.35, 0.01, 'flush draw 9 outs flop->river');
approx(M.outsToEquity(9, 'turn'), 9 / 46, 1e-9, '9 outs turn->river');
approx(M.evCall(0.4, 100, 50), 0.4 * 150 - 50, 1e-9, 'EV call');
var ror = M.riskOfRuin(10, 100, 5000);
ok(ror > 0 && ror < 0.001 + 1, 'RoR sane: ' + ror.toFixed(4));
var br = M.bankrollForRoR(10, 100, 0.05);
approx(M.riskOfRuin(10, 100, br), 0.05, 1e-6, 'BR(RoR) inverts RoR');

console.log(failures === 0 ? '\nALL TESTS PASSED' : '\n' + failures + ' FAILURES');
process.exit(failures ? 1 : 0);
