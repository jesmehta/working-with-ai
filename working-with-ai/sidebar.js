(function(){
  "use strict";
  var toggle = document.querySelector('.sidebar-toggle');
  var sidebar = document.querySelector('.sidebar');
  var backdrop = document.querySelector('.sidebar-backdrop');
  var closeBtn = document.querySelector('.sidebar-close');
  if(!toggle || !sidebar || !backdrop) return;

  var MOBILE_BREAKPOINT = 860;

  function open(){
    sidebar.classList.add('open');
    backdrop.classList.add('open');
    document.body.classList.add('sidebar-open');
    toggle.setAttribute('aria-expanded','true');
  }
  function close(){
    sidebar.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.classList.remove('sidebar-open');
    toggle.setAttribute('aria-expanded','false');
  }

  // Markup ships with the sidebar open; collapse it on narrow viewports
  // where it would otherwise cover the page as a full overlay.
  if(window.innerWidth < MOBILE_BREAKPOINT){
    close();
  } else {
    document.body.classList.add('sidebar-open');
  }

  toggle.addEventListener('click', function(){
    if(sidebar.classList.contains('open')) close(); else open();
  });
  backdrop.addEventListener('click', close);
  if(closeBtn) closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') close();
  });
})();
