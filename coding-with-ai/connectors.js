(function(){
  "use strict";

  function draw(){
    var svg = document.querySelector('.summary-connectors');
    var wrap = document.querySelector('.summary-wrap');
    if(!svg || !wrap) return;

    svg.innerHTML = '';
    if(window.innerWidth <= 760) return; // matches CSS stacking breakpoint

    var wrapRect = wrap.getBoundingClientRect();
    svg.setAttribute('width', wrapRect.width);
    svg.setAttribute('height', wrapRect.height);
    svg.setAttribute('viewBox', '0 0 ' + wrapRect.width + ' ' + wrapRect.height);

    var items = document.querySelectorAll('.summary-principles li[data-cat]');
    items.forEach(function(li){
      var cats = li.getAttribute('data-cat').split(' ');
      var liRect = li.getBoundingClientRect();
      var startX = liRect.right - wrapRect.left;
      var startY = liRect.top - wrapRect.top + liRect.height / 2;

      cats.forEach(function(cat){
        var target = document.querySelector('.theme-card[data-theme="' + cat + '"]');
        if(!target) return;
        var tRect = target.getBoundingClientRect();
        var endX = tRect.left - wrapRect.left;
        var endY = tRect.top - wrapRect.top + tRect.height / 2;
        var color = target.style.getPropertyValue('--theme-color') || '#9A8FCB';
        var midX = (startX + endX) / 2;

        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        var d = 'M' + startX + ',' + startY +
                ' C' + midX + ',' + startY +
                ' ' + midX + ',' + endY +
                ' ' + endX + ',' + endY;
        path.setAttribute('d', d);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '1.4');
        path.setAttribute('fill', 'none');
        path.setAttribute('opacity', '0.45');
        svg.appendChild(path);
      });
    });
  }

  var raf = null;
  function scheduleDraw(){
    if(raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(draw);
  }

  document.addEventListener('DOMContentLoaded', scheduleDraw);
  window.addEventListener('resize', scheduleDraw);
  window.addEventListener('load', scheduleDraw);

  // Redraw when the sidebar push-layout changes the available width.
  var root = document.documentElement;
  var mo = new MutationObserver(scheduleDraw);
  mo.observe(root, { attributes: true, attributeFilter: ['class'] });
})();
