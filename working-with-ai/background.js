(function(){
  "use strict";

  var canvas = document.getElementById('bg');
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var INK = '42,35,97';   // matches --ink
  var SEAL = '178,58,46'; // matches --seal, used sparingly for neon glints

  var MODE = canvas.getAttribute('data-mode') || 'bounce';

  var W=0, H=0, DPR=1;
  var buf, bctx; // offscreen trail buffer (kept fully transparent except ink strokes)

  function resize(){
    DPR = Math.min(window.devicePixelRatio||1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W*DPR);
    canvas.height = Math.floor(H*DPR);
    canvas.style.width = W+'px';
    canvas.style.height = H+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);

    buf = document.createElement('canvas');
    buf.width = Math.floor(W*DPR);
    buf.height = Math.floor(H*DPR);
    bctx = buf.getContext('2d');
    bctx.setTransform(DPR,0,0,DPR,0,0);

    if(current && current.onresize) current.onresize();
  }

  function rand(a,b){ return a + Math.random()*(b-a); }

  // ---------- tiny value-noise (used by flowfield only) ----------
  var permTable = (function(){
    var p = new Uint8Array(512);
    var perm = [];
    for(var i=0;i<256;i++) perm.push(i);
    for(i=255;i>0;i--){
      var j = Math.floor(Math.abs(Math.sin(i*127.1+311.7))*10000) % (i+1);
      var t = perm[i]; perm[i]=perm[j]; perm[j]=t;
    }
    for(i=0;i<512;i++) p[i] = perm[i & 255];
    return p;
  })();
  function fade(t){ return t*t*t*(t*(t*6-15)+10); }
  function lerp(a,b,t){ return a+t*(b-a); }
  function grad(hash, x, y){
    var h = hash & 3;
    var u = h<2 ? x : y;
    var v = h<2 ? y : x;
    return ((h&1)? -u : u) + ((h&2)? -2*v : 2*v);
  }
  function noise2(x,y){
    var X = Math.floor(x)&255, Y=Math.floor(y)&255;
    x -= Math.floor(x); y -= Math.floor(y);
    var u = fade(x), v = fade(y);
    var aa = permTable[permTable[X]+Y], ab = permTable[permTable[X]+Y+1];
    var ba = permTable[permTable[X+1]+Y], bb = permTable[permTable[X+1]+Y+1];
    var x1 = lerp(grad(aa,x,y), grad(ba,x-1,y), u);
    var x2 = lerp(grad(ab,x,y-1), grad(bb,x-1,y-1), u);
    return (lerp(x1,x2,v)) * 0.7;
  }
  function fbm(x,y,oct){
    oct = oct||3;
    var val=0, amp=0.5, freq=1;
    for(var i=0;i<oct;i++){
      val += amp*noise2(x*freq, y*freq);
      amp*=0.5; freq*=2.05;
    }
    return val;
  }

  // ================= modes (one active at a time, no switching) =================

  // 1. bouncing particles — ink dots drifting and bouncing off edges,
  //    trailing faint constellation lines. Trails fade via the offscreen
  //    buffer's own alpha channel so the page's gradient stays visible.
  var bounceMode = (function(){
    var pts = [];
    var N = 42;
    function seed(){
      pts = [];
      for(var i=0;i<N;i++){
        pts.push({
          x: rand(0,W), y: rand(0,H),
          vx: rand(-0.3,0.3), vy: rand(-0.3,0.3),
          r: rand(1.9,5.2)
        });
      }
    }
    return {
      init:function(){ seed(); },
      onresize:function(){ seed(); },
      step:function(dt){
        bctx.globalCompositeOperation = 'destination-out';
        bctx.fillStyle = 'rgba(0,0,0,0.045)';
        bctx.fillRect(0,0,W,H);
        bctx.globalCompositeOperation = 'source-over';

        for(var i=0;i<pts.length;i++){
          var p = pts[i];
          p.x += p.vx*dt*0.06; p.y += p.vy*dt*0.06;
          if(p.x<0||p.x>W) p.vx*=-1;
          if(p.y<0||p.y>H) p.vy*=-1;
          bctx.beginPath();
          bctx.arc(p.x,p.y,p.r,0,Math.PI*2);
          bctx.fillStyle = 'rgba('+INK+',0.30)';
          bctx.fill();
          for(var j=i+1;j<pts.length;j++){
            var q=pts[j];
            var dx=p.x-q.x, dy=p.y-q.y;
            var d = Math.sqrt(dx*dx+dy*dy);
            if(d<150){
              bctx.beginPath();
              bctx.moveTo(p.x,p.y); bctx.lineTo(q.x,q.y);
              bctx.strokeStyle = 'rgba('+INK+','+(0.10*(1-d/150))+')';
              bctx.lineWidth=1;
              bctx.stroke();
            }
          }
        }

        ctx.clearRect(0,0,W,H);
        ctx.drawImage(buf,0,0,W,H);
      }
    };
  })();

  // 2. particles on a noise field — ink advected along a flow field,
  //    leaving soft trailing streaks, occasional neon glints.
  var flowfieldMode = (function(){
    var pts = [];
    var N = 70;
    function seed(){
      pts = [];
      for(var i=0;i<N;i++){
        pts.push({x:rand(0,W), y:rand(0,H), age: rand(0,140), neon: Math.random()<0.12});
      }
    }
    var t = 0;
    return {
      init:function(){ seed(); },
      onresize:function(){ seed(); },
      step:function(dt){
        t += dt;
        bctx.globalCompositeOperation = 'destination-out';
        bctx.fillStyle = 'rgba(0,0,0,0.035)';
        bctx.fillRect(0,0,W,H);
        bctx.globalCompositeOperation = 'source-over';

        var tt = t*0.000003;
        for(var i=0;i<pts.length;i++){
          var p = pts[i];
          var ang = fbm(p.x*0.0035, p.y*0.0035 + tt*6, 3) * Math.PI*3;
          var nx = p.x + Math.cos(ang)*1.3;
          var ny = p.y + Math.sin(ang)*1.3;
          bctx.beginPath();
          bctx.moveTo(p.x,p.y);
          bctx.lineTo(nx,ny);
          bctx.strokeStyle = p.neon ? 'rgba('+SEAL+',0.22)' : 'rgba('+INK+',0.20)';
          bctx.lineWidth = p.neon ? 1.4 : 1.1;
          bctx.lineCap='round';
          bctx.stroke();
          p.x=nx; p.y=ny; p.age++;
          if(p.x<-20||p.x>W+20||p.y<-20||p.y>H+20||p.age>260){
            p.x=rand(0,W); p.y=rand(0,H); p.age=0; p.neon = Math.random()<0.12;
          }
        }

        ctx.clearRect(0,0,W,H);
        ctx.drawImage(buf,0,0,W,H);
      }
    };
  })();

  // 3. subdivision — recursive ink-block partition, panels breathing
  //    gently in place. No trail buffer needed: cheap to redraw whole.
  var subdivisionMode = (function(){
    var rects = [];
    function subdivide(x,y,w,h,depth){
      if(depth<=0 || w<28 || h<28 || Math.random()<0.16){
        rects.push({
          x:x,y:y,w:w,h:h,
          a: rand(0.05,0.13),
          phase: rand(0,Math.PI*2),
          neon: Math.random()<0.16
        });
        return;
      }
      if(w>h){
        var cut = w*rand(0.35,0.65);
        subdivide(x,y,cut,h,depth-1);
        subdivide(x+cut,y,w-cut,h,depth-1);
      } else {
        var cut2 = h*rand(0.35,0.65);
        subdivide(x,y,w,cut2,depth-1);
        subdivide(x,y+cut2,w,h-cut2,depth-1);
      }
    }
    function seed(){
      rects = [];
      subdivide(0,0,W,H,10);
    }
    return {
      init:function(){ seed(); },
      onresize:function(){ seed(); },
      step:function(dt, now){
        ctx.clearRect(0,0,W,H);
        for(var i=0;i<rects.length;i++){
          var r = rects[i];
          var pulse = (Math.sin(now*0.0004 + r.phase)+1)/2;
          var col = r.neon ? SEAL : INK;
          ctx.fillStyle = 'rgba('+col+','+(r.a*(0.5+0.5*pulse)*(r.neon?0.9:1))+')';
          ctx.fillRect(r.x+1,r.y+1,r.w-2,r.h-2);
          ctx.strokeStyle = 'rgba('+INK+',0.10)';
          ctx.lineWidth=1;
          ctx.strokeRect(r.x+0.5,r.y+0.5,r.w-1,r.h-1);
        }
      }
    };
  })();

  var MODES = { bounce: bounceMode, flowfield: flowfieldMode, subdivision: subdivisionMode };
  var current = MODES[MODE] || bounceMode;

  resize();
  window.addEventListener('resize', resize);
  current.init();

  if(reduceMotion){
    current.step(16, 0);
    window.addEventListener('resize', function(){ current.step(16, 0); });
    return;
  }

  var last = performance.now();
  function frame(now){
    var dt = Math.min(now-last, 48);
    last = now;
    current.step(dt, now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

})();
