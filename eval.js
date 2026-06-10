/* ============================================================
   EDGE — eval.js
   7-card hand evaluator + Monte-Carlo equity engine + poker math.
   Pure functions, no DOM. Works in browser and node (for tests).
   ============================================================ */
'use strict';

/* ---------- straight detection on a rank bitmask ----------
   mask bit r set if rank r present (r: 0=2 .. 12=A).
   Returns top rank of best straight, or -1. Handles the wheel. */
function straightTop(mask) {
  // A can play low: synthesize bit -1 conceptually via wheel check
  var run = 0;
  for (var r = 12; r >= 0; r--) {
    if (mask & (1 << r)) {
      run++;
      if (run >= 5) return r + 4;
    } else run = 0;
  }
  // wheel: A,2,3,4,5
  var wheel = (1 << 12) | (1 << 0) | (1 << 1) | (1 << 2) | (1 << 3);
  if ((mask & wheel) === wheel) return 3; // 5-high straight, top rank index of '5' = 3
  return -1;
}

/* pack category + up to 5 tiebreak ranks (each 0..12 -> 4 bits) */
function packScore(cat, t) {
  var v = cat;
  for (var i = 0; i < 5; i++) v = v * 16 + (t[i] === undefined ? 0 : t[i] + 1);
  return v;
}

var HAND_CATS = ['High Card', 'Pair', 'Two Pair', 'Three of a Kind', 'Straight',
  'Flush', 'Full House', 'Four of a Kind', 'Straight Flush'];

/* Evaluate exactly 7 cards (array of ints). Higher score wins. */
function evaluate7(cards) {
  var rankCount = new Array(13), suitCount = [0, 0, 0, 0];
  var i, r;
  for (i = 0; i < 13; i++) rankCount[i] = 0;
  var suitMasks = [0, 0, 0, 0], rankMask = 0;
  for (i = 0; i < 7; i++) {
    r = cards[i] >> 2;
    var s = cards[i] & 3;
    rankCount[r]++;
    suitCount[s]++;
    suitMasks[s] |= (1 << r);
    rankMask |= (1 << r);
  }
  // flush?
  var flushSuit = -1;
  for (i = 0; i < 4; i++) if (suitCount[i] >= 5) flushSuit = i;
  if (flushSuit >= 0) {
    var sfTop = straightTop(suitMasks[flushSuit]);
    if (sfTop >= 0) return packScore(8, [sfTop]);
  }
  // collect rank multiplicities (descending rank)
  var quads = [], trips = [], pairs = [], singles = [];
  for (r = 12; r >= 0; r--) {
    if (rankCount[r] === 4) quads.push(r);
    else if (rankCount[r] === 3) trips.push(r);
    else if (rankCount[r] === 2) pairs.push(r);
    else if (rankCount[r] === 1) singles.push(r);
  }
  if (quads.length) {
    // best kicker among remaining
    var kick = -1;
    for (r = 12; r >= 0; r--) if (r !== quads[0] && rankCount[r] > 0) { kick = r; break; }
    return packScore(7, [quads[0], kick]);
  }
  if (trips.length >= 2) { // trips + trips = full house (use 2nd trips as pair)
    return packScore(6, [trips[0], trips[1]]);
  }
  if (trips.length === 1 && pairs.length >= 1) {
    return packScore(6, [trips[0], pairs[0]]);
  }
  if (flushSuit >= 0) {
    var fr = [];
    for (r = 12; r >= 0 && fr.length < 5; r--) {
      if (suitMasks[flushSuit] & (1 << r)) fr.push(r);
    }
    return packScore(5, fr);
  }
  var st = straightTop(rankMask);
  if (st >= 0) return packScore(4, [st]);
  if (trips.length === 1) {
    return packScore(3, [trips[0], singles[0], singles[1]]);
  }
  if (pairs.length >= 2) {
    var k2 = -1;
    for (r = 12; r >= 0; r--) {
      if (rankCount[r] > 0 && r !== pairs[0] && r !== pairs[1]) { k2 = r; break; }
    }
    return packScore(2, [pairs[0], pairs[1], k2]);
  }
  if (pairs.length === 1) {
    return packScore(1, [pairs[0], singles[0], singles[1], singles[2]]);
  }
  return packScore(0, [singles[0], singles[1], singles[2], singles[3], singles[4]]);
}
function scoreCategory(score) {
  return Math.floor(score / Math.pow(16, 5));
}

/* ---------- Monte-Carlo equity ----------
   hero: [c1,c2]
   villainCombos: array of [c1,c2] (already filtered for known dead cards
                  EXCEPT board/run-outs which we re-check), or null = random hand
   board: array of 0..5 cards already out
   iters: simulations
   Returns { win, tie, lose, equity, iters }                              */
function mcEquity(hero, villainCombos, board, iters) {
  board = board || [];
  iters = iters || 20000;
  var dead = hero.concat(board);
  var deadSet = {};
  var i;
  for (i = 0; i < dead.length; i++) deadSet[dead[i]] = true;

  // pre-filter villain combos vs current dead cards
  var vlist = null;
  if (villainCombos) {
    vlist = [];
    for (i = 0; i < villainCombos.length; i++) {
      var vc = villainCombos[i];
      if (!deadSet[vc[0]] && !deadSet[vc[1]]) vlist.push(vc);
    }
    if (!vlist.length) return { win: 0, tie: 0, lose: 0, equity: 0, iters: 0, empty: true };
  }

  var baseDeck = [];
  for (i = 0; i < 52; i++) if (!deadSet[i]) baseDeck.push(i);

  var win = 0, tie = 0, lose = 0;
  var need = 5 - board.length;
  for (var it = 0; it < iters; it++) {
    var v;
    if (vlist) v = vlist[Math.floor(Math.random() * vlist.length)];
    else {
      // random villain from remaining deck
      var a = baseDeck[Math.floor(Math.random() * baseDeck.length)];
      var b = baseDeck[Math.floor(Math.random() * baseDeck.length)];
      while (b === a) b = baseDeck[Math.floor(Math.random() * baseDeck.length)];
      v = [a, b];
    }
    // build runout avoiding villain cards
    var run = [];
    while (run.length < need) {
      var c = baseDeck[Math.floor(Math.random() * baseDeck.length)];
      if (c === v[0] || c === v[1]) continue;
      var dup = false;
      for (var k = 0; k < run.length; k++) if (run[k] === c) { dup = true; break; }
      if (!dup) run.push(c);
    }
    var full = board.concat(run);
    var hs = evaluate7([hero[0], hero[1], full[0], full[1], full[2], full[3], full[4]]);
    var vs = evaluate7([v[0], v[1], full[0], full[1], full[2], full[3], full[4]]);
    if (hs > vs) win++;
    else if (hs === vs) tie++;
    else lose++;
  }
  return {
    win: win / iters, tie: tie / iters, lose: lose / iters,
    equity: (win + tie / 2) / iters, iters: iters
  };
}

/* equity of hero class-range vs villain range — used by trainer explanations */
function mcEquityHandVsHand(heroStr, villStr, boardStr, iters) {
  var hero = [parseCard(heroStr.slice(0, 2)), parseCard(heroStr.slice(2, 4))];
  var vill = [parseCard(villStr.slice(0, 2)), parseCard(villStr.slice(2, 4))];
  var board = [];
  if (boardStr) for (var i = 0; i + 1 < boardStr.length; i += 2) board.push(parseCard(boardStr.slice(i, i + 2)));
  return mcEquity(hero, [vill], board, iters || 20000);
}

/* ---------- Poker math (the "science" toolbox) ---------- */
var PokerMath = {
  /* equity needed to call: call / (pot + call) ; pot = pot BEFORE your call,
     including villain's bet */
  potOddsEquity: function (pot, call) { return call / (pot + call); },

  /* Minimum Defense Frequency vs a bet: 1 - bet/(pot+bet) = pot/(pot+bet) */
  mdf: function (pot, bet) { return pot / (pot + bet); },

  /* Bluff break-even % (how often a pure bluff must work): risk/(risk+reward) */
  bluffBreakeven: function (pot, bet) { return bet / (pot + bet); },

  /* Required bluff:value ratio for river bet to make bluff-catching indifferent:
     bluffs share = bet/(2*bet+pot)  (pot-share odds the caller gets) */
  optimalBluffShare: function (pot, bet) { return (bet / (2 * bet + pot)); },

  /* Stack-to-pot ratio */
  spr: function (effStack, pot) { return effStack / pot; },

  /* Expected value of a call: eq*(pot+call) - call */
  evCall: function (equity, pot, call) { return equity * (pot + call) - call; },

  /* implied odds: extra chips needed to make a call break-even:
     X such that call = eq*(pot+call+X)  ->  X = (call - eq*(pot+call))/eq */
  impliedNeeded: function (equity, pot, call) {
    if (equity <= 0) return Infinity;
    return Math.max(0, (call - equity * (pot + call)) / equity);
  },

  /* rule of 2 & 4 plus exact draw odds with known outs */
  outsToEquity: function (outs, street) { // street: 'flop' (2 cards) or 'turn' (1)
    if (street === 'flop') {
      return 1 - ((47 - outs) / 47) * ((46 - outs) / 46);
    }
    return outs / 46;
  },

  /* sample std dev */
  stdev: function (xs) {
    if (xs.length < 2) return 0;
    var m = 0, i;
    for (i = 0; i < xs.length; i++) m += xs[i];
    m /= xs.length;
    var v = 0;
    for (i = 0; i < xs.length; i++) v += (xs[i] - m) * (xs[i] - m);
    return Math.sqrt(v / (xs.length - 1));
  },

  mean: function (xs) {
    if (!xs.length) return 0;
    var m = 0;
    for (var i = 0; i < xs.length; i++) m += xs[i];
    return m / xs.length;
  },

  /* 95% CI for hourly winrate given per-session winrates weighted by hours.
     Uses hourly aggregation: wr = totalProfit/totalHours,
     se = sd_hourly / sqrt(hours). We approximate sd_hourly from session data:
     sd of (session profit normalized per sqrt(hours)).                    */
  winrateCI: function (sessions) { // [{profit, hours}]
    var totalP = 0, totalH = 0, i;
    for (i = 0; i < sessions.length; i++) { totalP += sessions[i].profit; totalH += sessions[i].hours; }
    if (totalH <= 0 || sessions.length < 2) return null;
    var wr = totalP / totalH;
    // per-session deviation scaled: x_i = (profit_i - wr*hours_i)/sqrt(hours_i)
    var devs = [];
    for (i = 0; i < sessions.length; i++) {
      var h = Math.max(sessions[i].hours, 0.1);
      devs.push((sessions[i].profit - wr * h) / Math.sqrt(h));
    }
    var sdHour = PokerMath.stdev(devs); // std dev per sqrt(hour) ≈ hourly sd
    var se = sdHour / Math.sqrt(totalH);
    return { wr: wr, sdHour: sdHour, lo: wr - 1.96 * se, hi: wr + 1.96 * se, hours: totalH };
  },

  /* Bankroll for target risk-of-ruin (classic Brownian approx):
     BR = (sd^2 / (2*wr)) * ln(1/ror)   (units consistent: per-hour)      */
  bankrollForRoR: function (wr, sdHour, ror) {
    if (wr <= 0) return Infinity;
    return (sdHour * sdHour / (2 * wr)) * Math.log(1 / ror);
  },

  /* risk of ruin given bankroll */
  riskOfRuin: function (wr, sdHour, bankroll) {
    if (wr <= 0) return 1;
    return Math.exp(-2 * wr * bankroll / (sdHour * sdHour));
  }
};

if (typeof module !== 'undefined') {
  module.exports = {
    evaluate7: evaluate7, scoreCategory: scoreCategory, HAND_CATS: HAND_CATS,
    mcEquity: mcEquity, mcEquityHandVsHand: mcEquityHandVsHand,
    PokerMath: PokerMath, straightTop: straightTop
  };
  // pull in card helpers when running under node
  var _c = require('./cards.js');
  if (typeof parseCard === 'undefined') { global.parseCard = _c.parseCard; }
}
