/* Validate postflop street charts, drills, and the defense math. */
'use strict';
var P = require('./postflop.js');

var failures = 0;
function ok(c, m) { if (c) console.log('  PASS ' + m); else { failures++; console.error('  FAIL ' + m); } }

console.log('postflop charts');
ok(P.POSTFLOP_CHARTS.length >= 8, P.POSTFLOP_CHARTS.length + ' street charts');
var streets = { flop: 0, turn: 0, river: 0 };
var seen = {};
P.POSTFLOP_CHARTS.forEach(function (c) {
  ok(!seen[c.id], c.id + ' unique id'); seen[c.id] = true;
  ok(['flop', 'turn', 'river'].indexOf(c.street) >= 0, c.id + ' legal street');
  streets[c.street]++;
  ok(c.formats.length >= 1 && c.formats.every(function (f) { return f === 'cash' || f === 'mtt'; }), c.id + ' legal formats');
  ok(typeof c.title === 'string' && c.title.length > 4 && typeof c.intro === 'string' && c.intro.length > 40, c.id + ' has title + real intro');
  ok(c.rows.length >= 3, c.id + ': ' + c.rows.length + ' texture rows');
  c.rows.forEach(function (r) {
    if (!(r.freq >= 0 && r.freq <= 1)) { failures++; console.error('  FAIL ' + c.id + ' bad freq ' + r.freq); }
    if (typeof r.plan !== 'string' || r.plan.length < 10 || typeof r.why !== 'string' || r.why.length < 30) {
      failures++; console.error('  FAIL ' + c.id + ' row lacks plan/why: ' + r.tex);
    }
    // board strings must be parseable pairs when card-like
    if (r.board && /^[AKQJT2-9][cdhs]/.test(r.board)) {
      var segs = r.board.split(' ');
      segs.forEach(function (s) {
        if (s.length % 2 !== 0) { failures++; console.error('  FAIL ' + c.id + ' odd board string: ' + s); }
        for (var i = 0; i + 1 < s.length; i += 2) {
          if (!/^[AKQJT2-9][cdhs]$/.test(s.slice(i, i + 2))) { failures++; console.error('  FAIL ' + c.id + ' bad card ' + s.slice(i, i + 2)); }
        }
      });
    }
  });
});
ok(streets.flop >= 4 && streets.turn >= 2 && streets.river >= 1, 'coverage: ' + streets.flop + ' flop / ' + streets.turn + ' turn / ' + streets.river + ' river');
ok(P.postflopByStreet('flop', 'mtt').some(function (c) { return c.id === 'pf-mtt-spr'; }), 'MTT-only SPR card appears in MTT mode');
ok(!P.postflopByStreet('flop', 'cash').some(function (c) { return c.id === 'pf-mtt-spr'; }), 'SPR card hidden in cash mode');
ok(P.POSTFLOP_CHARTS.some(function (c) { return c.rows.some(function (r) { return r.mtt && r.mtt.length > 10; }); }), 'rows carry MTT deltas');

console.log('postflop drills');
ok(P.POSTFLOP_DRILLS.length >= 12, P.POSTFLOP_DRILLS.length + ' drill items');
var dseen = {};
P.POSTFLOP_DRILLS.forEach(function (d) {
  ok(!dseen[d.id], d.id + ' unique'); dseen[d.id] = true;
  var keys = d.opts.map(function (o) { return o.k; });
  ok(keys.indexOf(d.a) >= 0, d.id + ' answer key exists');
  ok(d.opts.length >= 3, d.id + ' has 3+ options');
  ok(typeof d.why === 'string' && d.why.length > 40, d.id + ' has real explanation');
  ok(['flop', 'turn', 'river'].indexOf(d.street) >= 0, d.id + ' legal street');
});

console.log('defense math');
function close(a, b) { return Math.abs(a - b) < 0.001; }
ok(close(P.pfMdf(100, 33), 100 / 133), 'MDF vs 33% = 75.2%');
ok(close(P.pfMdf(100, 50), 2 / 3), 'MDF vs 50% = 66.7%');
ok(close(P.pfMdf(100, 100), 0.5), 'MDF vs pot = 50%');
ok(close(P.pfAlpha(100, 50), 1 / 3), 'bluff break-even vs 50% = 33.3%');
ok(close(P.pfPotOdds(100, 50), 0.25), 'call 50% pot needs 25% equity');
ok(close(P.pfPotOdds(100, 100), 1 / 3), 'call pot bet needs 33.3% equity');
ok(close(P.pfBluffShare(0.5), 0.25), 'half-pot river bet: 25% bluffs');
ok(close(P.pfBluffShare(1), 1 / 3), 'pot river bet: 33% bluffs');
ok(close(P.pfBluffShare(2), 0.4), '2x-pot river bet: 40% bluffs');
// internal consistency: caller's required equity == bettor's bluff share at every size
[0.33, 0.5, 0.75, 1, 1.5, 2].forEach(function (b) {
  ok(close(P.pfPotOdds(1, b), P.pfBluffShare(b)), 'indifference holds at ' + Math.round(b * 100) + '% pot');
});

console.log(failures === 0 ? '\nALL POSTFLOP TESTS PASS' : '\n' + failures + ' FAILURES');
process.exit(failures ? 1 : 0);
