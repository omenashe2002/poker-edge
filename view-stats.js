/* ============================================================
   EDGE — view-stats.js
   The science of your own game: bankroll curve, win rate with
   confidence interval, variance, risk-of-ruin bankroll math,
   leak frequencies, and drill-accuracy improvement over time.
   ============================================================ */
'use strict';

var statsUI = { addOpen: false, editId: null };

function renderStats(root) {
  clear(root);
  root.appendChild(sectionTitle('Stats', 'Results + improvement, with honest error bars.'));

  var ss = STATE.sessions.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });

  /* ---- headline cards ---- */
  var totalP = 0, totalH = 0, wins = 0;
  var hourly = [];
  ss.forEach(function (s) {
    var p = sessionProfit(s);
    totalP += p; totalH += s.hours || 0;
    if (p > 0) wins++;
  });
  var grid = el('div', { class: 'stat-grid' });
  grid.appendChild(statCard('Total profit', fmtMoney(totalP), ss.length + ' sessions', totalP >= 0 ? 'pos' : 'neg'));
  grid.appendChild(statCard('Hourly', totalH ? fmtMoney(totalP / totalH) + '/h' : '—', totalH.toFixed(0) + ' hours'));
  var bbTotal = 0, bbHours = 0;
  ss.forEach(function (s) { if (s.bb) { bbTotal += sessionProfit(s) / s.bb; bbHours += s.hours || 0; } });
  grid.appendChild(statCard('bb/hour', bbHours ? (bbTotal / bbHours).toFixed(1) : '—', 'big blinds per hour'));
  grid.appendChild(statCard('Win rate', ss.length ? Math.round(100 * wins / ss.length) + '%' : '—', 'winning sessions'));
  root.appendChild(grid);

  /* ---- bankroll curve ---- */
  var cardBR = el('div', { class: 'card' });
  cardBR.appendChild(el('div', { class: 'chart-title', text: 'Bankroll curve (cumulative)' }));
  var cum = 0;
  var pts = ss.map(function (s, i) { cum += sessionProfit(s); return { x: i + 1, y: cum }; });
  cardBR.appendChild(lineChart(pts, { height: 200, zeroLine: true, fmtY: function (v) { return fmtMoney(v); } }));
  root.appendChild(cardBR);

  /* ---- the honest statistics ---- */
  if (ss.length >= 5) {
    var ci = PokerMath.winrateCI(ss.map(function (s) { return { profit: sessionProfit(s), hours: s.hours || 1 }; }));
    if (ci) {
      var cardCI = el('div', { class: 'card' });
      cardCI.appendChild(el('div', { class: 'chart-title', text: 'True win rate (95% confidence)' }));
      cardCI.appendChild(el('p', { class: 'note', html:
        'Observed: <b>' + fmtMoney(ci.wr) + '/h</b> over ' + ci.hours.toFixed(0) + ' hours.<br>' +
        '95% CI: <b>' + fmtMoney(ci.lo) + '/h … ' + fmtMoney(ci.hi) + '/h</b>.<br>' +
        'Hourly std dev ≈ <b>' + fmtMoney(ci.sdHour) + '</b>.' +
        (ci.lo < 0 && ci.wr > 0 ? '<br><i>The interval still includes negative win rates — variance dominates small samples. Keep logging.</i>' : '')
      }));
      if (ci.wr > 0) {
        var br5 = PokerMath.bankrollForRoR(ci.wr, ci.sdHour, 0.05);
        var br1 = PokerMath.bankrollForRoR(ci.wr, ci.sdHour, 0.01);
        cardCI.appendChild(el('p', { class: 'note', html:
          'Bankroll for ≤5% risk of ruin at this win rate: <b>' + fmtMoney(br5) + '</b> · for ≤1%: <b>' + fmtMoney(br1) + '</b>.' }));
      }
      root.appendChild(cardCI);
    }
  } else if (ss.length) {
    root.appendChild(el('div', { class: 'card note-card', text: 'Log 5+ sessions to unlock win-rate confidence intervals and bankroll/risk-of-ruin math.' }));
  }

  /* ---- by stakes ---- */
  if (ss.length) {
    var by = {};
    ss.forEach(function (s) {
      var k = s.stakes || '?';
      by[k] = by[k] || { p: 0, h: 0, n: 0 };
      by[k].p += sessionProfit(s); by[k].h += s.hours || 0; by[k].n++;
    });
    var cardBy = el('div', { class: 'card' });
    cardBy.appendChild(el('div', { class: 'chart-title', text: 'By stakes' }));
    var tbl = el('table', { class: 'tbl' });
    tbl.appendChild(el('tr', {}, [th('Stakes'), th('Sessions'), th('Hours'), th('Profit'), th('$/h')]));
    Object.keys(by).forEach(function (k) {
      var b = by[k];
      tbl.appendChild(el('tr', {}, [
        td(k), td(String(b.n)), td(b.h.toFixed(0)),
        td(fmtMoney(b.p), b.p >= 0 ? 'pos' : 'neg'),
        td(b.h ? fmtMoney(b.p / b.h) : '—')
      ]));
    });
    cardBy.appendChild(tbl);
    root.appendChild(cardBy);
  }

  /* ---- improvement: drill accuracy over time ---- */
  var cardDr = el('div', { class: 'card' });
  cardDr.appendChild(el('div', { class: 'chart-title', text: 'Training accuracy (weekly)' }));
  var weekly = weeklyDrillAccuracy();
  cardDr.appendChild(lineChart(weekly, { height: 160, fmtY: function (v) { return Math.round(v) + '%'; } }));
  var modeRow = el('div', { class: 'legend' });
  DRILL_MODES.forEach(function (m) {
    var st = drillStats(m.id);
    if (st.n) modeRow.appendChild(el('span', { class: 'leg-item', text: m.label + ': ' + fmtPct(st.acc, 0) + ' (' + st.n + ')' }));
  });
  cardDr.appendChild(modeRow);
  root.appendChild(cardDr);

  /* ---- leak board ---- */
  var leakCounts = {};
  STATE.hands.forEach(function (h) { (h.leaks || []).forEach(function (L) { leakCounts[L] = (leakCounts[L] || 0) + 1; }); });
  var leakKeys = Object.keys(leakCounts).sort(function (a, b) { return leakCounts[b] - leakCounts[a]; });
  if (leakKeys.length) {
    var cardLk = el('div', { class: 'card' });
    cardLk.appendChild(el('div', { class: 'chart-title', text: 'Leak board (from reviewed hands)' }));
    leakKeys.forEach(function (k) {
      cardLk.appendChild(el('div', { class: 'leak-row' }, [
        el('span', { text: k }),
        el('span', { class: 'leak-n', text: '×' + leakCounts[k] })
      ]));
    });
    cardLk.appendChild(el('p', { class: 'note', text: 'Your most frequent leak is your cheapest fix. Study that exact spot this week.' }));
    root.appendChild(cardLk);
  }

  /* ---- sessions list + manual add ---- */
  var cardS = el('div', { class: 'card' });
  var hd = el('div', { class: 'panel-head' }, [
    el('div', { class: 'chart-title', text: 'Sessions' }),
    el('button', { class: 'btn ghost sm', text: statsUI.addOpen ? '✕' : '+ Add manually', onclick: function () { statsUI.addOpen = !statsUI.addOpen; rerender(); } })
  ]);
  cardS.appendChild(hd);
  if (statsUI.addOpen) cardS.appendChild(sessionForm(null));
  ss.slice().reverse().forEach(function (s) {
    var p = sessionProfit(s);
    var row = el('div', { class: 'sess-row' }, [
      el('span', { text: s.date + ' · ' + s.stakes + ' · ' + s.location }),
      el('span', { text: (s.hours || 0) + 'h' }),
      el('span', { class: p >= 0 ? 'pos' : 'neg', text: (p >= 0 ? '+' : '') + fmtMoney(p) }),
      el('button', { class: 'btn ghost sm', text: '✎', onclick: function () { statsUI.editId = statsUI.editId === s.id ? null : s.id; rerender(); } })
    ]);
    cardS.appendChild(row);
    if (statsUI.editId === s.id) cardS.appendChild(sessionForm(s));
  });
  root.appendChild(cardS);

  /* ---- data management ---- */
  var cardD = el('div', { class: 'card' });
  cardD.appendChild(el('div', { class: 'chart-title', text: 'Your data' }));
  cardD.appendChild(el('p', { class: 'note', text: 'Everything is stored on this device only. Back up regularly — especially before clearing browser data.' }));
  var rowD = el('div', { class: 'btn-row wrap' });
  rowD.appendChild(el('button', { class: 'btn primary', text: '⬇ Export backup', onclick: exportData }));
  var fileIn = el('input', { type: 'file', accept: '.json', style: 'display:none' });
  fileIn.addEventListener('change', function () {
    if (!fileIn.files.length) return;
    importData(fileIn.files[0], function (err) {
      if (err) toast(err, true); else { toast('Backup restored.'); rerender(); }
    });
  });
  rowD.appendChild(fileIn);
  rowD.appendChild(el('button', { class: 'btn ghost', text: '⬆ Import backup', onclick: function () { fileIn.click(); } }));
  rowD.appendChild(el('button', {
    class: 'btn danger', text: 'Wipe all data',
    onclick: function () {
      confirmAction('Delete ALL sessions, players, hands and drill history on this device? Export a backup first!', function () {
        STATE = JSON.parse(JSON.stringify(DEFAULT_STATE));
        saveState(); rerender(); toast('All data wiped.');
      });
    }
  }));
  cardD.appendChild(rowD);
  root.appendChild(cardD);
}

function th(t) { return el('th', { text: t }); }
function td(t, cls) { return el('td', { text: t, class: cls || '' }); }

function weeklyDrillAccuracy() {
  if (!STATE.drills.length) return [];
  var byWeek = {};
  STATE.drills.forEach(function (d) {
    var wk = Math.floor(d.ts / (7 * 864e5));
    byWeek[wk] = byWeek[wk] || { n: 0, r: 0 };
    byWeek[wk].n++;
    if (d.correct) byWeek[wk].r++;
  });
  return Object.keys(byWeek).sort().map(function (wk, i) {
    return { x: i + 1, y: 100 * byWeek[wk].r / byWeek[wk].n };
  });
}

function sessionForm(existing) {
  var box = el('div', { class: 'sess-form' });
  var date = inputRow('Date', 'date', existing ? existing.date : new Date().toISOString().slice(0, 10));
  var stakes = inputRow('Stakes (sb/bb)', 'text', existing ? existing.stakes : STATE.settings.sb + '/' + STATE.settings.bb);
  var loc = inputRow('Location', 'text', existing ? existing.location : '');
  var hours = inputRow('Hours', 'number', existing ? existing.hours : '');
  var buyin = inputRow('Total buy-in', 'number', existing ? existing.buyin : '');
  var cashout = inputRow('Cash-out', 'number', existing ? existing.cashout : '');
  [date, stakes, loc, hours, buyin, cashout].forEach(function (r) { box.appendChild(r.row); });
  var row = el('div', { class: 'btn-row' });
  row.appendChild(el('button', {
    class: 'btn primary grow', text: existing ? 'Save changes' : 'Add session',
    onclick: function () {
      var parts = (stakes.input.value || '1/2').split('/');
      var bb = parseFloat(parts[1]) || parseFloat(parts[0]) || 2;
      var obj = existing || { id: uid() };
      obj.date = date.input.value;
      obj.stakes = stakes.input.value;
      obj.sb = parseFloat(parts[0]) || 1; obj.bb = bb;
      obj.location = loc.input.value;
      obj.hours = parseFloat(hours.input.value) || 0;
      obj.buyin = parseFloat(buyin.input.value) || 0;
      obj.cashout = parseFloat(cashout.input.value) || 0;
      obj.game = 'NLHE';
      if (!existing) STATE.sessions.push(obj);
      statsUI.addOpen = false; statsUI.editId = null;
      saveState(); rerender();
    }
  }));
  if (existing) {
    row.appendChild(el('button', {
      class: 'btn danger', text: 'Delete',
      onclick: function () {
        confirmAction('Delete this session?', function () {
          STATE.sessions = STATE.sessions.filter(function (x) { return x.id !== existing.id; });
          statsUI.editId = null;
          saveState(); rerender();
        });
      }
    }));
  }
  box.appendChild(row);
  return box;
}
