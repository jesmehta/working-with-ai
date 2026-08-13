(function(){
  "use strict";
  var toggle = document.querySelector('.sidebar-toggle');
  var sidebar = document.querySelector('.sidebar');
  var backdrop = document.querySelector('.sidebar-backdrop');
  var closeBtn = document.querySelector('.sidebar-close');
  if(!toggle || !sidebar || !backdrop) return;

  var root = document.documentElement;

  function open(){ root.classList.add('sidebar-open'); }
  function close(){ root.classList.remove('sidebar-open'); }

  toggle.addEventListener('click', open);
  backdrop.addEventListener('click', close);
  if(closeBtn) closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') close();
  });

  // Keep state in sync when crossing the push/overlay breakpoint —
  // desktop defaults open (pushes content), mobile defaults closed (overlay).
  var mq = window.matchMedia('(min-width: 861px)');
  function syncToBreakpoint(e){
    if(e.matches) open(); else close();
  }
  if(mq.addEventListener) mq.addEventListener('change', syncToBreakpoint);
  else if(mq.addListener) mq.addListener(syncToBreakpoint);
})();
