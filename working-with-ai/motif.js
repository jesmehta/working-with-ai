(function(){
  "use strict";

  var canvas = document.getElementById('motif');
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var rootStyle = getComputedStyle(document.documentElement);
  var INK = (rootStyle.getPropertyValue('--ink') || '#2A2361').trim();
  var SEAL = (rootStyle.getPropertyValue('--seal') || '#B23A2E').trim();

  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;
  function resize(){
    var rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if(reduceMotion) render();
  }
  window.addEventListener('resize', resize);

  // mouseX drives the rolling-circle radius (loop count), mouseY drives the
  // pen offset (how tight/spiky the loops are). Smoothed so it drifts rather
  // than snaps to the cursor.
  var tx = 0.42, ty = 0.5;
  var sx = 0.42, sy = 0.5;

  function setTarget(clientX, clientY){
    tx = clientX / window.innerWidth;
    ty = clientY / window.innerHeight;
  }
  window.addEventListener('pointermove', function(e){ setTarget(e.clientX, e.clientY); }, {passive:true});
  window.addEventListener('touchmove', function(e){
    if(e.touches && e.touches[0]) setTarget(e.touches[0].clientX, e.touches[0].clientY);
  }, {passive:true});

  function drawCurve(r, d, Rr){
    var cx = W/2, cy = H/2;
    var ratio = (Rr - r) / r;
    var steps = 1600;
    ctx.beginPath();
    for(var i=0; i<=steps; i++){
      var t = (i/steps) * Math.PI * 2 * 16;
      var x = (Rr - r) * Math.cos(t) + d * Math.cos(ratio * t);
      var y = (Rr - r) * Math.sin(t) - d * Math.sin(ratio * t);
      var px = cx + x, py = cy + y;
      if(i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  function render(){
    if(!W || !H) return;
    var Rr = Math.min(W, H) * 0.46;
    var r = Rr * (0.16 + sx * 0.5);
    var d = r * (0.3 + sy * 1.5);

    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = INK;
    drawCurve(r, d, Rr);

    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = SEAL;
    drawCurve(r * 0.94, d * 1.06, Rr);
  }

  resize();

  if(reduceMotion){
    sx = 0.38; sy = 0.45;
    render();
    return;
  }

  function frame(){
    sx += (tx - sx) * 0.05;
    sy += (ty - sy) * 0.05;
    render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

})();
