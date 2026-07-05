/* ============================================================
   EDGE — postflop.js
   Street strategy charts (flop / turn / river), distilled from
   solver aggregate reports (GTO Wizard, RangeConverter) into
   texture-driven plans. The core law, per Brokos: preflop range
   dynamics — not board texture — drive postflop strategy. The
   right question is never "did I hit?" but "how much does this
   board help the CALLER catch up?"

   Data model:
     POSTFLOP_CHARTS: [{ id, street, formats, scenario, title, sub,
        intro, rows: [{ tex, board, freq, size, plan, why, mtt }],
        keys: [..takeaways] }]
     - freq: 0..1 baseline bet/continue frequency for the row
     - size: pot-fraction label ("33%", "66-75%", "check")
     - mtt:  how the row shifts in tournaments (shallower SPR/ICM)
   POSTFLOP_DRILLS: explicit graded MCQ items for the Train tab.
   Math helpers: pfMdf, pfAlpha, pfPotOdds, pfBluffShare.
   ============================================================ */
'use strict';

/* ---------- the math ----------
   pot, bet in same units (bet may exceed pot for overbets).      */
function pfMdf(pot, bet)      { return pot / (pot + bet); }           // defender: min continue freq
function pfAlpha(pot, bet)    { return bet / (pot + bet); }           // bluffer: folds needed to break even
function pfPotOdds(pot, bet)  { return bet / (pot + 2 * bet); }       // caller: equity needed
function pfBluffShare(betPct) { return betPct / (1 + 2 * betPct); }   // polar bettor: max bluff share, bet as pot-fraction

var POSTFLOP_CHARTS = [

  /* ================= FLOP ================= */
  { id: 'pf-cbet-ip', street: 'flop', formats: ['cash', 'mtt'], scenario: 'SRP · you raised, blind called · IP',
    title: 'C-bet in position — single-raised pot', sub: 'BTN/CO vs BB caller · baseline 100bb cash',
    intro: 'You arrive with the stronger, uncapped range: the BB called with a discount and missed their best hands (they would have 3-bet those). Bet most on boards that do NOT help a wide, low-card-heavy calling range.',
    rows: [
      { tex: 'Ace-high dry', board: 'Ah7d2c', freq: 0.72, size: '33%',
        plan: 'Bet small at high frequency; weak Ax and KK-JJ mix checks.',
        why: 'You own more Ax, but fold equity is worth less (nothing outdraws top pair) and the BB check-raises this texture polar - so marginal made hands delay to the turn.',
        mtt: 'At 40bb this becomes a near range-bet (~100%): the ante-widened BB range whiffs more often.' },
      { tex: 'K/Q-high dry', board: 'Kd8s3c', freq: 0.88, size: '33%',
        plan: 'Near range-bet small. Marginal Kx/Qx bets for protection + value.',
        why: 'Best of both: your broadway-heavy range smashes it, the BB is full of live undercards that must fold or float badly. Protection has real value here, unlike A-high.',
        mtt: 'Same plan; at low SPR the small bet sets up geometric turn/river stack-off with TPGK+.' },
      { tex: 'Paired', board: 'Ks9s9d', freq: 0.85, size: '33%',
        plan: 'High-frequency small bet across the range.',
        why: 'Only two live ranks for the caller, draws are rare, and trips are in both ranges - so nut advantage is muted but range advantage is huge. Small bets are brutal to defend against.',
        mtt: 'Identical logic. On low paired boards (663) sizing up as a bluff works better vs sticky freeroll fields only when you can fire twice.' },
      { tex: 'Low disconnected', board: '7d4s2c', freq: 0.70, size: '33-50%',
        plan: 'Bet frequently; overcards + overpairs bet, some Ax-high checks.',
        why: 'Neither range connects, so the preflop equity edge carries over. The BB continues with pairs and gutters but folds the junk half of a wide range.',
        mtt: 'Shorter stacks make the BB peel wider (better price) - value-lean your barrels.' },
      { tex: 'Medium connected', board: 'Td9s8c', freq: 0.45, size: '66-75%',
        plan: 'Polarize: bet strong hands + real draws bigger, check the middle.',
        why: 'The worst c-bet class: the BB range is dense with middling cards, straights are possible, and check-raises spike. Your marginal hands hate bloating this pot.',
        mtt: 'At 40bb check even more OOP-vulnerable hands; stack-off threshold drops to two pair.' },
      { tex: 'Two-tone + draws', board: 'Jh8h4d', freq: 0.60, size: '66%',
        plan: 'Bet bigger but less often - value + semi-bluffs, protect equity.',
        why: 'Live flush draws mean your good hands need protection and your bets get check-raised more. Size up for denial; the smallest bets give draws a perfect price.',
        mtt: 'Semi-bluff draws harder at 25-40bb: fold equity + equity is the classic jam-leverage combo.' },
      { tex: 'Monotone', board: 'Kh9h5h', freq: 0.38, size: '33%',
        plan: 'Small and selective. Check most; flushes often check back once.',
        why: 'Flushes in the caller range wreck your nut advantage - and when you DO hold a flush it blocks their continues. Betting big just isolates you against the top of their range.',
        mtt: 'Same. Shallow, a single small bet + jam line makes low flushes easier to play.' },
      { tex: 'Straight-complete', board: '9c8d7s', freq: 0.35, size: '33-50%',
        plan: 'Lowest c-bet texture in poker. Check range-wide, bet made+draw combos.',
        why: 'The caller flops straights, two pairs and endless 8-out draws here; your overpairs shrink to bluff-catchers. Respect it - size down, check often.',
        mtt: 'Identical - and ICM makes paying off raises here even worse.' }
    ],
    keys: [
      'C-bet MORE: high-card, paired, disconnected, rainbow - boards that miss a wide caller.',
      'C-bet LESS + BIGGER: medium connected, draw-heavy - polarize when the caller catches up.',
      'Monotone/straight-complete: small, infrequent, and never auto-continue.'
    ] },

  { id: 'pf-cbet-oop', street: 'flop', formats: ['cash', 'mtt'], scenario: 'SRP · you raised EP/MP, BTN/CO called · OOP',
    title: 'C-bet out of position — single-raised pot', sub: 'vs an IN-POSITION caller · check more everywhere',
    intro: 'A cold-caller in position has a capped but solid range - and position. Your range is stronger, but you realize less equity: cut every frequency and protect your checks.',
    rows: [
      { tex: 'A/K-high dry', board: 'Kc7h2d', freq: 0.60, size: '33-50%',
        plan: 'Still your best boards - bet value + best backdoors, check-call the rest.',
        why: 'Your EP range dominates broadways. But the caller keeps position forever: checking strong hands sometimes keeps your checking range defendable.',
        mtt: 'At 40bb the caller has more suited junk - bet these boards relentlessly.' },
      { tex: 'Medium connected', board: '9h8c6d', freq: 0.30, size: '66%',
        plan: 'Check-heavy. Bet only nutted + strong draws; check-raise the top.',
        why: 'Cold-callers are dense with 77-TT, 98s, T9s: this is THEIR board. OOP with an overpair, check-calling twice often beats bet-bet-cry.',
        mtt: 'Stack-off with overpairs is standard at 40bb; deeper, slow down.' },
      { tex: 'Monotone / 3-straight', board: '8s6s5s', freq: 0.25, size: '33%',
        plan: 'Check almost everything; small stabs with nut-blocker hands.',
        why: 'Worst combination: their range connects AND they have position. The Ax-of-suit hands make the best delayed bluffs instead.',
        mtt: 'Same, with even less thin value - reverse implied odds hurt more when busting matters.' },
      { tex: 'Paired', board: 'QdQs4h', freq: 0.55, size: '33%',
        plan: 'Small bets work; give up faster without equity on turn.',
        why: 'Range advantage persists on paired broadways, but a positional floater will peel once wide - have a turn plan before you stab.',
        mtt: 'Fine to fire once at any depth; twice needs equity.' }
    ],
    keys: [
      'OOP = every frequency drops. Checking is a strategy, not surrender.',
      'Protect checks with strong hands or good players will auto-stab you.',
      'No turn plan = no flop bet.'
    ] },

  { id: 'pf-cbet-3bp', street: 'flop', formats: ['cash', 'mtt'], scenario: '3-bet pot · SPR ~4 (cash) / ~2-3 (MTT 40bb)',
    title: 'C-bet in 3-bet pots', sub: 'Low SPR flips the rules: small bets, high frequency',
    intro: 'The 3-bettor arrives with a massive equity edge (QQ+/AK density) and the pot is already bloated - SPR ~2-4. Position matters less; tiny bets put every underpair and unpaired hand in a vice.',
    rows: [
      { tex: 'A/K-high (as 3-bettor)', board: 'Ad8c3s', freq: 0.85, size: '25-33%',
        plan: 'Range-bet tiny. Your AK/AQ/overpair density owns this flop.',
        why: 'The caller has QQ-66, suited broadways - all crushed or drawing thin. A 30% bet risks little and denies their 6 outs; with SPR ~4 it also sets up geometric all-in by the river.',
        mtt: 'At 40bb (SPR ~2), bet small and be ready to get it in with TPGK+; folding overpairs is burning chips.' },
      { tex: 'Low/medium connected (as 3-bettor)', board: '8d7d5c', freq: 0.55, size: '50-66%',
        plan: 'Check more; bet bigger and polar when you do.',
        why: 'This is the CALLER\'s board - 88-55, 76s live here. Your unimproved AK/AQ still has equity: checking keeps the pot controlled and your range protected.',
        mtt: 'Shallow, overpairs jam over raises; deep, prepare to play turns honestly.' },
      { tex: 'Low paired (OOP 3-bettor)', board: '6h6c3d', freq: 0.35, size: '66%+',
        plan: 'Check often; when betting, size UP for max fold equity.',
        why: 'Solvers check ~65% here OOP: the caller\'s 77-TT own the board. Your bets are polar - overpairs and total air - so they come big.',
        mtt: 'Same shape; at SPR 2 the check-jam line with overpairs prints.' },
      { tex: 'Broadway connected', board: 'KsQdJh', freq: 0.70, size: '33%',
        plan: 'Small high-frequency bet - your range, but respect made straights.',
        why: 'You hold AK/KQ/QQ+ in spades - but ATs/T9s made it too. Small size extracts from worse pairs while keeping the check-raise honest.',
        mtt: 'Identical; stacks go in over any raise with two pair+.' }
    ],
    keys: [
      'Low SPR = small bets (25-33%) at high frequency; the money goes in by itself.',
      'Geometric plan: three equal pot-fraction bets that get stacks in by the river.',
      'The lower the SPR, the lower your stack-off threshold: TPGK is a snap at SPR 2.'
    ] },

  { id: 'pf-face-cbet', street: 'flop', formats: ['cash', 'mtt'], scenario: 'You defended BB, the raiser c-bets',
    title: 'Facing the c-bet — defense math', sub: 'MDF by bet size · what continues',
    intro: 'Minimum Defense Frequency = pot / (pot + bet): fold more than this and any two cards profit betting into you. You defend by calling with equity and check-raising a polar mix.',
    rows: [
      { tex: 'vs 33% pot', board: '', freq: 0.75, size: 'defend 75%',
        plan: 'Continue: ANY pair, any draw incl. gutshots, two overcards w/ backdoors.',
        why: 'A tiny bet needs your range to defend wide - alpha is only 25%. Folding 9-high with a backdoor is fine; folding bottom pair is not.',
        mtt: 'Ante bloats the pot: defend even wider vs small stabs.' },
      { tex: 'vs 50% pot', board: '', freq: 0.67, size: 'defend 67%',
        plan: 'Continue: pairs, open-enders, flush draws, most gutshots.',
        why: 'Standard sizing, standard rule: two-thirds of your range continues at equilibrium. Bare overcards without backup start folding.',
        mtt: 'Same math - the pot just got there with antes.' },
      { tex: 'vs 66-75% pot', board: '', freq: 0.58, size: 'defend ~58%',
        plan: 'Continue: 3rd pair+, strong draws. Fold weak gutters, bare overs.',
        why: 'Bigger bets are more polar: your bluff-catchers gain value, your fringe floats lose it.',
        mtt: 'ICM shaves the thinnest calls near pay jumps.' },
      { tex: 'vs pot+', board: '', freq: 0.50, size: 'defend ≤50%',
        plan: 'Continue: top pair+, premium draws. Check-raise jam the best combos.',
        why: 'MDF is a ceiling, not a target, vs overbets - real populations under-bluff big sizings. Fold the pretty stuff.',
        mtt: 'vs shove-sized bets, call off = tournament life: apply a risk premium.' },
      { tex: 'Check-raising', board: '', freq: 0.12, size: 'x/r ~10-15%',
        plan: 'Value: two pair+, sets. Bluffs: pair+draw, OESD+overcard, FD.',
        why: 'Your x/r range must stay balanced or good regs float you to death. Every bluff needs outs when called.',
        mtt: 'x/r jam at 25-40bb with pair+draw is the highest-leverage MTT line.' }
    ],
    keys: [
      'MDF = pot/(pot+bet): 33%→75% · 50%→67% · 66%→60% · pot→50%.',
      'Small bets: defend everything playable. Big bets: defend honestly.',
      'Every check-raise bluff has equity when called - no naked stabs.'
    ] },

  /* ================= TURN ================= */
  { id: 'pf-turn-barrel', street: 'turn', formats: ['cash', 'mtt'], scenario: 'Your flop c-bet was called · IP',
    title: 'Turn barreling — the second bullet', sub: 'Barrel by turn-card class, polarize and size up',
    intro: 'Once the flop bet is called, ranges narrow and the turn card redraws the map. Ask: does this card help MY range or the CALLER\'s? Turn bets run bigger (66-100%+) because both ranges are stronger and yours polarizes.',
    rows: [
      { tex: 'Brick (offsuit low)', board: 'Kd8s3c 2h', freq: 0.65, size: '66-75%',
        plan: 'Keep pressure with value + best draws; give up weakest air.',
        why: 'Nothing changed = your range advantage persists. A brick after a called flop bet is a green light for the pre-planned second barrel.',
        mtt: 'At 40bb this bet often commits you - fire it with a plan for the river jab or jam.' },
      { tex: 'Overcard to the board (A/K/Q)', board: 'Td8s4c Kh', freq: 0.70, size: '66%',
        plan: 'Barrel aggressively - broadways smash the RAISER\'s range.',
        why: 'You have every AK/KQ/Kx; the flop caller mostly does not. Their middling pairs just became second pair and must fold or bluff-catch.',
        mtt: 'Best MTT barrel card: survival pressure makes folds even likelier.' },
      { tex: 'Board pairs', board: 'Jh8d5s 8c', freq: 0.55, size: '50-66%',
        plan: 'Bet value + draws; slow with pure air (their trips exist).',
        why: 'Pairing the middle card hits a flop-caller range full of 8x. Pairing the TOP card is better for you (they fold-called Jx less).',
        mtt: 'Same read; jam leverage over a raise favors pair+draw hands.' },
      { tex: 'Flush completes', board: 'Jh8h4d 6h', freq: 0.35, size: '50%',
        plan: 'Slow down without it; barrel your made flushes + nut-blocker bluffs.',
        why: 'The caller floats flop with every flush draw - this card is theirs. Ah-in-hand makes the perfect barrel bluff: you block the nuts they want to raise with.',
        mtt: 'Check-fold more; paying off flushes is how stacks die at 40bb.' },
      { tex: 'Straight completes', board: 'Td9s4c 8d', freq: 0.35, size: '50%',
        plan: 'Check most one-pair; barrel straights, sets, + open-ender bluffs.',
        why: 'Middling connectors live in the caller\'s range - a JT/76 just got there. Your overpairs became bluff-catchers: stop building the pot.',
        mtt: 'Identical, and ICM says do not pay off the check-raise.' },
      { tex: 'New flush draw arrives', board: 'Kc7h2d 9h', freq: 0.62, size: '66%',
        plan: 'Barrel wider - your value + fresh semi-bluffs.',
        why: 'A new draw gives your barrels extra equity and their one-pair hands a worse time. Draws that dominate their folds (better gutters, higher FDs) are ideal.',
        mtt: 'Equity+fold-equity barrels are the backbone of 25-40bb aggression.' }
    ],
    keys: [
      'Barrel bricks and range-favoring overcards; brake on caller-favoring middle cards.',
      'A flop bet without a turn plan is a donation - decide the barrel card classes in advance.',
      'Turn bets are bigger than flop bets: ranges are stronger, yours is polar.'
    ] },

  { id: 'pf-turn-delayed', street: 'turn', formats: ['cash', 'mtt'], scenario: 'Checked-through flop lines',
    title: 'Delayed c-bets & probe bets', sub: 'When the flop goes check-check',
    intro: 'Two mirror spots: you checked back the flop as the raiser (delayed c-bet), or you check-called from the BB and the raiser checked back (probe).',
    rows: [
      { tex: 'Delayed c-bet (IP raiser)', board: 'Ah7d2c 5s', freq: 0.60, size: '50-66%',
        plan: 'Bet the Ax/marginal hands you checked for pot control + new equity.',
        why: 'Their check-call range on the flop never materialized - after two checks, their range is capped and weak. Safe runouts print with the top pairs you slow-played.',
        mtt: 'The freeroll population gives up wildly after showing weakness - stab relentlessly.' },
      { tex: 'Probe: middling turn (BB)', board: 'Kd8s3c 7h', freq: 0.45, size: '50-66%',
        plan: 'Lead cards that favor YOUR range: middle connects, straighty cards.',
        why: 'The raiser checking back caps their range (no strong Kx). A 7/8/9 turn hits your defend range full of middling suited hands - take the pot.',
        mtt: 'Same trigger; smaller sizing works vs capped ranges at all depths.' },
      { tex: 'Probe: A/K turn (BB)', board: '9h6s3d Kc', freq: 0.20, size: 'check',
        plan: 'Mostly check - broadway turns favor the CHECKER-BACK\'s range.',
        why: 'Even a checked-back range holds plenty of Ax/Kx that pot-controlled. Leading into the improvement card torches money.',
        mtt: 'Identical.' }
    ],
    keys: [
      'Two checks = capped range. Attack it on the right cards.',
      'Probe cards that help the caller-range (middling); check the ones that help the raiser (broadway).'
    ] },

  /* ================= RIVER ================= */
  { id: 'pf-river', street: 'river', formats: ['cash', 'mtt'], scenario: 'Third barrel · value, bluffs, bluff-catching',
    title: 'River — the polarized street', sub: 'No more equity: only value, bluffs, and bluff-catchers',
    intro: 'On the river every range collapses into value / bluff / bluff-catcher. Bet size sets the exact bluff ratio: at bet b (pot=1) your bluff share is b/(1+2b) - 50% pot → 25% bluffs, pot → 33%, 2x pot → 40%.',
    rows: [
      { tex: 'Value: clean runout', board: 'Kd8s3c 2h 7d', freq: 0.75, size: '66-100%+',
        plan: 'Bet if worse calls >50% of the time; thin value is where win-rate lives.',
        why: 'Bricked runouts keep your barrel range ahead. IP you may value-bet as thin as strong second pair; OOP tighten one notch.',
        mtt: 'Freeroll fields under-fold vs river bets: value-bet THINNER, bluff less.' },
      { tex: 'Value: scary runout', board: 'Jh8h4d 6h Qh', freq: 0.35, size: '33-50%',
        plan: 'Downshift: block-bet or check strong-but-no-longer-nutted hands.',
        why: 'Four-flush/four-straight rivers flip the nuts distribution. A small block sets your own price and keeps their bluff-raises honest-ish.',
        mtt: 'Block-bet culture is rampant shallow - read raises as nutted.' },
      { tex: 'Bluff selection', board: 'Td9s4c 8d 2c', freq: 0.30, size: 'match value size',
        plan: 'Bluff busted draws that BLOCK calls and UNBLOCK folds.',
        why: 'The best bluff blocks the hands that call (your Ax of the dead flush suit blocks their flush) and does not block the hands that fold. Missed low FDs often block their FOLDS - worst bluffs.',
        mtt: 'Bluff less at ICM pressure points against covered stacks... and more AS the cover.' },
      { tex: 'Bluff-catching', board: '', freq: 0.50, size: 'MDF by size',
        plan: 'Call when you block value / unblock bluffs; fold the reverse.',
        why: 'vs pot bet you need 33% equity: your MDF is 50%. Population rivers are under-bluffed - a "correct" MDF fold vs a live nit is usually right.',
        mtt: 'Risk premium: fold marginal catchers when busting costs equity beyond the pot.' },
      { tex: 'Facing a raise', board: '', freq: 0.15, size: '—',
        plan: 'River raises are the most under-bluffed line in poker. Fold good, cry rarely.',
        why: 'A raise on the last street with no equity left is value-heavy in every population. Your one-pair hands are printing folds.',
        mtt: 'Doubly true - clicking back a river raise off 30bb is how tournaments end.' }
    ],
    keys: [
      'Bluff share by size: b/(1+2b). Half-pot 25% · pot 33% · 2x 40%.',
      'Best bluffs block calls, unblock folds. Blockers ARE the river.',
      'Live/freeroll rivers are under-bluffed: value thinner, hero-call less.'
    ] },

  /* ================= MTT-ONLY: SPR & ICM ================= */
  { id: 'pf-mtt-spr', street: 'flop', formats: ['mtt'], scenario: 'MTT geometry · 20-40bb',
    title: 'MTT postflop — SPR & stack-off gears', sub: 'The stack, not the board, picks your line',
    intro: 'Cash postflop assumes SPR 6-13. MTT pots at 20-40bb see SPR 1-5, and the correct plan is mostly a function of that number. Compute it on the flop: SPR = effective stack ÷ pot.',
    rows: [
      { tex: 'SPR ≤ 1.5', board: '3-bet pot at 25bb', freq: 0.95, size: 'any/jam',
        plan: 'Committed with any pair, any draw, any two overcards. Get it in.',
        why: 'You cannot fold profitably - the pot already offers better than 2:1 on the rest. "Fancy" here is a leak.',
        mtt: '' },
      { tex: 'SPR 2-3', board: '3BP at 40bb / SRP at 25bb', freq: 0.80, size: '33% + jam',
        plan: 'Stack off top pair good kicker+, pair+draw, big combo draws.',
        why: 'One small bet + one jam gets it in geometrically. TPGK is the classic commit line; folding it here is nitty, calling raises with less is spew.',
        mtt: '' },
      { tex: 'SPR 4-6', board: 'SRP at 40bb', freq: 0.65, size: '33-66% ×2',
        plan: 'Two-street value with TPTK+; overpairs happily stack off vs shorter stacks.',
        why: 'Closest to cash logic, but one gear lower: hands that pot-control at 100bb (TPTK) become stack-off hands.',
        mtt: '' },
      { tex: 'ICM pressure (bubble/FT)', board: '', freq: 0.40, size: 'tighten',
        plan: 'Cut thin value, marginal stack-offs, and hero calls. As the BIG stack: attack.',
        why: 'Chips you lose are worth more than chips you win near pay jumps. Medium stacks play a squeezed range; the cover leverages exactly that.',
        mtt: '' }
    ],
    keys: [
      'Say the SPR out loud on every MTT flop: it picks the plan.',
      'TPGK at SPR ≤3 = committed. Stop finding folds.',
      'Bubble: medium stack folds, big stack attacks, short stack picks a spot and jams.'
    ] }
];

/* ---------- postflop drills (explicit, graded) ---------- */
var POSTFLOP_DRILLS = [
  { id: 'pd1', street: 'flop', q: 'Cash 100bb: you open BTN, BB calls. Flop Kd 8s 3c (rainbow, dry). Your whole-range plan?',
    opts: [{ k: 'a', label: 'C-bet small (~33%) at very high frequency' }, { k: 'b', label: 'Check range - you missed' }, { k: 'c', label: 'Bet big (75%) polarized' }],
    a: 'a', sev: 'mistake', why: 'K-high dry is the best c-bet texture in poker: your broadway range crushes a wide BB caller who mostly missed. Small range-bets print - big polar bets waste the advantage.' },
  { id: 'pd2', street: 'flop', q: 'Same spot, flop Td 9s 8c (medium connected). Best baseline?',
    opts: [{ k: 'a', label: 'Range-bet small again' }, { k: 'b', label: 'Polarize: bet strong + draws ~70%, check the middle' }, { k: 'c', label: 'Check everything' }],
    a: 'b', sev: 'mistake', why: 'Middling connected boards smash the CALLER. Betting frequency drops (~45%) and size goes up - value and real draws only. Range-betting here walks into check-raises.' },
  { id: 'pd3', street: 'flop', q: 'You 3-bet SB vs BTN, they call. Flop 6h 6c 3d, SPR ~4. Solver baseline OOP?',
    opts: [{ k: 'a', label: 'Range-bet 33%' }, { k: 'b', label: 'Check ~65%; bets are big and polar' }, { k: 'c', label: 'Check-fold everything without a 6' }],
    a: 'b', sev: 'mistake', why: 'Low paired boards favor the CALLER\'s 77-TT here. OOP 3-bettor checks most of the range; the betting range is polar (overpairs + air) so it sizes up.' },
  { id: 'pd4', street: 'flop', q: 'MTT 40bb: you 3-bet, they call, SPR = 2. You flop TPGK on Ad 8c 3s. Plan?',
    opts: [{ k: 'a', label: 'Bet small, get the rest in by the river - you are committed' }, { k: 'b', label: 'Pot control: check-call one street, re-evaluate' }, { k: 'c', label: 'Check-raise all-in immediately for max pressure' }],
    a: 'a', sev: 'blunder', why: 'At SPR 2, TPGK+ stacks off geometrically: 33% flop + jam turn. Pot-controlling committed hands or folding overpairs at low SPR is the definition of a chip leak.' },
  { id: 'pd5', street: 'flop', q: 'You defend BB vs a 33%-pot c-bet. MDF says you continue with roughly...',
    opts: [{ k: 'a', label: '~50% of your range' }, { k: 'b', label: '~75% of your range' }, { k: 'c', label: '~90% of your range' }],
    a: 'b', sev: 'mistake', why: 'MDF = pot/(pot+bet) = 1/(1+0.33) ≈ 75%. Tiny bets get defended wide: any pair, any draw, gutshots, overcards with backdoors.' },
  { id: 'pd6', street: 'turn', q: 'SRP IP: you c-bet Kd 8s 3c, called. Turn 2h (brick). Baseline?',
    opts: [{ k: 'a', label: 'Barrel value + best draws ~66-75% pot' }, { k: 'b', label: 'Check back - they called, they have it' }, { k: 'c', label: 'Bet 25% to keep it cheap' }],
    a: 'a', sev: 'mistake', why: 'Bricks preserve your range advantage. The planned second barrel comes bigger (ranges are stronger, yours is polar). One-and-done c-betting is a top-3 population leak.' },
  { id: 'pd7', street: 'turn', q: 'You c-bet Jh 8h 4d, called. Turn 6h completes the flush. You hold AdAc (no heart). Best line?',
    opts: [{ k: 'a', label: 'Barrel 66% - overpair is still strong' }, { k: 'b', label: 'Check back / pot control - your hand became a bluff-catcher' }, { k: 'c', label: 'Overbet to protect' }],
    a: 'b', sev: 'mistake', why: 'The flop caller holds every flush draw; this card is theirs. Overpairs without the key heart downgrade to bluff-catchers - stop building the pot.' },
  { id: 'pd8', street: 'turn', q: 'Flop went check-check (you defended BB vs BTN). Turn is a middling 7h on Kd 8s 3c. You should...',
    opts: [{ k: 'a', label: 'Probe bet ~50-66% - the checked-back range is capped' }, { k: 'b', label: 'Check again - stay safe' }, { k: 'c', label: 'Overbet jam' }],
    a: 'a', sev: 'close', why: 'Two checks cap the raiser\'s range (no strong Kx). Middling turns hit YOUR defend range - probe bets on these cards print, especially vs weak fields.' },
  { id: 'pd9', street: 'river', q: 'You triple-barrel bluff pot-size on the river. What share of your betting range should be bluffs at equilibrium?',
    opts: [{ k: 'a', label: '~20%' }, { k: 'b', label: '~33%' }, { k: 'c', label: '~50%' }],
    a: 'b', sev: 'mistake', why: 'At bet=pot the caller gets 2:1 - they need 33% equity - so your polar range holds 2 value : 1 bluff. Formula: b/(1+2b) with b=1 → 33%.' },
  { id: 'pd10', street: 'river', q: 'River bluff candidates: board ran Td 9s 4c 8d 2c and your flush draw bricked. The BEST bluffs...',
    opts: [{ k: 'a', label: 'Block the hands that call, unblock the hands that fold' }, { k: 'b', label: 'Are always the biggest missed draws' }, { k: 'c', label: 'Are random - balance happens naturally' }],
    a: 'a', sev: 'mistake', why: 'Blocker logic IS river strategy: hold cards from their calling range (straight/flush blockers), avoid holding their folding range. Missed low draws often block folds - the worst bluffs.' },
  { id: 'pd11', street: 'river', q: 'Live 1/3 or a freeroll: villain raises your river value bet. Population baseline?',
    opts: [{ k: 'a', label: 'They bluff enough - call at MDF' }, { k: 'b', label: 'River raises are massively under-bluffed: fold good hands' }, { k: 'c', label: 'Always jam over' }],
    a: 'b', sev: 'mistake', why: 'The river raise is the most value-heavy line in live/low-stakes poker. MDF is a ceiling vs balanced players, not a target vs real ones.' },
  { id: 'pd12', street: 'flop', q: 'MTT bubble, you are a MEDIUM stack with TPTK facing a big-stack check-raise jam at SPR 4. ICM says...',
    opts: [{ k: 'a', label: 'Call - you are ahead of jams often enough by chip-EV' }, { k: 'b', label: 'Fold - busting costs more $EV than the pot wins' }, { k: 'c', label: 'ICM only matters heads-up' }],
    a: 'b', sev: 'mistake', why: 'Near pay jumps, chips lost > chips won. Medium stacks fold marginal stack-offs the big stack profitably attacks. Survive the squeeze; the same hand is a snap off the bubble.' }
];

function postflopByStreet(street, format) {
  var out = [];
  for (var i = 0; i < POSTFLOP_CHARTS.length; i++) {
    var c = POSTFLOP_CHARTS[i];
    if (c.street === street && c.formats.indexOf(format) >= 0) out.push(c);
  }
  return out;
}

if (typeof module !== 'undefined') {
  module.exports = {
    POSTFLOP_CHARTS: POSTFLOP_CHARTS, POSTFLOP_DRILLS: POSTFLOP_DRILLS,
    postflopByStreet: postflopByStreet,
    pfMdf: pfMdf, pfAlpha: pfAlpha, pfPotOdds: pfPotOdds, pfBluffShare: pfBluffShare
  };
}
