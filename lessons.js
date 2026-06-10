/* ============================================================
   EDGE — lessons.js
   A compact course in the math and logic of winning poker,
   sequenced to pair with Modern Poker Theory. Each lesson is
   ~2 minutes + a checkpoint quiz. Progress is tracked.
   ============================================================ */
'use strict';

var LESSONS = [
  {
    id: 'ranges', icon: '🎴', title: 'Think in ranges, not hands',
    minutes: 2,
    body: [
      'The single biggest upgrade from amateur to serious player: stop putting an opponent on A HAND and start putting them on a RANGE — the full set of hands they would play this exact way, weighted by combinations.',
      'Every action filters the range. A tight player open-raising UTG starts with maybe 12% of hands. When they bet the flop on K72, ask: which of those ~160 combos bet here? Which check? By the river the range is often startlingly narrow.',
      'Your own strategy works the same way: the charts in Study are not "what to do with AJs" — they are complete range blueprints. The solver chose every hand so that the RANGE is balanced: enough value, enough bluffs, protected checks. Pull one thread (open junk, fold the bluffs) and the whole fabric becomes exploitable.',
      'Practice: after every live hand you watch at showdown, replay villain\'s actions and ask what their full range was on each street — not what they had, but everything they COULD have had.'
    ],
    quiz: [
      { q: 'A nit opens UTG and triple-barrels K72-4-2. Their river bet most likely represents…',
        options: ['Any two cards — people bluff', 'A narrow, value-heavy slice of an already tight range', 'Exactly AK every time', 'A balanced 2:1 value-to-bluff mix'],
        a: 1, why: 'Tight range in, tighter range out: each barrel filters the 12% UTG range toward strong made hands. Population (especially nits) under-bluffs rivers.' },
      { q: 'Why does folding all your weak hands preflop and playing only premiums make you exploitable?',
        options: ['It does not — tight is right', 'Opponents fold to your aggression and steal your blinds relentlessly', 'You lose rake', 'Premiums lose to random hands'],
        a: 1, why: 'A face-up range gets attacked: no one pays your aces, and everyone steals your blinds. Ranges need breadth to get paid.' }
    ]
  },
  {
    id: 'position', icon: '🪑', title: 'Position is money',
    minutes: 2,
    body: [
      'Why does the Button open ~43% of hands while UTG opens ~13%? Information. Acting last on every postflop street means you see what everyone does before you commit a chip. That edge is worth a fortune — solvers value the same hand dramatically higher in position.',
      'In position you realize MORE than your share of equity: you take free cards when you want, value bet thinner, bluff at better moments. Out of position you realize LESS: you get bet off equity, your strong hands win small pots, your weak hands lose big ones.',
      'This is why the charts widen monotonically from UTG to BTN, why the BB defends wide (closing the action, getting a discount) but plays carefully postflop, and why winning live players fight for seats to the LEFT of the money.',
      'Rule of thumb: a hand at the bottom of your CO range is unplayable UTG, and a clear open on the BTN. The hand never changed — the position did.'
    ],
    quiz: [
      { q: 'K9s folds UTG (9-max) but opens on the BTN. The main reason:',
        options: ['K9s flops better in late position', 'Fewer players left + postflop position = far higher EV', 'The blinds have worse hands when you are on the BTN', 'Card removal'],
        a: 1, why: 'Only 2 players left to beat, and you act last every street — equity realization soars.' },
      { q: 'Best seat at a live table is usually…',
        options: ['Directly LEFT of the loosest splashy player', 'Directly right of the loosest player', 'Across from the dealer', 'Wherever the cards are running hot'],
        a: 0, why: 'You want position ON the money: they act first, you decide with information, isolate their limps, and 3-bet their loose opens.' }
    ]
  },
  {
    id: 'potodds', icon: '⚖️', title: 'Pot odds: the price of the call',
    minutes: 3,
    body: [
      'Every call is a purchase. Pot odds tell you the price: required equity = call ÷ (pot + bet + call). Facing a $50 bet into a $100 pot, you call $50 to win $200 total → 50/200 = 25%. Win more than a quarter of the time and the call prints.',
      'Memorize the holy trinity: half-pot bet → need 25%. Two-thirds pot → 28.5%. Full pot → 33%. That covers most real decisions; the Tools tab computes anything else.',
      'Compare price to equity: a flush draw on the flop is ~35% to get there by the river (Rule of 4: outs × 4). Against a half-pot bet (25% needed) a naked flush draw calls comfortably. Against a pot-size bet plus a raise behind threat? Now implied odds and reverse implied odds decide.',
      'Implied odds = chips you will win LATER when you hit (drawing to nut hands in deep games = great implied odds). Reverse implied odds = chips you lose when you hit and are still second best (dominated draws, weak flushes vs better flushes). Suited connectors love deep stacks; offsuit junk drowns in reverse implied odds.'
    ],
    quiz: [
      { q: 'Villain bets $75 into $100. Minimum equity to call?',
        options: ['~20%', '~30%', '~43%', '~50%'],
        a: 1, why: '75 ÷ (100+75+75) = 75/250 = 30%.' },
      { q: 'You have a gutshot (4 outs) on the flop. Rule-of-thumb chance to hit by the river?',
        options: ['~4%', '~8%', '~16%', '~24%'],
        a: 2, why: 'Rule of 4 on the flop: 4 outs × 4 ≈ 16% (exact: 16.5%).' },
      { q: 'Which draw has the WORST reverse implied odds?',
        options: ['Nut flush draw', 'Open-ender with two overcards', 'Low flush draw (6♦5♦ on a diamond board)', 'Set draw with a small pair'],
        a: 2, why: 'When a low flush hits, bigger flushes get paid BY you. Hitting your hand and losing a stack is the most expensive outcome in poker.' }
    ]
  },
  {
    id: 'mdf', icon: '🛡️', title: 'MDF: stop over-folding',
    minutes: 2,
    body: [
      'Minimum Defense Frequency answers: how much of my range must continue vs a bet so that bluffing me cannot be automatic profit? MDF = pot ÷ (pot + bet). Vs half pot, defend 67% of range. Vs pot, defend 50%.',
      'If you fold more than MDF allows, any two cards profit by betting at you — you become an ATM that dispenses on aggression. Most low-stakes players massively over-fold vs big bets and over-call vs small ones.',
      'MDF is a DEFAULT, not a law. Against the live population that under-bluffs big river bets, deliberately "over-folding" the river is correct — that is an exploit, chosen on purpose, not a leak suffered unknowingly.',
      'Flip it around for offense: when a player folds way more than MDF (the fold-to-cbet machine), every small bet you make with air is immediately profitable. The Live tab player types tell you who these people are.'
    ],
    quiz: [
      { q: 'Villain bets half pot. MDF says you defend…',
        options: ['25% of range', '50% of range', '67% of range', '75% of range'],
        a: 2, why: 'MDF = pot/(pot+bet) = 1/(1+0.5) = 67%. Their bluffs need to work 33% to break even — deny it.' },
      { q: 'A live rec overbets the river. The population read says…',
        options: ['Apply strict MDF — defend 45%+', 'Over-fold one-pair hands: big river bets are massively under-bluffed live', 'Always call with any pair', 'Raise as a bluff'],
        a: 1, why: 'MDF assumes a balanced bettor. Live overbets skew heavily to value — the profitable deviation is folding more than MDF.' }
    ]
  },
  {
    id: 'bluffmath', icon: '🎭', title: 'Bluff math: when lies are profitable',
    minutes: 2,
    body: [
      'A pure bluff needs to work: bet ÷ (bet + pot) of the time. Bluff $100 into $100 → must work 50%. Bluff $50 into $100 → only 33%. Small bluffs need to succeed far less often — which is why small probes at weak ranges print.',
      'Balanced betting ranges mix value and bluffs so the caller is indifferent. On the river with a pot-size bet, the math says about 1/3 of your betting range should be bluffs (2:1 value-to-bluff). Earlier streets allow more bluffs because they still carry equity when called.',
      'Choose bluffs by BLOCKERS and equity: the best bluff candidates block villain\'s calling hands (an ace blocker halves their AA/AK combos — the soul of the A5s 3-bet) and have outs when called (flush draws, straight draws, overcards).',
      'Vs calling stations all of this collapses to one rule: do not bluff people who do not fold. Bluff math assumes folds exist.'
    ],
    quiz: [
      { q: 'You bluff $60 into a $120 pot. It must work at least…',
        options: ['25%', '33%', '50%', '66%'],
        a: 1, why: '60/(60+120) = 33%. If they fold more than a third, instant profit.' },
      { q: 'Why is A5s a famous 3-bet bluff but A5o is not?',
        options: ['A5o has worse high-card strength', 'Suitedness: nut flush potential + wheel draws + the ace blocker make it playable when called; offsuit it is just a bad ace', 'Tradition', 'A5o blocks more hands'],
        a: 1, why: 'Both block AA/AK. A5s actually FLOPS things (nut flushes, wheels). A5o mostly flops regret.' }
    ]
  },
  {
    id: 'blockers', icon: '🧱', title: 'Blockers & combinatorics',
    minutes: 3,
    body: [
      'There are 1,326 starting combos: every pair = 6, every suited hand = 4, every offsuit hand = 12. Hand reading is just counting these and crossing them off.',
      'Cards you hold (or see on the board) REMOVE combos from villain\'s range. You hold an ace → AA drops from 6 combos to 3, AK from 16 to 12. That is a blocker: physical evidence making certain holdings less likely.',
      'Practical magic: on a board of K72, a set of kings is 3 combos while AK is up to 12 — top-pair-top-kicker is four times more common than the set. When the river card pairs the board or completes the flush, recount before you pay off.',
      'Unblockers matter too: bluff-catching with a hand that does NOT block villain\'s missed draws (their most likely bluffs) makes their bluffs more probable and your call better. Combos in, combos out — use the Tools → Combos counter until this is reflex.'
    ],
    quiz: [
      { q: 'You hold A♠K♠ . How many combos of AA remain?',
        options: ['6', '3', '4', '1'],
        a: 1, why: 'One ace gone: C(3,2) = 3 combos of AA left (was 6). Your ace literally blocks half of aces.' },
      { q: 'Board K♥7♦2♣. Villain plays AK and 77 identically. Roughly how do the combo counts compare?',
        options: ['Equal', 'AK 12 vs 77 set 3 — TPTK is ~4x more common', '77 is more likely', 'Cannot be counted'],
        a: 1, why: 'AK offsuit+suited = up to 16 minus the K on board → 12. A set of 7s = 3. Count, don\'t fear.' }
    ]
  },
  {
    id: 'borders', icon: '📏', title: 'Memorize borders, not grids',
    minutes: 2,
    body: [
      'Trying to memorize 169 cells per chart is how studying dies. The pros\' trick: memorize the BORDER of each hand family — the weakest hand that continues. Everything above the border plays automatically.',
      'Example, UTG 9-max: lowest pair 66, lowest suited ace ATs (plus the A5s blocker bluff), lowest suited king KJs, lowest offsuit hand AQo. Five facts ≈ ninety percent of the chart.',
      'EDGE is built around this: every chart in Study shows its border summary, the trainer deliberately serves border-zone hands (where the real decisions live — nobody needs reps folding 72o), and feedback tells you when a hand IS the border.',
      'As stacks, antes, or opponents change, borders shift while the core never does. Learn borders + the logic of WHY they sit there, and you can reconstruct any chart from scratch at the table.'
    ],
    quiz: [
      { q: 'The most efficient way to internalize an opening range:',
        options: ['Stare at the full 13x13 grid nightly', 'Memorize the weakest continuing hand per family (the borders) + drill the border zone', 'Memorize the % number', 'Print charts and bring them to the casino'],
        a: 1, why: 'Borders compress a 169-cell grid into ~6 facts, and border-zone drilling targets the only hands you actually get wrong.' },
      { q: 'A hand sits exactly ON the border of a range. Its EV is…',
        options: ['Strongly positive — raise bigger', 'Approximately zero — close to indifferent between playing and folding', 'Strongly negative', 'Unknowable'],
        a: 1, why: 'Borders ARE the indifference points. That is why border mistakes are cheap and "blunders" (deep misses) are what cost money.' }
    ]
  },
  {
    id: 'spr', icon: '🧮', title: 'SPR & commitment',
    minutes: 2,
    body: [
      'Stack-to-Pot Ratio = effective stack ÷ pot, measured on the flop. It tells you how big a hand you need to happily get all-in. Low SPR (<3): top pair is committed. Medium (4-6): top pair strong kicker plays for stacks with caution. High (>10): you need two pair+ or a monster draw.',
      'This is why 3-bet pots play so differently: $50 in a 2/5 game with $500 stacks → SPR ~5 in a single-raised pot, but ~2 in a 3-bet pot. Same TPTK, completely different decision: at SPR 2 you never fold it; at SPR 10 stacking off with one pair is lighting money on fire.',
      'Plan streets with SPR before acting on the flop: "if I bet here and get raised, am I committed?" Deciding BEFORE the raise arrives is strategy; deciding after is panic.',
      'Implied-odds hands invert the logic: small pairs and suited connectors WANT high SPR (room to win a stack when they bink), and are nearly worthless at low SPR.'
    ],
    quiz: [
      { q: 'Flop SPR is 1.8 and you hold top pair, good kicker. The plan:',
        options: ['Check-fold to pressure', 'Get the money in — you are committed at this SPR', 'Call one street then fold', 'Min-bet for information'],
        a: 1, why: 'Below SPR ~3, one pair is a stack-off by default. Folding committed equity is the bigger error.' },
      { q: 'Which hand most wants a HIGH SPR?',
        options: ['AKo', '55', 'KQo', 'A9o'],
        a: 1, why: 'Small pairs are implied-odds machines: hit a set (~12% per flop), win a deep stack. Low SPR kills the payoff.' }
    ]
  },
  {
    id: 'exploit', icon: '⚔️', title: 'GTO is the shield, exploits are the sword',
    minutes: 2,
    body: [
      'GTO (game-theory optimal) play cannot be beaten — but it also extracts less than the maximum from bad players. Its job is to be your unexploitable DEFAULT, the thing you do against unknowns and tough regs.',
      'Maximum EV against humans comes from deviating ON PURPOSE at their leaks: the station never folds → delete bluffs, value bet brutally thin. The nit folds too much → attack every pot. The maniac barrels air → bluff-catch down light. Every deviation has a name and a trigger.',
      'The danger: every exploit opens YOU up. Bluffing the over-folder means an observant reg can over-call you. Live at low-mid stakes nobody is counter-exploiting carefully — deviate boldly, but know which baseline you left so you can snap back.',
      'EDGE\'s architecture mirrors this: Study/Train = the GTO shield. Live tab player profiling = the sword. Use both.'
    ],
    quiz: [
      { q: 'Versus a pure calling station, the biggest leak you can have is…',
        options: ['Value betting too thin', 'Bluffing — they do not fold, so bluffs are pure donations', 'Playing too tight preflop', 'Slowplaying monsters'],
        a: 1, why: 'Bluff EV comes from folds. No folds, no EV. Meanwhile thin value is printed money.' },
      { q: 'When should you play closest to GTO baselines?',
        options: ['Against the table whale', 'Against unknown or tough, observant opponents', 'When tilted', 'Never — exploits always beat GTO'],
        a: 1, why: 'No read = no exploit target; tough player = deviations get punished. Baseline until the data arrives (about 2 orbits).' }
    ]
  },
  {
    id: 'variance', icon: '🎢', title: 'Variance, bankroll & the long run',
    minutes: 3,
    body: [
      'A good live win rate is 5-10 bb/hour with a standard deviation around 70-100 bb/hour. Read that twice: the NOISE is ten times the SIGNAL. Losing weeks prove nothing; winning weeks prove nothing. Only volume reveals truth.',
      'That is why the Stats tab shows a 95% confidence interval instead of a naked win rate: after 100 hours, "I win $25/hr ± $60/hr" is the honest statement. Most players have never computed it and tilt over noise their own math could have predicted.',
      'Bankroll math: the risk-of-ruin formula says the bankroll needed scales with variance² ÷ win-rate. Practical live guideline: 20-30 buy-ins for your stake, more if your edge is thin or the game is wild. Moving up with 10 buy-ins is not aggression, it is gambling on ruin.',
      'The meta-skill is emotional: variance WILL hand you brutal stretches that mean nothing. The players who survive are the ones whose decisions tonight are unaffected by results last night. Log sessions, review hands, trust the interval — not the feeling.'
    ],
    quiz: [
      { q: 'You won 8 of your last 10 sessions. What does this prove about your edge?',
        options: ['You are a solid winner', 'Almost nothing — 10 sessions is statistical noise at poker variance levels', 'You should move up immediately', 'Your GTO study is complete'],
        a: 1, why: 'With sd ≈ 10x win rate, ten sessions cannot separate skill from luck. The confidence interval in Stats will still straddle zero.' },
      { q: 'Reasonable live cash bankroll guideline:',
        options: ['5 buy-ins', '20-30 buy-ins', '100 buy-ins minimum', 'One buy-in, reload if needed'],
        a: 1, why: '20-30 buy-ins keeps risk of ruin low for a typical live edge. Thin edge or wild games → add more.' }
    ]
  }
];

if (typeof module !== 'undefined') {
  module.exports = { LESSONS: LESSONS };
}
