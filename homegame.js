/* ============================================================
   EDGE — homegame.js
   Home-game ledger: buy-ins, re-buys, cash-outs per player,
   chip-count mismatch check, and a MINIMIZED settlement —
   who pays whom, in at most (players - 1) transfers.
   ============================================================ */
'use strict';

function newHomeGame() {
  STATE.homeGame = {
    id: uid(), startedAt: Date.now(),
    name: 'Home game ' + new Date().toLocaleDateString(),
    players: [], settled: false, transfers: null
  };
  saveState();
}

function hgAddPlayer(name) {
  STATE.homeGame.players.push({ id: uid(), name: name || 'Player ' + (STATE.homeGame.players.length + 1), buyins: [], cashout: null });
  saveState();
}

function hgTotals(g) {
  var inSum = 0, outSum = 0, outMissing = 0;
  g.players.forEach(function (p) {
    p.buyins.forEach(function (b) { inSum += b; });
    if (p.cashout === null) outMissing++;
    else outSum += p.cashout;
  });
  return { inSum: inSum, outSum: outSum, outMissing: outMissing, diff: outSum - inSum };
}

function hgNet(p) {
  var b = 0;
  p.buyins.forEach(function (x) { b += x; });
  return (p.cashout === null ? 0 : p.cashout) - b;
}

/* Minimal-transfer settlement: greedy largest-creditor vs largest-debtor.
   Produces at most n-1 transfers. */
function hgSettle(players) {
  var creditors = [], debtors = [];
  players.forEach(function (p) {
    var net = Math.round(hgNet(p) * 100) / 100;
    if (net > 0.005) creditors.push({ name: p.name, amt: net });
    else if (net < -0.005) debtors.push({ name: p.name, amt: -net });
  });
  creditors.sort(function (a, b) { return b.amt - a.amt; });
  debtors.sort(function (a, b) { return b.amt - a.amt; });
  var transfers = [];
  var ci = 0, di = 0;
  while (ci < creditors.length && di < debtors.length) {
    var pay = Math.min(creditors[ci].amt, debtors[di].amt);
    transfers.push({ from: debtors[di].name, to: creditors[ci].name, amt: Math.round(pay * 100) / 100 });
    creditors[ci].amt -= pay;
    debtors[di].amt -= pay;
    if (creditors[ci].amt < 0.005) ci++;
    if (debtors[di].amt < 0.005) di++;
  }
  return transfers;
}

function hgSummaryText(g) {
  var lines = ['♠ ' + g.name];
  g.players.forEach(function (p) {
    var b = 0;
    p.buyins.forEach(function (x) { b += x; });
    lines.push(p.name + ': in ' + fmtMoney(b) + ', out ' + fmtMoney(p.cashout || 0) + ' → ' + (hgNet(p) >= 0 ? '+' : '') + fmtMoney(hgNet(p)));
  });
  if (g.transfers && g.transfers.length) {
    lines.push('— Settle up —');
    g.transfers.forEach(function (t) { lines.push(t.from + ' pays ' + t.to + ' ' + fmtMoney(t.amt)); });
  }
  lines.push('(via EDGE)');
  return lines.join('\n');
}

/* ---------- UI ---------- */
function renderHomeLedger(root) {
  var g = STATE.homeGame;
  var tot = hgTotals(g);

  var head = el('div', { class: 'card live-head' }, [
    el('div', {}, [
      el('div', { class: 'chart-title', text: g.name }),
      el('div', { class: 'chart-sub', text: g.players.length + ' players · on the table: ' + fmtMoney(tot.inSum - tot.outSum) })
    ]),
    el('button', {
      class: 'btn ghost sm', text: '✕ Discard',
      onclick: function () {
        confirmAction('Discard this home game (no archive)?', function () {
          STATE.homeGame = null; saveState(); rerender();
        });
      }
    })
  ]);
  root.appendChild(head);

  // players
  var card = el('div', { class: 'card' });
  if (!g.players.length) card.appendChild(el('p', { class: 'note', text: 'Add everyone at the table. Track each buy-in as it happens; enter cash-outs when the game breaks.' }));
  g.players.forEach(function (p, idx) {
    var b = 0;
    p.buyins.forEach(function (x) { b += x; });
    var row = el('div', { class: 'hg-row' });
    row.appendChild(el('div', { class: 'hg-name' }, [
      el('span', { text: p.name }),
      el('span', { class: 'hg-buyins', text: p.buyins.length ? p.buyins.map(function (x) { return fmtMoney(x); }).join(' + ') : 'no buy-in yet' })
    ]));
    var net = hgNet(p);
    row.appendChild(el('div', { class: 'hg-mid' }, [
      el('div', { class: 'hg-in', text: 'in ' + fmtMoney(b) }),
      el('div', { class: 'hg-out' + (p.cashout === null ? ' dim' : ''), text: p.cashout === null ? 'out —' : 'out ' + fmtMoney(p.cashout) }),
      p.cashout !== null ? el('div', { class: net >= 0 ? 'pos' : 'neg', text: (net >= 0 ? '+' : '') + fmtMoney(net) }) : null
    ]));
    var btns = el('div', { class: 'hg-btns' });
    btns.appendChild(el('button', {
      class: 'btn sm primary', text: '+ Buy-in',
      onclick: function () {
        var def = p.buyins.length ? p.buyins[p.buyins.length - 1] : (g.players[0] && g.players[0].buyins[0]) || 50;
        moneySheet('Buy-in — ' + p.name, 'Each entry is tracked separately.', def, function (amt) {
          if (amt > 0) { p.buyins.push(amt); g.transfers = null; saveState(); rerender(); }
        }, [20, 50, 100, 200]);
      }
    }));
    btns.appendChild(el('button', {
      class: 'btn sm ghost', text: 'Cash out',
      onclick: function () {
        moneySheet('Cash-out — ' + p.name, 'Final chip count converted to cash.', p.cashout !== null ? p.cashout : '', function (amt) {
          if (amt >= 0) { p.cashout = amt; g.transfers = null; saveState(); rerender(); }
        }, [25, 50, 100, 200]);
      }
    }));
    btns.appendChild(el('button', {
      class: 'btn sm ghost', text: '✕',
      onclick: function () {
        confirmAction('Remove ' + p.name + '?', function () {
          g.players.splice(idx, 1); g.transfers = null; saveState(); rerender();
        });
      }
    }));
    row.appendChild(btns);
    card.appendChild(row);
  });
  var nameIn = el('input', { class: 'input', placeholder: 'Player name…' });
  var addRow = el('div', { class: 'btn-row' });
  addRow.appendChild(nameIn);
  addRow.appendChild(el('button', {
    class: 'btn primary', text: 'Add',
    onclick: function () { if (nameIn.value.trim()) { hgAddPlayer(nameIn.value.trim()); rerender(); } }
  }));
  card.appendChild(addRow);
  root.appendChild(card);

  // settlement
  var sCard = el('div', { class: 'card' });
  sCard.appendChild(el('div', { class: 'chart-title', text: 'Settle up' }));
  if (tot.outMissing > 0) {
    sCard.appendChild(el('p', { class: 'note', text: tot.outMissing + ' player(s) still need a cash-out before settlement.' }));
  } else if (g.players.length >= 2) {
    if (Math.abs(tot.diff) > 0.01) {
      sCard.appendChild(el('div', { class: 'fb-verdict bad', text: 'Chips off by ' + fmtMoney(Math.abs(tot.diff)) + ' (' + (tot.diff > 0 ? 'more cashed out than bought in' : 'missing from cash-outs') + ') — recount before settling.' }));
    }
    sCard.appendChild(el('button', {
      class: 'btn primary block', text: 'Compute minimal payments',
      onclick: function () { g.transfers = hgSettle(g.players); saveState(); rerender(); }
    }));
    if (g.transfers) {
      if (!g.transfers.length) sCard.appendChild(el('p', { class: 'note', text: 'Everyone is exactly even. A statistical miracle.' }));
      g.transfers.forEach(function (t) {
        sCard.appendChild(el('div', { class: 'hg-transfer' }, [
          el('span', { text: t.from }),
          el('span', { class: 'hg-arrow', text: '→' }),
          el('span', { text: t.to }),
          el('b', { text: fmtMoney(t.amt) })
        ]));
      });
      var act = el('div', { class: 'btn-row wrap' });
      act.appendChild(el('button', {
        class: 'btn ghost', text: 'Copy summary',
        onclick: function () {
          var txt2 = hgSummaryText(g);
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(txt2).then(function () { toast('Summary copied — paste it in the group chat.'); });
          } else { toast('Clipboard unavailable in this browser.', true); }
        }
      }));
      act.appendChild(el('button', {
        class: 'btn accent', text: '✓ Finish & archive',
        onclick: function () { finishHomeGame(g); }
      }));
      sCard.appendChild(act);
    }
  } else {
    sCard.appendChild(el('p', { class: 'note', text: 'Need at least 2 players.' }));
  }
  root.appendChild(sCard);
}

function finishHomeGame(g) {
  g.settled = true;
  g.endedAt = Date.now();
  STATE.homeGames = STATE.homeGames || [];
  STATE.homeGames.push(g);
  if (STATE.homeGames.length > 60) STATE.homeGames = STATE.homeGames.slice(-50);
  STATE.homeGame = null;
  saveState();
  rerender();
  // offer to log my own result into bankroll sessions
  showSheet({
    title: 'Add your result?', sub: 'Pick which player was you to log this in your session stats.',
    fields: [{ key: 'me', type: 'select', options: ['(skip)'].concat(g.players.map(function (p) { return p.name; })) }],
    confirmText: 'Add to my sessions',
    onConfirm: function (v) {
      if (!v.me || v.me === '(skip)') return;
      var mine = null;
      g.players.forEach(function (p) { if (p.name === v.me) mine = p; });
      if (!mine) return;
      var b = 0;
      mine.buyins.forEach(function (x) { b += x; });
      STATE.sessions.push({
        id: uid(), date: new Date(g.startedAt).toISOString().slice(0, 10),
        stakes: 'home', sb: 0, bb: 0, game: 'NLHE (home)',
        location: g.name, hours: Math.max(1, Math.round((Date.now() - g.startedAt) / 36e5 * 10) / 10),
        buyin: b, cashout: mine.cashout || 0, notes: 'home game'
      });
      saveState();
      toast('Added to your sessions: ' + (hgNet(mine) >= 0 ? '+' : '') + fmtMoney(hgNet(mine)));
      rerender();
    }
  });
}

function renderHomeHistory(root) {
  var hist = (STATE.homeGames || []).slice().reverse();
  if (!hist.length) return;
  var card = el('div', { class: 'card' });
  card.appendChild(el('div', { class: 'chart-title', text: 'Past home games' }));
  hist.slice(0, 8).forEach(function (g) {
    var tot = hgTotals(g);
    card.appendChild(el('div', { class: 'sess-row' }, [
      el('span', { text: new Date(g.startedAt).toLocaleDateString() + ' · ' + g.name }),
      el('span', { text: g.players.length + 'p' }),
      el('span', { class: 'pos', text: fmtMoney(tot.inSum) + ' pot' })
    ]));
  });
  root.appendChild(card);
}

if (typeof module !== 'undefined') {
  module.exports = { hgSettle: hgSettle, hgTotals: hgTotals };
}
