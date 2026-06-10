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
  drills: []        // drill attempts
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

if (typeof module !== 'undefined') {
  module.exports = { loadState: loadState, DEFAULT_STATE: DEFAULT_STATE, uid: uid };
}
