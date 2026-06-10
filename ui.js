/* ============================================================
   EDGE — ui.js
   Small DOM helpers, hand-grid renderer, card picker, line chart.
   ============================================================ */
'use strict';

function el(tag, attrs, children) {
  var node = document.createElement(tag);
  if (attrs) {
    for (var k in attrs) {
      if (!attrs.hasOwnProperty(k)) continue;
      if (k === 'class') node.className = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else if (k === 'text') node.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') node.addEventListener(k.slice(2), attrs[k]);
      else node.setAttribute(k, attrs[k]);
    }
  }
  if (children) {
    for (var i = 0; i < children.length; i++) {
      if (children[i]) node.appendChild(children[i]);
    }
  }
  return node;
}
function txt(s) { return document.createTextNode(s); }
function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }
function fmtMoney(x, cur) {
  cur = cur || (STATE && STATE.settings.currency) || '$';
  var sign = x < 0 ? '-' : '';
  var v = Math.abs(Math.round(x * 100) / 100);
  var s = v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return sign + cur + s;
}
function fmtPct(x, dp) { return (100 * x).toFixed(dp === undefined ? 1 : dp) + '%'; }

var toastTimer = null;
function toast(msg, bad) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (bad ? ' bad' : '');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.className = 'toast'; }, 2200);
}

/* ---------- 13x13 hand grid ----------
   chartObj: {chart: {label: action}, spec: {...}}
   highlight: optional label to outline (drill feedback)            */
function renderHandGrid(compiled, highlight) {
  var wrap = el('div', { class: 'grid-wrap' });
  var grid = el('div', { class: 'hand-grid' });
  for (var i = 0; i < 13; i++) {
    for (var j = 0; j < 13; j++) {
      var label = gridLabel(i, j);
      var act = compiled ? compiled.chart[label] : undefined;
      var cls = 'cell ' + (act ? ACTION_META[act].cls : 'act-fold');
      if (i === j) cls += ' pair';
      if (highlight === label) cls += ' hl';
      grid.appendChild(el('div', { class: cls, text: label, title: label + (act ? ' — ' + ACTION_META[act].label : ' — Fold') }));
    }
  }
  wrap.appendChild(grid);
  return wrap;
}

function renderChartLegend(compiled) {
  var stats = chartStats(compiled.chart);
  var seen = {};
  var order = ['raise', 'threebet', 'fourbet', 'shove', 'call', 'mixed'];
  var leg = el('div', { class: 'legend' });
  for (var i = 0; i < order.length; i++) {
    var a = order[i];
    if (stats.byAction[a]) {
      leg.appendChild(el('span', { class: 'leg-item' }, [
        el('span', { class: 'leg-dot ' + ACTION_META[a].cls }),
        txt(ACTION_META[a].label + ' ' + (100 * stats.byAction[a] / 1326).toFixed(1) + '%')
      ]));
      seen[a] = true;
    }
  }
  leg.appendChild(el('span', { class: 'leg-item' }, [
    el('span', { class: 'leg-dot act-fold' }),
    txt('Fold ' + (100 * (1326 - stats.inChart) / 1326).toFixed(1) + '%')
  ]));
  return leg;
}

/* ---------- card picker ----------
   Returns element; onPick(cardInt) fired per selection.
   disabled: array of card ints to grey out.                         */
function cardPicker(onPick, disabled) {
  var dis = {};
  (disabled || []).forEach(function (c) { dis[c] = true; });
  var wrap = el('div', { class: 'card-picker' });
  for (var s = 3; s >= 0; s--) {
    var row = el('div', { class: 'cp-row' });
    for (var r = 12; r >= 0; r--) {
      (function (card) {
        var suitCh = SUITS[card & 3];
        var b = el('button', {
          class: 'cp-card' + (SUIT_RED[suitCh] ? ' red' : '') + (dis[card] ? ' dis' : ''),
          text: RANKS[card >> 2] + SUIT_GLYPH[suitCh],
          onclick: function () { if (!dis[card]) onPick(card); }
        });
        row.appendChild(b);
      })(r * 4 + s);
    }
    wrap.appendChild(row);
  }
  return wrap;
}

function cardChip(c, big) {
  var suitCh = SUITS[c & 3];
  return el('span', { class: 'card-chip' + (SUIT_RED[suitCh] ? ' red' : '') + (big ? ' big' : ''), text: cardPretty(c) });
}

/* ---------- simple responsive line chart on canvas ----------
   points: [{x: ts or idx, y: value, label}], opts {height, fmtY, zeroLine} */
function lineChart(points, opts) {
  opts = opts || {};
  var holder = el('div', { class: 'chart-holder' });
  var canvas = el('canvas');
  holder.appendChild(canvas);
  function draw() {
    var W = holder.clientWidth || 320;
    var H = opts.height || 180;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);
    if (!points.length) {
      ctx.fillStyle = '#6b7a6e';
      ctx.font = '13px system-ui';
      ctx.fillText('No data yet', 12, H / 2);
      return;
    }
    var padL = 44, padR = 10, padT = 12, padB = 20;
    var xs = points.map(function (p) { return p.x; });
    var ys = points.map(function (p) { return p.y; });
    var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
    var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    if (opts.zeroLine) { minY = Math.min(minY, 0); maxY = Math.max(maxY, 0); }
    if (minY === maxY) { minY -= 1; maxY += 1; }
    if (minX === maxX) { minX -= 1; maxX += 1; }
    var sx = function (x) { return padL + (x - minX) / (maxX - minX) * (W - padL - padR); };
    var sy = function (y) { return H - padB - (y - minY) / (maxY - minY) * (H - padT - padB); };
    // gridlines
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.fillStyle = '#8fa193';
    ctx.font = '10px system-ui';
    var steps = 4;
    for (var g = 0; g <= steps; g++) {
      var yv = minY + (maxY - minY) * g / steps;
      var yy = sy(yv);
      ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(W - padR, yy); ctx.stroke();
      ctx.fillText(opts.fmtY ? opts.fmtY(yv) : Math.round(yv), 4, yy + 3);
    }
    if (opts.zeroLine && minY < 0 && maxY > 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath(); ctx.moveTo(padL, sy(0)); ctx.lineTo(W - padR, sy(0)); ctx.stroke();
    }
    // line
    ctx.strokeStyle = '#39d98a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i < points.length; i++) {
      var px = sx(points[i].x), py = sy(points[i].y);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    // dots
    ctx.fillStyle = '#39d98a';
    for (var d = 0; d < points.length; d++) {
      ctx.beginPath();
      ctx.arc(sx(points[d].x), sy(points[d].y), 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // draw after attach
  setTimeout(draw, 0);
  window.addEventListener('resize', draw);
  return holder;
}

/* simple stat card */
function statCard(label, value, sub, cls) {
  return el('div', { class: 'stat-card ' + (cls || '') }, [
    el('div', { class: 'stat-value', text: value }),
    el('div', { class: 'stat-label', text: label }),
    sub ? el('div', { class: 'stat-sub', text: sub }) : null
  ]);
}

function sectionTitle(t, sub) {
  return el('div', { class: 'sec-title' }, [
    el('h2', { text: t }),
    sub ? el('p', { class: 'sec-sub', text: sub }) : null
  ]);
}

/* confirm helper */
function confirmAction(msg, fn) { if (window.confirm(msg)) fn(); }

/* ---------- mini table scene (visual drill situations) ---------- */
var ACTION_ORDER_9 = ['UTG', 'UTG+1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

function tableScene(cfg) {
  var order = ACTION_ORDER_9;
  var n = order.length;
  var felt = el('div', { class: 'mini-felt' });
  var heroIdx = order.indexOf(cfg.hero);
  if (heroIdx < 0) heroIdx = 0;
  for (var i = 0; i < n; i++) {
    var pos = order[i];
    var angle = Math.PI / 2 + (Math.PI * 2 * (i - heroIdx) / n);
    var x = 50 + 42 * Math.cos(angle);
    var y = 50 + 36 * Math.sin(angle);
    var isHero = pos === cfg.hero;
    var folded = (cfg.folds || []).indexOf(pos) >= 0;
    var cls = 'mseat' + (isHero ? ' hero' : '') + (folded ? ' folded' : '');
    var seat = el('div', { class: cls, style: 'left:' + x + '%;top:' + y + '%' });
    seat.appendChild(el('div', { class: 'mseat-pos', text: isHero ? 'YOU' : pos }));
    if (isHero && cfg.stack) seat.appendChild(el('div', { class: 'mseat-stack', text: cfg.stack }));
    if (pos === 'BTN') seat.appendChild(el('div', { class: 'dealer-btn', text: 'D' }));
    var chip = cfg.chips && cfg.chips[pos];
    if (chip) seat.appendChild(el('div', { class: 'mchip', text: chip }));
    if (folded && !isHero) seat.appendChild(el('div', { class: 'mfold', text: 'fold' }));
    felt.appendChild(seat);
  }
  if (cfg.toAct) felt.appendChild(el('div', { class: 'mini-pot', text: cfg.toAct }));
  return felt;
}

/* Build a scene from a chart spec for drill questions */
function sceneForSpec(spec) {
  var posMap = { 'EP': 'UTG', 'MP': 'MP', 'LJ': 'LJ', 'HJ': 'HJ', 'CO': 'CO', 'BTN': 'BTN', 'SB': 'SB', 'BB': 'BB', 'Any': 'CO', 'UTG': 'UTG', 'UTG+1': 'UTG+1' };
  function seatOf(p) { return posMap[p] || 'CO'; }
  var hero = seatOf(spec.pos);
  var folds = [], chips = {};
  var heroAt = ACTION_ORDER_9.indexOf(hero);
  function foldUpTo(stopPos) {
    var stop = ACTION_ORDER_9.indexOf(stopPos);
    for (var i = 0; i < stop; i++) folds.push(ACTION_ORDER_9[i]);
  }
  function foldBetween(aPos, bPos) {
    var a = ACTION_ORDER_9.indexOf(aPos), b = ACTION_ORDER_9.indexOf(bPos);
    for (var i = a + 1; i < b; i++) folds.push(ACTION_ORDER_9[i]);
  }
  var toAct = 'your move';
  if (spec.group === 'rfi' || spec.group === 'pushfold') {
    foldUpTo(hero);
    toAct = 'folded to you';
  } else if (spec.group === 'vsrfi') {
    var raiserKey = (spec.vs || '').split(' ')[0];
    var raiser = seatOf(raiserKey);
    foldUpTo(raiser);
    chips[raiser] = 'raise';
    foldBetween(raiser, hero);
    toAct = raiser + ' raised → you';
  } else if (spec.group === 'vs3bet') {
    foldUpTo(hero);
    chips[hero] = 'open';
    var tb = (spec.vs || '').indexOf('BTN') >= 0 ? 'BTN' : (spec.vs || '').indexOf('BB') >= 0 ? 'BB' : 'SB';
    if (tb === hero) tb = 'BB';
    chips[tb] = '3-bet';
    foldBetween(hero, tb);
    toAct = 'you opened, ' + tb + ' 3-bet';
  } else if (spec.group === 'vs4bet') {
    chips[hero] = '3-bet';
    var fb = hero === 'BTN' ? 'CO' : 'BTN';
    chips[fb] = '4-bet';
    toAct = 'you 3-bet, facing a 4-bet';
  }
  return { hero: hero, folds: folds, chips: chips, stack: spec.stack ? spec.stack + 'bb' : null, toAct: toAct };
}

/* tiny mastery/progress bar */
function masteryBar(pct, label) {
  var wrap = el('div', { class: 'mbar-wrap' });
  if (label) wrap.appendChild(el('span', { class: 'mbar-label', text: label }));
  var bar = el('div', { class: 'mbar' });
  var fillCls = pct === null ? '' : pct >= 0.85 ? ' good' : pct >= 0.65 ? ' mid' : ' low';
  bar.appendChild(el('div', { class: 'mbar-fill' + fillCls, style: 'width:' + (pct === null ? 0 : Math.round(pct * 100)) + '%' }));
  wrap.appendChild(bar);
  wrap.appendChild(el('span', { class: 'mbar-pct', text: pct === null ? 'new' : Math.round(pct * 100) + '%' }));
  return wrap;
}
