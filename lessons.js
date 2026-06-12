/* ============================================================
   EDGE — lessons.js  (v3: the full course)
   26 lessons across 5 modules. Built on learning science:
   objectives up front (backward design), first-principles
   explanations (elaboration), checkpoint quizzes (retrieval),
   glossary-linked jargon (cognitive load), and drills + spaced
   review downstream (testing effect + distributed practice).
   ============================================================ */
'use strict';

var COURSE_MODULES = [
  { id: 'm1', title: 'The Game Beneath the Game', sub: 'What poker actually is — before any chart makes sense' },
  { id: 'm2', title: 'Preflop Architecture', sub: 'Why the charts look the way they do' },
  { id: 'm3', title: 'The Math Layer', sub: 'Every number you will ever need at a table' },
  { id: 'm4', title: 'Postflop: After the Charts End', sub: 'Textures, c-bets, barrels, and river truth' },
  { id: 'm5', title: 'The Human Game & The Long Run', sub: 'Exploits, composure, variance, and how to study' }
];

var LESSONS = [

  /* ==================== MODULE 1 ==================== */
  {
    id: 'ev', module: 'm1', icon: '🎲', title: 'Poker is pricing under uncertainty', minutes: 3,
    obj: ['Define expected value (EV) and use it as the only measure of a decision', 'Separate decision quality from outcome quality', 'Understand why winning players think in prices, not predictions'],
    body: [
      'Strip away the felt and the chips and poker is this: a market where you repeatedly price risky assets (hands, draws, bluffs) under incomplete information, against counterparties doing the same thing worse. The unit of account is expected value — EV — the average result of a decision if you could replay it ten thousand times. Every concept in this course is ultimately a tool for computing or estimating EV faster than the person across the table.',
      'EV = sum of (probability of each outcome × payoff of each outcome). You call $50 with a flush draw: 35% of the time you win the $150 out there, 65% you lose your $50. EV = 0.35×150 − 0.65×50 = $20. Positive. The call is correct — and it remains correct even when the river bricks and you lose the pot. The decision was priced right; the outcome was noise.',
      'This is the deepest habit separating professionals from everyone else: they grade themselves on decisions, never results. A trader who books a profit on a reckless position did not make a good trade, and a poker player who wins a hand they misplayed did not play well. Results arrive with so much variance attached that they are nearly useless as feedback on any single hand. EV is the signal; the pot going left or right tonight is the noise.',
      'The corollary: poker is not about winning pots. It is about winning money, which means maximizing EV per decision, which frequently means LOSING the pot — folding the second-best hand is one of the most profitable moves in the game. Amateurs hate folding because folding always "loses." Professionals fold constantly, cheerfully, because the alternative was losing more.',
      'Everything that follows — ranges, position, pot odds, blockers, exploits — is machinery for one task: estimating EV at speed, under pressure, with incomplete data. If you remember one sentence from this entire course: judge every action by its average, not its outcome.'
    ],
    take: ['EV = Σ probability × payoff. It is the only honest scorecard.', 'Good decisions lose sometimes; bad decisions win sometimes. Volume reveals the truth.', 'You are not trying to win pots — you are trying to price them.'],
    quiz: [
      { q: 'You call all-in with 45% equity getting better than even-money pot odds, and lose. The call was…',
        options: ['A mistake — you lost', 'Correct — the price beat the probability; the outcome is irrelevant to the grade', 'Correct only if you had a read', 'Gambling'],
        a: 1, why: 'If the pot offered better than the equity required, the call had positive EV. Replay it forever and it prints. The river card has no opinion about your decision quality.' },
      { q: 'Why do professionals fold so much more than amateurs?',
        options: ['They are risk-averse', 'Folding has EV of exactly zero — which beats every negative-EV continue', 'They wait for aces', 'Table image'],
        a: 1, why: 'A fold never loses another chip. Every losing call or bluff has negative EV. Zero beats negative — most of the money you "save" is money won.' }
    ]
  },
  {
    id: 'ranges', module: 'm1', icon: '🎴', title: 'Think in ranges, not hands', minutes: 3,
    obj: ['Replace "what does he have?" with "what is his distribution?"', 'Narrow a range street by street from actions', 'Understand your own strategy as a range, not a hand'],
    body: [
      'The single biggest conceptual upgrade in poker: stop putting an opponent on A HAND and start putting them on a RANGE — the full set of hands they would play this exact way, weighted by combinations. "I think he has ace-king" is fortune telling. "His 3-bet range here is QQ+, AK, plus A5s-type bluffs — about 40 combos, two-thirds value" is analysis.',
      'Every action filters the range, the way discovery narrows the set of facts still in dispute. A tight player opens UTG: ~12% of hands, maybe 160 combos. He bets the K72 flop: the suited connectors that missed start dropping out. He barrels the turn and river big: by the end you are facing the dense core — strong kings, sets, the occasional drifting AQ. The hand he holds was never knowable; the shape of the distribution was knowable from the first raise.',
      'Your OWN strategy must be built the same way. The charts in Study are not advice about individual hands — each one is a complete portfolio: enough strong hands to get paid, enough bluffs to get action on the strong hands, enough protected checks that you cannot be attacked. Like a balanced book, every position hedges another. Pull one thread — open junk UTG, or never bluff — and the whole construction becomes exploitable.',
      'Range thinking also explains why "tight is right" fails as a strategy. A player who only continues with premiums is perfectly readable: a face-up range. Opponents fold the moment he wakes up and steal everything else. Breadth in a range is not looseness — it is camouflage that gets the monsters paid.',
      'Train it: at every showdown you witness — live or on TV — rewind the action and reconstruct the full range street by street. Not "he had 87s" but "what was the complete set of holdings that plays this line?" Ten minutes of this per session builds hand-reading faster than anything else in the game.'
    ],
    take: ['A range = every hand consistent with the actions taken, weighted by combos.', 'Actions filter ranges street by street — narrow as you go.', 'Your charts are portfolios: value, bluffs, and protection in deliberate ratios.'],
    quiz: [
      { q: 'A nit opens UTG and triple-barrels K72-4-2. Their river bet most likely represents…',
        options: ['Any two cards — people bluff', 'A narrow, value-heavy slice of an already tight range', 'Exactly AK every time', 'A balanced 2:1 value-to-bluff mix'],
        a: 1, why: 'Tight range in, tighter range out: each barrel filters a 12% opening range toward strong made hands — and live populations under-bluff rivers on top of it.' },
      { q: 'Why does a range need bluffs at all?',
        options: ['Bluffing is fun', 'Without bluffs, opponents simply fold to your bets and your strong hands never get paid', 'Bluffs win bigger pots than value', 'To create variance'],
        a: 1, why: 'If you only bet monsters, betting tells the truth every time — and rational opponents stop paying. Bluffs are the price of getting value.' },
      { q: 'A player flat-calls your open preflop. Which holding is LEAST likely in their range?',
        options: ['77', 'KQs', 'AA', 'T9s'],
        a: 2, why: 'AA almost always re-raises — the call "caps" their range. Capped ranges are the ones you can pressure later.' }
    ]
  },
  {
    id: 'position', module: 'm1', icon: '🪑', title: 'Position is money', minutes: 3,
    obj: ['Explain why acting last is a structural edge', 'Connect position to equity realization', 'Use position to set preflop range width'],
    body: [
      'Why does the button open ~43% of hands while UTG opens ~13%? One word: information. Acting last on every postflop street means you see what everyone does before committing a single chip. In a game of incomplete information, moving last is the closest thing to legal insider knowledge — every street, your opponent discloses first.',
      'The mechanism is equity realization. A hand\'s raw equity is its share of the pot if all cards ran out — but you only capture that share by navigating three streets of betting. In position, you over-realize: free cards when you want them, thin value bets when safe, bluffs timed to maximum weakness. Out of position, you under-realize: bet off your equity, forced to guess first, your strong hands win small and your weak ones lose big. The same 87s might realize 110% of its equity on the button and 70% in the blinds. Same asset, different custody.',
      'This is the entire logic of positional range width. UTG faces eight unknown players and a positional deficit against nearly all of them — so the range is value-dense and suited: hands that play well even blind. The button faces two players, both of whom must act first forever — so nearly half the deck becomes profitable. The hand never changes; the seat changes its value.',
      'Two practical corollaries. First, blind-vs-blind and BB defense: the big blind closes preflop action and gets a discount, so it defends wide — but plays carefully after, because it is out of position the whole way. Second, live seat selection: money flows clockwise. Sit to the LEFT of the loose money so it acts before you, and let the tough reg sit to YOUR left where his position advantage targets someone else.',
      'Chess players know this as tempo; litigators know it as getting the last word. Poker just prices it explicitly, every street, in chips.'
    ],
    take: ['Acting last = information advantage = over-realized equity.', 'Range width is a function of seat: 13% UTG → 43% BTN is the same logic, priced.', 'Live: sit left of the money. Position on the whale outearns any single skill.'],
    quiz: [
      { q: 'K9s folds UTG (9-max) but opens on the BTN. The main reason:',
        options: ['K9s flops better in late position', 'Fewer players left to beat + guaranteed postflop position = far higher EV', 'The blinds have worse hands when you are on the BTN', 'Card removal'],
        a: 1, why: 'Two opponents instead of eight, and you act last every street. The hand realizes far more of its equity — enough to flip fold into open.' },
      { q: 'Which hand suffers MOST from being out of position?',
        options: ['AA', 'A medium hand like 98s that relies on maneuvering', 'A pure bluff candidate', '72o'],
        a: 1, why: 'Monsters and trash play themselves. Medium playability hands need the steering wheel — free cards, pot control, well-timed pressure — and OOP takes the wheel away.' }
    ]
  },
  {
    id: 'aggression', module: 'm1', icon: '⚡', title: 'Why aggression wins', minutes: 3,
    obj: ['Name the two ways to win a pot and why betting accesses both', 'Define fold equity and initiative', 'Understand why calling is the weakest action in poker'],
    body: [
      'There are exactly two ways to win a pot: show down the best hand, or make everyone else fold. Betting and raising access BOTH paths; checking and calling access only the first. That asymmetry — two outs versus one — is the entire mathematical case for aggression, and it is why every winning style ever documented is aggressive at its core.',
      'The technical name for the second path is fold equity: the percentage of the time your bet wins immediately, multiplied by the pot. It is real equity, as spendable as a made hand. A flush draw with 35% pot equity that bets and generates 30% folds is not a 35% underdog — it is a favorite, combining two income streams. This is the semi-bluff, the most profitable bet type in poker: heads you fold, tails I improve.',
      'Aggression also buys initiative — the right to keep telling the story. The preflop raiser gets to c-bet; the c-bettor gets to barrel. Each act of aggression forces opponents to answer questions under uncertainty while you set the agenda. Initiative is to poker what tempo is to chess and what framing is to negotiation: the party that defines the question usually wins the exchange.',
      'Now the inverse: calling is the weakest action in the game. A call can never win the pot immediately, never denies equity, caps your range in the eyes of observant players, and commits chips with only one path to victory. Solvers still call plenty — calls have a job, as bluff-catchers and pot control — but the live-poker plague of "call to see what happens" is a slow tax on every player who pays it.',
      'The discipline: aggression must be selective, not constant. The maniac who raises everything is just as readable as the nit who raises nothing. The charts encode the balance — which hands attack, which defend, which surrender. Aggression is the engine; the ranges are the steering.'
    ],
    take: ['Two ways to win; betting accesses both. Fold equity is real money.', 'Semi-bluffs (equity + fold equity) are the best bets in poker.', 'Initiative compounds: the aggressor keeps asking the questions.'],
    quiz: [
      { q: 'A flush draw bets the flop as a semi-bluff. Where does its profit come from?',
        options: ['Only from hitting the flush', 'Only from folds', 'Two streams: immediate folds PLUS the ~35% equity when called', 'Table image'],
        a: 2, why: 'Semi-bluffs are dual-income: fold equity now, pot equity later. Either path can win, which is why solvers bet draws relentlessly.' },
      { q: 'Why is open-limping (just calling the blind first-in) almost always wrong?',
        options: ['It risks too much', 'It forfeits both fold equity and initiative while building no pot for your strong hands', 'It is against the rules', 'It works only in tournaments'],
        a: 1, why: 'A limp can\'t win the pot now, invites multiway chaos, and announces weakness. Raise-or-fold captures everything a limp gives away.' }
    ]
  },
  {
    id: 'language', module: 'm1', icon: '🗣️', title: 'The language of the table', minutes: 2,
    obj: ['Decode the core vocabulary: RFI, 3-bet, IP/OOP, VPIP/PFR', 'Know every seat name and the action order', 'Never lose an explanation to jargon again'],
    body: [
      'Poker has a compressed professional dialect, and most training material refuses to translate it. This lesson is the translation layer — and everything here lives permanently in the Glossary tab (tap any highlighted term anywhere in this course for an instant definition).',
      'The seats, in preflop action order at a full 9-handed table: UTG ("under the gun" — first to act, tightest range), then UTG+1, MP, the lojack, the hijack, the cutoff, the button (the dealer — acts last postflop, the most profitable seat in poker), then the small blind and big blind, who post forced bets and act last preflop but first on every later street.',
      'The raise tree has numbered names. The blind posts count as the first bet; an open-raise or RFI (raise first in) is the second; so the first re-raise is a 3-bet, the next a 4-bet, then a 5-bet (usually all-in at 100bb). "Folded to you" or "unopened pot" means nobody has entered yet — that is RFI territory, the simplest and most-studied decision in the game, and where your training starts.',
      'Player-tracking shorthand: VPIP is the percentage of hands someone voluntarily plays; PFR is how often they raise. A 22/18 is a solid reg; a 45/8 is a calling station; a 50/40 is a maniac. EDGE\'s Live tab computes these per opponent with one tap per hand — two orbits of data and the numbers start talking.',
      'And the one term this app leans on constantly: mixed. When a chart cell is gold, the solver plays that hand BOTH ways at some frequency — raise sometimes, fold sometimes — because at that exact spot the EVs of both actions are nearly identical (the indifference point). Practical translation: with a mixed hand, either choice is fine, and worrying about which is the cheapest worry in poker. Borders and mixed cells are where ranges are decided; everything else is automatic.'
    ],
    take: ['RFI = first raise into an unopened pot. The numbered tree: open → 3-bet → 4-bet → 5-bet.', 'Mixed (gold cells) = both actions have ~equal EV. Either is correct.', 'VPIP/PFR is the two-number fingerprint of every opponent.'],
    quiz: [
      { q: 'Why is a re-raise called a "3-bet" when it is only the second raise?',
        options: ['Tradition with no logic', 'The forced blind counts as the first bet, the open as the second', 'It refers to three players', 'Because it is usually 3x the open'],
        a: 1, why: 'Blind = bet #1, open-raise = bet #2, first re-raise = bet #3. The numbering counts bets, not raises.' },
      { q: 'A chart shows A9s as a gold ("mixed") cell for a UTG open. You raise it every time. How big is this "error"?',
        options: ['Severe — mixed means fold', 'Nearly zero — at the indifference point both actions have almost identical EV', 'Moderate', 'It depends on your table image only'],
        a: 1, why: 'Mixing exists because the EVs are equal at equilibrium. Picking one action consistently costs almost nothing — especially live, where nobody is tracking your frequencies.' }
    ]
  },

  /* ==================== MODULE 2 ==================== */
  {
    id: 'rangecraft', module: 'm2', icon: '🏗️', title: 'How ranges are built (and why "mixed" exists)', minutes: 4,
    obj: ['Name the three reasons a hand enters a range: equity, playability, blockers', 'Explain mixed frequencies via indifference', 'Read any chart as an engineered object, not a list to memorize'],
    body: [
      'A solver builds a range the way an engineer builds a portfolio — every hand earns its slot through one of three properties. Raw equity: pairs and big cards that simply win showdowns (AA, AK, QQ). Playability: hands that convert well postflop — suited, connected, capable of making nuts (87s, JTs, A5s\'s flush half). Blockers: hands whose cards reduce the opponent\'s strongest combos (any ace halves their AA). Most hands in a range score on two or three axes at once; most hands outside a range fail all three.',
      'This explains every "weird" chart decision that confuses beginners. Why does A5s open UTG while the higher-equity A9o folds? A9o has naked equity and nothing else — dominated when called, no flush, kicker trouble forever. A5s has the nut flush, wheel straights, and an ace blocker: worse cards, better asset. Why does 76s appear where KJo doesn\'t? Domination risk: KJo makes pretty pairs that lose big pots to AJ/KQ, while 76s makes disguised hands that WIN big pots. Charts are not ranked lists of "good hands" — they are portfolios optimized for what happens after the flop.',
      'Now the concept this app highlights in gold: mixed frequencies. At equilibrium, the borderline hands reach an indifference point — raising A9s from UTG earns almost exactly as much as folding it. When two actions tie, the solver splits frequencies (open 40%, fold 60%) partly because the tie is real and partly to stay unpredictable across the population of all hands. The practical takeaway is liberating: gold cells are spots where YOU CANNOT MEANINGFULLY ERR. Pick raise, pick fold, flip a mental coin — the EV difference is pennies. Save your precision for the borders that matter.',
      'Ranges also need internal balance to survive contact with thinking opponents. A 3-bet range of only QQ+/AK is face-up: opponents fold everything but monsters and your premiums earn nothing. So solvers weave in bluffs — and choose them by blocker logic and playability (A5s again), not by "feeling frisky." Value defines the size of the bluff quota; bluffs make the value get paid. Every chart you study is this same dance at different ratios.',
      'Read charts like an engineer reviewing someone else\'s design: for each region, ask WHICH property earned the slot — equity, playability, or blockers? Within a week the charts stop being images to memorize and become consequences you could re-derive. That is the difference between knowing a rule and owning it.'
    ],
    take: ['Three entry tickets to a range: equity, playability, blockers.', 'Mixed (gold) = indifference: both actions tie in EV. Unstressable.', 'Bluffs exist to fund value. Value sets the bluff quota.'],
    quiz: [
      { q: 'Why does A5s open in spots where A9o folds, despite A9o\'s higher raw equity?',
        options: ['Solvers make errors', 'A5s scores on playability (nut flush, wheel) and blockers; A9o has only dominated equity', 'Five is a lucky card', 'A9o blocks too much'],
        a: 1, why: 'A9o\'s equity is real but unrealizable: dominated when called, no nut potential. A5s converts its slot into nut hands and 3-bet bluff material.' },
      { q: 'A solver opens 55 from the hijack 70% and folds it 30%. The deepest reason for the split:',
        options: ['Randomness for its own sake', 'At equilibrium 55 sits at an indifference point — open and fold have nearly equal EV', 'The solver is uncertain', '55 is a bad hand'],
        a: 1, why: 'Mixing emerges where EVs tie. Frequencies keep the overall strategy balanced, but for any single decision the cost of picking either action is ~zero.' },
      { q: 'If you removed every bluff from your 3-bet range, what happens over time vs observant players?',
        options: ['You win more — fewer risks', 'Your 3-bets stop getting action: opponents correctly fold everything short of premiums, and your QQ+/AK earn far less', 'Nothing changes', 'Your variance rises'],
        a: 1, why: 'An honest range is a readable range. The bluffs are what force opponents to pay off the value — remove them and the value starves.' }
    ]
  },
  {
    id: 'rfilogic', module: 'm2', icon: '📤', title: 'RFI: the architecture of opening', minutes: 3,
    obj: ['Derive why open ranges widen monotonically by position', 'Apply the border-hand method to compress chart memorization', 'Choose sizings for online-style vs live games'],
    body: [
      'RFI — raise first in — is the most common decision in poker and the easiest to perfect, because it has the fewest variables: the pot is unopened, so the only inputs are your cards, your seat, and the players left behind. Master RFI and roughly a third of all your in-game decisions become automatic, freeing attention for the streets that actually require thought.',
      'The structure is one clean gradient: ranges widen monotonically from UTG (~13%) to the button (~43%) and small blind (~45%). Two forces drive it, both shrinking as you move later: the number of players who can wake up with a monster behind you (eight at UTG, two on the button), and the probability of playing the hand out of position (near-certain from UTG, zero from the button). Each seat to the left removes risk on both axes, and the range expands to fill the space.',
      'Do not memorize 169 cells per seat — memorize BORDERS. Every chart in Study auto-generates its border summary: the weakest pair, the weakest suited ace, the weakest offsuit broadway that still opens. Six facts per position cover ~90% of the grid, and everything above a border plays automatically. This is the compression trick every professional uses, and it is why EDGE\'s drills deliberately serve border-zone hands — reps on 72o and AA teach nothing; reps at the cut lines build the actual skill.',
      'Sizing: online-derived charts assume 2.2-2.5x opens. Live poker is a different economy — players call regardless of size, so the standard open is 3-5x (and bigger over limpers: 4-5bb plus one per limper). When opponents\' calling ranges are inelastic, you simply charge more — the live adjustment is to shade your range slightly toward value and let the loose callers pay the markup. Same architecture, higher prices.',
      'Last principle: when a chart feels "too loose" — K5s on the button! — remember what the open is buying: three ways to win (best hand, c-bet take-down, blind steal) against the two weakest ranges at the table. The button open is less a bet on your cards than a tax you levy on the blinds for sitting there. Collect it.'
    ],
    take: ['RFI widens UTG→BTN because risk-behind and OOP-probability both shrink.', 'Memorize borders (~6 facts/seat), not grids (169 cells).', 'Live: open 3-5x; the field calls anyway — charge accordingly.'],
    quiz: [
      { q: 'The fundamental reason BTN opens ~43% while UTG opens ~13%:',
        options: ['Button cards run hotter', 'Two opponents instead of eight, and guaranteed position postflop', 'Tradition', 'Blinds must fold more vs the button'],
        a: 1, why: 'Fewer chances someone holds a monster, plus structural position forever after. Both risks shrink; the range expands to fill the space.' },
      { q: 'Your live 2/5 game has three limpers. Best default with a strong opening hand?',
        options: ['Limp along to be safe', 'Raise to ~4-5bb plus 1bb per limper — size up for the inelastic callers', 'Min-raise', 'Fold everything but AA'],
        a: 1, why: 'Limpers under-fold to raises, so you iso big for value: build the pot, thin the field, take initiative — and let their calling habit fund you.' }
    ]
  },
  {
    id: 'defending', module: 'm2', icon: '🛡️', title: 'Facing an open: call, 3-bet, or fold', minutes: 4,
    obj: ['Choose between flatting and 3-betting on principled grounds', 'Understand the BB discount and why it defends widest', 'Distinguish linear vs polarized 3-bet construction'],
    body: [
      'Someone opens in front of you. Three doors: fold (the default — most hands), call (keep his range wide, see a cheap flop), or 3-bet (attack his range now). The skill is knowing which property of YOUR hand and HIS range picks the door.',
      'Calling wants hands that flop well multiway and profit from a wide pot: pairs hunting sets, suited broadways, the best suited connectors — and it wants POSITION, because a cold-call signs you up for postflop play with a capped range. This is why the small blind almost never flats: out of position against the opener, with the BB still lurking behind for a squeeze, a call from the SB combines every disadvantage in the game. From the SB it is 3-bet or fold.',
      'The big blind is the great exception, for a purely economic reason: the discount. You already posted a blind, so facing a 2.5x open you call 1.5 more to see a pot of ~5.5 — better than 3.5:1 on the call. Solver BB defense is shockingly wide (40%+ vs late opens) not from courage but from price. The check on that width: you play the whole hand out of position, so the weak end of the defend range is suited and connected junk that can flop equity, never offsuit trash that flops kicker problems.',
      '3-betting splits into two architectures by who it targets. LINEAR (merged): your 3-bet range is simply the best hands top-down — TT+, AQ+, suited broadways. Use it against opens that will CALL too much (live players, stations): every hand in the range out-flops their calling range, and bluff slots would be wasted. POLARIZED: premiums plus low-equity blocker bluffs (A5s-A2s), nothing in between — the middle hands flat instead. Use it against opponents who FOLD properly to 3-bets: the bluffs print when they fold, the premiums stack them when they don\'t, and the suited-wheel-ace bluffs retain nut potential when called. Identify which world your table lives in — most live games are the first one, which means: 3-bet bigger, value-heavier, and skip the fancy bluffs.',
      'One number to carry: facing a 3x live open with the field behind, a hand needs clear purpose to continue — set-mine odds (15-20x effective stacks for pairs), domination-free playability, or 3-bet value. "It\'s suited" is a reason to fold slightly less often, not a plan.'
    ],
    take: ['Call = position + playability + price. SB: 3-bet or fold. BB: widest, due to the discount.', 'Linear 3-bets attack callers; polarized 3-bets attack folders.', 'Live default: value-heavy linear 3-bets, sized up.'],
    quiz: [
      { q: 'Why does the SB play 3-bet-or-fold while the BB flats wide?',
        options: ['SB cards are worse', 'SB has the worst seat (OOP + a player still behind) and no discount worth defending; BB closes action with a discounted price', 'Tradition', 'BB always has position'],
        a: 1, why: 'The BB call closes preflop action at ~3.5:1; the SB call invites a squeeze and plays OOP against two ranges. Structure, not style.' },
      { q: 'Your opponent folds correctly to 3-bets. Your 3-bet range should become…',
        options: ['Pure premiums', 'Polarized: premiums + suited wheel-ace bluffs, flatting the middle', 'Wider calls instead', 'Linear top-down'],
        a: 1, why: 'Against a folder, bluffs print and middling hands prefer to flat (they hate facing a 4-bet). Polarity extracts the maximum from his discipline.' },
      { q: 'Against a live player who calls 3-bets with any pair and any suited hand, the A4s 3-bet bluff is…',
        options: ['Mandatory for balance', 'A leak — he does not fold, so 3-bet linear value instead and make the bluff slots into value hands', 'Better as a 4-bet', 'Fine if the table is watching'],
        a: 1, why: 'Bluffs need folds. When the fold button is broken, every "bluff combo" converts to a value combo: 3-bet TT/AJs instead of A4s.' }
    ]
  },
  {
    id: 'limping', module: 'm2', icon: '\ud83d\udc0c', title: 'Limping: when calling first-in is right', minutes: 3,
    obj: ['Know the one spot where open-limping is theoretically sound (the SB)', 'Over-limp correctly behind limpers', 'Punish limpers instead of joining them'],
    body: [
      'Everything this course says about aggression is true \u2014 and yet solvers LIMP. The reconciliation: limping is wrong where a raise wins dead money and initiative cheaply (any unopened pot with players behind), and right where those rewards shrink. There are exactly two legitimate limps, and both have charts in this app.',
      'Limp #1 \u2014 the small blind, folded to you. You are guaranteed to play out of position with a forced half-bet already invested, against exactly one opponent. Raising your whole playable range here just builds a pot you must navigate blind-first; so modern strategy SPLITS: raise a value-lean range (the 3x range in the SB limp chart), and LIMP a wide band of playable hands \u2014 small pairs, suited junk with nut potential, weak aces, connected cards. You see flops at half price; the BB rarely punishes correctly. If they DO start attacking your limps relentlessly, limp-reraise traps (mix AA/KK into the limp) restore the balance instantly.',
      'Limp #2 \u2014 over-limping behind limpers. Once one or more players limp, a raise no longer takes the pot down often (limpers under-fold), so speculative hands that crave cheap multiway flops \u2014 small pairs, suited connectors, weak suited aces \u2014 happily complete behind. The over-limp keeps the pot small, the implied odds enormous, and your range disguised. The hands that should NEVER over-limp are offsuit broadways: they make dominated second-best hands in exactly the multiway pots you just signed up for. Iso-raise or fold those.',
      'What stays forbidden: open-limping FIRST from any non-SB seat. It forfeits fold equity, caps your range publicly, invites the blinds in free, and wins nothing when everyone misses. If a hand is not worth raising from your seat, it is not worth playing \u2014 the chart already made that call. And when OTHERS limp into you holding a real hand: attack, big. The vs Limpers charts are the most profitable charts in live poker for a reason.'
    ],
    take: ['SB folded-to-you: split raise (value) / limp (playability). The only theoretically-sound open-limp.', 'Over-limp speculative hands behind limpers; never offsuit broadways.', 'Everywhere else first-in: raise or fold \u2014 limping first caps you for no reward.'],
    quiz: [
      { q: 'Why is the small blind the one seat where open-limping is solver-approved?',
        options: ['Tradition', 'Half the bet is already posted, only one player remains, and you are OOP forever \u2014 the raise reward shrinks while cheap playability gains', 'SB hands are stronger', 'The BB cannot raise a limp'],
        a: 1, why: 'Discounted price + single opponent + permanent positional disadvantage flips the raise/limp math that applies everywhere else.' },
      { q: 'Two players limp; you hold KJo on the button. Best default?',
        options: ['Over-limp \u2014 see a cheap flop', 'Iso-raise big or fold: offsuit broadways make dominated hands in multiway pots, the over-limp\u2019s worst nightmare', 'Always fold', 'Min-raise'],
        a: 1, why: 'KJo wants folds or a heads-up pot with initiative. Over-limping it into a family pot manufactures kicker problems \u2014 iso to 5bb+ or let it go.' }
    ]
  },
  {
    id: 'threebetwars', module: 'm2', icon: '⚔️', title: '3-bet pots and the blocker wars', minutes: 3,
    obj: ['Defend correctly against 3-bets in and out of position', 'Build 4-bet ranges around blockers', 'Adjust the whole tree for live under-bluffed 3-bets'],
    body: [
      'You open, someone 3-bets. First instinct to install: this is not an emergency, it is a price change. Your open was built for a 2.5x world; the 3-bet re-prices the pot, and your range simply re-sorts into four buckets: continue-for-value (4-bet), continue-by-calling, fold, and a thin mixed layer in between. The charts in Study encode the sort — the lesson here is the logic underneath.',
      'Position decides the calling bucket\'s width. In position against a blind\'s 3-bet you defend wide — pairs, suited broadways, good connectors — because you will out-realize equity all hand. Out of position (you open CO, button 3-bets) the same hands bleed: you fold more, 4-bet a bit more, and flat only the hands that can stand pressure without initiative. The asymmetry is pure equity realization, the position lesson wearing battle armor.',
      'The 4-bet range is where blocker logic becomes visible. Value is obvious: QQ+/AK-region hands that welcome stacks. The bluff slots go almost exclusively to suited wheel aces (A5s/A4s) — and the reason is precise. The ace blocks AA and AK, the only hands that continue comfortably against a 4-bet, cutting villain\'s premium combos by nearly half; and when the bluff gets called, the hand still makes nut flushes and wheels. High-impact when it folds, alive when it doesn\'t. That is the complete anatomy of a modern bluff: block their continues, keep your outs.',
      'Versus a 4-bet after you 3-bet: the baseline says continue with QQ+/AK (mixing AKo, calling JJ/AQs sometimes) and release the rest — your 3-bet bluffs did their job and now retire. The deeper note: 5-bet shoves are nearly pure KK+/A5s-jam territory at 100bb, which means YOUR response to 4-bets should be unsentimental. Queens go from "ship it" online to "proceed carefully" against a live 65-year-old\'s third raise.',
      'And that is the standing live adjustment for this entire tree: population 3-bets and especially 4-bets are massively value-weighted. Until an opponent shows you a bluff personally, treat their re-raises as honest: over-fold the marginal continues, stop "defending your range" against people who are not attacking it. Balance is for opponents who are watching; most aren\'t.'
    ],
    take: ['A 3-bet is a re-price: re-sort into 4-bet / call / fold buckets.', '4-bet bluffs = suited wheel aces: block AA/AK, keep nut outs.', 'Live re-raises are honest: over-fold until shown otherwise.'],
    quiz: [
      { q: 'Why is A5s the canonical 4-bet bluff rather than KQs?',
        options: ['A5s has more raw equity', 'The ace blocks AA/AK (their main continues) and the hand keeps nut-flush/wheel outs when called; KQs blocks little and is often dominated when action continues', 'Tradition', 'KQs is too strong to bluff'],
        a: 1, why: 'Bluff selection = block their calls, keep your outs. A5s does both better than any other non-premium.' },
      { q: 'A tight live reg 4-bets your 3-bet for the first time in four hours. Your QQ should usually…',
        options: ['Jam — never fold queens', 'Fold or flat conservatively — population 4-bets are value-heavy, and this one screams KK+/AK', 'Min-5-bet', 'Call planning to fold every flop'],
        a: 1, why: 'GTO charts assume balanced 4-bettors. A four-hour nit\'s first 4-bet is not balanced. Exploit means folding hands the chart continues.' }
    ]
  },
  {
    id: 'shortstack', module: 'm2', icon: '📉', title: 'Short stacks: push/fold and why it works', minutes: 3,
    obj: ['Explain why open-shoving becomes optimal at short depth', 'Read push/fold charts as risk/reward equations', 'Recognize ICM\'s tightening pressure in tournaments'],
    body: [
      'Below roughly 15 big blinds, poker undergoes a phase change: the elegant multi-street game collapses into a one-decision game, and the math gets cleaner the shorter you are. Push/fold is not a style choice — it is what optimal play converges to when stacks can no longer fund postflop maneuvering.',
      'The logic of the open-shove: with 10bb, a normal 2.2x raise commits a quarter of your stack, leaving you priced in to bad flops with no fold equity left behind. Shoving instead does three jobs at once — maximizes immediate fold equity (the blinds need real hands to call off), eliminates every postflop mistake you could make out of position, and converts your equity-when-called at full freight. The shove is unexploitable in the purest sense: against a Nash shoving range, no calling strategy profits. That is why these are the only truly "solved" charts in poker.',
      'Reading the charts: shove ranges widen with later position (fewer callers possible) and with shallower stacks (fold equity matters more relative to the risk). At 5bb the small blind jams essentially any two cards — not bravado, arithmetic: the blinds you pick up are a huge fraction of your stack and the caller needs a real hand. At 15bb early position, the jam narrows toward 77+/AJs because eight players and a real stack mean real risk. Every cell is the same equation: fold equity × pot now, versus equity-when-called × stacks.',
      'Tournament overlay: ICM. In a tournament, chips are not money — busting forfeits all future pay jumps, so chips you might LOSE are worth more than chips you might WIN. Practical effect: CALLING ranges tighten dramatically near bubbles and final tables (you need clearly the best of it to risk elimination), while SHOVING ranges — especially as a big stack attacking medium stacks who can\'t afford the call — widen viciously. The big stack at a bubble is running a protection racket; the medium stacks have to pay.',
      'Cash-game note: you will rarely be this short in a live cash game by choice, but straddled pots and topped-off-short players create the same geometry. When effective stacks compress, simplify with them — the fancy play sleeps below 15bb.'
    ],
    take: ['Short stacks collapse poker into one clean decision; Nash shoves are unexploitable.', 'Shove ranges widen with later position and shorter stacks.', 'ICM: tighten calls near pay jumps; big stacks attack.'],
    quiz: [
      { q: 'Why shove 10bb instead of min-raising?',
        options: ['It looks stronger', 'A raise commits you anyway with no fold equity left; the jam maximizes folds, kills your postflop-error surface, and gets full value from your equity', 'Min-raising is illegal short', 'To gamble'],
        a: 1, why: 'At 10bb, raise-then-fold burns the stack and raise-then-call does the same as jamming with extra steps and extra mistakes. The shove is the whole tree, optimized.' },
      { q: 'On a tournament bubble, a medium stack facing a big-stack shove should call…',
        options: ['With the same range as a cash game', 'Tighter than chip-EV — busting costs future pay jumps, so the chips you would lose are worth more than the chips you would win', 'Wider — pressure demands defiance', 'Never'],
        a: 1, why: 'ICM asymmetry: survival has cash value. The big stack knows it, which is exactly why he is shoving into you every hand.' }
    ]
  },

  /* ==================== MODULE 3 ==================== */
  {
    id: 'equity', module: 'm3', icon: '📐', title: 'Equity, outs, and the Rule of 2 & 4', minutes: 3,
    obj: ['Count outs cleanly and convert them to equity at speed', 'Know the big preflop matchup numbers cold', 'Discount dirty outs like a professional'],
    body: [
      'Equity is your share of the pot if the hand were checked down from here — the probability-weighted fraction that is already "yours." Every betting decision is a comparison between equity (what your hand is worth) and price (what the action costs). This lesson installs the conversion tables; the Tools tab\'s Monte Carlo calculator verifies anything you ever doubt.',
      'Outs are the cards that improve you to the (probable) best hand. Count them honestly: flush draw = 9, open-ended straight draw = 8, gutshot = 4, two overcards = 6, pair-to-set = 2. Then the Rule of 2 & 4: with two cards to come (on the flop, facing an all-in), equity ≈ outs × 4; with one card to come, outs × 2. Nine-out flush draw on the flop ≈ 36% (true: 35%). Eight-out OESD on the turn ≈ 16% (true: 17.4%). The rule errs by a point or two at the extremes — at the table, that precision is free money versus guessing.',
      'The preflop matchups worth knowing cold, because they price every all-in you will ever face: overpair vs underpair ≈ 80/20. Pair vs two overcards (the classic flip) ≈ 52/48 — yes, QQ vs AK is nearly a coin toss, which should recalibrate how "ahead" feels. Pair vs one overcard (AQ vs KK-style: dominated) — the dominating pair is ~70/30. Two live overcards vs two undercards ≈ 63/37. Dominated same-high-card hands (AK vs AQ) ≈ 73/27. Six numbers, 90% of all-in situations priced.',
      'Professional refinement: discount dirty outs. Your flush draw has 9 outs — unless the board is paired and one flush card fills villain\'s full house, or your "winning" pair-outs make him a better two pair. A naive 9 can be a true 6, and the difference flips many calls. Ask not "what improves my hand" but "what improves my hand TO THE WINNER."',
      'Equity is necessary, never sufficient: 35% with position, initiative, and fold equity is a monster; the same 35% out of position facing a jam is exactly 35%. The next lessons price that difference — pot odds tells you what equity you NEED; this lesson told you what you HAVE.'
    ],
    take: ['Rule of 2 & 4: outs × 4 (two cards to come), × 2 (one card).', 'Flips are real: QQ vs AK ≈ 52/48. Domination ≈ 70/30. Overpair ≈ 80/20.', 'Discount outs that improve you to second place.'],
    quiz: [
      { q: 'Flush draw + gutshot (12 clean outs) on the flop, facing an all-in. Your equity is roughly…',
        options: ['~24%', '~36%', '~48%', '~60%'],
        a: 2, why: 'Two cards to come: 12 × 4 = 48% (true value ~45%). A monster draw is often the equity favorite against one pair.' },
      { q: 'QQ vs AKs all-in preflop is approximately…',
        options: ['80/20 for QQ', '52/48 — a near coin-flip', '65/35 for QQ', '60/40 for AK'],
        a: 1, why: 'The famous flip. Six outs twice plus backdoors brings AK to ~46-48%. "Ahead" preflop is thinner than it feels.' }
    ]
  },
  {
    id: 'potodds', module: 'm3', icon: '⚖️', title: 'Pot odds & implied odds: the price of the call', minutes: 3,
    obj: ['Compute required equity for any bet size instantly', 'Use implied and reverse-implied odds to adjust raw prices', 'Memorize the three anchor prices'],
    body: [
      'Every call is a purchase, and pot odds is the sticker price: required equity = call ÷ (pot + bet + call) — what you pay over what the pot becomes. Villain bets $50 into $100: you call 50 to win a final pot of 200, so you need 50/200 = 25%. Clear that with your Rule-of-2&4 equity and the call prints; miss it and you are donating, however pretty the draw.',
      'Three anchors cover most of real poker: half-pot bet → 25% needed; two-thirds pot → 28.5%; full pot → 33%. Notice how flat the curve is — even a full-pot bet only demands a third. This is why naked flush draws (35%) almost never fold-out correctly on the flop and why "I had to fold, he bet big" is usually an arithmetic error, not discipline.',
      'Implied odds extend the price into the future: chips you will win LATER when you hit complete the call that the current pot alone cannot justify. The cleanest case is set mining — a small pair flops a set ~12% of the time (7.5:1 against), so a preflop call needs roughly 15-20x the call sitting in the effective stacks to pay off the misses. Implied odds scale with three things: how hidden your draw is, how strong villain\'s range is (strong hands pay off), and how deep the money is. A set is the perfect implied-odds asset: invisible and lethal.',
      'Reverse implied odds is the same telescope pointed backward: hands that lose EXTRA when they "hit." A 6-high flush draw can make its flush and lose the stack to a 9-high flush; KJo can spike a king and be drawing dead to AK\'s kicker. This is the hidden tax that makes dominated hands and low flushes fold preflop despite decent raw equity — their winning card is sometimes the most expensive card in the deck.',
      'The complete call checklist, in order: price (pot odds now), improvement (Rule of 2&4), future (implied minus reverse-implied), and position (IP realizes more of all of it). Four questions, five seconds, every call in poker.'
    ],
    take: ['Required equity = call ÷ (pot + bet + call). Anchors: 25 / 28.5 / 33%.', 'Set mining needs ~15-20x effective stacks behind.', 'Reverse implied odds: beware hands that hit and still lose.'],
    quiz: [
      { q: 'Villain bets $75 into $100. Minimum equity to call?',
        options: ['~20%', '~30%', '~43%', '~50%'],
        a: 1, why: '75 ÷ (100+75+75) = 75/250 = 30%. Even a three-quarter-pot bet asks less than a third.' },
      { q: '55 faces a $20 raise. Effective stacks are $150. The set-mine call is…',
        options: ['Automatic — pairs always call', 'Marginal-to-bad: ~7.5x behind when the guideline wants 15-20x to fund the 7.5:1 flop odds', 'Great — sets win big', 'Only right multiway'],
        a: 1, why: 'You hit 1-in-8.5; the wins must cover the misses. $150 behind a $20 call cannot, even when the set gets paid in full.' },
      { q: 'Which holding suffers the WORST reverse implied odds?',
        options: ['Nut flush draw', '6♦5♦ flush draw on a diamond board', 'An open-ender to the nuts', 'Pocket aces'],
        a: 1, why: 'Low flushes are payoff machines for higher flushes: the hand "hits" and then loses the maximum. Nut draws never face that bill.' }
    ]
  },
  {
    id: 'mdf', module: 'm3', icon: '🧮', title: 'MDF & alpha: the defense equation', minutes: 3,
    obj: ['Compute MDF and alpha for any sizing', 'Know when to honor MDF and when to deliberately violate it', 'Use the bettor/defender symmetry to build balanced rivers'],
    body: [
      'Two formulas, one equation, both sides of every bet. ALPHA — the bluffer\'s hurdle: a bluff must work bet ÷ (bet + pot) of the time to break even. MDF — the defender\'s duty: continue with pot ÷ (pot + bet) of your range so that bluffing you is not automatic profit. They sum to one because they ARE one fact: a half-pot bluff needs 33% folds, so the defender supplies at most 33% folds by continuing 67%. Burn the symmetry in and you can derive either side at the table.',
      'The anchor values: vs half pot defend 67% (bluff needs 33%); vs two-thirds defend 60% (40%); vs pot defend 50% (50%); vs 1.5x overbet defend 40% (60%). Note what this says about sizing: bigger bluffs need to work more often but get paid more when they do — and force the defender to continue with hands that hate it.',
      'MDF is a shield against EXPLOITATION, not a law of nature — and knowing when to drop the shield is the entire art. MDF assumes your opponent bluffs at balanced frequencies. Against the live population\'s big river bets — which run massively value-heavy — strict MDF defense is lighting money on fire. The correct play is deliberate, smiling over-fold: you are not "exploitable" in any way that matters, because nobody at a 2/5 table is attacking your folding frequency with balanced bluffs. Honor MDF against strong, aggressive thinkers; abandon it against the honest.',
      'Flip to offense and alpha becomes a weapon-sight: a half-pot bluff needs one fold in three. Against the fit-or-fold masses who miss two flops out of three, small c-bet bluffs clear their hurdle constantly — this single arithmetic fact funds half of modern poker\'s aggression. Against a calling station, alpha reads "your bluff must work 33%" while reality reads "he folds 4%" — and the bluff deletes itself from your game.',
      'Last layer, river construction: a balanced pot-size river bet wants value:bluff at 2:1 (the caller\'s 33% pot-odds equity exactly breaks even against one-third bluffs). Bigger sizing carries more bluffs; smaller carries fewer. You will rarely build these ratios live — but knowing the blueprint tells you instantly how far any opponent has strayed from it, and which direction the money leaks.'
    ],
    take: ['Alpha = bet/(bet+pot); MDF = pot/(pot+bet); they sum to 1.', 'Honor MDF vs balanced killers; gleefully over-fold vs honest populations.', 'Balanced pot-size river = 2:1 value:bluff.'],
    quiz: [
      { q: 'Villain bets half pot. MDF says defend…',
        options: ['25%', '50%', '67%', '75%'],
        a: 2, why: 'MDF = pot/(pot+bet) = 1/1.5 = 67%. His bluffs need a third; deny him more than that — against balanced opponents.' },
      { q: 'A passive live player overbets the river. MDF says defend 40%. You should…',
        options: ['Defend exactly 40% — never be exploitable', 'Over-fold far below MDF: population overbets are value-heavy, and theory-shields are for theoretical attackers', 'Call wider for information', 'Raise as a bluff'],
        a: 1, why: 'MDF protects against balanced bluffing that this player is not doing. The profitable "imbalance" is folding — exploitation is the point of reads.' },
      { q: 'Your half-pot river bluff needs to work…',
        options: ['50% of the time', '33% — and vs fit-or-fold players it clears that bar easily', '25%', '67%'],
        a: 1, why: 'Alpha = 0.5/(0.5+1) = 33%. People miss most flops and fold most misses; small bluffs are structurally profitable against the unexamined.' }
    ]
  },
  {
    id: 'blockers', module: 'm3', icon: '🧱', title: 'Combinatorics: counting your way to reads', minutes: 3,
    obj: ['Count combos for any hand class with and without dead cards', 'Use blockers and unblockers in real decisions', 'Replace fear with arithmetic on scary boards'],
    body: [
      'There are 1,326 two-card combinations; every pair is 6, every suited hand 4, every offsuit hand 12. Hand reading — the mystic skill of "putting someone on a hand" — is nothing but counting these and crossing off what the visible cards forbid. It is bookkeeping wearing a magician\'s cape.',
      'Dead cards shrink the book. You hold an ace: villain\'s AA drops from 6 combos to 3, his AK from 16 to 12. The board pairs a king: KK drops to 1 combo. This is blocker logic in its raw form — your cards are evidence about his cards, and the evidence compounds. The Tools tab\'s combo counter does this mechanically; this lesson is about doing it in your head, where it changes decisions.',
      'The classic application, the one that pays for the lesson: board K♥7♦2♣, you hold QQ, the UTG opener bets hard. Fear says "set of kings." Arithmetic says: AK = 12 combos, KK = 3 (the board king killed half of them... precisely, 3 remain of 6). Top-pair-top-kicker outnumbers the set FOUR to one within his value region — and your queens beat none of it, which is the real lesson: combos tell you what the betting range IS; your equity against it is a separate question. Count first, then compare.',
      'Unblockers — the elegant second-order tool: when bluff-catching, you want to NOT hold the cards his bluffs contain. River comes on a board where every missed draw was a heart draw; your hand with zero hearts means all his missed-heart bluffs still exist — your call gains equity from what you DON\'T hold. Conversely, holding the ace of the flush-draw suit when considering your own bluff is gold: it blocks his nut flush AND guarantees he can\'t have the hand you are representing... wait — it guarantees YOU could have it and he cannot. Representation rights, secured by a single card.',
      'Make it reflex with one habit: every flop you see (played or folded), name the nuts, then count the combos of the top three value hands. Thirty seconds a hand, invisible to the table, and within a month "scary" boards become spreadsheets.'
    ],
    take: ['6 / 4 / 12: pair / suited / offsuit combos. 1,326 total.', 'On K72: AK ≈ 12 combos vs KK = 3. Fear is bad at math.', 'Bluff-catch holding cards that DON\'T block his bluffs.'],
    quiz: [
      { q: 'You hold A♠K♠. How many AA combos remain for villain?',
        options: ['6', '3', '4', '1'],
        a: 1, why: 'One ace is dead: C(3,2) = 3. Your single ace halved his aces — that is a blocker doing its quiet work.' },
      { q: 'Board K♥7♦2♣. Villain has only AK and 77 for value. The combo ratio is…',
        options: ['Even', 'AK 12 vs 77 set 3 — four to one toward top pair', '77 more likely', 'Unknowable'],
        a: 1, why: 'Unpaired AK keeps 12 combos; 77 keeps 3 as a set. When the bet comes, the boogeyman is usually just one pair.' },
      { q: 'Choosing a river bluff-catcher, you prefer a hand that…',
        options: ['Blocks his bluffs', 'Does NOT block his bluffs (his missed draws all still possible) and ideally blocks his value', 'Has the best kicker', 'Is suited'],
        a: 1, why: 'You profit when he is bluffing — so you want every bluff combo alive, and his value combos dead. Unblock bluffs, block value.' }
    ]
  },
  {
    id: 'evsizing', module: 'm3', icon: '📏', title: 'Bet sizing: the why behind the number', minutes: 3,
    obj: ['Match sizing to range advantage and hand class', 'Understand small-frequent vs big-polar betting', 'Stop sizing by feel, start sizing by purpose'],
    body: [
      'Every bet size is a question priced for a specific answer. Before any number, ask what the bet is FOR: extract value from worse? Deny equity to draws? Fold out better? Build a pot for later streets? The purpose picks the size — and "two-thirds pot because that\'s what I do" is how money leaks one beige decision at a time.',
      'The two grand strategies. SMALL AND FREQUENT (25-33% pot): when your range owns the board — you raised preflop and the flop is A-K-x or K-7-2 — a small bet plays your entire range cheaply, taxes his folds (alpha says it needs only ~21-25% folds), denies overcard equity, and keeps your bluffs cheap. Solvers c-bet these textures at enormous frequency precisely BECAUSE the size is small. BIG AND POLAR (75%-150%+): when ranges are closer or the board favors him, betting narrows to a polarized set — strong value and real bluffs — and the size maximizes both the value extraction and the pressure. Small bets ask "do you have anything?"; big bets ask "are you willing to die with that?"',
      'Value sizing has one commandment: charge the maximum the calling hands will pay, which is usually MORE than feels polite. Against stations and draws, "thin" sizing with strong hands is charity — the live population\'s calling ranges are wildly inelastic, meaning their call/fold decision barely responds to price. Inelastic demand, monopolist pricing: bet bigger.',
      'Two structural notes that sort professionals from tourists. Geometry: if you intend to play for stacks, the pot must grow geometrically — equal pot-fraction bets on each street that land all-in by the river (with SPR 4, that\'s roughly 75% pot three times). Deciding on the RIVER that you want stacks in is too late; geometric sizing is a flop decision. And consistency: your sizes should depend on boards and ranges, never on your specific hand — the moment big-means-value and small-means-weak, observant players read you like a disclosure document. Against the oblivious, though, invert freely: size up value, size down nothing, and let their inattention pay.',
      'Default tree to install: range-advantage flops → 30% often; turn barrels → 66-75% polarizing; value rivers vs callers → big; and any time you catch yourself betting "standard" — stop and name the purpose first.'
    ],
    take: ['Purpose picks size: small-frequent with range advantage; big-polar without it.', 'Value vs inelastic callers: charge more than feels polite.', 'Plan geometric sizing from the flop if stacks are the goal.'],
    quiz: [
      { q: 'You raise preflop; flop K72 rainbow smashes your range. Best default:',
        options: ['Check to trap', 'Bet small (~30%) at very high frequency with your whole range', 'Pot it with kings only', 'Bet 75% with top pair plus'],
        a: 1, why: 'Total range advantage makes a cheap bet profitable with everything: bluffs need few folds, value starts the pot, draws pay rent.' },
      { q: 'A calling station has a probable worse top pair; you hold two pair on the river. Your size should be…',
        options: ['Quarter pot to guarantee the call', 'Large — his calling range barely responds to price, so charge the maximum', 'Check to induce', 'All-in is always wrong'],
        a: 1, why: 'Inelastic callers are the dream customer: the call is coming at almost any price, so the price should be high. Thin sizing vs stations is donated value.' }
    ]
  },
  {
    id: 'spr', module: 'm3', icon: '🧮', title: 'SPR & commitment: planning for stacks', minutes: 3,
    obj: ['Compute SPR and map it to commitment thresholds', 'Plan the whole hand on the flop, not street by street', 'Use preflop sizing to engineer the SPR you want'],
    body: [
      'Stack-to-Pot Ratio — effective stack divided by flop pot — is the single number that converts "I have top pair" into "I know what I am willing to do with it." Low SPR (under 3): top pair is committed; getting it in is routine. Medium (4-6): top pair strong kicker plays for stacks with care; overpairs welcome it. High (10+): one pair is a pot-control hand, and stacks belong to two pair plus, big combo draws, and coolers. The hand didn\'t change — the geometry did.',
      'The professional habit SPR enables is single-decision planning. Amateurs play streets ("bet... uh, he raised, now what?"); professionals decide ON THE FLOP what the hand\'s ceiling is: "SPR 5, I hold KQ on K84 — I am committed against this player; if raised, the money goes in" or "SPR 12, same hand — two streets of value then evaluate, and I am never stacking off unimproved." Deciding before the pressure arrives is strategy; deciding during is improvisation with your stack as the audience.',
      'You ENGINEER SPR preflop, mostly with raise sizing. 3-bet pots exist largely for this reason: holding QQ at 100bb deep, a single-raised pot leaves SPR ~10 — a queasy overpair future of three guessing streets — while a 3-bet pot leaves SPR ~3-4, where QQ happily plays for everything. Big preflop hands want low SPR (raise bigger, 3-bet); implied-odds hands — small pairs, suited connectors — want the opposite: HIGH SPR, deep money, maximum payoff when the disguised monster lands. Matching hand class to intended geometry is half of preflop sizing\'s real job.',
      'The corollary live players butcher: low SPR converts marginal hands into all-ins, so getting 40% of your stack in with a hand you intend to fold is strategic self-harm. If the SPR math says a raise commits you, then EITHER commit gladly or take the other line entirely — the middle path of "bet big, then fold to the jam" donates the maximum with the least information.',
      'Make it mechanical: every flop, before anything else, divide the short stack by the pot. One division, two seconds — and "should I go with this?" stops being a feeling and becomes a lookup.'
    ],
    take: ['SPR <3: top pair commits. 4-6: strong top pair carefully. 10+: two pair or better.', 'Decide on the flop what the hand\'s ceiling is — before the raise arrives.', '3-bets manufacture low SPR for big pairs; deep SPR feeds implied-odds hands.'],
    quiz: [
      { q: 'Flop SPR is 1.8 and you hold top pair, good kicker. The plan:',
        options: ['Check-fold to pressure', 'Commit — at this SPR, top pair plays for stacks by default', 'Call one street then fold', 'Min-bet for information'],
        a: 1, why: 'Below SPR ~3 the math has already married you to top pair. Folding committed equity is the bigger error than occasionally losing.' },
      { q: 'With QQ 100bb deep, why 3-bet preflop rather than flat?',
        options: ['To "find out where you are"', 'To engineer a low-SPR pot where an overpair comfortably plays for stacks — flatting leaves SPR ~10 and three guessing streets', 'Because folding is weak', 'To isolate the blinds only'],
        a: 1, why: 'Big made hands want geometry that lets them commit. The 3-bet isn\'t just value now — it is buying the SPR the hand plays best at.' }
    ]
  }
,
  /* ==================== MODULE 4 ==================== */
  {
    id: 'textures', module: 'm4', icon: '🗺️', title: 'Board textures & range advantage', minutes: 3,
    obj: ['Classify boards by who they favor and why', 'Distinguish range advantage from nut advantage', 'Predict c-bet strategy from texture alone'],
    body: [
      'The flop is where two invisible portfolios collide with three public cards, and the entire postflop game flows from one question: whose RANGE did this board help? Not whose hand — whose distribution. A K72 rainbow flop is a landslide for the preflop raiser (every AK, KQ, AA-QQ just connected or stayed ahead) and a desert for the big-blind caller (whose Kx is thin and whose suited junk missed). Before you look at your cards, the texture has already set the terms of engagement.',
      'Two distinct advantages, two distinct levers. RANGE advantage — whose total equity is higher across all combos — sets betting FREQUENCY: own the board, bet often and small. NUT advantage — who holds more of the very strongest hands — sets betting SIZE: when only you can hold the sets and big overpairs (A-K-x after you 3-bet), overbets become available because his best hands are your bluff-catchers. A board can split them: on 765 two-tone, the BB caller actually has MORE nutted combos (86s, 98s, sets of small pairs he peeled with) even if the raiser keeps a raw equity edge — which is why solvers suddenly check entire ranges there.',
      'A working taxonomy. DRY-HIGH (K72r, A83r): raiser owns everything; small range-bets at near-100% frequency. MIDDLING-CONNECTED (T98, 876 two-tone): caller country; the raiser checks a lot, and barrels need real equity. PAIRED (Q66, 884): nobody connected often; small bets print, but beware the caller who DID. MONOTONE (three of a suit): equities compress, sizing shrinks, one-card flushes lurk. ACE-HIGH after 3-betting: maximal nut advantage — the overbet playground.',
      'The turn and river re-deal these advantages every street. A board of K72 turning a 9 changes little; turning a 6 of the flush-draw suit hands the caller a fistful of completed draws and mutes your barrels. Professionals track WHO the runout helped the way traders track which way news cuts an existing position: the card matters only relative to the ranges that arrived there.',
      'Habit to install: on every flop, before any decision, say silently — \"this board favors X by a little/a lot; nuts belong to Y.\" Two seconds. It will be right 90% of the time within a month, and every c-bet, check-raise, and barrel decision downstream becomes an inference instead of a guess.'
    ],
    take: ['Range advantage → bet frequency. Nut advantage → bet size.', 'Dry-high boards: raiser bets small, often. Middling-connected: caller country.', 'Every turn re-deals the advantages — track who the card helped.'],
    quiz: [
      { q: 'You raise UTG, BB calls. Flop K72 rainbow. Why is a tiny (~30%) bet with your ENTIRE range so strong here?',
        options: ['It balances your checks', 'You hold all the strong Kx/overpairs and he holds almost nothing — massive range advantage makes even bluffs profitable at a cheap price', 'Small bets look scary', 'It protects against draws'],
        a: 1, why: 'His defending range whiffed this board; yours owns it. When every hand in your range profits by betting small, betting everything small is the strategy.' },
      { q: 'On 7♠6♠5♦ after the BB calls your BTN open, the NUT advantage mostly belongs to…',
        options: ['You — you raised', 'The BB: 98s, 84s? no — 86s/98s/small sets live in his calling range while your range is broadway-heavy', 'Neither player', 'Whoever has position'],
        a: 1, why: 'Callers keep the suited connectors and small pairs that smash low-connected boards; raisers keep broadways that miss them. Solvers check these flops at high frequency for exactly this reason.' }
    ]
  },
  {
    id: 'cbet', module: 'm4', icon: '🎯', title: 'C-bet theory: continuing the story', minutes: 3,
    obj: ['Decide c-bet frequency and size from texture + position', 'Know when checking is the strong play', 'Stop auto-c-betting into the wrong boards'],
    body: [
      'The continuation bet — betting the flop after raising preflop — is the most common postflop decision in poker, and most players run it on autopilot in both directions: auto-bet (\"I raised, so I bet\") or auto-give-up when they miss. Both leak. The c-bet is simply the first application of last lesson\'s question: who did this flop favor, and at what price should I tax the answer?',
      'The modern baseline IN POSITION: on boards that favor your range (dry, high, disconnected), bet small (25-33%) at very high frequency — with value, with air, with everything. The math is brutal in your favor: a one-third-pot bluff needs only 25% folds (alpha), fit-or-fold opponents miss the flop ~60% of the time, and your value hands start building geometrically. On boards that favor the caller (middling, connected, suited), the frequency collapses and the size grows: bet your real hands and real draws at 66-75%, check the rest, and decline to donate.',
      'OUT OF POSITION (you 3-bet from the blinds, or raised and got called behind): checking becomes a weapon, not a surrender. Solver OOP strategies check large portions of strong ranges because betting into position with a capped continuing-range invites floats and raises you cannot answer. The check-raise is the equalizer: built from your strongest hands plus draws, it makes auto-stabbing at your checks expensive — and a player who NEVER check-raises trains the whole table to bet at him relentlessly.',
      'When your small c-bet gets called, the turn sorts your range honestly: barrels continue with value and equity (next lesson); give-ups check-fold the pure air that already bought its one cheap shot at the fold. The discipline is refusing the middle path — the half-hearted second bullet with nothing, into a range that just told you it isn\'t folding.',
      'Live-population overlay: c-bets get called MORE (people hate folding) and check-raises mean MORE (people don\'t bluff-raise enough). So: thin your bluff c-bets slightly, fatten your value sizing, and treat flop check-raises as the value-heavy alarms they are. The theory sets the frame; the population sets the dial.'
    ],
    take: ['Range-favoring board: bet ~30% with everything. Caller-favoring: bet bigger, much less often.', 'OOP: checking strong hands + check-raising is structure, not weakness.', 'Live: c-bet bluffs less, value-size more, respect check-raises.'],
    quiz: [
      { q: 'You raise CO, BTN calls. Flop J♠9♠8♥ — you hold A♣K♦. Best default:',
        options: ['C-bet small — you always c-bet', 'Check: this connected, two-tone board smashes the caller\'s range and your AK has weak equity to barrel with', 'Pot it for protection', 'C-bet 33% as a range bet'],
        a: 1, why: 'This is the texture where auto-c-betting bleeds: his range owns the board, you are OOP-in-spirit (he has position), and your two overcards have poor barrel prospects. Check, evaluate, lose the minimum.' },
      { q: 'Why do solvers c-bet K72 rainbow at ~100% frequency but 765 two-tone at ~30%?',
        options: ['Randomization', 'Range advantage: K72 belongs to the raiser entirely; 765 belongs to the caller — frequency follows ownership', 'K72 has no draws to fear', 'Habit'],
        a: 1, why: 'Bet frequency tracks who owns the texture. Own it: tax everything cheaply. Don\'t: bet selectively with hands that genuinely want the money in.' }
    ]
  },
  {
    id: 'barrels', module: 'm4', icon: '🔥', title: 'Barreling: turns, rivers, and equity denial', minutes: 3,
    obj: ['Choose turn barrels by equity + blockers + the card\'s owner', 'Use equity denial as a real source of EV', 'Plan triple-barrels before firing the first'],
    body: [
      'The flop c-bet got called. Now poker actually starts. Turn barreling — the second bullet — is where the money in single-raised pots changes hands, because calling ranges arrive at the turn still wide and still mostly mediocre, while most players\' barrels arrive unplanned. A planned second bullet into an unplanned defense is the most reliable edge in live poker.',
      'Three green lights for the barrel, best when stacked: (1) EQUITY — your hand picked up outs or kept them: flush draws, straight draws, overcards to his likely pairs. Semi-bluff barrels are dual-income: folds now, outs later. (2) THE CARD HELPED YOU — an ace or king turn after you raised preflop belongs to YOUR range; his middling pairs just got relegated, and the barrel leans on that story. (3) BLOCKERS — holding the ace of the front-door flush suit while barreling means his nut draw is dead and your river bluffs gain representation rights. Zero lights? Check, and keep the give-up cheap.',
      'Equity denial is the under-priced cash flow of betting: forcing out live equity is profit even when the fold was \"correct\" for him. When your JJ bets a T84 turn and folds out his AQ — six clean outs, ~14% — you banked those percentage points without showdown. Players who \"only bet when sure\" leak this constantly: their checks give every floating overcard a free lottery ticket. Denial sits under value and bluffing as betting\'s third income stream, and it is why protection-betting medium-strength hands on wet runouts is often right even with the worst hand occasionally.',
      'The river bullet is a different animal: all equity is realized, semi-bluffs are extinct, and the bet is purely a claim about ranges. Plan triples on the FLOP — \"this hand barrels spade turns and bricks, gives up on board-pairs\" — because river courage manufactured in the moment is how stacks die. The standing population read again: rivers get under-bluffed and over-folded… by them. Which means your disciplined, planned triple gets MORE respect than theory predicts — and their sudden river aggression deserves more folds than MDF suggests.',
      'The complete barrel checklist, five seconds at the turn: Did the card help my range or his? Do I have equity or blockers? Is this opponent capable of folding a pair? What is my river plan on each runout class? Four answers — then the bet sizes itself.'
    ],
    take: ['Barrel on: equity, range-owning cards, blockers. Zero of three = give up.', 'Equity denial is real income: folding out live overcards banks their outs.', 'Plan the triple on the flop; improvised river bluffs are stack leaks.'],
    quiz: [
      { q: 'You c-bet K♠7♦2♦ with A♦Q♦ and get called. Turn 4♦? wait — turn is 9♠. Barrel?',
        options: ['No — you have ace-high', 'Yes: nut-flush-draw equity, two overcards, and his K72-calling range is mostly mediocre pairs that hate pressure — a premium semi-bluff barrel', 'Only if he checks first', 'Jam'],
        a: 1, why: 'Nine clean diamond outs plus overcards plus initiative: folds now or outs later. This is the dual-income barrel the lesson is about.' },
      { q: 'What is \"equity denial\" worth when your turn bet folds out two overcards (~14% to beat you)?',
        options: ['Nothing — he folded incorrectly, his loss', 'Real EV: you banked his 14% of the pot without a showdown — betting\'s third income stream after value and bluffs', 'Only psychological value', 'It costs you action'],
        a: 1, why: 'Every percentage point of live equity that folds is transferred to you. \"He folded wrong\" and \"I profited\" are the same sentence.' }
    ]
  },
  {
    id: 'bluffcatch', module: 'm4', icon: '🕵️', title: 'River truth: bluff-catching & big folds', minutes: 3,
    obj: ['Frame river calls as pure price-vs-frequency math', 'Pick bluff-catchers by blocker quality', 'Make disciplined big folds against honest populations'],
    body: [
      'The river is poker with the mask off: no more outs, no more equity, no more \"we\'ll see.\" Your pair of nines either beats his bets-worth of hands or it doesn\'t. Every river call reduces to one clean comparison: the price (pot odds: a pot-size bet needs you right 33% of the time) versus his bluffing frequency IN THIS LINE. That second number — not your hand strength — is almost the entire decision.',
      'Understand what a bluff-catcher is: a hand that beats every bluff and loses to every value bet. Once your hand is in that class, its exact strength barely matters — second pair and top-pair-weak-kicker are THE SAME HAND against a polarized river bet. What separates good bluff-catchers is blockers: the best ones block his value (you hold a card from the straight he reps) and unblock his bluffs (you hold none of the missed flush draw, so all those broken draws remain in his range). Combinatorics, again, doing the deciding.',
      'Now the number that pays your rent: live populations under-bluff big rivers, badly. The triple barrel for stacks at a 2/5 table arrives as value far more often than the 33% balance point — which converts \"never fold a bluff-catcher getting 2:1\" theory into \"fold most one-pair hands to big honest-population rivers\" practice. The discipline has a name at the table: the big fold. It will feel terrible. It is one of the highest-EV skills in live poker, and EDGE\'s severity engine deliberately refuses to punish you for the close ones.',
      'The mirror discipline: when YOU arrive at the river with the bluffing opportunity against these same populations — having planned it since the flop, holding the right blockers, against a player who demonstrably CAN fold — your bluffs clear their alpha hurdle more often than theory promises, because nobody hero-calls less than a live reg who \"knows you have it.\" Under-bluff the strangers; bluff the foldgers — wait, the folders — with conviction.',
      'River checklist, in order: Am I a bluff-catcher (beat bluffs only)? What price am I offered? Does THIS player bluff THIS line at that frequency? Do my blockers help or hurt? Answer honestly and the river stops being dramatic — it becomes an invoice you either pay or decline.'
    ],
    take: ['River calls = price vs his actual bluff frequency. Hand strength is almost irrelevant within the bluff-catcher class.', 'Best catchers: block his value, unblock his bluffs.', 'Live: the big fold prints. Population rivers are honest.'],
    quiz: [
      { q: 'Facing a pot-size river bet, you need to win 33% of the time. Your read: this player bluffs this line ~15%. The call is…',
        options: ['Mandatory — never fold getting 2:1', 'A clear fold: his frequency is below your price, and no hand strength fixes that', 'Correct with top pair only', 'A coin flip'],
        a: 1, why: 'Price 33%, supply 15%: every call loses money on average regardless of what you hold. Bluff-catching is frequency shopping, not courage.' },
      { q: 'Two river bluff-catchers: Hand A holds two cards of the flush draw that missed; Hand B holds none of it. Which calls?',
        options: ['A — it blocks flushes', 'B: it UNBLOCKS his missed-flush bluffs (they all still exist) while A removes the very bluffs you beat', 'Either — same strength', 'Neither'],
        a: 1, why: 'You profit only when he is bluffing, so you want maximum bluff combos alive in his range. Holding his bluff cards kills your own payout.' }
    ]
  },
  {
    id: 'multiway', module: 'm4', icon: '👥', title: 'Multiway pots: the live-poker default', minutes: 3,
    obj: ['Adjust value thresholds and bluff frequency for 3+ players', 'Re-rank starting hands for multiway play', 'Exploit the family-pot dynamics of live games'],
    body: [
      'Theory is built heads-up; live poker is played in crowds. Four players see the flop at most 1/2 and 2/5 games, and every formula you have learned bends under the weight: equities compress, bluffs decay, and the nuts appreciate. A player who ports heads-up strategy into family pots donates from both directions — bluffing into too many hands and paying off too many made ones.',
      'The bluff math is the brutal part: fold equity must clear EVERY opponent, and the probabilities multiply. If each of three callers folds 50% to your barrel, the pot is yours 0.5 × 0.5 × 0.5 = 12.5% of the time — versus the 33%+ a pot-size bluff needs. Multiway, the bluff frequency that survives is a fraction of heads-up levels, concentrated in hands with robust equity backup. The give-up button is your friend; \"someone always has it\" is not pessimism multiway, it is arithmetic.',
      'Value thresholds climb symmetrically: top pair good kicker — a three-street monster heads-up — becomes a two-street hand against four opponents, because SOMEONE\'S range connected hard with that board. The corollary players miss: thin value bets shrink but FAT value grows, because family pots pay off the nuts magnificently. Sets, straights, flushes: bet big, bet often, and stop slow-playing into fields that will call you down anyway.',
      'Preflop re-ranking follows: hands that make the NUTS appreciate (suited aces, suited connectors, pairs hunting sets — implied-odds assets with five customers), while one-pair hands depreciate (AJo, KQo: hands that make second-best hands in crowds — domination with an audience). This is why limped family pots reward the patient speculative call and punish the proud broadway call.',
      'Positional and protection notes: position compounds multiway (more information per street, more pots that check to you), and \"protection\" betting rises in value — with vulnerable made hands on wet boards, charging three draws at once is genuine income. The family-pot formula: speculate cheap, bluff rare, value-bet the nuts loud, and let the crowd\'s curiosity finance your discipline.'
    ],
    take: ['Bluff folds must clear EVERY player — frequencies collapse multiway.', 'Thin value shrinks; nutted value grows. Stop slow-playing into crowds.', 'Multiway preflop: nut-potential up, offsuit-broadway down.'],
    quiz: [
      { q: 'Three opponents each fold 50% to river bets. Your pot-size bluff (needs 33%) succeeds…',
        options: ['50% — the average', '12.5% — folds multiply: a catastrophic bluff', '33% — exactly breakeven', '25%'],
        a: 1, why: '0.5³ = 12.5% vs 33% needed. Multiway bluffing into multiple ranges is how stacks evaporate politely.' },
      { q: 'Five players see a flop. Which holding gained the most value relative to heads-up?',
        options: ['AJo', '66 (set-mining)', 'KQo', 'A9o'],
        a: 1, why: 'Sets are nut-class hands with five potential customers and perfect disguise — implied odds at their theoretical maximum. The offsuit broadways became domination bait.' }
    ]
  },

  /* ==================== MODULE 5 ==================== */
  {
    id: 'exploit', module: 'm5', icon: '⚔️', title: 'GTO is the shield, exploits are the sword', minutes: 3,
    obj: ['Position GTO and exploitation correctly relative to each other', 'Run the deviation playbook per player type', 'Know when to snap back to baseline'],
    body: [
      'Game-theory-optimal play has one magical property: it cannot lose to anyone in expectation. And one expensive property: it declines to maximally punish anyone either. GTO is the unexploitable DEFAULT — the stance you take against unknowns and strong regs. Exploitation is the profit center: deliberate, named deviations aimed at observed leaks. The architecture of this entire app mirrors the relationship — Study/Train build the shield; the Live tab\'s profiling aims the sword.',
      'Every exploit is a simple trade: you accept theoretical vulnerability in exchange for real money from a real leak. The station never folds → delete every bluff, value bet down to third pair (your \"unbalanced\" range would lose to a counter-strategy he will never run). The nit folds everything → steal every pot, and lay down big to his raises (his aggression is always real). The maniac barrels air → stop bluffing, call down with bluff-catchers, let him fund your patience. The whale plays half the deck → isolate wide in position, value bet thin, keep him happy. Each deviation has a trigger, a direction, and a snap-back condition.',
      'The discipline most players lack: exploits are HYPOTHESES, and hypotheses need evidence and revision. Two orbits of VPIP data, one showdown where the \"station\" check-raise-bluffed you — update or pay. The Live tab\'s stat-based type suggestions exist for exactly this: impressions lie, frequencies don\'t. And against anyone capable of noticing your deviations — the good reg two seats over — the correct exploit is usually NO exploit: baseline, varied, boring, while the sword stays pointed at the table\'s actual donors.',
      'Strategic priority for live games, in order: table selection (the biggest exploit is choosing exploitable opponents), seat selection (position on the money), THEN in-game deviations. A perfectly-played seat at a tough table earns less than a sloppy seat at a soft one. Hunt games the way you hunt spots.',
      'The closing frame: GTO knowledge is what makes your exploits SAFE — you know exactly which baseline you left, by how much, and the road back. Players who only know exploits get lost when the leak disappears; players who only know GTO leave money at every soft table on earth. You are building both halves on purpose.'
    ],
    take: ['GTO = unexploitable default; exploits = named deviations with triggers and snap-backs.', 'Stations: no bluffs, thin value. Nits: steal, then believe them. Maniacs: catch, don\'t push.', 'Table and seat selection out-earn any in-game adjustment.'],
    quiz: [
      { q: 'Versus a pure calling station, the biggest leak you can have is…',
        options: ['Value betting too thin', 'Bluffing — folds fund bluffs and he has none to sell', 'Playing too tight preflop', 'Slowplaying monsters'],
        a: 1, why: 'Bluff EV is manufactured exclusively from folds. Meanwhile every thin value bet against his curiosity prints. Swap your bluff budget into value.' },
      { q: 'When should your play sit CLOSEST to GTO baselines?',
        options: ['Against the table whale', 'Against unknown or strong, observant opponents', 'When tilted', 'Never — always exploit'],
        a: 1, why: 'No data = no target; strong observer = deviations get counter-attacked. Baseline until the evidence arrives, then deviate with intent.' }
    ]
  },
  {
    id: 'livetells', module: 'm5', icon: '👁️', title: 'Live dynamics: tells, timing, and table craft', minutes: 3,
    obj: ['Rank live information sources correctly (sizing > timing > body)', 'Use the reliable population tells', 'Protect your own signal while harvesting theirs'],
    body: [
      'Hollywood lied: live tells are not eye-twitches decoded by geniuses. The reliable hierarchy runs: SIZING tells (how much) > TIMING tells (how fast) > verbal tells (what they say) > physical tells (what they do). The further down the list, the noisier the signal — and the more a smart opponent can fake it. Master the top of the hierarchy before romancing the bottom.',
      'Sizing tells are population-wide and shockingly stable: the sudden overbet from a passive player is value (recreational players size UP with hands, not bluffs — bluffing big feels too expensive to them). The suspiciously small river \"blocker\" bet is medium-strength begging you not to raise — so raise more. Round-number bets ($100 even) skew bluffy; considered, odd amounts ($135) skew value. None of these are laws; all of them are profitable priors until a specific player breaks them.',
      'Timing: SNAP actions reveal decisions that required no thought — snap-calls are draws and medium hands (monsters at least consider raising), snap-bets are often pre-decided bluffs or huge hands (the middle thinks). Long tanks followed by aggression from non-actors lean value (\"I tanked because the hand mattered\"); long tank into a CALL is genuinely marginal. Your counter-discipline: same tempo for everything — pick a beat (three seconds), act on it always, and your timing channel goes silent.',
      'The verbal and physical layer, used sparingly: people who announce \"I guess I\'ll call\" usually aren\'t guessing; table-talk during a hand from a quiet player means strength feeling chatty; shaking hands usually means adrenaline (big hand!), not fear. And the most useful physical \"tell\" is pre-hand: who is reaching for chips before the action arrives (they want to play — steal less), who just took a bad beat (tilt-watch), who is on their phone ordering a drink (steal more). Reading the table between hands out-earns reading faces during them.',
      'Final craft note — your image is an asset you spend deliberately: after showing down two bluffs, your value bets get paid for an hour; after a nitty session, your steals print. Track what THEY have seen of you, not what you know of yourself, and time your deviations to the story your last twenty minutes told.'
    ],
    take: ['Trust sizing > timing > verbal > physical. Overbets from recs = value.', 'Snap-call = draw/medium. Tank-then-bet = usually value. Keep your own tempo constant.', 'Your image is spendable: bluff-heavy image → value bet; tight image → steal.'],
    quiz: [
      { q: 'A passive recreational player suddenly overbets the river into you. Population read:',
        options: ['Bluff — overbets are polarized so call', 'Value, heavily: recs size up with made hands, and bluffing big feels expensive to them — fold your bluff-catchers', 'Exactly 50/50', 'Depends on his eyes'],
        a: 1, why: 'The polarization math says value-or-bluff; the population data says which: passive players\' big bets are honest. Theory frames it, frequency answers it.' },
      { q: 'The cheapest way to stop leaking timing tells:',
        options: ['Always act instantly', 'Always tank 30 seconds', 'Fixed tempo: same short beat before every action, strong or weak', 'Talk constantly'],
        a: 2, why: 'A constant rhythm carries zero information. Varying speed — fast with bluffs, slow with value, or vice versa — hands observant players a free HUD on your hand strength.' }
    ]
  },
  {
    id: 'innergame', module: 'm5', icon: '🧘', title: 'The inner game: tilt, focus, and the A-game', minutes: 3,
    obj: ['Identify your tilt profile and install circuit breakers', 'Grade sessions on decision quality, not results', 'Protect the focus that live win rates are made of'],
    body: [
      'Here is an uncomfortable equation: a strong player\'s edge might be 8bb/hour playing their A-game — and negative 20 playing tilted. Which means the spread between your best and worst self is BIGGER than your edge over the table. The inner game isn\'t the soft side of poker; it is the largest line item in your win rate, and it deserves the same systematic treatment as preflop ranges.',
      'Tilt is not one thing — find YOUR variant. Injustice tilt: the two-outer hits and the brain demands the universe balance its books NOW (it pays double when the rage-bluff fires). Revenge tilt: that specific player must be defeated, ranges optional. Entitlement tilt: \"I\'ve folded for three hours, I DESERVE this pot.\" Winner\'s tilt — the sneaky one: up four buy-ins, suddenly splashing with house money you have mentally already spent. Name your pattern in your Hands reviews (the Tilt leak tag exists for this); a tilt you can name mid-hand is a tilt half-disarmed.',
      'Circuit breakers, mechanical and pre-committed: a stop-loss (two or three buy-ins — not because the next buy-in is doomed, but because the player reloading it is compromised); a bad-beat ritual (one breath, verdict — \"money went in good\" — next hand); a B-game protocol (the moment you catch autopilot: tighten one notch, re-engage with reads, or rack up). The discipline of leaving a GOOD game because YOU are no longer good in it is rarer than aces — and worth more.',
      'The deeper installation is process-orientation, the EV lesson grown up: grade every session on decision quality, never on dollars. The questions that matter at 2 a.m.: did I play my ranges, did I make the big folds, did I value bet thin, did I quit on time? A losing session full of yes is a WIN — variance simply hasn\'t paid the invoice yet. EDGE\'s whole design conspires toward this: severity-graded drills, leak tags, confidence intervals on your win rate — the dashboard measures process because process is the only thing you control.',
      'And protect the machine itself: live poker is hours of vigilance punctuated by decisions worth hundreds of big blinds. Sleep, food, the walk before the session — boring, decisive. The player who arrives rested and leaves on schedule beats the genius who grinds tired, every month, forever. Your brain is the bankroll; manage it like one.'
    ],
    take: ['The A-game/C-game spread exceeds your edge — manage it like money.', 'Name your tilt type; pre-commit stop-losses and rituals.', 'Grade sessions on decisions, not dollars. Process is the only controllable.'],
    quiz: [
      { q: 'You are up 3 buy-ins and catch yourself open-raising J6s \"because it\'s been working.\" This is…',
        options: ['Momentum — ride it', 'Winner\'s tilt: results-intoxication loosening your ranges with money you mentally banked — snap back to baseline or book the win', 'A solid image play', 'Fine if the table is soft'],
        a: 1, why: 'Tilt isn\'t only anger. Playing hands because recent results felt good is the same disease in a better mood — the ranges don\'t care that you\'re winning.' },
      { q: 'The strongest argument for a pre-committed stop-loss:',
        options: ['The cards turn cold after losses', 'You become the worse player: tilt degrades decisions precisely when the stakes feel highest, and pre-commitment removes the decision from the compromised brain', 'Bankrolls are fragile', 'Tables get harder late'],
        a: 1, why: 'The math of the next hand never changes; the player does. A rule made by your best self at noon outranks a judgment call by your worst self at midnight.' }
    ]
  },
  {
    id: 'variance', module: 'm5', icon: '🎢', title: 'Variance, bankroll & the long run', minutes: 3,
    obj: ['Size the noise honestly: sd ≈ 10x win rate', 'Apply bankroll rules that make ruin mathematically remote', 'Use confidence intervals instead of feelings'],
    body: [
      'A good live win rate is 5-10 bb/hour. The standard deviation around it: 70-100 bb/hour. Read that ratio again — the NOISE is roughly ten times the SIGNAL. A full losing month proves nearly nothing; a crushing weekend proves less. Poker pays skill, but it pays through a slot machine\'s accounting department, and every emotion you feel about short-run results is statistically illiterate. This is the lesson that keeps the others employed.',
      'Concretely: at +7bb/hr with 90bb/hr sd, a 40-hour month has a standard deviation of ~570bb against an expectation of +280bb — meaning solid winners post losing months about ONE IN THREE. The Stats tab computes your actual 95% confidence interval, and for your first few hundred hours it will straddle zero. That isn\'t discouragement; it is the honest size of the evidence — and the inoculation against both despair (downswings are scheduled) and delusion (heaters are too).',
      'Bankroll management converts this noise into something survivable. The guideline: 20-30 buy-ins for your regular game, more if the game is wild or your edge is thin. The math behind it (risk-of-ruin: bankroll needed scales with variance² ÷ win rate — also live in your Stats tab) has one non-negotiable premise: the bankroll is REAL — segregated from rent, replaceable only by play or planned deposits. Ten buy-ins isn\'t aggressive; it is a coin-flip with ruin wearing cologne.',
      'Moving stakes is a math decision, not a mood: shots at 30+ buy-ins of the new stake with a defined retreat line (drop back at -5 buy-ins, no shame, the stake will still be there). The catastrophic pattern — chasing losses UP in stakes to \"win it back faster\" — is how bankrolls and hobbies end. Write your rules sober; obey them bleeding.',
      'The psychological endgame: variance is the PRICE of edge, not its enemy. If results were smooth, the whales would feel their losses immediately and quit — the noise is what keeps bad players funded by hope. Every absurd suckout is a marketing expense for the most profitable game you have access to. Log the session, trust the interval, keep swimming.'
    ],
    take: ['sd ≈ 10x win rate: months are noise, hundreds of hours are signal.', '20-30 buy-ins, segregated. Shots with retreat lines, never chases.', 'Variance is what keeps the losers playing — it funds your edge.'],
    quiz: [
      { q: 'A winning player (+7bb/hr, 90bb/hr sd) plays 40 hours this month. A losing month is…',
        options: ['Evidence the edge is gone', 'Entirely routine — roughly a 1-in-3 event at these parameters', 'Nearly impossible', 'Proof of bad play'],
        a: 1, why: 'Monthly sd (~570bb) dwarfs monthly expectation (+280bb). Winners lose months constantly; only the confidence interval, not the calendar, knows your truth.' },
      { q: 'After losing 3 buy-ins at 2/5, the WORST possible response:',
        options: ['Book the loss and review hands tomorrow', 'Move UP to 5/10 to win it back faster', 'Drop to 1/3 for the rest of the night', 'Take a week off'],
        a: 1, why: 'Chasing up-stakes combines a damaged decision-maker, a thinner edge, and doubled variance against a bankroll that just shrank. It is the canonical ruin script.' }
    ]
  },
  {
    id: 'metalearning', module: 'm5', icon: '🧠', title: 'How to study poker (and how EDGE trains you)', minutes: 3,
    obj: ['Apply the evidence hierarchy of learning techniques to poker', 'Build a weekly study loop that compounds', 'Use this app the way it was engineered to be used'],
    body: [
      'Last lesson: learning how to learn this game — because study time is an investment portfolio and most players allocate it like tourists. Cognitive science has a clean evidence hierarchy, and poker study should follow it: RETRIEVAL PRACTICE (testing yourself) and SPACED REPETITION (reviews at growing intervals) sit at the top with the strongest effects; INTERLEAVING (mixing topics) and ELABORATION (asking \"why is this true?\") in the strong middle; passive re-reading and chart-staring at the bottom — they feel productive and build almost nothing. The app you are holding is this hierarchy wearing a poker costume.',
      'Mapping it explicitly: the Train tab is retrieval practice (every drill is a self-test, the strongest single technique known); the review queue is spaced repetition (misses return at 1→3→7→14→30 days, rebuilding the memory each time it starts to fade); the Exam interleaves every topic (mixing positions and decision types — harder than blocked practice, and that difficulty is precisely what makes it stick); and the WHY explanations after every answer are elaboration (reasons weld facts into structures). Even the border-focus is load management: drilling 169 cells wastes attention on the 140 that were never in question.',
      'Your weekly loop, twenty minutes a day: clear the review queue FIRST (highest yield per minute in the entire app — these are your personal weak points at their forgetting moment); one Quick drill on your lowest mastery meter; one lesson re-read ONLY after its drills expose a gap (re-reading with a question outperforms re-reading on schedule); Exam once a week as your honest interleaved benchmark. After live sessions: log the two or three key hands while they are warm, tag the leaks brutally, and let the Leak Board tell you what next week\'s twenty minutes are for.',
      'Reading Modern Poker Theory alongside: read a chapter AFTER drilling its territory, not before. The drills generate questions; the book answers questions you actually have — which is elaboration running at full power, versus highlighting sentences that feel important. And everywhere Acevedo\'s numbers differ from EDGE\'s baselines, trust the book and edit ranges.js — owning your charts beats renting anyone\'s.',
      'The meta-principle over all of it: difficulty is the signal of learning, not the obstacle. The drill that stings, the exam grade that disappoints, the review hand you\'ve missed twice — that discomfort is the feeling of a skill being built at its edge. Comfortable study is usually decorative. You now know the game beneath the game AND the learning beneath the learning. Go play.'
    ],
    take: ['Hierarchy: retrieval + spacing > interleaving + elaboration > re-reading.', 'Daily: queue first, then weakest-meter drills. Weekly: one Exam.', 'Read MPT chapters AFTER drilling their territory — questions first, answers second.'],
    quiz: [
      { q: 'Twenty minutes tonight: highest-yield option?',
        options: ['Re-read two lessons', 'Stare at the BTN chart', 'Clear the spaced-repetition review queue, then Quick-drill your weakest meter', 'Watch a training video'],
        a: 2, why: 'Reviews catch your personal weaknesses at the forgetting moment — retrieval plus spacing, the two strongest effects, aimed at your actual gaps.' },
      { q: 'Why does the Exam mix all topics instead of testing one chart at a time?',
        options: ['Variety prevents boredom', 'Interleaving: mixed practice is harder in the moment and produces dramatically better retention and transfer than blocked practice', 'It is faster to build', 'To inflate difficulty artificially'],
        a: 1, why: 'Blocked practice feels smooth and evaporates; interleaved practice feels rough and sticks. The Exam\'s difficulty is the feature.' }
    ]
  }
];

/* lessons grouped by module for rendering */
function lessonsByModule(moduleId) {
  return LESSONS.filter(function (L) { return L.module === moduleId; });
}

if (typeof module !== 'undefined') {
  module.exports = { LESSONS: LESSONS, COURSE_MODULES: COURSE_MODULES, lessonsByModule: lessonsByModule };
}
