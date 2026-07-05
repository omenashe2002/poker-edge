/* ============================================================
   EDGE — ranges.js
   GTO baseline preflop ranges (100bb cash, no ante) in the spirit
   of Modern Poker Theory, plus Nash-style push/fold approximations.

   These are SOLVER-STYLE APPROXIMATIONS for study and drilling —
   simplified to primary actions with a "mixed" bucket for hands
   solvers play at meaningful but sub-100% frequency.

   Action precedence inside a chart: first listed action wins if a
   hand appears twice.
   ============================================================ */
'use strict';

var ACTION_META = {
  raise:  { label: 'Raise',  cls: 'act-raise' },
  threebet:{ label: '3-Bet', cls: 'act-raise' },
  fourbet:{ label: '4-Bet',  cls: 'act-raise' },
  shove:  { label: 'Shove',  cls: 'act-raise' },
  call:   { label: 'Call',   cls: 'act-call'  },
  mixed:  { label: 'Mixed',  cls: 'act-mixed' },
  mixedHigh: { label: 'Mostly', cls: 'act-mixed' },
  mixedLow:  { label: 'Rarely', cls: 'act-mixed' },
  fold:   { label: 'Fold',   cls: 'act-fold'  }
};

/* Which buttons a drill shows for each chart group */
var GROUP_ANSWERS = {
  rfi:      ['fold', 'raise'],
  vslimp:   ['fold', 'call', 'raise'],
  vsrfi:    ['fold', 'call', 'threebet'],
  vs3bet:   ['fold', 'call', 'fourbet'],
  vs4bet:   ['fold', 'call', 'shove'],
  pushfold: ['fold', 'shove'],
  mttrfi:   ['fold', 'raise'],
  mttdef:   ['fold', 'call', 'threebet'],
  mtt25:    ['fold', 'shove']
};

var RANGE_CHARTS = [

  /* ================= 9-MAX RFI (open-raising) ================= */
  { id: 'rfi9-utg', group: 'rfi', format: 'cash', depth: 100, game: '9max', pos: 'UTG', title: 'RFI — UTG (9-max)',
    sub: 'Open 2.2–2.5x online · 3–5x live', note: 'Tightest open. Under the gun you act first against 8 players: value-heavy, suited and connected.',
    actions: {
      raise: '66+,ATs+,A5s,KJs+,QJs,JTs,T9s,98s,AQo+',
      mixedHigh: 'A9s,KTs,AJo',
      mixed: '55-44,QTs,A4s',
      mixedLow: '33-22,87s'
    } },
  { id: 'rfi9-utg1', group: 'rfi', format: 'cash', depth: 100, game: '9max', pos: 'UTG+1', title: 'RFI — UTG+1 (9-max)',
    sub: 'Open 2.2–2.5x online · 3–5x live', note: 'Barely wider than UTG.',
    actions: {
      raise: '55+,A9s+,A5s-A4s,KJs+,QJs,JTs,T9s,98s,87s,AJo+',
      mixed: '22-44,KTs,QTs,76s,KQo'
    } },
  { id: 'rfi9-mp', group: 'rfi', format: 'cash', depth: 100, game: '9max', pos: 'MP', title: 'RFI — MP / UTG+2 (9-max)',
    sub: 'Open 2.2–2.5x', note: 'Suited aces and connectors start entering at full frequency.',
    actions: {
      raise: '44+,A9s+,A5s-A3s,KTs+,QTs+,JTs,T9s,98s,87s,76s,AJo+,KQo',
      mixed: '22-33,A8s,A2s,J9s,65s,ATo'
    } },
  { id: 'rfi9-lj', group: 'rfi', format: 'cash', depth: 100, game: '9max', pos: 'LJ', title: 'RFI — Lojack (9-max / UTG 6-max)',
    sub: 'Open 2.2–2.5x', note: 'This chart doubles as the 6-max UTG opening range.',
    actions: {
      raise: '33+,A8s+,A5s-A2s,KTs+,QTs+,J9s+,T9s,98s,87s,76s,65s,ATo+,KQo',
      mixed: '22,A7s-A6s,K9s,Q9s,T8s,54s,KJo,QJo'
    } },
  { id: 'rfi9-hj', group: 'rfi', format: 'cash', depth: 100, game: '9max', pos: 'HJ', title: 'RFI — Hijack (9-max & 6-max)',
    sub: 'Open 2.2–2.5x', note: 'All pairs open profitably from here on.',
    actions: {
      raise: '22+,A7s+,A5s-A2s,K9s+,Q9s+,J9s+,T8s+,97s+,87s,76s,65s,54s,ATo+,KJo+,QJo',
      mixedHigh: 'A6s,K8s,A9o,KTo',
      mixed: 'Q8s,J8s,QTo,JTo',
      mixedLow: '86s,75s'
    } },
  { id: 'rfi9-co', group: 'rfi', format: 'cash', depth: 100, game: '9max', pos: 'CO', title: 'RFI — Cutoff (9-max & 6-max)',
    sub: 'Open 2.2–2.5x', note: '~27% of hands. You only have BTN + blinds left to beat.',
    actions: {
      raise: '22+,A2s+,K8s+,Q9s+,J8s+,T8s+,97s+,86s+,75s+,65s,54s,A9o+,KTo+,QTo+,JTo',
      mixed: 'K7s-K6s,T7s,64s,53s,A8o,K9o,Q9o,J9o,T9o'
    } },
  { id: 'rfi9-btn', group: 'rfi', format: 'cash', depth: 100, game: '9max', pos: 'BTN', title: 'RFI — Button (9-max & 6-max)',
    sub: 'Open 2.2–2.5x', note: '~43%. Position is worth this much. If blinds are tight/passive, open even wider.',
    actions: {
      raise: '22+,A2s+,K2s+,Q4s+,J6s+,T6s+,96s+,85s+,75s+,64s+,54s,43s,A2o+,K8o+,Q9o+,J9o+,T8o+,98o',
      mixedHigh: 'K7o,Q8o,J8o,87o',
      mixed: 'Q3s-Q2s,95s,84s,T7o,97o',
      mixedLow: '74s,63s,53s'
    } },
  { id: 'rfi9-sb', group: 'rfi', format: 'cash', depth: 100, game: '9max', pos: 'SB', title: 'RFI — Small Blind (9-max & 6-max)',
    sub: 'Open 3x (raise-or-fold baseline)', note: 'Solver SB strategies mix limps; a 3x raise-or-fold strategy is a strong, simple baseline. Vs a weak BB, raise even wider.',
    actions: {
      raise: '22+,A2s+,K2s+,Q2s+,J4s+,T6s+,96s+,85s+,75s+,64s+,54s,43s,A2o+,K5o+,Q8o+,J8o+,T8o+,98o,87o',
      mixed: 'J3s-J2s,T5s-T4s,95s,84s,74s,63s,53s,K4o-K3o,Q7o,J7o,T7o,97o,76o'
    } },

  /* ================= VS LIMPERS (live staple) ================= */
  { id: 'lmp-mp', group: 'vslimp', format: 'cash', depth: 100, game: 'both', pos: 'HJ', vs: '1 limper',
    title: 'vs 1 limper — HJ/MP iso', sub: 'Iso-raise to 4-5bb (Call = over-limp)',
    note: 'Limpers under-fold to raises: iso a linear, value-lean range and take initiative. Over-limp only hands that crave cheap multiway flops.',
    actions: {
      raise: '66+,ATs+,A5s,KTs+,QTs+,JTs,T9s,98s,ATo+,KQo',
      mixed: '55-44,A9s,A4s,KJo,QJo,87s',
      call: '33-22,76s,65s,54s'
    } },
  { id: 'lmp-btn', group: 'vslimp', format: 'cash', depth: 100, game: 'both', pos: 'BTN', vs: '1-2 limpers',
    title: 'vs limpers — BTN iso', sub: 'Iso 4-5bb +1bb per limper (Call = over-limp)',
    note: 'Best seat, widest iso. Over-limping speculative hands in position is fine; over-limping offsuit broadways is a leak — iso or fold them.',
    actions: {
      raise: '44+,A8s+,A5s-A4s,K9s+,Q9s+,J9s+,T8s+,98s,87s,ATo+,KJo+,QJo',
      mixed: '33-22,A7s-A6s,A3s-A2s,K8s,Q8s,76s,A9o,KTo',
      call: '65s,54s,43s,T7s,96s,86s,75s' },
    extraMixed: { call: 'J8s,T9s' } },
  { id: 'sb-limp', group: 'vslimp', format: 'cash', depth: 100, game: 'both', pos: 'SB', vs: 'BB only',
    title: 'SB limp strategy (folded to you)', sub: 'Raise 3x value \u00b7 Call = LIMP \u00b7 100bb vs BB',
    note: 'When everyone folds to your small blind, modern strategy MIXES limps with raises: you are out of position with a forced half-bet already in, so a wide limp keeps the pot small with playable junk while your raises stay value-lean. Limp-folding to huge raises is fine; limp-reraise your traps (AA/KK mixed in) if the BB attacks limps relentlessly.',
    actions: {
      raise: '88+,ATs+,A5s-A4s,KJs+,QJs,JTs,AJo+,KQo',
      mixedHigh: '77-66,A9s,KTs,QTs,T9s,98s,ATo,KJo',
      call: '55-22,A8s-A6s,A3s-A2s,K2s-K9s,Q2s-QTs,J2s-J9s,T8s-T2s,97s-92s,87s-82s,76s-72s,65s-62s,54s-52s,43s-42s,32s,A2o-A9o,KTo-K2o,QJo-Q5o,JTo-J7o,T9o-T7o,98o-96o,87o-86o,76o,65o',
      mixedLow: 'K9o'
    } },
  { id: 'lmp-blind', group: 'vslimp', format: 'cash', depth: 100, game: 'both', pos: 'SB', vs: '2+ limpers',
    title: 'vs limpers — blind attack', sub: 'Raise BIG: 5-6bb + 1 per limper',
    note: 'From the blinds you play the bloated pot out of position — so attack only with hands that dominate limping ranges, and size up hard. In the BB, checking your option with everything else is free.',
    actions: {
      raise: '77+,ATs+,A5s,KJs+,KQo,AJo+',
      mixed: '66-55,A9s,KTs,QJs,JTs,ATo'
    } },

  /* ================= DEFENDS vs RFI ================= */
  { id: 'def-bb-ep', group: 'vsrfi', format: 'cash', depth: 100, game: 'both', pos: 'BB', vs: 'EP open',
    title: 'BB vs EP open (2.5x)', sub: '3-bet 4x from the BB',
    note: 'EP ranges are strong: 3-bet linear value + A5s/A4s, call with hands that flop well. Offsuit broadways are mostly folds.',
    actions: {
      threebet: 'QQ+,AKs,A5s,AKo',
      mixed: 'JJ,AQs,A4s,AJo,KQo',
      call: '22-JJ,A2s+,KTs+,QTs+,JTs,T9s,98s,87s,76s,65s,54s,AQo'
    } },
  { id: 'def-bb-mp', group: 'vsrfi', format: 'cash', depth: 100, game: 'both', pos: 'BB', vs: 'MP open',
    title: 'BB vs MP/LJ open (2.5x)', sub: '3-bet 4x',
    note: 'Slightly wider than vs EP in every bucket.',
    actions: {
      threebet: 'JJ+,AQs+,A5s-A4s,AKo',
      mixed: 'TT,AJs,KQs,AQo',
      call: '22-TT,A2s+,K9s+,Q9s+,J9s+,T8s+,97s+,87s,76s,65s,54s,ATo+,KJo+,QJo'
    } },
  { id: 'def-bb-co', group: 'vsrfi', format: 'cash', depth: 100, game: 'both', pos: 'BB', vs: 'CO open',
    title: 'BB vs CO open (2.5x)', sub: '3-bet 4x',
    note: 'Add suited wheel aces as 3-bet bluffs; defend most suited hands by calling.',
    actions: {
      threebet: 'TT+,AJs+,A5s-A3s,KQs,AQo+',
      mixed: '99,ATs,KJs,A9s,AJo,KQo',
      call: '22-88,A2s+,K7s+,Q8s+,J8s+,T7s+,96s+,86s+,75s+,64s+,54s,A7o+,KTo+,QTo+,JTo,T9o,K9o,Q9o,98o'
    } },
  { id: 'def-bb-btn', group: 'vsrfi', format: 'cash', depth: 100, game: 'both', pos: 'BB', vs: 'BTN open',
    title: 'BB vs BTN open (2.5x)', sub: '3-bet 4x',
    note: 'Defend wide — you close action getting ~3.6:1. Vs live 3x opens, trim the weakest offsuit calls.',
    actions: {
      threebet: '99+,ATs+,A5s-A2s,KJs+,AQo+',
      mixedHigh: '88,A9s,AJo,KQo',
      mixed: '77-66,KTs,QJs,JTs',
      mixedLow: '76s,65s',
      call: '22-55,A2s+,K4s+,Q6s+,J7s+,T7s+,96s+,86s+,75s+,64s+,54s,43s,A4o+,K9o+,Q9o+,J9o+,T8o+,98o,87o'
    } },
  { id: 'def-bb-sb', group: 'vsrfi', format: 'cash', depth: 100, game: 'both', pos: 'BB', vs: 'SB open',
    title: 'BB vs SB open (3x)', sub: '3-bet ~3.5x IP',
    note: 'You have position for the whole hand: 3-bet aggressively and call very wide.',
    actions: {
      threebet: '88+,A9s+,A5s-A2s,KTs+,QTs+,JTs,AJo+,KQo',
      mixed: '55-77,A8s,K9s,T9s,98s,ATo,KJo',
      call: '22-44,A2s+,K5s+,Q7s+,J7s+,T7s+,96s+,86s+,75s+,64s+,54s,43s,A4o+,K9o+,Q9o+,J9o+,T8o+,98o,87o,76o'
    } },
  { id: 'def-sb-ep', group: 'vsrfi', format: 'cash', depth: 100, game: 'both', pos: 'SB', vs: 'EP open',
    title: 'SB vs EP open', sub: '3-bet 4–4.5x OOP (3-bet or fold)',
    note: 'From the SB play 3-bet-or-fold: calling invites the BB in and plays a capped range OOP.',
    actions: {
      threebet: 'JJ+,AQs+,AKo',
      mixed: 'TT,AJs,A5s,KQs,AQo'
    } },
  { id: 'def-sb-mp', group: 'vsrfi', format: 'cash', depth: 100, game: 'both', pos: 'SB', vs: 'MP open',
    title: 'SB vs MP/LJ open', sub: '3-bet 4–4.5x (3-bet or fold)',
    actions: {
      threebet: 'TT+,AJs+,A5s-A4s,KQs,AQo+',
      mixed: '99,ATs,KJs,AJo'
    } },
  { id: 'def-sb-co', group: 'vsrfi', format: 'cash', depth: 100, game: 'both', pos: 'SB', vs: 'CO open',
    title: 'SB vs CO open', sub: '3-bet 4–4.5x (3-bet or fold)',
    actions: {
      threebet: '99+,ATs+,A5s-A3s,KJs+,QJs,AQo+',
      mixed: '77-88,A9s,KTs,QTs,T9s,AJo,KQo'
    } },
  { id: 'def-sb-btn', group: 'vsrfi', format: 'cash', depth: 100, game: 'both', pos: 'SB', vs: 'BTN open',
    title: 'SB vs BTN open', sub: '3-bet 4x (3-bet or fold)',
    note: 'BTN opens ~43%, so punish it: ~16% 3-bet.',
    actions: {
      threebet: '66+,A8s+,A5s-A2s,KTs+,QTs+,JTs,T9s,98s,ATo+,KJo+',
      mixed: '22-55,A7s-A6s,K9s,Q9s,J9s,87s,76s,A9o,KTo,QJo'
    } },
  { id: 'def-btn-ep', group: 'vsrfi', format: 'cash', depth: 100, game: 'both', pos: 'BTN', vs: 'EP open',
    title: 'BTN vs EP open', sub: '3-bet 3x IP',
    note: 'Flat with pairs and the best suited connectors — you have position vs a strong range.',
    actions: {
      threebet: 'JJ+,AQs+,AKo',
      mixed: 'TT,AJs,A5s-A4s,KQs,AQo',
      call: '22-99,ATs,KTs+,QTs+,JTs,T9s,98s,87s,76s,65s' },
    extraMixed: { call: 'A9s,K9s,J9s,54s,AJo,KQo' } },
  { id: 'def-btn-mp', group: 'vsrfi', format: 'cash', depth: 100, game: 'both', pos: 'BTN', vs: 'MP open',
    title: 'BTN vs MP/LJ open', sub: '3-bet 3x IP',
    actions: {
      threebet: 'TT+,AQs+,A5s-A4s,AKo',
      mixed: '99,AJs,KQs,AQo',
      call: '22-88,ATs,KTs+,QTs+,JTs,T9s,98s,87s,76s,65s,54s' },
    extraMixed: { call: 'A9s,J9s,T8s,AJo,KQo' } },
  { id: 'def-btn-co', group: 'vsrfi', format: 'cash', depth: 100, game: 'both', pos: 'BTN', vs: 'CO open',
    title: 'BTN vs CO open', sub: '3-bet 3x IP',
    actions: {
      threebet: '99+,AJs+,A5s-A3s,KQs,AQo+',
      mixed: '66-88,ATs,KJs,QJs,JTs,T9s,AJo,KQo,87s',
      call: '22-55,A9s-A2s,KTs,QTs,98s,76s,65s,54s' },
    extraMixed: { call: 'K9s,Q9s,J9s,T8s,ATo,KJo' } },

  /* ================= FACING A 3-BET (you opened) ================= */
  { id: 'v3b-ep', group: 'vs3bet', format: 'cash', depth: 100, game: 'both', pos: 'EP', vs: '3-bet',
    title: 'You open EP, facing a 3-bet', sub: '4-bet ~2.2–2.5x the 3-bet',
    note: 'EP vs 3-bet is tight: continue mostly with the top of your range.',
    actions: {
      fourbet: 'KK+',
      mixed: 'QQ,AKs,A5s',
      call: '99-JJ,AJs+,KQs,AKo' },
    extraMixed: { call: '88,77,ATs,KJs,QJs,JTs,T9s,AQo' } },
  { id: 'v3b-mp', group: 'vs3bet', format: 'cash', depth: 100, game: 'both', pos: 'MP', vs: '3-bet',
    title: 'You open MP/LJ, facing a 3-bet', sub: '4-bet ~2.2–2.5x',
    actions: {
      fourbet: 'QQ+,AKs',
      mixed: 'JJ,AKo,A5s',
      call: '88-JJ,ATs+,KJs+,QJs,JTs' },
    extraMixed: { call: '66-77,KTs,T9s,98s,AQo' } },
  { id: 'v3b-co-btn', group: 'vs3bet', format: 'cash', depth: 100, game: 'both', pos: 'CO', vs: 'BTN 3-bet',
    title: 'You open CO, BTN 3-bets (you are OOP)', sub: '4-bet ~2.2–2.5x',
    note: 'Out of position vs the 3-bettor: defend tighter than vs blinds.',
    actions: {
      fourbet: 'QQ+,AKs,A5s',
      mixed: 'JJ,AKo,A4s',
      call: '77-JJ,ATs+,KJs+,QJs,JTs,T9s,AQo' },
    extraMixed: { call: '55-66,A9s,KTs,QTs,98s,87s,AJo,KQo' } },
  { id: 'v3b-btn-blind', group: 'vs3bet', format: 'cash', depth: 100, game: 'both', pos: 'BTN', vs: 'blind 3-bet',
    title: 'You open BTN, SB/BB 3-bets (you are IP)', sub: '4-bet ~2.2x',
    note: 'In position you defend wide — blinds 3-bet with many bluffs vs button opens.',
    actions: {
      fourbet: 'QQ+,AKs,A5s-A4s',
      mixed: 'JJ,AKo,A3s,KQs',
      call: '55-JJ,ATs+,KTs+,QTs+,JTs,T9s,98s,87s,76s,AQo' },
    extraMixed: { call: '22-44,A9s,K9s,65s,54s,AJo,KQo' } },
  { id: 'v3b-sb-bb', group: 'vs3bet', format: 'cash', depth: 100, game: 'both', pos: 'SB', vs: 'BB 3-bet',
    title: 'You open SB, BB 3-bets', sub: '4-bet ~2.2–2.5x',
    actions: {
      fourbet: 'QQ+,AKs,A5s',
      mixed: 'JJ,AKo,A4s',
      call: '55-JJ,ATs+,KTs+,QTs+,JTs,T9s,98s,AQo' },
    extraMixed: { call: '22-44,A9s,87s,76s,AJo,KQo' } },
  { id: 'v4b', group: 'vs4bet', format: 'cash', depth: 100, game: 'both', pos: 'Any', vs: '4-bet',
    title: 'You 3-bet, facing a 4-bet (100bb)', sub: 'Shove ≈ jam over a ~2.3x 4-bet',
    note: 'Vs live players who rarely 4-bet bluff, fold the mixed bucket and most of the calls.',
    actions: {
      shove: 'KK+',
      mixed: 'QQ,AKs,A5s-A4s',
      call: 'JJ-QQ,AQs+,AKo' },
    extraMixed: { call: 'TT,AJs,KQs' } },

  /* ================= PUSH/FOLD (MTT, no ante baseline) ================= */
  { id: 'pf5-ep', group: 'pushfold', format: 'mtt', depth: 5, game: 'mtt', pos: 'EP', stack: 5, title: 'Shove — EP, 5bb',
    actions: { shove: '22+,A2s+,K7s+,Q9s+,J9s+,T9s,A8o+,KTo+' } },
  { id: 'pf5-mp', group: 'pushfold', format: 'mtt', depth: 5, game: 'mtt', pos: 'MP', stack: 5, title: 'Shove — MP, 5bb',
    actions: { shove: '22+,A2s+,K5s+,Q8s+,J8s+,T8s+,98s,A4o+,K9o+,QTo+' } },
  { id: 'pf5-co', group: 'pushfold', format: 'mtt', depth: 5, game: 'mtt', pos: 'CO', stack: 5, title: 'Shove — CO, 5bb',
    actions: { shove: '22+,A2s+,K2s+,Q5s+,J7s+,T7s+,97s+,87s,A2o+,K7o+,Q9o+,JTo' } },
  { id: 'pf5-btn', group: 'pushfold', format: 'mtt', depth: 5, game: 'mtt', pos: 'BTN', stack: 5, title: 'Shove — BTN, 5bb',
    actions: { shove: '22+,A2s+,K2s+,Q2s+,J4s+,T6s+,96s+,86s+,75s+,65s,A2o+,K4o+,Q7o+,J8o+,T8o+,98o' } },
  { id: 'pf5-sb', group: 'pushfold', format: 'mtt', depth: 5, game: 'mtt', pos: 'SB', stack: 5, title: 'Shove — SB, 5bb',
    note: 'At 5bb the SB jams nearly any two against a single opponent.',
    actions: { shove: '22+,A2s+,K2s+,Q2s+,J2s+,T2s+,92s+,82s+,72s+,62s+,52s+,42s+,32s,A2o+,K2o+,Q2o+,J4o+,T6o+,96o+,86o+,76o' } },
  { id: 'pf8-ep', group: 'pushfold', format: 'mtt', depth: 8, game: 'mtt', pos: 'EP', stack: 8, title: 'Shove — EP, 8bb',
    actions: { shove: '22+,A7s+,A5s,KTs+,QJs,JTs,ATo+,KQo' } },
  { id: 'pf8-mp', group: 'pushfold', format: 'mtt', depth: 8, game: 'mtt', pos: 'MP', stack: 8, title: 'Shove — MP, 8bb',
    actions: { shove: '22+,A4s+,KTs+,QTs+,JTs,T9s,A9o+,KJo+' } },
  { id: 'pf8-co', group: 'pushfold', format: 'mtt', depth: 8, game: 'mtt', pos: 'CO', stack: 8, title: 'Shove — CO, 8bb',
    actions: { shove: '22+,A2s+,K8s+,Q9s+,J9s+,T8s+,98s,A5o+,KTo+,QJo' } },
  { id: 'pf8-btn', group: 'pushfold', format: 'mtt', depth: 8, game: 'mtt', pos: 'BTN', stack: 8, title: 'Shove — BTN, 8bb',
    actions: { shove: '22+,A2s+,K4s+,Q7s+,J8s+,T7s+,97s+,86s+,76s,A2o+,K8o+,QTo+,JTo,T9o' } },
  { id: 'pf8-sb', group: 'pushfold', format: 'mtt', depth: 8, game: 'mtt', pos: 'SB', stack: 8, title: 'Shove — SB, 8bb',
    actions: { shove: '22+,A2s+,K2s+,Q3s+,J5s+,T6s+,96s+,86s+,75s+,65s,54s,A2o+,K5o+,Q8o+,J9o+,T9o' } },
  { id: 'pf10-ep', group: 'pushfold', format: 'mtt', depth: 10, game: 'mtt', pos: 'EP', stack: 10, title: 'Shove — EP, 10bb',
    actions: { shove: '44+,ATs+,A5s,KQs,AJo+' } },
  { id: 'pf10-mp', group: 'pushfold', format: 'mtt', depth: 10, game: 'mtt', pos: 'MP', stack: 10, title: 'Shove — MP, 10bb',
    actions: { shove: '33+,A8s+,A5s-A4s,KTs+,QJs,ATo+,KQo' } },
  { id: 'pf10-co', group: 'pushfold', format: 'mtt', depth: 10, game: 'mtt', pos: 'CO', stack: 10, title: 'Shove — CO, 10bb',
    actions: { shove: '22+,A4s+,K9s+,QTs+,JTs,T9s,A8o+,KJo+' } },
  { id: 'pf10-btn', group: 'pushfold', format: 'mtt', depth: 10, game: 'mtt', pos: 'BTN', stack: 10, title: 'Shove — BTN, 10bb',
    actions: { shove: '22+,A2s+,K6s+,Q8s+,J8s+,T8s+,98s,87s,A3o+,K9o+,QTo+,JTo' } },
  { id: 'pf10-sb', group: 'pushfold', format: 'mtt', depth: 10, game: 'mtt', pos: 'SB', stack: 10, title: 'Shove — SB, 10bb',
    actions: { shove: '22+,A2s+,K2s+,Q5s+,J7s+,T7s+,97s+,87s,76s,A2o+,K7o+,Q9o+,J9o+,T9o' } },
  { id: 'pf12-ep', group: 'pushfold', format: 'mtt', depth: 12, game: 'mtt', pos: 'EP', stack: 12, title: 'Shove — EP, 12bb',
    note: 'At 12bb+ a small raise-fold/raise-call tree is often better than open-jamming the top of range; this is the pure-jam baseline.',
    actions: { shove: '66+,ATs+,KQs,AQo+' } },
  { id: 'pf12-mp', group: 'pushfold', format: 'mtt', depth: 12, game: 'mtt', pos: 'MP', stack: 12, title: 'Shove — MP, 12bb',
    actions: { shove: '55+,A9s+,A5s,KJs+,AJo+,KQo' } },
  { id: 'pf12-co', group: 'pushfold', format: 'mtt', depth: 12, game: 'mtt', pos: 'CO', stack: 12, title: 'Shove — CO, 12bb',
    actions: { shove: '33+,A7s+,A5s-A4s,KTs+,QJs,JTs,ATo+,KQo' } },
  { id: 'pf12-btn', group: 'pushfold', format: 'mtt', depth: 12, game: 'mtt', pos: 'BTN', stack: 12, title: 'Shove — BTN, 12bb',
    actions: { shove: '22+,A2s+,K8s+,Q9s+,J9s+,T9s,A5o+,KTo+,QJo' } },
  { id: 'pf12-sb', group: 'pushfold', format: 'mtt', depth: 12, game: 'mtt', pos: 'SB', stack: 12, title: 'Shove — SB, 12bb',
    actions: { shove: '22+,A2s+,K4s+,Q7s+,J8s+,T8s+,98s,87s,A2o+,K8o+,QTo+,JTo' } },
  { id: 'pf15-ep', group: 'pushfold', format: 'mtt', depth: 15, game: 'mtt', pos: 'EP', stack: 15, title: 'Shove — EP, 15bb',
    actions: { shove: '77+,AJs+,AQo+' } },
  { id: 'pf15-mp', group: 'pushfold', format: 'mtt', depth: 15, game: 'mtt', pos: 'MP', stack: 15, title: 'Shove — MP, 15bb',
    actions: { shove: '66+,ATs+,KQs,AQo+' } },
  { id: 'pf15-co', group: 'pushfold', format: 'mtt', depth: 15, game: 'mtt', pos: 'CO', stack: 15, title: 'Shove — CO, 15bb',
    actions: { shove: '44+,A8s+,A5s,KJs+,QJs,AJo+,KQo' } },
  { id: 'pf15-btn', group: 'pushfold', format: 'mtt', depth: 15, game: 'mtt', pos: 'BTN', stack: 15, title: 'Shove — BTN, 15bb',
    actions: { shove: '22+,A4s+,K9s+,QTs+,JTs,T9s,A8o+,KJo+' } },
  { id: 'pf15-sb', group: 'pushfold', format: 'mtt', depth: 15, game: 'mtt', pos: 'SB', stack: 15, title: 'Shove — SB, 15bb',
    actions: { shove: '22+,A2s+,K6s+,Q9s+,J9s+,T8s+,98s,A3o+,K9o+,QTo+,JTo' } },

  /* ================= MTT 40bb OPENS (ante in play) =================
     Linear ranges built on the 5-6-7-8-9-10 suited-floor rule with
     8-9-10 offsuit floors. Antes add dead money: ~2-4% wider than
     no-ante. Speculative small pairs/connectors tighten vs 100bb. */
  { id: 'mtt40-utg', group: 'mttrfi', format: 'mtt', depth: 40, game: 'mtt', pos: 'UTG', title: 'MTT Open — UTG (40bb, ante)',
    sub: 'Open 2.2-2.5x · suited floor: 9x · offsuit floor: Jx', note: 'Tightest seat. Suited 9x (T9s, J9s, Q9s) is the perimeter; below it, fold. Small pairs lose set-mine value at 40bb: 44-22 are mixes at best.',
    actions: {
      raise: '66+,A9s+,A5s,KTs+,QTs+,JTs,T9s,98s,AJo+,KJo+,QJo',
      mixedHigh: 'J9s,Q9s,A4s',
      mixed: '55-44,K9s,87s,ATo',
      mixedLow: '33-22,76s'
    } },
  { id: 'mtt40-utg1', group: 'mttrfi', format: 'mtt', depth: 40, game: 'mtt', pos: 'UTG+1', title: 'MTT Open — UTG+1 (40bb, ante)',
    sub: 'Open 2.2-2.5x', note: 'One notch wider than UTG: same 9x suited floor at full frequency, offsuit Tx starts mixing.',
    actions: {
      raise: '55+,A9s+,A5s-A4s,K9s+,Q9s+,J9s+,T9s,98s,87s,AJo+,KJo+,QJo',
      mixed: '44-33,A8s,A3s,T8s,76s,ATo,KTo',
      mixedLow: '22,QTo'
    } },
  { id: 'mtt40-lj', group: 'mttrfi', format: 'mtt', depth: 40, game: 'mtt', pos: 'LJ', title: 'MTT Open — Lojack (40bb, ante)',
    sub: 'Open 2.2-2.5x · suited floor: 8x', note: 'Suited 8x floor (T8s, J8s, Q8s). Offsuit floor drops to Tx (KTo, QTo, JTo).',
    actions: {
      raise: '44+,A8s+,A5s-A3s,K9s+,Q9s+,J9s+,T8s+,98s,87s,76s,ATo+,KTo+,QTo+,JTo',
      mixed: '33-22,A7s,A2s,K8s,Q8s,J8s,65s,A9o,KQo',
      mixedLow: '97s,54s'
    } },
  { id: 'mtt40-hj', group: 'mttrfi', format: 'mtt', depth: 40, game: 'mtt', pos: 'HJ', title: 'MTT Open — Hijack (40bb, ante)',
    sub: 'Open 2.2-2.3x · suited floor: 7x', note: 'Suited 7x floor (T7s, J7s, Q7s). All pairs now open.',
    actions: {
      raise: '22+,A7s+,A5s-A2s,K8s+,Q8s+,J8s+,T7s+,97s+,87s,76s,65s,ATo+,KTo+,QTo+,JTo',
      mixed: 'A6s,K7s,Q7s,J7s,86s,75s,54s,A9o,K9o,T9o',
      mixedLow: 'A8o,Q9o,64s'
    } },
  { id: 'mtt40-co', group: 'mttrfi', format: 'mtt', depth: 40, game: 'mtt', pos: 'CO', title: 'MTT Open — Cutoff (40bb, ante)',
    sub: 'Open 2.2-2.3x · suited floor: 6x', note: 'Suited 6x floor (T6s, J6s, Q6s, 86s), offsuit floor 9x (K9o, Q9o, J9o, T9o).',
    actions: {
      raise: '22+,A2s+,K6s+,Q7s+,J7s+,T6s+,96s+,86s+,75s+,65s,54s,A8o+,K9o+,Q9o+,J9o+,T9o',
      mixed: 'K5s,Q6s,J6s,95s,85s,74s,64s,A7o-A5o,98o',
      mixedLow: '53s,43s,K8o,Q8o'
    } },
  { id: 'mtt40-btn', group: 'mttrfi', format: 'mtt', depth: 40, game: 'mtt', pos: 'BTN', title: 'MTT Open — Button (40bb, ante)',
    sub: 'Open 2.2x · suited floor: 5x · ~54% w/ mixes', note: 'Widest open in poker: suited 5x floor (85s, 95s, T5s, J5s), offsuit floor 8x. With antes the BTN steal prints — do not tighten this seat.',
    actions: {
      raise: '22+,A2s+,K2s+,Q4s+,J5s+,T5s+,95s+,85s+,74s+,64s+,53s+,43s,A2o+,K8o+,Q8o+,J8o+,T8o+,98o,87o',
      mixed: 'Q3s-Q2s,J4s-J3s,T4s,94s,84s,73s,63s,42s,K7o-K5o,Q7o,J7o,T7o,97o,76o',
      mixedLow: '32s,86o,65o'
    } },
  { id: 'mtt40-sb', group: 'mttrfi', format: 'mtt', depth: 40, game: 'mtt', pos: 'SB', title: 'MTT Open — Small Blind (40bb, ante)',
    sub: 'Raise 2.5-3x · raise-or-fold', note: 'At 40bb the SB plays raise-or-fold: limping OOP with no initiative is too exploitable. ~35%, value-lean because the BB realizes equity well in position.',
    actions: {
      raise: '22+,A2s+,K5s+,Q7s+,J7s+,T7s+,97s+,86s+,76s,65s,54s,A4o+,K9o+,QTo+,JTo,T9o',
      mixed: 'K4s-K2s,Q6s-Q5s,J6s,T6s,96s,85s,75s,64s,A3o-A2o,K8o,Q9o,J9o,98o',
      mixedLow: '53s,43s,87o'
    } },

  /* ================= MTT BB DEFENSE 40bb (vs ~2.3x + ante) =========
     The BB closes action getting a huge ante-boosted price: defend %
     scales with the opener's width. Rule of 5-6-7: the offsuit low-card
     floor vs BTN=5x, CO=6x, HJ=7x; nearly all suited hands defend vs LP. */
  { id: 'mttdef-bb-ep', group: 'mttdef', format: 'mtt', depth: 40, game: 'mtt', pos: 'BB', vs: 'EP open',
    title: 'MTT BB vs EP open (40bb)', sub: '3-bet ~3.8x · defend ~42%',
    note: 'EP opens are strong even in MTTs: 3-bet linear value plus wheel-ace bluffs, call hands that flop well. Offsuit floor tightens to broadways and 98o-type connects.',
    actions: {
      threebet: 'QQ+,AKs,A5s,AKo',
      mixed: 'JJ,AQs,A4s,AQo',
      call: '22-JJ,A2s+,K2s+,Q4s+,J6s+,T6s+,96s+,85s+,75s+,64s+,54s,43s,ATo+,KTo+,QTo+,JTo,T9o,98o,87o',
      mixedLow: 'A9o-A5o,K9o,Q9o,J9o,T8o,76o'
    } },
  { id: 'mttdef-bb-hj', group: 'mttdef', format: 'mtt', depth: 40, game: 'mtt', pos: 'BB', vs: 'HJ open',
    title: 'MTT BB vs HJ open (40bb)', sub: '3-bet ~3.8x · defend ~53% · offsuit floor: 7x',
    note: 'Rule of 7: defend offsuit down to the 7-low-card floor (T7o, J7o, Q7o, K7o, 87o) and virtually all suited hands.',
    actions: {
      threebet: 'JJ+,AQs+,A5s-A4s,AKo',
      mixed: 'TT,AJs,KQs,A3s-A2s,AQo',
      call: '22-TT,A2s+,K2s+,Q4s+,J6s+,T6s+,95s+,85s+,74s+,64s+,53s+,43s,A2o+,K7o+,Q7o+,J7o+,T7o+,97o+,87o,76o'
    } },
  { id: 'mttdef-bb-co', group: 'mttdef', format: 'mtt', depth: 40, game: 'mtt', pos: 'BB', vs: 'CO open',
    title: 'MTT BB vs CO open (40bb)', sub: '3-bet ~3.8x · defend ~66% · offsuit floor: 6x',
    note: 'Rule of 6: offsuit 6x floor (T6o, J6o, Q6o, K6o, 76o, 86o), every suited hand defends.',
    actions: {
      threebet: 'TT+,AJs+,A5s-A3s,KQs,AQo+',
      mixed: '99,ATs,KJs,A2s,AJo,KQo',
      call: '22-99,A2s+,K2s+,Q2s+,J2s+,T2s+,92s+,83s+,73s+,62s+,52s+,42s+,32s,A2o+,K6o+,Q6o+,J6o+,T6o+,96o+,86o+,76o,65o'
    } },
  { id: 'mttdef-bb-btn', group: 'mttdef', format: 'mtt', depth: 40, game: 'mtt', pos: 'BB', vs: 'BTN open',
    title: 'MTT BB vs BTN open (40bb)', sub: '3-bet ~3.5x · defend ~74% · offsuit floor: 5x',
    note: 'The BTN opens half the deck, and the ante makes your price absurd: defend every suited hand and offsuit down to the 5x floor (T5o, J5o, Q5o, K5o, 65o, 75o). Fold only the true bottom.',
    actions: {
      threebet: '99+,ATs+,A5s-A2s,KJs+,AQo+',
      mixed: '88-77,A9s,KTs,QJs,JTs,AJo,ATo,KQo',
      call: '22-66,A2s+,K2s+,Q2s+,J2s+,T2s+,92s+,82s+,72s+,62s+,52s+,42s+,32s,A2o+,K5o+,Q5o+,J5o+,T5o+,95o+,85o+,75o+,65o,54o'
    } },

  /* ================= MTT 25bb OPEN-SHOVES =================
     20-35bb is raise/fold territory where open-jamming LP replaces the
     min-open you cannot call off with. Nash-style, ante-adjusted. */
  { id: 'mtt25-co', group: 'mtt25', format: 'mtt', depth: 25, game: 'mtt', pos: 'CO', stack: 25, title: 'MTT Open-shove — CO (25bb)',
    sub: 'Jam first-in · ~23%', note: 'At 25bb, min-open/fold bleeds chips. Jamming denies 3-bet leverage and realizes 100% equity. Min-raise-and-call-off only with TT+/AQ+.',
    actions: {
      shove: '44+,A2s+,A9o+,KJs+,KQo,QJs',
      mixed: '33-22,KTs+,QTs+,JTs,T9s,98s,87s,A8o-A5o,KJo,QJo'
    } },
  { id: 'mtt25-btn', group: 'mtt25', format: 'mtt', depth: 25, game: 'mtt', pos: 'BTN', stack: 25, title: 'MTT Open-shove — BTN (25bb)',
    sub: 'Jam first-in · ~42%', note: 'Any pair, any ace, huge suited coverage: the blinds must call off 25bb or surrender the ante-fattened pot.',
    actions: {
      shove: '22+,A2s+,A2o+,K2s+,K8o+,Q8s+,Q9o+,J8s+,J9o+,T8s+,T9o,98s',
      mixed: 'K7o-K5o,Q8o,J8o,97s,87s,76s'
    } },
  { id: 'mtt25-sb', group: 'mtt25', format: 'mtt', depth: 25, game: 'mtt', pos: 'SB', stack: 25, title: 'MTT Open-shove — SB (25bb)',
    sub: 'Jam first-in · ~37%', note: 'One player to beat. Jam wide but respect that the BB gets a fine price to look you up.',
    actions: {
      shove: '22+,A2s+,A7o+,K5s+,KTo+,Q8s+,QTo+,J9s+,JTo,T8s+,98s,87s',
      mixed: 'A6o-A2o,K4s-K2s,K9o,Q7s-Q6s,J8s,J9o,T7s,T9o,97s,76s,65s,54s'
    } }
];

/* Position groupings used by the drill generator */
var POSITIONS_9MAX = ['UTG', 'UTG+1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB'];
var POSITIONS_6MAX = ['LJ', 'HJ', 'CO', 'BTN', 'SB']; // LJ = 6-max UTG

/* Build compiled chart objects once */
var COMPILED_CHARTS = {};
var FREQ_TIERS = { mixedHigh: 0.75, mixed: 0.5, mixedLow: 0.25 };
(function compileAll() {
  for (var i = 0; i < RANGE_CHARTS.length; i++) {
    var spec = RANGE_CHARTS[i];
    var actions = {};
    for (var act in spec.actions) {
      if (spec.actions.hasOwnProperty(act)) actions[act] = spec.actions[act];
    }
    var chart = buildChart(actions);
    // frequency map: how often each in-chart hand actually plays at equilibrium
    var freq = {};
    for (var a3 in spec.actions) {
      if (!spec.actions.hasOwnProperty(a3)) continue;
      var f = FREQ_TIERS[a3] !== undefined ? FREQ_TIERS[a3] : 1;
      var cls3 = parseRange(spec.actions[a3]);
      for (var lb3 in cls3) if (freq[lb3] === undefined) freq[lb3] = f;
    }
    // extraMixed: hands that are mixed-into-a-specific-action (render amber,
    // grade as "that action OR fold both fine")
    var extraMixed = {};
    if (spec.extraMixed) {
      for (var a2 in spec.extraMixed) {
        if (!spec.extraMixed.hasOwnProperty(a2)) continue;
        var cls = parseRange(spec.extraMixed[a2]);
        for (var lbl in cls) {
          if (chart[lbl] === undefined) { chart[lbl] = 'mixed'; extraMixed[lbl] = a2; }
        }
      }
    }
    for (var lb4 in chart) {
      if (chart[lb4] === 'mixedHigh' || chart[lb4] === 'mixedLow') chart[lb4] = 'mixed';
      if (chart[lb4] === 'mixed' && freq[lb4] === undefined) freq[lb4] = 0.5;
    }
    COMPILED_CHARTS[spec.id] = { spec: spec, chart: chart, extraMixed: extraMixed, freq: freq };
  }
})();

function getChart(id) { return COMPILED_CHARTS[id]; }
function chartsByGroup(group) {
  var out = [];
  for (var i = 0; i < RANGE_CHARTS.length; i++) {
    if (RANGE_CHARTS[i].group === group) out.push(COMPILED_CHARTS[RANGE_CHARTS[i].id]);
  }
  return out;
}

/* Answer buttons available for a chart: 'fold' plus whatever primary
   actions the chart actually contains (in GROUP_ANSWERS order). */
function availableAnswers(chartId) {
  var c = COMPILED_CHARTS[chartId];
  var all = GROUP_ANSWERS[c.spec.group];
  var present = { fold: true };
  for (var lbl in c.chart) {
    var a = c.chart[lbl];
    if (a !== 'mixed') present[a] = true;
  }
  // mixed-into-action targets count too
  for (var lbl2 in c.extraMixed) present[c.extraMixed[lbl2]] = true;
  var out = [];
  for (var i = 0; i < all.length; i++) if (present[all[i]]) out.push(all[i]);
  return out;
}

/* For a drill: acceptable action keys for a hand class on a chart.
   Mixed-frequency hands are near-zero EV differences, so any available
   answer is accepted (with an explanatory note in the UI). Hands mixed
   into a specific action (extraMixed) accept that action or fold. */
function correctAnswers(chartId, label) {
  var c = COMPILED_CHARTS[chartId];
  var act = c.chart[label];
  if (act === undefined) return ['fold'];
  if (act === 'mixed') {
    var primary = c.extraMixed[label];
    if (primary) return [primary, 'fold'];
    return availableAnswers(chartId).slice();
  }
  return [act];
}

if (typeof module !== 'undefined') {
  module.exports = {
    RANGE_CHARTS: RANGE_CHARTS, COMPILED_CHARTS: COMPILED_CHARTS,
    getChart: getChart, chartsByGroup: chartsByGroup, correctAnswers: correctAnswers,
    availableAnswers: availableAnswers,
    ACTION_META: ACTION_META, GROUP_ANSWERS: GROUP_ANSWERS,
    POSITIONS_9MAX: POSITIONS_9MAX, POSITIONS_6MAX: POSITIONS_6MAX
  };
}
