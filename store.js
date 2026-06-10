/* ============================================================
   EDGE — store.js
   Persistent state (localStorage) + export/import backups.
   All your data lives ON THIS DEVICE, never in the repo.
   ============================================================ */
'use strict';

var STORE_KEY = 'edge-poker-v1';

var DEFAULT_STATE = {
  version: 1,
  settings: { sb: 2, bb: 5, currency: '$', tableSize: 9 },
  players: {},      // persistent player book: id -> profile
  liveSession: null, // active session object or null
  sessions: [],     // finished sessions
  hands: [],        // logged hands
  drills: [],       // drill attempts
  srs: {},          // spaced repetition: "chartId|label" -> {level, due, misses}
  exams: [],        // exam history: {ts, score, grade}
  goals: { dailyTarget: 30, streak: 0, bestStreak: 0, lastGoalDay: '', day: '', todayCount: 0 },
  lessons: {}       // lessonId -> {done, ts}
};

var STATE = null;

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadState() {
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      STATE = JSON.parse(raw);
      // shallow-merge any new top-level keys from defaults
      for (var k in DEFAULT_STATE) {
        if (STATE[k] === undefined) STATE[k] = JSON.parse(JSON.stringify(DEFAULT_STATE[k]));
      }
      return;
    }
  } catch (e) { /* corrupted -> start fresh but keep backup */
    try { localStorage.setItem(STORE_KEY + '-corrupt-' + Date.now(), localStorage.getItem(STORE_KEY)); } catch (e2) {}
  }
  STATE = JSON.parse(JSON.stringify(DEFAULT_STATE));
}

var saveTimer = null;
function saveState() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(function () {
    try {
      // cap drill log so storage never blows up
      if (STATE.drills.length > 8000) STATE.drills = STATE.drills.slice(-6000);
      localStorage.setItem(STORE_KEY, JSON.stringify(STATE));
    } catch (e) { console.error('save failed', e); }
  }, 150);
}

function exportData() {
  var blob = new Blob([JSON.stringify(STATE, null, 1)], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  var d = new Date();
  a.download = 'edge-backup-' + d.toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 200);
}

function importData(file, cb) {
  var reader = new FileReader();
  reader.onload = function () {
    try {
      var data = JSON.parse(reader.result);
      if (!data || typeof data !== 'object' || data.version === undefined) {
        cb('That file does not look like an EDGE backup.');
        return;
      }
      STATE = data;
      for (var k in DEFAULT_STATE) if (STATE[k] === undefined) STATE[k] = JSON.parse(JSON.stringify(DEFAULT_STATE[k]));
      saveState();
      cb(null);
    } catch (e) { cb('Could not read backup: ' + e.message); }
  };
  reader.readAsText(file);
}

/* ---- player book helpers ---- */
function getPlayer(id) { return STATE.players[id]; }
function newPlayer(name) {
  var id = uid();
  STATE.players[id] = {
    id: id, name: name || 'Player', type: 'unknown', notes: '',
    hands: 0, vpip: 0, pfr: 0, threebet: 0, limp: 0,
    sessionsSeen: 1, createdAt: Date.now(), updatedAt: Date.now()
  };
  saveState();
  return STATE.players[id];
}
function playerVpipPct(p) { return p.hands ? 100 * p.vpip / p.hands : 0; }
function playerPfrPct(p) { return p.hands ? 100 * p.pfr / p.hands : 0; }

/* ---- session helpers ---- */
function sessionProfit(s) { return (s.cashout - s.buyin); }
function sessionBBperHr(s) {
  if (!s.hours || !s.bb) return 0;
  return sessionProfit(s) / s.bb / s.hours;
}

/* ---- drill stats ---- */
function drillStats(mode, sinceTs) {
  var n = 0, right = 0;
  for (var i = 0; i < STATE.drills.length; i++) {
    var d = STATE.drills[i];
    if (mode && d.mode !== mode) continue;
    if (sinceTs && d.ts < sinceTs) continue;
    n++;
    if (d.correct) right++;
  }
  return { n: n, right: right, acc: n ? right / n : 0 };
}

/* ---- daily goal + streak ---- */
function todayStr() { return new Date().toISOString().slice(0, 10); }
function yesterdayStr() { return new Date(Date.now() - 864e5).toISOString().slice(0, 10); }
function goalState() {
  var g = STATE.goals;
  if (g.day !== todayStr()) { g.day = todayStr(); g.todayCount = 0; }
  return g;
}
function recordAnswerForGoal() {
  var g = goalState();
  g.todayCount++;
  if (g.todayCount === g.dailyTarget) { // goal hit right now
    if (g.lastGoalDay === yesterdayStr()) g.streak++;
    else if (g.lastGoalDay !== todayStr()) g.streak = 1;
    g.lastGoalDay = todayStr();
    if (g.streak > g.bestStreak) g.bestStreak = g.streak;
  }
}
function currentStreak() {
  var g = goalState();
  // streak shown only if alive (goal hit today or yesterday)
  if (g.lastGoalDay === todayStr() || g.lastGoalDay === yesterdayStr()) return g.streak;
  return 0;
}

/* ---- spaced repetition (SRS) ----
   miss -> level 0, due now. correct in review -> level+1,
   due in [1,3,7,14,30] days. miss in review -> back to level 0. */
var SRS_DAYS = [1, 3, 7, 14, 30];
function srsKey(chartId, label) { return chartId + '|' + label; }
function srsRecordMiss(chartId, label) {
  var k = srsKey(chartId, label);
  var it = STATE.srs[k] || { level: 0, misses: 0 };
  it.level = 0;
  it.misses = (it.misses || 0) + 1;
  it.due = Date.now();
  STATE.srs[k] = it;
}
function srsRecordPass(chartId, label) {
  var k = srsKey(chartId, label);
  var it = STATE.srs[k];
  if (!it) return;
  it.level = Math.min(it.level + 1, SRS_DAYS.length - 1);
  it.due = Date.now() + SRS_DAYS[it.level] * 864e5;
  if (it.level >= SRS_DAYS.length - 1) delete STATE.srs[k]; // graduated
}
function srsDue() {
  var now = Date.now(), out = [];
  for (var k in STATE.srs) {
    if (STATE.srs[k].due <= now) {
      var parts = k.split('|');
      out.push({ chartId: parts[0], label: parts[1], item: STATE.srs[k] });
    }
  }
  return out;
}

/* ---- mastery: severity-weighted accuracy over recent attempts ---- */
function chartMastery(chartId, windowN) {
  windowN = windowN || 40;
  var creds = [];
  for (var i = STATE.drills.length - 1; i >= 0 && creds.length < windowN; i--) {
    var d = STATE.drills[i];
    if (d.chartId !== chartId) continue;
    creds.push(d.credit !== undefined ? d.credit : (d.correct ? 1 : 0));
  }
  if (!creds.length) return null;
  var s = 0;
  for (var j = 0; j < creds.length; j++) s += creds[j];
  return { mastery: s / creds.length, n: creds.length };
}
function groupMastery(group) {
  var charts = chartsByGroup(group);
  if (group === 'vs3bet') charts = charts.concat(chartsByGroup('vs4bet'));
  var sum = 0, n = 0;
  charts.forEach(function (c) {
    var m = chartMastery(c.spec.id);
    if (m) { sum += m.mastery; n++; }
  });
  return n ? sum / n : null;
}

/* ---- EDGE Rating: one number to push ----
   1000 base + up to 600 mastery + 200 course + 150 exams + 50 streak. */
var RATING_TIERS = [
  [1150, 'Fish'], [1300, 'Grinder'], [1450, 'Reg'], [1600, 'Crusher'], [1750, 'Elite'], [9999, 'Apex']
];
function edgeRating() {
  var groups = ['rfi', 'vsrfi', 'vs3bet', 'pushfold'];
  var ms = [], i;
  for (i = 0; i < groups.length; i++) {
    var g = groupMastery(groups[i]);
    if (g !== null) ms.push(g);
  }
  var mathS = drillStats('math');
  if (mathS.n >= 10) ms.push(mathS.acc);
  var mastery = 0;
  if (ms.length) {
    for (i = 0; i < ms.length; i++) mastery += ms[i];
    mastery = (mastery / ms.length) * (Math.min(ms.length, 5) / 5); // breadth matters
  }
  var done = 0;
  for (var k in STATE.lessons) if (STATE.lessons[k] && STATE.lessons[k].done) done++;
  var lessonPct = LESSONS && LESSONS.length ? done / LESSONS.length : 0;
  var examAvg = 0;
  if (STATE.exams.length) {
    var last = STATE.exams.slice(-3);
    for (i = 0; i < last.length; i++) examAvg += last[i].score;
    examAvg /= last.length;
  }
  var streakBonus = Math.min(50, currentStreak() * 5);
  var rating = Math.round(1000 + 600 * mastery + 200 * lessonPct + 150 * examAvg + streakBonus);
  var tier = 'Fish';
  for (i = 0; i < RATING_TIERS.length; i++) {
    if (rating < RATING_TIERS[i][0]) { tier = RATING_TIERS[i][1]; break; }
  }
  return { rating: rating, tier: tier };
}

if (typeof module !== 'undefined') {
  module.exports = { loadState: loadState, DEFAULT_STATE: DEFAULT_STATE, uid: uid };
}
