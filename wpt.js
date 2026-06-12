/* ============================================================
   EDGE — wpt.js
   Cash vs tournament: the core differences, plus a stage-by-stage
   playbook for the ClubWPT Gold daily freerolls (5:30p & 11:15p).
   ============================================================ */
'use strict';

var MTT_DIFFS = [
  { h: 'Chips are not money', items: [
    'Cash: every chip = its face value forever, and you can reload. Tournament: chips you might LOSE are worth more than chips you might WIN (ICM), because busting forfeits every future pay jump.',
    'Practical effect: tournament CALLING ranges tighten near money spots; SHOVING ranges widen. In cash there is no such asymmetry — only chip EV.',
    'Never copy a cash call-off into a bubble spot. The same hand, same odds, can be a snap call in cash and a clear fold in an MTT.'
  ] },
  { h: 'Stack depth is a moving target', items: [
    'Cash sits near 100bb forever (you top up). Tournaments COMPRESS: blinds escalate, and within two hours the average stack is 25-40bb — your whole chart set shifts toward the push/fold end.',
    'Re-evaluate your stack in BIG BLINDS every single orbit. Strategy keys off bb depth, not chip count: 60bb+ = full game, 25-40bb = raise-fold trees and 3-bet jams, under 15bb = pure push/fold (your charts).',
    'Antes (and online button antes) add dead money: open wider than cash once antes kick in.'
  ] },
  { h: 'Survival has value — but chips win tournaments', items: [
    'Folding has extra value near pay jumps; accumulating has extra value everywhere else. The classic error is playing scared-tight in the middle stages and arriving at the money with no stack.',
    'Big stacks should ATTACK bubbles relentlessly (others cannot call you), short stacks should ladder only when pay jumps are meaningful.',
    'No rebuying your mistake: one bust-out ends the night. Variance discipline matters more, tilt costs more.'
  ] },
  { h: 'Online vs live mechanics', items: [
    'No physical tells online — the only reads are SIZING and TIMING (snap actions, tank-jams) plus bet-size patterns. Your Live-tab tells sheet mostly does not transfer.',
    'Pace: online deals 2-3x more hands per hour; levels are shorter. Decisions arrive fast — pre-decide your ranges so the clock never rushes you into guessing.',
    'Player pools online at low/free stakes are WILDLY loose preflop and passive postflop: value bet bigger, bluff less, expect multiway pots constantly.'
  ] }
];

var WPT_GOLD = {
  intro: 'ClubWPT Gold is the WPT’s sweepstakes online room — NLHE tournaments with daily schedules and chip guarantees. The daily freerolls (5:30pm and 11:15pm) are huge, hyper-loose fields where the optimal line is closer to exploitation than equilibrium: tight-aggressive value early, controlled accumulation in the middle, ruthless push/fold and bubble pressure late.',
  stages: [
    { h: 'Stage 1 — Early levels: the all-in circus', items: [
      'Freeroll fields treat early levels like a lottery: expect open-jams and 5-way pots with junk. Do NOT join — fold equity barely exists, so bluffing is donating.',
      'Play a tight, value-heavy range (roughly your UTG/MP charts from ANY position) and bet your big hands LARGE on all three streets — the callers do not care about sizing.',
      'Calling all-ins: you need genuine premiums early (TT+, AK) — being "priced in" against four maniacs still torches your tournament when you lose the flip you never needed.',
      'Goal for stage 1: survive the chaos, double when the deck hits you, lose the minimum when it does not. Patience IS the edge here.'
    ] },
    { h: 'Stage 2 — Middle: the field gets human', items: [
      'The bingo players are gone; blinds now matter relative to stacks (most sit 25-50bb). Switch from value-only to standard MTT aggression: open your charts, attack limpers, start 3-betting the now-foldable opens.',
      'Steal relentlessly from late position — freeroll mid-fields massively over-fold once chips feel "real." Your BTN/CO charts plus a size up to 2.2-2.5x print here.',
      'Track YOUR bb depth every orbit: under 35bb, favor shove/re-shove over flatting; flatting raises off a mid stack is the classic freeroll chip-bleed.',
      'Avoid coolering yourself vs the table big stack without a real hand — he calls everything; value bet him instead.'
    ] },
    { h: 'Stage 3 — Bubble & money: pressure or ladder', items: [
      'Identify the bubble dynamic: freerolls have a huge limp-to-cash crowd. If you are healthy (35bb+), raise EVERY fold-heavy spot — this is the most profitable stretch of the entire tournament.',
      'If you are short (under 12bb), the ladder is real value in sweeps prizes: tighten jams a notch below the chart and let the other shorts bust first — but never blind below ~6bb waiting.',
      'ICM rule of thumb: big stack shoves wide, medium stacks fold almost everything vs shoves, shorts pick spots by fold equity. Medium-stack hero calls are the bubble’s biggest punt.',
      'Post-bubble: everyone unclenches at once — expect a jam-fest for 10 minutes. Re-tighten call-offs briefly, then resume standard play.'
    ] },
    { h: 'Stage 4 — Final table: where the money lives', items: [
      'Payouts are top-heavy: most of the prize pool sits in the top 3 spots. Play for the WIN once medium pay jumps pass — laddering from 9th to 7th is pennies vs pressing for the top.',
      'Use the push/fold charts constantly (most FT stacks are 10-25bb) and attack the players visibly trying to ladder.',
      'Heads-up and 3-handed: ranges explode — any pair, any ace, most kings and suited hands are playable. The tight player loses these spots by default.',
      'Log the session in EDGE afterward like any other: freerolls are free practice reps for real-stakes MTT instincts — review your biggest pots while fresh.'
    ] }
  ],
  schedule: 'Daily freerolls: 5:30pm and 11:15pm. Set a 10-minute pre-game: clear your review queue, skim the push/fold charts, and decide your stage-1 discipline before the first hand.'
};

function renderWptSheet(root) {
  var intro = el('div', { class: 'card' });
  intro.appendChild(el('div', { class: 'chart-title', text: 'Cash vs tournament — the core differences' }));
  intro.appendChild(el('p', { class: 'note', text: 'Same game, different economics. Internalize these four shifts and the rest is chart-reading.' }));
  root.appendChild(intro);
  MTT_DIFFS.forEach(function (sec) {
    var card = el('div', { class: 'card' });
    card.appendChild(el('div', { class: 'chart-title', text: sec.h }));
    var ul = el('ul', { class: 'tips' });
    sec.items.forEach(function (it) { ul.appendChild(el('li', { text: it })); });
    card.appendChild(ul);
    root.appendChild(card);
  });

  var gold = el('div', { class: 'card', style: 'border-color: rgba(232,177,78,0.45)' });
  gold.appendChild(el('div', { class: 'chart-title', text: 'ClubWPT Gold daily freerolls — the playbook' }));
  gold.appendChild(el('p', { class: 'note', text: WPT_GOLD.intro }));
  gold.appendChild(el('p', { class: 'note', style: 'color: var(--amber)', text: WPT_GOLD.schedule }));
  root.appendChild(gold);
  WPT_GOLD.stages.forEach(function (sec) {
    var card = el('div', { class: 'card' });
    card.appendChild(el('div', { class: 'chart-title', text: sec.h }));
    var ul = el('ul', { class: 'tips' });
    sec.items.forEach(function (it) { ul.appendChild(el('li', { text: it })); });
    card.appendChild(ul);
    root.appendChild(card);
  });
  root.appendChild(el('p', { class: 'fineprint', text: 'Pair this sheet with Charts → Push/Fold for the late stages, and the Train tab’s Push/Fold drills before each session.' }));
}

if (typeof module !== 'undefined') {
  module.exports = { MTT_DIFFS: MTT_DIFFS, WPT_GOLD: WPT_GOLD };
}
