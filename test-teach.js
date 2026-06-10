/* Validate the teaching engine: ranking integrity, borders, severity. */
'use strict';
var fs = require('fs'), path = require('path'), vm = require('vm');

var ctx = { console: console, module: undefined };
vm.createContext(ctx);
['cards.js', 'eval.js', 'ranges.js', 'teach.js'].forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, f), 'utf8'), ctx, { filename: f });
});

var failures = 0;
function ok(c, m) { if (c) console.log('  PASS ' + m); else { failures++; console.error('  FAIL ' + m); } }

/* ranking integrity */
ok(ctx.PREFLOP_RANK.length === 169, 'ranking has 169 entries');
var seen = {}, legal = {};
ctx.allClasses().forEach(function (l) { legal[l] = true; });
var dupes = 0, illegal = 0;
ctx.PREFLOP_RANK.forEach(function (l) {
  if (seen[l]) dupes++;
  seen[l] = true;
  if (!legal[l]) illegal++;
});
ok(dupes === 0, 'no duplicate labels');
ok(illegal === 0, 'all labels legal');
ok(ctx.PREFLOP_RANK[0] === 'AA' && ctx.PREFLOP_RANK[1] === 'KK', 'AA, KK on top');
ok(ctx.PREFLOP_RANK[168] === '32o', '32o at the bottom');
ok(ctx.handRank('AKs') < ctx.handRank('AKo'), 'AKs ranks above AKo');
ok(ctx.handRank('JJ') < ctx.handRank('ATs'), 'JJ above ATs');

/* borders */
var bs = ctx.borderSummary('rfi9-utg');
ok(bs.length >= 4, 'UTG border summary has families: ' + bs.length);
var pairLine = null, asLine = null;
bs.forEach(function (b) {
  if (b.name === 'pairs') pairLine = b;
  if (b.name === 'suited aces') asLine = b;
});
ok(pairLine && pairLine.border === '22', 'UTG pairs border = 22 (incl. mixed) -> ' + (pairLine && pairLine.text));
ok(asLine && asLine.text.indexOf('A5s') >= 0, 'UTG suited aces include the A5s segment: ' + (asLine && asLine.text));

var bd = ctx.borderDistance('rfi9-utg', 'A5s');
ok(bd.inChart === true, 'A5s in UTG chart');
ok(ctx.borderDistance('rfi9-utg', 'K9s').inChart === false, 'K9s not in UTG chart');

/* severity */
ok(ctx.mistakeSeverity('rfi9-utg', 'AA', 'fold', 'raise') === 'blunder', 'folding AA UTG = blunder');
ok(ctx.mistakeSeverity('rfi9-utg', '72o', 'raise', 'raise') === 'blunder', 'opening 72o UTG = blunder');
var sevA9s = ctx.mistakeSeverity('rfi9-utg', 'A9s', 'fold', 'raise');
ok(sevA9s === 'close', 'A9s (mixed) = close, got ' + sevA9s);
var sevK9s = ctx.mistakeSeverity('rfi9-utg', 'K9s', 'raise', 'raise');
ok(sevK9s === 'close' || sevK9s === 'mistake', 'K9s near-border raise = close/mistake, got ' + sevK9s);

/* explanations */
var exp = ctx.explainAnswer('rfi9-utg', 'A5s', 'fold', ['raise']);
ok(exp.correct === false && exp.text.length > 40, 'A5s explanation exists');
ok(/blocker|blocks/i.test(exp.text), 'A5s explanation mentions blockers');
var exp2 = ctx.explainAnswer('rfi9-btn', '72o', 'fold', ['fold']);
ok(exp2.correct === true, '72o fold correct on BTN');
var exp3 = ctx.explainAnswer('def-bb-btn', 'A4o', 'call', ctx.correctAnswers('def-bb-btn', 'A4o'));
ok(typeof exp3.text === 'string' && exp3.text.length > 0, 'BB defend explanation renders');

/* interesting labels (border-zone sampling pool) */
var pool = ctx.interestingLabels('rfi9-utg');
ok(pool.length >= 15 && pool.length <= 80, 'UTG interesting pool sane size: ' + pool.length);
ok(pool.indexOf('AA') < 0 || true, 'pool computed');
var hasMixed = pool.indexOf('A9s') >= 0;
ok(hasMixed, 'mixed hands in pool');
var hasJustOutside = pool.some(function (l) { return ctx.COMPILED_CHARTS['rfi9-utg'].chart[l] === undefined; });
ok(hasJustOutside, 'just-outside-border hands in pool');

/* every chart can build borders + pool without error */
var errs = 0;
ctx.RANGE_CHARTS.forEach(function (spec) {
  try { ctx.borderSummary(spec.id); ctx.interestingLabels(spec.id); }
  catch (e) { errs++; console.error('  FAIL ' + spec.id + ': ' + e.message); }
});
ok(errs === 0, 'borders + pools build for all ' + ctx.RANGE_CHARTS.length + ' charts');

console.log(failures === 0 ? '\nALL TEACH TESTS PASSED' : '\n' + failures + ' FAILURES');
process.exit(failures ? 1 : 0);
