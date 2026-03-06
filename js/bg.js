(function(){
  var c=document.getElementById('cur'), r=document.getElementById('cur-r');
  var mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',function(e){ mx=e.clientX; my=e.clientY; c.style.left=mx+'px'; c.style.top=my+'px'; });
  (function loop(){ rx+=(mx-rx)*.13; ry+=(my-ry)*.13; r.style.left=rx+'px'; r.style.top=ry+'px'; requestAnimationFrame(loop); })();
  document.addEventListener('mouseover',function(e){ if(e.target.closest('button,a,[data-h]')) document.body.classList.add('ch'); else document.body.classList.remove('ch'); });
  document.documentElement.addEventListener('mouseleave',function(){ c.style.opacity='0'; r.style.opacity='0'; });
  document.documentElement.addEventListener('mouseenter',function(){ c.style.opacity='1'; r.style.opacity='1'; });
})();

// --- Particle background ---
(function(){
  var canvas = document.getElementById('particle-bg');
  var ctx = canvas.getContext('2d');
  var mouse = { x: -9999, y: -9999 };
  var W, H, particles = [];
  var COUNT = 90;
  var CONNECT_DIST = 130;
  var MOUSE_DIST = 160;

  document.addEventListener('mousemove', function(e){ mouse.x = e.clientX; mouse.y = e.clientY; });

  function resize(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function Particle(){
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.r = Math.random() * 1.5 + 0.5;
    this.base_alpha = Math.random() * 0.35 + 0.1;
    this.alpha = this.base_alpha;
  }

  Particle.prototype.update = function(){
    this.x += this.vx;
    this.y += this.vy;
    if(this.x < 0 || this.x > W) this.vx *= -1;
    if(this.y < 0 || this.y > H) this.vy *= -1;

    // Mouse repel
    var dx = this.x - mouse.x, dy = this.y - mouse.y;
    var dist = Math.sqrt(dx*dx + dy*dy);
    if(dist < MOUSE_DIST){
      var force = (1 - dist/MOUSE_DIST) * 0.6;
      this.vx += (dx/dist) * force * 0.08;
      this.vy += (dy/dist) * force * 0.08;
      this.alpha = Math.min(0.7, this.base_alpha + force * 0.5);
    } else {
      this.alpha += (this.base_alpha - this.alpha) * 0.05;
    }

    // Speed cap
    var spd = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
    if(spd > 1.2){ this.vx *= 0.98; this.vy *= 0.98; }
  };

  for(var i=0; i<COUNT; i++) particles.push(new Particle());

  function draw(){
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for(var i=0; i<particles.length; i++){
      for(var j=i+1; j<particles.length; j++){
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var d = Math.sqrt(dx*dx + dy*dy);
        if(d < CONNECT_DIST){
          var alpha = (1 - d/CONNECT_DIST) * 0.12;
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(232,232,232,' + alpha + ')';
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw dots
    for(var i=0; i<particles.length; i++){
      var p = particles[i];
      p.update();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(232,232,232,' + p.alpha + ')';
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }
  draw();
})();
</script>

