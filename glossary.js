/* ============================================================
   EDGE — glossary.js
   Every term the poker world assumes you already know.
   Terms auto-link inside lessons; tap any to open the definition.
   ============================================================ */
'use strict';

var GLOSSARY = [
  { t: 'RFI', full: 'Raise First In', d: 'Being the first player to voluntarily raise when the pot is unopened (everyone before you folded). Your RFI range is the set of hands you open-raise from each position. Example: it folds to you in the cutoff and you raise to 2.5bb — that is an RFI.', m: ['RFI', 'open-raise', 'open raise', 'raise first in'] },
  { t: 'Open', full: 'Opening raise', d: 'Same as RFI: the first raise into an unopened pot. "UTG opens to 3x" means the first player raised to 3 big blinds.', m: ['opens to'] },
  { t: 'Limp', full: 'Open-limp', d: 'Entering the pot by just calling the big blind instead of raising. Weak-passive by default — strong players almost never open-limp (except sometimes in the small blind). A limp-RAISE (limping then re-raising a raiser) from a passive live player is almost always a monster.', m: ['limp', 'limps', 'limping', 'limper', 'limpers', 'limp-raise'] },
  { t: 'Iso-raise', full: 'Isolation raise', d: 'Raising over one or more limpers to isolate the weakest player and take the pot heads-up with position. Standard live-poker bread and butter: 4-5bb plus 1bb per extra limper.', m: ['iso-raise', 'iso raise', 'isolate', 'isolation raise'] },
  { t: '3-bet', full: 'Three-bet (re-raise)', d: 'The second raise. The blind post counts as bet one, the open-raise is bet two, so the first re-raise is the "3-bet." A 3-bet range contains value hands (QQ+, AK) plus bluffs chosen for blockers and playability (A5s).', m: ['3-bet', '3bet', 'three-bet', '3-bets', '3-betting', '3-bettor'] },
  { t: '4-bet', full: 'Four-bet', d: 'A re-raise over a 3-bet. Usually sized ~2.2-2.5x the 3-bet. 4-bet ranges are narrow and polarized: premiums for value, a few blocker hands (A5s) as bluffs.', m: ['4-bet', '4bet', 'four-bet', '4-bets', '4-betting'] },
  { t: '5-bet', full: 'Five-bet', d: 'A re-raise over a 4-bet — at 100bb this is usually just moving all-in. 5-bet ranges are essentially KK+ plus the occasional AKs/A5s jam.', m: ['5-bet', '5bet'] },
  { t: 'Cold call', full: 'Cold call', d: 'Calling a raise when you have no money already invested in the pot (you are not in the blinds and did not limp). Cold-calling ranges are condensed: strong enough to continue, not strong enough to re-raise.', m: ['cold call', 'cold-call', 'flat', 'flatting', 'flats'] },
  { t: 'Squeeze', full: 'Squeeze play', d: 'A 3-bet made after there is both a raiser AND one or more callers. The callers are "squeezed" between the raiser and you — they face a raise with capped ranges and dead money already in the pot.', m: ['squeeze'] },
  { t: 'IP / OOP', full: 'In position / Out of position', d: 'In position (IP) = you act LAST on every postflop street; out of position (OOP) = you act first. Acting last is a structural information advantage worth real EV — it is why the button is the most profitable seat at the table.', m: ['in position', 'out of position', 'IP', 'OOP'] },
  { t: 'Positions', full: 'Seat names (UTG → BB)', d: 'Action order preflop at 9-max: UTG, UTG+1, MP (UTG+2), LJ (lojack), HJ (hijack), CO (cutoff), BTN (button/dealer), SB (small blind), BB (big blind). The button acts last postflop; the blinds act first.', m: ['UTG', 'lojack', 'hijack', 'cutoff', 'button', 'small blind', 'big blind'] },
  { t: 'Blinds', full: 'Small blind & big blind', d: 'Forced bets posted before cards are dealt — they create the initial pot everyone fights for. Blinds are the engine of poker: without them, the correct strategy would be to fold everything except aces.', m: ['blinds'] },
  { t: 'Straddle', full: 'Straddle', d: 'A voluntary blind bet (usually 2x the big blind) posted before the deal, common in live games. It doubles the effective stakes, halves everyone\'s stack depth in big blinds, and makes ranges play looser.', m: ['straddle'] },
  { t: 'VPIP', full: 'Voluntarily Put In Pot %', d: 'The percentage of hands a player chooses to play (calling or raising preflop — not counting checking the BB). The single fastest read on a player: under 18% = tight, over 35% = loose. EDGE\'s Live tab tracks this per opponent with one tap.', m: ['VPIP'] },
  { t: 'PFR', full: 'Preflop Raise %', d: 'The percentage of hands a player raises preflop. Read together with VPIP: a big gap (high VPIP, low PFR) = passive caller; close together = aggressive. 22/18 is a solid reg; 40/8 is a calling station.', m: ['PFR'] },
  { t: 'Mixed strategy', full: 'Mixed-frequency play', d: 'When a solver plays the same hand differently at some frequency — e.g., A9s opens 40% and folds 60% from UTG. This happens because at the indifference point both actions have nearly IDENTICAL expected value. Practical meaning: with a mixed hand, either action is fine — these are the cheapest "mistakes" in poker. In EDGE charts, gold cells = mixed.', m: ['mixed', 'mixed-frequency', 'mixed strategy', 'indifference', 'indifferent'] },
  { t: 'GTO', full: 'Game Theory Optimal', d: 'A strategy that cannot be exploited: if you play GTO, no opponent adjustment can beat you in expectation. It is the unbeatable DEFAULT, not the maximum-profit strategy — max profit comes from deviating to attack specific opponents\' mistakes (exploitative play).', m: ['GTO', 'game theory optimal', 'unexploitable'] },
  { t: 'Exploit', full: 'Exploitative play', d: 'Deliberately deviating from GTO to attack a specific leak: never bluffing a calling station, stealing every blind from a nit. Every exploit theoretically opens you to counter-exploitation — which is why you exploit weak players and stay near baseline against strong ones.', m: ['exploit', 'exploits', 'exploitative', 'exploitable'] },
  { t: 'Solver', full: 'Poker solver', d: 'Software (PioSOLVER, GTO Wizard, etc.) that computes equilibrium strategies for a defined game tree. Solver outputs are where modern preflop charts come from — including the baselines in EDGE\'s Study tab.', m: ['solver', 'solvers'] },
  { t: 'Range', full: 'Hand range', d: 'The complete set of hands a player can hold given their actions, weighted by combinations. The foundational mental shift of serious poker: you never play against a hand, you play against a distribution of hands.', m: ['range', 'ranges'] },
  { t: 'Combo', full: 'Combination', d: 'One specific two-card holding. Every pair has 6 combos, every suited hand 4, every offsuit hand 12 — 1,326 total. Hand reading is counting combos: on K72, AK has 12 combos but a set of kings only 3.', m: ['combo', 'combos', 'combinations', 'combinatorics'] },
  { t: 'Blocker', full: 'Blocker (card removal)', d: 'A card in your hand that reduces the combinations your opponent can hold. Holding an ace halves their AA combos (6→3). Blockers drive modern bluff selection: A5s 3-bets partly because the ace blocks the AA/AK that would 4-bet you.', m: ['blocker', 'blockers', 'blocks', 'card removal', 'unblock', 'unblocks', 'unblocker'] },
  { t: 'Equity', full: 'Pot equity', d: 'Your percentage chance of winning the pot if all cards were run out right now — your fair share of the pot. AA has 81% equity vs KK preflop. Equity is the raw material; position and skill determine how much of it you actually realize.', m: ['equity', 'equity realization', 'realize equity'] },
  { t: 'EV', full: 'Expected Value', d: 'The long-run average result of a decision: sum of (probability × outcome) across all possibilities. The only honest measure of poker decisions. A call can lose the hand and still be correct — EV is about the average across infinite repetitions, not tonight\'s result.', m: ['EV', 'expected value', '+EV', '-EV'] },
  { t: 'Pot odds', full: 'Pot odds', d: 'The price the pot offers on a call: required equity = call ÷ (pot + bet + call). Facing a half-pot bet you need 25%; full pot needs 33%. The most-used number in poker — EDGE\'s math drills burn it in.', m: ['pot odds'] },
  { t: 'Implied odds', full: 'Implied odds', d: 'Future winnings that justify a call that pot odds alone would not. Drawing to a hidden monster (a set, a straight) in a deep-stacked game has great implied odds because you win extra chips when you hit.', m: ['implied odds'] },
  { t: 'Reverse implied odds', full: 'Reverse implied odds', d: 'The opposite: hands that lose MORE when they "hit." A weak flush draw can make its flush and still lose a stack to a bigger flush. Dominated draws and weak top pairs are reverse-implied-odds machines.', m: ['reverse implied odds'] },
  { t: 'MDF', full: 'Minimum Defense Frequency', d: 'The fraction of your range you must continue with versus a bet so that bluffing you cannot be automatic profit: MDF = pot ÷ (pot + bet). Vs half pot, defend ~67%. A theoretical anchor — deliberately fold MORE vs live players who never bluff.', m: ['MDF', 'minimum defense'] },
  { t: 'Alpha', full: 'Alpha (bluff break-even)', d: 'How often a bluff must work to break even: bet ÷ (bet + pot). A pot-size bluff needs 50% folds; half-pot needs 33%. Alpha and MDF are two views of the same equation — one for the bluffer, one for the defender.', m: ['alpha', 'break-even', 'breakeven'] },
  { t: 'C-bet', full: 'Continuation bet', d: 'A bet by the preflop aggressor on the flop, "continuing" the story of strength. The most common bet in poker. Modern theory: small (25-33% pot) c-bets at high frequency on boards that favor your range; bigger and more selective on boards that favor the caller.', m: ['c-bet', 'cbet', 'c-bets', 'continuation bet', 'c-betting'] },
  { t: 'Barrel', full: 'Barreling', d: 'Firing consecutive bets across streets (double barrel = flop+turn, triple = all three). Good barrels target opponents\' capped ranges and use cards that improve YOUR range (an ace turn after you raised preflop).', m: ['barrel', 'barrels', 'barreling', 'double barrel', 'triple barrel', 'triple-barrels'] },
  { t: 'Donk bet', full: 'Donk bet', d: 'Betting into the previous street\'s aggressor instead of checking to them (out of position). Named because it used to be considered amateurish; solvers actually do it on boards that strongly favor the caller\'s range.', m: ['donk bet', 'donk'] },
  { t: 'Check-raise', full: 'Check-raise', d: 'Checking with the intention of raising after your opponent bets. The most powerful line in poker for both value and bluffs — it leverages their c-bet frequency against them.', m: ['check-raise', 'check-raises', 'check-raising'] },
  { t: 'Float', full: 'Float', d: 'Calling a bet (usually in position, often with weak holdings) planning to take the pot away on a later street when the aggressor gives up.', m: ['float', 'floats', 'floating'] },
  { t: 'Probe', full: 'Probe bet', d: 'An out-of-position bet on the turn or river after the preflop aggressor declined to c-bet the flop — probing the weakness they just showed.', m: ['probe'] },
  { t: 'Polarized', full: 'Polarized range', d: 'A range made of very strong hands and bluffs, with nothing in between — the shape of big-bet and 4-bet ranges. The opposite of linear. You polarize when your opponent\'s range is condensed: they can\'t raise you without the nuts.', m: ['polarized', 'polarize', 'polar'] },
  { t: 'Linear', full: 'Linear (merged) range', d: 'A range of simply the best X% of hands, top-down — the shape of value-heavy 3-bets vs weak players and of most RFI ranges. You play linear when worse hands will pay you off.', m: ['linear', 'merged'] },
  { t: 'Capped', full: 'Capped range', d: 'A range whose strongest possible holdings are limited by prior actions — e.g., a player who just called preflop usually cannot have AA/KK (they would have raised). Capped ranges are the prime target for aggression.', m: ['capped', 'cap', 'uncapped'] },
  { t: 'Condensed', full: 'Condensed range', d: 'A range concentrated in medium-strength hands (the shape of calling ranges). Condensed ranges hate big polar bets — which is exactly why those bets exist.', m: ['condensed'] },
  { t: 'Range advantage', full: 'Range advantage', d: 'When the overall equity of your range beats your opponent\'s on a given board. A K72 flop smashes the UTG opener\'s range and misses the BB\'s. Range advantage drives c-bet frequency; NUT advantage (who has more of the very strongest hands) drives bet SIZE.', m: ['range advantage', 'nut advantage'] },
  { t: 'SPR', full: 'Stack-to-Pot Ratio', d: 'Effective stack ÷ pot, measured on the flop. It tells you how strong a hand must be to play for stacks: SPR under 3, top pair is committed; SPR over 10, you need two pair or better. Plan the hand around SPR before you bet.', m: ['SPR', 'stack-to-pot'] },
  { t: 'Effective stack', full: 'Effective stack', d: 'The smaller of the stacks in a confrontation — the most that can actually be won or lost. All stack-depth strategy keys off the effective stack, not your own.', m: ['effective stack', 'effective stacks'] },
  { t: 'ICM', full: 'Independent Chip Model', d: 'Tournament math that converts chip stacks into real-money equity. Because busting costs you all future pay jumps, chips you might LOSE are worth more than chips you might WIN — so ICM makes calling ranges tighter than chip-EV, especially near bubbles and final tables.', m: ['ICM'] },
  { t: 'Bubble', full: 'Tournament bubble', d: 'The point in a tournament just before the money. ICM pressure peaks here: short stacks must survive, big stacks should attack relentlessly.', m: ['bubble'] },
  { t: 'Nit', full: 'Nit', d: 'An extremely tight, risk-averse player (VPIP under ~18). Steal their blinds forever; fold when they raise — their aggression is always real.', m: ['nit', 'nitty', 'nits'] },
  { t: 'TAG', full: 'Tight-aggressive', d: 'A solid regular: selective preflop, aggressive postflop, positionally aware (roughly 20/17). The default winning style and the closest thing to GTO at most tables.', m: ['TAG', 'tight-aggressive'] },
  { t: 'LAG', full: 'Loose-aggressive', d: 'A skilled aggressive player (28/24+) who pressures capped ranges relentlessly. Against them: tighten opens, widen value 3-bets, call down lighter, and let them bluff into your traps.', m: ['LAG', 'loose-aggressive'] },
  { t: 'Calling station', full: 'Calling station', d: 'A player who calls everything and folds nothing. The golden rule: never bluff them, value bet relentlessly thin. Their sudden raises are always monsters.', m: ['calling station', 'station'] },
  { t: 'Maniac', full: 'Maniac', d: 'Hyper-aggressive chaos player who raises and barrels with anything. Tighten up, call down with bluff-catchers, and let them hang themselves.', m: ['maniac'] },
  { t: 'Whale', full: 'Whale / recreational', d: 'A deep-pocketed fun player who plays half the deck. The economic engine of live poker. Be kind, play pots in position with them, value bet thin, never bluff big.', m: ['whale', 'recreational', 'rec'] },
  { t: 'Tilt', full: 'Tilt', d: 'Emotionally-degraded decision making — usually triggered by bad beats, losing sessions, or specific opponents. The biggest single leak in most players\' win rate. Process-focus and stop-loss rules are the countermeasures.', m: ['tilt', 'tilted', 'tilting'] },
  { t: 'Variance', full: 'Variance', d: 'The statistical noise of poker. Live win rates run ~5-10 bb/hr with standard deviations near 80-100 bb/hr — the noise is 10x the signal, which is why results need hundreds of hours to mean anything.', m: ['variance', 'downswing', 'swings'] },
  { t: 'Bankroll', full: 'Bankroll', d: 'Money set aside exclusively for poker, sized so that normal variance cannot ruin you: 20-30 buy-ins for live cash as a guideline. Bankroll management is what lets skill survive long enough to matter.', m: ['bankroll'] },
  { t: 'bb/hr', full: 'Big blinds per hour', d: 'The stake-independent measure of a live win rate. $25/hr at 2/5 is 5 bb/hr. Measuring in bb makes results comparable across stakes and to online bb/100.', m: ['bb/hr', 'bb/100', 'win rate', 'winrate'] },
  { t: 'Board texture', full: 'Board texture', d: 'How coordinated the community cards are. "Dry" (K72 rainbow) = few draws, favors the raiser; "wet" (9♠8♠6♦) = straights and flushes everywhere, favors the caller. Texture decides c-bet strategy.', m: ['texture', 'wet board', 'dry board', 'coordinated'] },
  { t: 'Gutshot', full: 'Gutshot straight draw', d: 'A straight draw needing one specific rank (4 outs) — e.g., 97 on a K65 board needs an 8. Worth ~16% by the river from the flop.', m: ['gutshot'] },
  { t: 'OESD', full: 'Open-ended straight draw', d: 'A straight draw that completes on either end (8 outs) — e.g., 98 on a 76x board hits any 5 or T. ~32% by the river from the flop.', m: ['OESD', 'open-ended', 'open-ender'] },
  { t: 'Backdoor', full: 'Backdoor draw', d: 'A draw needing BOTH the turn and river (e.g., three to a flush on the flop). Worth only ~4%, but backdoors matter in solver play as tie-breakers for which hands barrel.', m: ['backdoor', 'backdoors'] },
  { t: 'Kicker', full: 'Kicker', d: 'The side card that breaks ties between equal pairs. AK beats AQ on an A72 board because the K outkicks the Q. Weak-kicked hands (A4o) are domination-prone — the reason offsuit aces fold preflop.', m: ['kicker', 'kickers', 'outkick'] },
  { t: 'Dominated', full: 'Domination', d: 'When your hand shares a card with a better hand (KQ vs AK, A4 vs AT): you are drawing to ~3 outs. Avoiding domination is the hidden logic of tight early-position ranges.', m: ['dominated', 'dominates', 'domination'] },
  { t: 'Set-mine', full: 'Set mining', d: 'Calling preflop with a small pair purely to flop a set (~12% of flops, 7.5:1 against). Profitable only with deep effective stacks (the 15-20x rule: stacks should be 15-20 times the call).', m: ['set-mine', 'set mining', 'set-mining'] },
  { t: 'Suited connector', full: 'Suited connector', d: 'Adjacent same-suit cards (87s, 65s). Low raw equity, superb playability: straights, flushes, and disguised monsters. They want position, deep stacks, and multiway-ish pots cheap.', m: ['suited connector', 'suited connectors', 'suited gapper'] },
  { t: 'Broadway', full: 'Broadway cards', d: 'T, J, Q, K, A — the cards that make the nut straight (AKQJT, "Broadway"). "Offsuit broadways" (KJo, QTo) look pretty and are the most overplayed hands in live poker.', m: ['broadway', 'broadways'] },
  { t: 'Wheel', full: 'The wheel', d: 'The A-2-3-4-5 straight, the lowest possible. The ace plays low — which is why suited wheel aces (A5s-A2s) carry hidden straight equity and star as bluff candidates.', m: ['wheel'] },
  { t: 'Cooler', full: 'Cooler', d: 'A clash of two monster hands where the money was always going in (set over set, KK into AA). Not a mistake — just variance wearing a costume. Log it, laugh, move on.', m: ['cooler', 'coolers'] },
  { t: 'Showdown value', full: 'Showdown value', d: 'A hand strong enough to win unimproved at showdown but too weak to bet for value (middle pair on the river). Hands with showdown value usually prefer checking — betting them accomplishes nothing: better hands call, worse hands fold.', m: ['showdown value'] },
  { t: 'Equity denial', full: 'Equity denial', d: 'Betting to make hands with real equity fold — forcing out two overcards that would beat you 25% of the time has value even when they fold "incorrectly."', m: ['equity denial', 'protection'] },
  { t: 'Bluff-catcher', full: 'Bluff-catcher', d: 'A hand that can only beat bluffs — it loses to all value bets. Whether to call with one is purely a question of how often THIS opponent bluffs (population answer at live tables: not often enough).', m: ['bluff-catcher', 'bluff-catchers', 'bluff-catch', 'bluff-catching'] },
  { t: 'Nuts', full: 'The nuts', d: 'The best possible hand on a given board. The "effective nuts" is a hand so strong it plays as if unbeatable. Knowing the exact nuts on every board instantly is a basic pro skill — practice it on every flop you watch.', m: ['nuts', 'nutted'] }
];

/* build match index: longest-first for greedy linking */
var GLOSSARY_INDEX = {};
var GLOSSARY_MATCHES = [];
(function () {
  GLOSSARY.forEach(function (g, i) {
    (g.m || [g.t]).forEach(function (m) {
      GLOSSARY_MATCHES.push({ m: m.toLowerCase(), i: i });
    });
  });
  GLOSSARY_MATCHES.sort(function (a, b) { return b.m.length - a.m.length; });
  GLOSSARY.forEach(function (g, i) { GLOSSARY_INDEX[g.t.toLowerCase()] = i; });
})();

function findGlossary(query) {
  query = query.toLowerCase();
  return GLOSSARY.filter(function (g) {
    if (g.t.toLowerCase().indexOf(query) >= 0) return true;
    if (g.full.toLowerCase().indexOf(query) >= 0) return true;
    if (g.d.toLowerCase().indexOf(query) >= 0) return true;
    return false;
  });
}

if (typeof module !== 'undefined') {
  module.exports = { GLOSSARY: GLOSSARY, GLOSSARY_MATCHES: GLOSSARY_MATCHES, findGlossary: findGlossary };
}
