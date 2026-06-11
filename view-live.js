/* ============================================================
   EDGE — view-live.js
   Live session mode: seat map, one-tap VPIP/PFR tracking,
   player book, exploit advisor, quick hand capture.

   Etiquette note: use between hands. Most rooms bar phone use
   while you are IN a hand — and it leaks your attention anyway.
   ============================================================ */
'use strict';

var liveUI = { openSeat: null, logging: false, logDraft: null };

function renderLive(root) {
  clear(root);
  var s = STATE.liveSession;
  if (s) return renderActiveSession(root, s);
  if (STATE.homeGame) {
    root.appendChild(sectionTitle('Home Game', 'Track every buy-in; settle with the fewest possible payments.'));
    return renderHomeLedger(root);
  }
  renderSessionSetup(root);
  renderHomeGameCard(root);
  renderHomeHistory(root);
}

function renderHomeGameCard(root) {
  var card = el('div', { class: 'card homegame-card' });
  card.appendChild(el('div', { class: 'chart-title', text: 'Host a home game' }));
  card.appendChild(el('div', { class: 'chart-sub', text: 'The ledger for cash-free home games: log every buy-in and cash-out per player, catch chip-count mismatches, and settle the night in the fewest possible payments — no spreadsheets, no arguments.' }));
  card.appendChild(el('button', {
    class: 'btn accent block', text: 'Start home game ledger',
    onclick: function () { newHomeGame(); rerender(); }
  }));
  root.appendChild(card);
}

/* ---------- setup ---------- */
function renderSessionSetup(root) {
  root.appendChild(sectionTitle('Live Session', 'Track the table, profile every player, and get exploit advice seat by seat.'));
  var card = el('div', { class: 'card' });
  var set = STATE.settings;

  var loc = inputRow('Location', 'text', localStorage.getItem('edge-last-loc') || '');
  var sb = inputRow('Small blind', 'number', set.sb);
  var bb = inputRow('Big blind', 'number', set.bb);
  var buyin = inputRow('Buy-in', 'number', set.bb * 100);
  var seats = inputRow('Table size', 'number', set.tableSize);

  card.appendChild(loc.row); card.appendChild(sb.row); card.appendChild(bb.row);
  card.appendChild(buyin.row); card.appendChild(seats.row);

  card.appendChild(el('button', {
    class: 'btn primary block', text: 'Start session',
    onclick: function () {
      var n = Math.max(2, Math.min(10, parseInt(seats.input.value || '9', 10)));
      STATE.liveSession = {
        id: uid(), startedAt: Date.now(),
        location: loc.input.value || 'Casino',
        sb: parseFloat(sb.input.value) || 1, bb: parseFloat(bb.input.value) || 2,
        buyin: parseFloat(buyin.input.value) || 0,
        tableSize: n, mySeat: 0,
        seats: {}, perHand: {}, handCount: 0
      };
      STATE.settings.sb = STATE.liveSession.sb;
      STATE.settings.bb = STATE.liveSession.bb;
      STATE.settings.tableSize = n;
      localStorage.setItem('edge-last-loc', STATE.liveSession.location);
      saveState();
      rerender();
    }
  }));
  root.appendChild(card);
  root.appendChild(el('p', { class: 'fineprint', text: 'Phone etiquette: log between hands only. Most rooms prohibit phone use mid-hand, and the best reads come from watching, not typing.' }));
}

function inputRow(label, type, value) {
  var input = el('input', { class: 'input', type: type, value: value });
  if (type === 'number') input.setAttribute('inputmode', 'decimal');
  var row = el('label', { class: 'input-row' }, [el('span', { text: label }), input]);
  return { row: row, input: input };
}

/* ---------- active session ---------- */
function renderActiveSession(root, s) {
  var hrs = (Date.now() - s.startedAt) / 36e5;
  var head = el('div', { class: 'live-head card' }, [
    el('div', {}, [
      el('div', { class: 'chart-title', text: s.sb + '/' + s.bb + ' @ ' + s.location }),
      el('div', { class: 'chart-sub', text: hrs.toFixed(1) + 'h · in for ' + fmtMoney(s.buyin) + ' · hand #' + s.handCount })
    ]),
    el('div', { class: 'btn-col' }, [
      el('button', { class: 'btn ghost sm', text: '+ Rebuy', onclick: function () { addRebuy(s); } }),
      el('button', { class: 'btn ghost sm', text: 'End session', onclick: function () { endSession(s); } })
    ])
  ]);
  root.appendChild(head);

  // next hand commits marks
  var commitBar = el('div', { class: 'btn-row' });
  commitBar.appendChild(el('button', {
    class: 'btn primary grow', text: 'Next hand · commit marks',
    onclick: function () { commitHand(s); }
  }));
  commitBar.appendChild(el('button', {
    class: 'btn accent', text: 'Log key hand',
    onclick: function () { liveUI.logging = !liveUI.logging; liveUI.logDraft = null; rerender(); }
  }));
  root.appendChild(commitBar);
  root.appendChild(el('p', { class: 'hint', text: 'Tap a seat to mark this hand: blank → VPIP (called) → PFR (raised). Tap ⓘ for profile & exploits. “Next hand” banks the marks.' }));

  if (liveUI.logging) root.appendChild(renderHandLogger(s));

  root.appendChild(renderSeatMap(s));

  if (liveUI.openSeat !== null) {
    root.appendChild(renderPlayerPanel(s, liveUI.openSeat));
  }
}

function addRebuy(s) {
  moneySheet('Rebuy', 'Adds to your total buy-in for this session.', s.bb * 100, function (amt) {
    if (amt > 0) { s.buyin += amt; saveState(); rerender(); toast('Rebuy added: ' + fmtMoney(amt)); }
  }, [100, 200, 300, 500]);
}

function commitHand(s) {
  s.handCount++;
  for (var seat in s.seats) {
    if (!s.seats[seat]) continue;
    var p = STATE.players[s.seats[seat]];
    if (!p) continue;
    p.hands++;
    var mark = s.perHand[seat];
    if (mark === 'v' || mark === 'r') p.vpip++;
    if (mark === 'r') p.pfr++;
    p.updatedAt = Date.now();
  }
  s.perHand = {};
  saveState();
  rerender();
}

function renderSeatMap(s) {
  var wrap = el('div', { class: 'card table-card' });
  var table = el('div', { class: 'table-felt' });
  var n = s.tableSize;
  for (var i = 0; i < n; i++) {
    (function (seatIdx) {
      var angle = (Math.PI * 2 * seatIdx / n) + Math.PI / 2; // seat 0 at bottom
      var x = 50 + 41 * Math.cos(angle);
      var y = 50 + 38 * Math.sin(angle);
      var pid = s.seats[seatIdx];
      var p = pid ? STATE.players[pid] : null;
      var mark = s.perHand[seatIdx];
      var isMe = s.mySeat === seatIdx;
      var cls = 'seat' + (p ? ' filled' : '') + (mark === 'v' ? ' mark-v' : mark === 'r' ? ' mark-r' : '') + (isMe ? ' me' : '');
      var label = isMe ? 'ME' : (p ? (PLAYER_TYPES[p.type] || PLAYER_TYPES.unknown).icon + ' ' + p.name.slice(0, 7) : 'Seat ' + (seatIdx + 1));
      var sub = p && p.hands >= 5 ? Math.round(playerVpipPct(p)) + '/' + Math.round(playerPfrPct(p)) : '';
      var seatEl = el('div', { class: cls, style: 'left:' + x + '%;top:' + y + '%' }, [
        el('div', { class: 'seat-name', text: label }),
        sub ? el('div', { class: 'seat-stats', text: sub }) : null,
        el('button', { class: 'seat-info', text: 'ⓘ', onclick: function (e) { e.stopPropagation(); liveUI.openSeat = seatIdx; rerender(); } })
      ]);
      seatEl.addEventListener('click', function () {
        if (isMe) { liveUI.openSeat = seatIdx; rerender(); return; }
        if (!p) { liveUI.openSeat = seatIdx; rerender(); return; }
        // cycle mark: none -> v -> r -> none
        var cur = s.perHand[seatIdx];
        s.perHand[seatIdx] = cur === 'v' ? 'r' : cur === 'r' ? undefined : 'v';
        saveState();
        rerender();
      });
      table.appendChild(seatEl);
    })(i);
  }
  table.appendChild(el('div', { class: 'felt-logo', text: 'EDGE' }));
  wrap.appendChild(table);
  return wrap;
}

/* ---------- player panel ---------- */
function renderPlayerPanel(s, seatIdx) {
  var pid = s.seats[seatIdx];
  var panel = el('div', { class: 'card player-panel' });
  var headRow = el('div', { class: 'panel-head' }, [
    el('div', { class: 'chart-title', text: 'Seat ' + (seatIdx + 1) + (s.mySeat === seatIdx ? ' (you)' : '') }),
    el('button', { class: 'btn ghost sm', text: '✕', onclick: function () { liveUI.openSeat = null; rerender(); } })
  ]);
  panel.appendChild(headRow);

  // my seat selector
  panel.appendChild(el('button', {
    class: 'btn ghost sm', text: s.mySeat === seatIdx ? 'This is my seat ✓' : 'Set as my seat',
    onclick: function () { s.mySeat = seatIdx; saveState(); rerender(); }
  }));

  if (!pid) {
    // assign: new or existing
    var nameIn = el('input', { class: 'input', placeholder: 'Name / alias (e.g., “Red cap”, “Vlad”)' });
    panel.appendChild(el('div', { class: 'input-row' }, [el('span', { text: 'New player' }), nameIn]));
    panel.appendChild(el('button', {
      class: 'btn primary block', text: 'Add player to seat',
      onclick: function () {
        var p = newPlayer(nameIn.value.trim() || ('Seat ' + (seatIdx + 1)));
        s.seats[seatIdx] = p.id;
        saveState(); rerender();
      }
    }));
    // existing players book
    var ids = Object.keys(STATE.players);
    if (ids.length) {
      var sel = el('select', { class: 'select' });
      sel.appendChild(el('option', { value: '', text: '…or pick from your player book (' + ids.length + ')' }));
      ids.sort(function (a, b) { return STATE.players[b].updatedAt - STATE.players[a].updatedAt; });
      ids.forEach(function (id) {
        var p = STATE.players[id];
        sel.appendChild(el('option', { value: id, text: p.name + ' (' + (PLAYER_TYPES[p.type] || {}).name + ', ' + p.hands + 'h)' }));
      });
      sel.addEventListener('change', function () {
        if (!sel.value) return;
        s.seats[seatIdx] = sel.value;
        STATE.players[sel.value].sessionsSeen++;
        saveState(); rerender();
      });
      panel.appendChild(sel);
    }
    return panel;
  }

  var p = STATE.players[pid];
  // name + remove
  var nm = el('input', { class: 'input', value: p.name });
  nm.addEventListener('change', function () { p.name = nm.value; saveState(); rerender(); });
  panel.appendChild(el('div', { class: 'input-row' }, [el('span', { text: 'Name' }), nm]));

  // stats line + manual adjust
  var vp = playerVpipPct(p), pf = playerPfrPct(p);
  panel.appendChild(el('div', { class: 'stat-line', text: 'VPIP ' + Math.round(vp) + '% · PFR ' + Math.round(pf) + '% · 3-bets ' + p.threebet + ' · ' + p.hands + ' hands · seen ' + p.sessionsSeen + ' session(s)' }));
  var quick = el('div', { class: 'btn-row wrap' });
  quick.appendChild(el('button', { class: 'btn ghost sm', text: '+3-bet', onclick: function () { p.threebet++; saveState(); rerender(); } }));
  quick.appendChild(el('button', { class: 'btn ghost sm', text: '+limp', onclick: function () { p.limp = (p.limp || 0) + 1; saveState(); rerender(); } }));
  quick.appendChild(el('button', { class: 'btn ghost sm', text: 'Remove from seat', onclick: function () { delete s.seats[seatIdx]; delete s.perHand[seatIdx]; liveUI.openSeat = null; saveState(); rerender(); } }));
  panel.appendChild(quick);

  // type chips
  var chips = el('div', { class: 'chip-row' });
  for (var key in PLAYER_TYPES) {
    (function (k) {
      chips.appendChild(el('button', {
        class: 'chip' + (p.type === k ? ' on' : ''),
        text: PLAYER_TYPES[k].icon + ' ' + PLAYER_TYPES[k].short,
        onclick: function () { p.type = k; p.updatedAt = Date.now(); saveState(); rerender(); }
      }));
    })(key);
  }
  panel.appendChild(chips);

  // auto-classification suggestion
  var cl = classifyFromStats(vp, pf, p.hands);
  if (p.hands >= 10 && cl.type !== p.type) {
    panel.appendChild(el('div', { class: 'suggest', html: 'Stats suggest <b>' + PLAYER_TYPES[cl.type].name + '</b> (' + cl.confidence + ' confidence). ' + cl.why + ' ' }, [
      el('button', { class: 'btn ghost sm', text: 'Apply', onclick: function () { p.type = cl.type; saveState(); rerender(); } })
    ]));
  }

  // notes
  var notes = el('textarea', { class: 'input ta', placeholder: 'Reads: showdowns seen, sizing tells, tilt state…' });
  notes.value = p.notes || '';
  notes.addEventListener('change', function () { p.notes = notes.value; p.updatedAt = Date.now(); saveState(); });
  panel.appendChild(notes);

  // exploit advisor
  var t = PLAYER_TYPES[p.type] || PLAYER_TYPES.unknown;
  var exp = el('details', { class: 'exploits', open: '' }, [el('summary', { text: '⚔️ Exploits vs ' + t.name })]);
  exp.appendChild(exploitList('Preflop', t.exploits.preflop));
  exp.appendChild(exploitList('Postflop', t.exploits.postflop));
  exp.appendChild(exploitList('Careful', t.exploits.dangers));
  panel.appendChild(exp);

  return panel;
}

/* ---------- quick hand logger ---------- */
function renderHandLogger(s) {
  if (!liveUI.logDraft) {
    liveUI.logDraft = { cards: [], position: 'BTN', vs: '', line: [], result: '', note: '' };
  }
  var d = liveUI.logDraft;
  var card = el('div', { class: 'card logger' });
  card.appendChild(el('div', { class: 'chart-title', text: 'Log key hand (10 seconds, details later)' }));

  // my cards
  var cardsRow = el('div', { class: 'drill-hand sm' });
  d.cards.forEach(function (c, i) {
    var chip = cardChip(c, true);
    chip.addEventListener('click', function () { d.cards.splice(i, 1); rerender(); });
    cardsRow.appendChild(chip);
  });
  if (d.cards.length < 2) cardsRow.appendChild(el('span', { class: 'hint', text: d.cards.length === 0 ? 'pick your two cards ↓' : 'one more ↓' }));
  card.appendChild(cardsRow);
  if (d.cards.length < 2) card.appendChild(cardPicker(function (c) {
    if (d.cards.indexOf(c) >= 0) return;
    d.cards.push(c); rerender();
  }, d.cards));

  // position
  var posRow = el('div', { class: 'chip-row' });
  POSITIONS_9MAX.concat(['BB']).forEach(function (pos) {
    posRow.appendChild(el('button', {
      class: 'chip' + (d.position === pos ? ' on' : ''), text: pos,
      onclick: function () { d.position = pos; rerender(); }
    }));
  });
  card.appendChild(el('div', { class: 'lab', text: 'My position' }));
  card.appendChild(posRow);

  // line chips
  var LINES = ['I opened', 'I 3-bet', 'I called open', 'I defended BB', 'Limped pot', 'I faced 3-bet', 'I c-bet', 'I barreled', 'I bluffed', 'I value bet', 'I called down', 'I folded'];
  var lineRow = el('div', { class: 'chip-row' });
  LINES.forEach(function (L) {
    lineRow.appendChild(el('button', {
      class: 'chip' + (d.line.indexOf(L) >= 0 ? ' on' : ''), text: L,
      onclick: function () {
        var ix = d.line.indexOf(L);
        if (ix >= 0) d.line.splice(ix, 1); else d.line.push(L);
        rerender();
      }
    }));
  });
  card.appendChild(el('div', { class: 'lab', text: 'What happened (tap all that apply)' }));
  card.appendChild(lineRow);

  // vs + result + note
  var vsIn = el('input', { class: 'input', placeholder: 'vs who? (name/seat)', value: d.vs });
  vsIn.addEventListener('input', function () { d.vs = vsIn.value; });
  var resIn = el('input', { class: 'input', type: 'number', placeholder: '+/- result (e.g., -350)', value: d.result });
  resIn.setAttribute('inputmode', 'decimal');
  resIn.addEventListener('input', function () { d.result = resIn.value; });
  var noteIn = el('input', { class: 'input', placeholder: 'quick note (board, sizing…)', value: d.note });
  noteIn.addEventListener('input', function () { d.note = noteIn.value; });
  card.appendChild(vsIn); card.appendChild(resIn); card.appendChild(noteIn);

  var row = el('div', { class: 'btn-row' });
  row.appendChild(el('button', {
    class: 'btn primary grow', text: 'Save hand',
    onclick: function () {
      STATE.hands.push({
        id: uid(), sessionId: s.id, ts: Date.now(),
        stakes: s.sb + '/' + s.bb, bb: s.bb,
        cards: d.cards.slice(), position: d.position, vs: d.vs,
        line: d.line.slice(), result: parseFloat(d.result) || 0,
        note: d.note, board: '', streetNotes: '', leaks: [], reviewed: false
      });
      liveUI.logging = false; liveUI.logDraft = null;
      saveState(); rerender();
      toast('Hand saved — review it in the Hands tab later.');
    }
  }));
  row.appendChild(el('button', { class: 'btn ghost', text: 'Cancel', onclick: function () { liveUI.logging = false; liveUI.logDraft = null; rerender(); } }));
  card.appendChild(row);
  return card;
}

/* ---------- end session ---------- */
function endSession(s) {
  var hrsDef = ((Date.now() - s.startedAt) / 36e5).toFixed(1);
  showSheet({
    title: 'End session', sub: s.sb + '/' + s.bb + ' @ ' + s.location + ' · in for ' + fmtMoney(s.buyin),
    fields: [
      { key: 'cash', type: 'money', label: 'Cash-out', value: '' },
      { key: 'hrs', type: 'money', label: 'Hours played', value: hrsDef }
    ],
    confirmText: 'Save session',
    onConfirm: function (v) { finishLiveSession(s, parseFloat(v.cash) || 0, parseFloat(v.hrs) || parseFloat(hrsDef)); }
  });
}
function finishLiveSession(s, cashout, hrs) {
  STATE.sessions.push({
    id: s.id, date: new Date(s.startedAt).toISOString().slice(0, 10),
    stakes: s.sb + '/' + s.bb, sb: s.sb, bb: s.bb, game: 'NLHE',
    location: s.location, hours: Math.round(hrs * 10) / 10,
    buyin: s.buyin, cashout: cashout, hands: s.handCount, notes: ''
  });
  STATE.liveSession = null;
  liveUI.openSeat = null; liveUI.logging = false;
  saveState();
  rerender();
  var profit = cashout - s.buyin;
  toast('Session saved: ' + (profit >= 0 ? '+' : '') + fmtMoney(profit), profit < 0);
}
