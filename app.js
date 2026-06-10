/* ============================================================
   EDGE — app.js
   Navigation + boot.
   ============================================================ */
'use strict';

var VIEWS = [
  { id: 'study', icon: '📖', label: 'Study', render: renderStudy },
  { id: 'train', icon: '🎓', label: 'Train', render: renderTrain },
  { id: 'live', icon: '♠️', label: 'Live', render: renderLive },
  { id: 'hands', icon: '🃏', label: 'Hands', render: renderHands },
  { id: 'tools', icon: '🧮', label: 'Tools', render: renderTools },
  { id: 'stats', icon: '📈', label: 'Stats', render: renderStats }
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
    }, [
      el('span', { class: 'nav-ico', text: v.icon }),
      el('span', { class: 'nav-lab', text: v.label })
    ]);
    nav.appendChild(b);
  });
  // resume live session prominently
  if (STATE.liveSession) currentView = localStorage.getItem('edge-view') || 'live';
  rerender();
}

document.addEventListener('DOMContentLoaded', boot);
