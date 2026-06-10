/* ============================================================
   EDGE — cards.js
   Card primitives, the 169-hand grid, and range notation parsing.
   Card = integer 0..51.  rank = card >> 2  (0='2' ... 12='A')
                          suit = card & 3   (0=club 1=diamond 2=heart 3=spade)
   ============================================================ */
'use strict';

var RANKS = '23456789TJQKA';            // index 0..12
var SUITS = 'cdhs';
var SUIT_GLYPH = { c: '♣', d: '♦', h: '♥', s: '♠' };
var SUIT_RED = { c: false, d: true, h: true, s: false };

function makeCard(rankChar, suitChar) {
  return RANKS.indexOf(rankChar) * 4 + SUITS.indexOf(suitChar);
}
function cardRank(c) { return c >> 2; }
function cardSuit(c) { return c & 3; }
function cardStr(c) { return RANKS[c >> 2] + SUITS[c & 3]; }
function cardPretty(c) {
  var r = RANKS[c >> 2], s = SUITS[c & 3];
  return r + SUIT_GLYPH[s];
}
function parseCard(s) {
  s = s.trim();
  var r = RANKS.indexOf(s[0].toUpperCase());
  var su = SUITS.indexOf(s[1].toLowerCase());
  if (r < 0 || su < 0) return -1;
  return r * 4 + su;
}
function fullDeck() {
  var d = [];
  for (var i = 0; i < 52; i++) d.push(i);
  return d;
}
function deckWithout(dead) {
  var set = {};
  for (var i = 0; i < dead.length; i++) set[dead[i]] = true;
  var d = [];
  for (var c = 0; c < 52; c++) if (!set[c]) d.push(c);
  return d;
}

/* ---------- 169 hand classes ----------
   Class label examples: "AA", "AKs", "AKo".
   Grid: 13x13, row i = first rank (A high at top, index 0 = A),
   col j = second rank. i<j region above diagonal = suited in the
   conventional chart orientation (row rank > col rank means we
   normalize: hi = higher rank). We use:
     gridLabel(row, col): row 0..12 top->bottom = A..2,
     col 0..12 left->right = A..2.
     row === col -> pair; row < col -> suited (upper right); row > col -> offsuit.
*/
function rIdxFromTop(i) { return 12 - i; }  // grid row/col index -> rank index (A=12)

function gridLabel(row, col) {
  var r1 = RANKS[rIdxFromTop(row)], r2 = RANKS[rIdxFromTop(col)];
  if (row === col) return r1 + r2;
  if (row < col) return r1 + r2 + 's';
  return r2 + r1 + 'o';
}
function allClasses() {
  var out = [];
  for (var i = 0; i < 13; i++) for (var j = 0; j < 13; j++) out.push(gridLabel(i, j));
  return out;
}
/* number of combos in a class */
function classComboCount(label) {
  if (label.length === 2) return 6;
  return label[2] === 's' ? 4 : 12;
}
/* expand class label to concrete 2-card combos, excluding dead cards */
function classToCombos(label, dead) {
  dead = dead || [];
  var deadSet = {};
  for (var i = 0; i < dead.length; i++) deadSet[dead[i]] = true;
  var r1 = RANKS.indexOf(label[0]), r2 = RANKS.indexOf(label[1]);
  var out = [];
  var a, b, s1, s2;
  if (label.length === 2) { // pair
    for (s1 = 0; s1 < 4; s1++) for (s2 = s1 + 1; s2 < 4; s2++) {
      a = r1 * 4 + s1; b = r1 * 4 + s2;
      if (!deadSet[a] && !deadSet[b]) out.push([a, b]);
    }
  } else if (label[2] === 's') {
    for (s1 = 0; s1 < 4; s1++) {
      a = r1 * 4 + s1; b = r2 * 4 + s1;
      if (!deadSet[a] && !deadSet[b]) out.push([a, b]);
    }
  } else {
    for (s1 = 0; s1 < 4; s1++) for (s2 = 0; s2 < 4; s2++) {
      if (s1 === s2) continue;
      a = r1 * 4 + s1; b = r2 * 4 + s2;
      if (!deadSet[a] && !deadSet[b]) out.push([a, b]);
    }
  }
  return out;
}
/* class label for two concrete cards */
function comboClass(c1, c2) {
  var r1 = cardRank(c1), r2 = cardRank(c2);
  var hi = Math.max(r1, r2), lo = Math.min(r1, r2);
  if (hi === lo) return RANKS[hi] + RANKS[lo];
  var suited = cardSuit(c1) === cardSuit(c2);
  return RANKS[hi] + RANKS[lo] + (suited ? 's' : 'o');
}

/* ---------- Range notation parser ----------
   Supports comma separated tokens:
     "AA" "TT" pairs            "22+" "77-99" pair spans
     "AKs" "T9o" singles        "A2s+"  kicker climbs to one below first rank
     "K9s+" same climb rule     "A5s-A2s" span on second rank
     "QTo+" etc.
   Returns object: { classes: { "AKs": weight, ... } }
   weight defaults 1 (can pass w).
*/
function parseRange(str, w) {
  w = (w === undefined) ? 1 : w;
  var classes = {};
  if (!str) return classes;
  var tokens = str.split(',');
  for (var t = 0; t < tokens.length; t++) {
    var tok = tokens[t].trim();
    if (!tok) continue;
    var plus = /\+$/.test(tok);
    if (plus) tok = tok.slice(0, -1);
    var dash = tok.indexOf('-') >= 0;
    if (dash) {
      var parts = tok.split('-');
      var hiTok = parts[0].trim(), loTok = parts[1].trim();
      if (hiTok.length === 2 && hiTok[0] === hiTok[1]) { // pair span "99-77"
        var hp = RANKS.indexOf(hiTok[0]), lp = RANKS.indexOf(loTok[0]);
        var lo2 = Math.min(hp, lp), hi2 = Math.max(hp, lp);
        for (var p = lo2; p <= hi2; p++) classes[RANKS[p] + RANKS[p]] = w;
      } else { // "A5s-A2s" span on second rank, same first rank + suffix
        var first = hiTok[0], sfx = hiTok[2] || '';
        var k1 = RANKS.indexOf(hiTok[1]), k2 = RANKS.indexOf(loTok[1]);
        var klo = Math.min(k1, k2), khi = Math.max(k1, k2);
        for (var k = klo; k <= khi; k++) classes[first + RANKS[k] + sfx] = w;
      }
      continue;
    }
    if (tok.length === 2 && tok[0] === tok[1]) { // pair
      var pr = RANKS.indexOf(tok[0]);
      if (plus) { for (var q = pr; q <= 12; q++) classes[RANKS[q] + RANKS[q]] = w; }
      else classes[tok] = w;
      continue;
    }
    // non-pair
    var f = RANKS.indexOf(tok[0]), s = RANKS.indexOf(tok[1]);
    var suffix = tok[2] || 'o';
    if (tok.length === 2) { // e.g. "AK" = both suited+offsuit
      if (plus) {
        for (var x = s; x < f; x++) {
          classes[tok[0] + RANKS[x] + 's'] = w;
          classes[tok[0] + RANKS[x] + 'o'] = w;
        }
      } else {
        classes[tok + 's'] = w; classes[tok + 'o'] = w;
      }
      continue;
    }
    if (plus) {
      for (var y = s; y < f; y++) classes[tok[0] + RANKS[y] + suffix] = w;
    } else {
      classes[tok] = w;
    }
  }
  return classes;
}

/* Merge several action strings into one chart object:
   buildChart({ raise: "...", call: "...", mixed: "..." })
   -> { "AKs": "raise", ... }  later keys do NOT overwrite earlier ones. */
function buildChart(actions) {
  var chart = {};
  for (var act in actions) {
    if (!actions.hasOwnProperty(act)) continue;
    var cls = parseRange(actions[act]);
    for (var label in cls) {
      if (chart[label] === undefined) chart[label] = act;
    }
  }
  return chart;
}

/* combos in a chart action (for range % display) */
function chartStats(chart) {
  var total = 1326, byAction = {}, combosInChart = 0;
  for (var label in chart) {
    var n = classComboCount(label);
    byAction[chart[label]] = (byAction[chart[label]] || 0) + n;
    combosInChart += n;
  }
  return { byAction: byAction, total: total, inChart: combosInChart };
}

/* range object ({class: weight/action}) -> list of concrete combos */
function rangeToCombos(rangeObj, dead) {
  var out = [];
  for (var label in rangeObj) {
    if (!rangeObj.hasOwnProperty(label)) continue;
    var combos = classToCombos(label, dead);
    for (var i = 0; i < combos.length; i++) out.push(combos[i]);
  }
  return out;
}

/* random helpers */
function randInt(n) { return Math.floor(Math.random() * n); }
function shuffleInPlace(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = randInt(i + 1);
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}
function sampleHand() { // random 2 distinct cards
  var a = randInt(52), b = randInt(52);
  while (b === a) b = randInt(52);
  return [a, b];
}

/* expose for node tests */
if (typeof module !== 'undefined') {
  module.exports = {
    RANKS: RANKS, SUITS: SUITS, makeCard: makeCard, parseCard: parseCard,
    cardStr: cardStr, cardRank: cardRank, cardSuit: cardSuit, cardPretty: cardPretty,
    fullDeck: fullDeck, deckWithout: deckWithout, gridLabel: gridLabel,
    allClasses: allClasses, classToCombos: classToCombos, comboClass: comboClass,
    classComboCount: classComboCount, parseRange: parseRange, buildChart: buildChart,
    chartStats: chartStats, rangeToCombos: rangeToCombos, sampleHand: sampleHand,
    shuffleInPlace: shuffleInPlace, randInt: randInt
  };
}
