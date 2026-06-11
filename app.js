/* ============================================================
   EDGE — app.js
   Navigation + boot.
   ============================================================ */
'use strict';

var NAV_SVG = {
  study: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  train: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="0.8" fill="currentColor"/></svg>',
  live: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C9.5 7 4.5 9.5 4.5 13.6c0 2.6 2 4.6 4.6 4.6 1 0 1.9-.3 2.6-.9-.3 1.6-1 2.9-2.2 3.7v1h5v-1c-1.2-.8-1.9-2.1-2.2-3.7.7.6 1.6.9 2.6.9 2.6 0 4.6-2 4.6-4.6C19.5 9.5 14.5 7 12 2z"/></svg>',
  hands: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="11" height="15" rx="2"/><path d="M16 4l4.5 1.6a2 2 0 0 1 1.2 2.5L18 19"/></svg>',
  tools: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8"/><path d="M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/></svg>',
  stats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 7-8"/><path d="M14 7h6v6"/></svg>'
};
var VIEWS = [
  { id: 'study', label: 'Study', render: renderStudy },
  { id: 'train', label: 'Train', render: renderTrain },
  { id: 'live', label: 'Live', render: renderLive },
  { id: 'hands', label: 'Hands', render: renderHands },
  { id: 'tools', label: 'Tools', render: renderTools },
  { id: 'stats', label: 'Stats', render: renderStats }
];

var currentView = localStorage.getItem('edge-view') || 'study';

function rerender() {
  var root = document.getElementById('view');
  var v = null;
  for (var i = 0; i < VIEWS.length; i++) if (VIEWS[i].id === currentView) v = VIEWS[i];
  if (!v) v = VIEWS[0];
  v.render(root);
  // nav state
  var navBtns = document.querySelectorAll('.nav-btn');
  for (var j = 0; j < navBtns.length; j++) {
    navBtns[j].className = 'nav-btn' + (navBtns[j].getAttribute('data-view') === currentView ? ' on' : '');
  }
  // live indicator
  var liveBtn = document.querySelector('.nav-btn[data-view="live"]');
  if (liveBtn) liveBtn.classList.toggle('pulse', !!STATE.liveSession);
  window.scrollTo(0, 0);
}

function navTo(id) {
  currentView = id;
  localStorage.setItem('edge-view', id);
  rerender();
}

function boot() {
  loadState();
  var nav = document.getElementById('nav');
  VIEWS.forEach(function (v) {
    var b = el('button', {
      class: 'nav-btn', 'data-view': v.id,
      onclick: function () { navTo(v.id); }
    });
    var ico = el('span', { class: 'nav-ico' });
    ico.innerHTML = NAV_SVG[v.id];
    b.appendChild(ico);
    b.appendChild(el('span', { class: 'nav-lab', text: v.label }));
    nav.appendChild(b);
  });
  // resume live session prominently
  if (STATE.liveSession) currentView = localStorage.getItem('edge-view') || 'live';
  rerender();
}

document.addEventListener('DOMContentLoaded', boot);
