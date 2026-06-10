/* ============================================================
   EDGE — videos.js
   Curated video learning: per-lesson picks from elite players
   and coaches, plus the masters' channel library.
   Links use channel pages and pinned searches (never go stale).
   ============================================================ */
'use strict';

function ytSearch(q) { return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q); }

var MASTERS = [
  { name: 'GTO Wizard', url: 'https://www.youtube.com/@GTOWizard', why: 'The deepest solver-based theory channel — Tombos21 and team turn equilibrium outputs into human strategy. Your charts speak their language.' },
  { name: 'Bart Hanson — Crush Live Poker', url: 'https://www.youtube.com/@CrushlivePoker', why: 'THE live cash-game specialist. Hand-reading call-ins at 2/5 and 5/10 — exactly the games and player pool you face.' },
  { name: 'Jonathan Little', url: 'https://www.youtube.com/@JonathanLittlePoker', why: 'WPT champion, most prolific hand-breakdown teacher on YouTube. Clear fundamentals, famous-hand analyses.' },
  { name: 'Doug Polk', url: 'https://www.youtube.com/@DougPolkPoker', why: 'Three WSOP bracelets, won the biggest HU grudge match in history vs Negreanu. Brutal clarity on aggression and bluffing math.' },
  { name: 'Upswing Poker', url: 'https://www.youtube.com/@UpswingPoker', why: 'Polk-founded training house: tight, modern strategy clips on ranges, c-betting, and sizing.' },
  { name: 'Daniel Negreanu', url: 'https://www.youtube.com/@DNegsPoker', why: '7 bracelets, GOAT-tier hand reading and table talk. His range-narrowing walkthroughs are masterclasses in Lesson 2 thinking.' },
  { name: 'Red Chip Poker', url: 'https://www.youtube.com/@RedChipPoker', why: 'Ed Miller / SplitSuit lineage — the best at translating theory into live low-stakes practice.' },
  { name: 'Phil Galfond', url: 'https://www.youtube.com/@PhilGalfond', why: 'Run It Once founder, three bracelets. The gold standard for thinking-process narration — how an elite mind actually reasons through a hand.' }
];

/* per-lesson curated picks: stable searches that surface the canonical videos */
var VIDEO_PICKS = {
  ev: [
    { t: 'Expected value, explained by the math lords', who: 'GTO Wizard', q: 'GTO Wizard expected value EV poker' },
    { t: 'Results vs decisions — thinking in EV', who: 'Doug Polk', q: 'Doug Polk poker expected value explained' }
  ],
  ranges: [
    { t: 'How to put opponents on a range', who: 'Daniel Negreanu', q: 'Daniel Negreanu hand reading putting opponent on a range' },
    { t: 'Range thinking for live players', who: 'Bart Hanson', q: 'Crush Live Poker hand reading range Bart Hanson' }
  ],
  position: [
    { t: 'Why position is worth money', who: 'Jonathan Little', q: 'Jonathan Little importance of position poker' },
    { t: 'Playing the button like a pro', who: 'Upswing Poker', q: 'Upswing Poker button strategy position' }
  ],
  aggression: [
    { t: 'Why aggression wins at poker', who: 'Doug Polk', q: 'Doug Polk aggression poker strategy' },
    { t: 'Semi-bluffing: the dual-income bet', who: 'GTO Wizard', q: 'GTO Wizard semi bluff strategy' }
  ],
  language: [
    { t: 'Poker terms every player must know', who: 'Red Chip Poker', q: 'Red Chip Poker terminology explained beginners' },
    { t: 'What is a 3-bet (and why)', who: 'Upswing Poker', q: 'Upswing Poker what is a 3-bet strategy' }
  ],
  rangecraft: [
    { t: 'How solvers build preflop ranges', who: 'GTO Wizard', q: 'GTO Wizard preflop ranges explained solver' },
    { t: 'Mixed strategies & indifference', who: 'GTO Wizard', q: 'GTO Wizard mixed strategy indifference poker' }
  ],
  rfilogic: [
    { t: 'Opening ranges by position', who: 'Jonathan Little', q: 'Jonathan Little preflop opening ranges position' },
    { t: 'Live-game open sizing', who: 'Bart Hanson', q: 'Crush Live Poker open raise sizing live' }
  ],
  defending: [
    { t: 'Big blind defense, solved', who: 'GTO Wizard', q: 'GTO Wizard big blind defense strategy' },
    { t: 'When to 3-bet vs call', who: 'Upswing Poker', q: 'Upswing Poker 3-bet or call preflop strategy' }
  ],
  threebetwars: [
    { t: '4-bets and blocker bluffs', who: 'GTO Wizard', q: 'GTO Wizard 4-bet bluff A5s blockers' },
    { t: 'Playing 3-bet pots in & out of position', who: 'Phil Galfond', q: 'Phil Galfond 3-bet pot strategy' }
  ],
  shortstack: [
    { t: 'Push/fold made simple', who: 'Jonathan Little', q: 'Jonathan Little push fold short stack strategy' },
    { t: 'ICM pressure explained', who: 'GTO Wizard', q: 'GTO Wizard ICM explained tournament' }
  ],
  equity: [
    { t: 'Outs & the Rule of 2 and 4', who: 'Red Chip Poker', q: 'Red Chip Poker rule of 2 and 4 outs equity' },
    { t: 'Preflop matchup equities', who: 'Upswing Poker', q: 'Upswing Poker preflop equity matchups coin flip' }
  ],
  potodds: [
    { t: 'Pot odds in plain English', who: 'Jonathan Little', q: 'Jonathan Little pot odds explained' },
    { t: 'Implied odds & set mining', who: 'Bart Hanson', q: 'Crush Live Poker set mining implied odds' }
  ],
  mdf: [
    { t: 'MDF & when to ignore it', who: 'GTO Wizard', q: 'GTO Wizard minimum defense frequency MDF' },
    { t: 'Bluffing math: alpha', who: 'Upswing Poker', q: 'Upswing Poker bluff break even percentage' }
  ],
  blockers: [
    { t: 'Combinatorics for hand reading', who: 'Red Chip Poker', q: 'Red Chip Poker combinatorics poker combos' },
    { t: 'Blockers, the modern weapon', who: 'GTO Wizard', q: 'GTO Wizard blockers explained poker' }
  ],
  evsizing: [
    { t: 'Bet sizing theory', who: 'GTO Wizard', q: 'GTO Wizard bet sizing theory explained' },
    { t: 'Small c-bets vs big polar bets', who: 'Upswing Poker', q: 'Upswing Poker bet sizing strategy when big small' }
  ],
  spr: [
    { t: 'SPR: stack-to-pot ratio', who: 'Red Chip Poker', q: 'Red Chip Poker SPR stack to pot ratio' },
    { t: 'Commitment decisions', who: 'Jonathan Little', q: 'Jonathan Little when to stack off top pair' }
  ],
  textures: [
    { t: 'Board textures & range advantage', who: 'GTO Wizard', q: 'GTO Wizard range advantage nut advantage board texture' },
    { t: 'Reading flops like a pro', who: 'Upswing Poker', q: 'Upswing Poker board texture analysis flop' }
  ],
  cbet: [
    { t: 'C-bet strategy, solved', who: 'GTO Wizard', q: 'GTO Wizard c-bet strategy flop' },
    { t: 'C-betting in live games', who: 'Bart Hanson', q: 'Crush Live Poker continuation bet live strategy' }
  ],
  barrels: [
    { t: 'Turn barreling & equity denial', who: 'Upswing Poker', q: 'Upswing Poker double barrel turn strategy' },
    { t: 'Picking barrel cards', who: 'GTO Wizard', q: 'GTO Wizard turn barrel which cards' }
  ],
  bluffcatch: [
    { t: 'River bluff-catching', who: 'Phil Galfond', q: 'Phil Galfond river call bluff catcher' },
    { t: 'The big laydown, live', who: 'Bart Hanson', q: 'Crush Live Poker big fold river live' }
  ],
  multiway: [
    { t: 'Multiway pot strategy', who: 'GTO Wizard', q: 'GTO Wizard multiway pots strategy' },
    { t: 'Family pots in live games', who: 'Bart Hanson', q: 'Crush Live Poker multiway pot live strategy' }
  ],
  exploit: [
    { t: 'GTO vs exploitative play', who: 'Doug Polk', q: 'Doug Polk GTO vs exploitative poker' },
    { t: 'Exploiting live player pools', who: 'Bart Hanson', q: 'Crush Live Poker exploiting live players' }
  ],
  livetells: [
    { t: 'Live tells that actually work', who: 'Daniel Negreanu', q: 'Daniel Negreanu poker tells reading players' },
    { t: 'Sizing tells & bet patterns', who: 'Bart Hanson', q: 'Crush Live Poker bet sizing tells live' }
  ],
  innergame: [
    { t: 'Tilt control & the mental game', who: 'Jonathan Little', q: 'Jonathan Little tilt control mental game poker' },
    { t: 'Process over results', who: 'Phil Galfond', q: 'Phil Galfond mindset variance process poker' }
  ],
  variance: [
    { t: 'Variance & bankroll management', who: 'Jonathan Little', q: 'Jonathan Little bankroll management variance' },
    { t: 'Downswings: what is normal', who: 'GTO Wizard', q: 'GTO Wizard variance downswing poker math' }
  ],
  metalearning: [
    { t: 'How to study poker effectively', who: 'GTO Wizard', q: 'GTO Wizard how to study poker effectively' },
    { t: 'Building a study routine', who: 'Jonathan Little', q: 'Jonathan Little how to study poker improve' }
  ]
};

function videoBox(lessonId) {
  var picks = VIDEO_PICKS[lessonId];
  if (!picks || !picks.length) return null;
  var box = el('div', { class: 'video-box' });
  box.appendChild(el('div', { class: 'exploit-h', text: '🎬 Watch the masters on this' }));
  picks.forEach(function (v) {
    var a = el('a', { class: 'video-link', href: ytSearch(v.q), target: '_blank', rel: 'noopener' }, [
      el('span', { class: 'video-play', text: '▶' }),
      el('span', { class: 'video-meta' }, [
        el('span', { class: 'video-t', text: v.t }),
        el('span', { class: 'video-who', text: v.who })
      ]),
      el('span', { class: 'video-ext', text: '↗' })
    ]);
    box.appendChild(a);
  });
  box.appendChild(el('div', { class: 'fineprint', style: 'margin:8px 2px 0', text: 'Links open a pinned YouTube search — the canonical video is the top result, and the link never goes stale.' }));
  return box;
}

function mastersLibraryCard() {
  var card = el('div', { class: 'card' });
  card.appendChild(el('div', { class: 'chart-title', text: '🎥 The Masters — video library' }));
  card.appendChild(el('div', { class: 'chart-sub', text: 'The eight channels worth your hours, chosen for signal density. Every lesson links its picks; this is the full shelf.' }));
  MASTERS.forEach(function (m) {
    var row = el('a', { class: 'master-row', href: m.url, target: '_blank', rel: 'noopener' });
    row.appendChild(el('div', {}, [
      el('div', { class: 'master-name', text: m.name }),
      el('div', { class: 'master-why', text: m.why })
    ]));
    row.appendChild(el('span', { class: 'video-ext', text: '↗' }));
    card.appendChild(row);
  });
  return card;
}

if (typeof module !== 'undefined') {
  module.exports = { VIDEO_PICKS: VIDEO_PICKS, MASTERS: MASTERS, ytSearch: ytSearch };
}
