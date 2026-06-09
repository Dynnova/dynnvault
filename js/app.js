// ============================================================
// app.js — Main React app (no admin panel, no Supabase)
// Tujuan     : Render store page, preview page, baca data.json
// Dipakai    : index.html (ReactDOM.createRoot)
// Dependensi : config.js (DATA_URL), store.js (DB.load)
//              React 18, anime.js (CDN)
// Fungsi     : App, Card, PreviewPage, BlackHole, FollowPath
//              Carousel, Modal, Toast, StatusBadge
// Side effect: GET data.json saat mount
// ============================================================

const {useState, useEffect, useRef} = React;

const DEFAULT_STORE = {
  storeName: "DynnVault",
  storeTagline: "Made by Love",
  storeDescription: "A personal collection of tools I've built. Feel free to use them.",
  accentColor: "#e8e8e8",
  accent2Color: "#22c55e"
};

const STATUS_CFG = {
  "free":        { label:"Free",        dot:"#22c55e",  text:"#22c55e"  },
  "works":       { label:"Works",       dot:"#22c55e",  text:"#22c55e"  },
  "maintenance": { label:"Maintenance", dot:"#f97316",  text:"#f97316"  },
  "not-works":   { label:"Not Works",   dot:"#ef4444",  text:"#ef4444"  },
};

const toEmbed = url => {
  if(!url) return "";
  if(url.includes("youtube.com/embed/")) return url;
  let m = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/); if(m) return "https://www.youtube.com/embed/"+m[1];
  m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/); if(m) return "https://www.youtube.com/embed/"+m[1];
  return url;
};

// --- Icons ---
const Icon = ({n, s=16}) => {
  const icons = {
    dl:     <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"><path d="M8 2v8M5 7l3 3 3-3M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1"/></svg>,
    eye:    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg>,
    back:   <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"><line x1="13" y1="8" x2="3" y2="8"/><polyline points="7 4 3 8 7 12"/></svg>,
    x:      <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"><line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/></svg>,
  };
  return icons[n] || null;
};

// --- Btn ---
function Btn({children, onClick, className="btn", style, disabled}){
  const ref = useRef();
  const press = () => anime({targets:ref.current, scale:[1,.94,1], duration:180, easing:'easeOutElastic(1,.5)'});
  return <button ref={ref} data-h="1" onClick={e=>{press();onClick&&onClick(e);}} className={className} style={{cursor:"pointer",...style}} disabled={disabled}>{children}</button>;
}

// --- Status badge ---
function StatusBadge({status}){
  const cfg = STATUS_CFG[status] || STATUS_CFG["works"];
  return(
    <span style={{display:"inline-flex",alignItems:"center",gap:5}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:cfg.dot,flexShrink:0,boxShadow:`0 0 5px ${cfg.dot}55`}}/>
      <span style={{fontSize:11,color:cfg.text,fontFamily:"var(--mono)",letterSpacing:".02em"}}>{cfg.label}</span>
    </span>
  );
}

// --- Truncated desc ---
function Desc({text}){
  if(!text) return null;
  return <p className="card-desc" style={{whiteSpace:"pre-wrap"}}>{text}</p>;
}

// --- Screenshot carousel ---
function Carousel({shots}){
  const imgs = shots.filter(Boolean);
  const [i, setI] = useState(0);
  const imgRef = useRef();
  if(!imgs.length) return null;
  const go = d => {
    const next = (i+d+imgs.length)%imgs.length;
    if(imgRef.current) anime({targets:imgRef.current,opacity:[0,1],translateX:[d>0?10:-10,0],duration:200,easing:'easeOutCubic'});
    setI(next);
  };
  const btnStyle = {
    position:"absolute", top:"50%", transform:"translateY(-50%)",
    background:"rgba(22,22,22,.92)", border:"1px solid var(--border-hover)",
    color:"var(--text)", width:32, height:32,
    display:"flex", alignItems:"center", justifyContent:"center",
    cursor:"pointer", zIndex:50, flexShrink:0
  };
  return(
    <div style={{position:"relative",height:"100%",border:"1px solid var(--border)"}}>
      <div style={{width:"100%",height:"100%",background:"#000",overflow:"hidden"}}>
        <img ref={imgRef} src={imgs[i]} style={{width:"100%",height:"100%",objectFit:"contain",display:"block",pointerEvents:"none"}} alt="" onError={e=>e.target.style.display='none'}/>
      </div>
      {imgs.length>1&&<>
        <button style={{...btnStyle,left:10}} onClick={()=>go(-1)}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="10 4 6 8 10 12"/></svg>
        </button>
        <button style={{...btnStyle,right:10}} onClick={()=>go(1)}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6 4 10 8 6 12"/></svg>
        </button>
        <div style={{position:"absolute",bottom:8,left:0,right:0,display:"flex",justifyContent:"center",gap:4,zIndex:50}}>
          {imgs.map((_,idx)=>(
            <div key={idx} onClick={()=>setI(idx)} style={{width:idx===i?16:4,height:4,background:idx===i?"var(--text)":"var(--border-hover)",transition:"all .2s",cursor:"pointer"}}/>
          ))}
        </div>
      </>}
    </div>
  );
}

// --- Format date ---
function fmtDate(d){ if(!d) return "—"; const dt=new Date(d); return dt.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}); }

// --- Tool Card ---
function Card({sw, index, onDownload, onPreview}){
  const ref = useRef();
  useEffect(()=>{
    anime({targets:ref.current, opacity:[0,1], translateY:[14,0], duration:420, delay:index*55, easing:'easeOutExpo'});
  },[]);
  return(
    <div ref={ref} className="tool-card" style={{opacity:0}}>
      <div className="card-top">
        <div>
          {sw.image&&<img src={sw.image} style={{width:28,height:28,objectFit:"cover",border:"1px solid var(--border)",marginBottom:10}} alt="" onError={e=>e.target.style.display='none'}/>}
          <div className="card-name">{sw.name}</div>
          <div className="card-meta">{sw.category} · v{sw.version}</div>
        </div>
        <StatusBadge status={sw.status}/>
      </div>
      <Desc text={sw.description}/>
      <div className="card-footer">
        <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)"}}>
          Updated {fmtDate(sw.lastUpdate)}
        </span>
        <div className="card-actions">
          <Btn onClick={onPreview} className="btn btn-sm" style={{display:"flex",alignItems:"center",gap:5}}><Icon n="eye" s={12}/>Info</Btn>
          <Btn onClick={onDownload} className="btn btn-primary btn-sm" style={{display:"flex",alignItems:"center",gap:5}}><Icon n="dl" s={12}/>Download</Btn>
        </div>
      </div>
    </div>
  );
}

// --- Toast ---
function Toast({msg, type}){
  const ref = useRef();
  useEffect(()=>{ anime({targets:ref.current,translateY:[12,0],opacity:[0,1],duration:280,easing:'easeOutExpo'}); });
  return(
    <div ref={ref} className="toast" style={{opacity:0,borderColor:type==="warn"?"rgba(239,68,68,.3)":"var(--border)"}}>
      <span style={{color:type==="warn"?"var(--red)":"var(--green)",fontSize:12}}>{type==="warn"?"✕":"✓"}</span>
      <span>{msg}</span>
    </div>
  );
}

// --- Preview BG Particles ---
function PreviewBg(){
  const canvasRef = useRef();
  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let W, H;
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const NUM = 55;
    const particles = Array.from({length: NUM}, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.4 + 0.3, alpha: Math.random() * 0.35 + 0.08,
    }));
    const CONNECT_DIST = 110;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if(p.x < 0) p.x = W; if(p.x > W) p.x = 0;
        if(p.y < 0) p.y = H; if(p.y > H) p.y = 0;
      });
      for(let i = 0; i < NUM; i++){
        for(let j = i+1; j < NUM; j++){
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if(dist < CONNECT_DIST){
            const opacity = (1 - dist/CONNECT_DIST) * 0.09;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(180,190,255,${opacity})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(200,210,255,${p.alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return (
    <canvas ref={canvasRef} style={{
      position:'absolute', inset:0, width:'100%', height:'100%',
      pointerEvents:'none', zIndex:0, display:'block'
    }}/>
  );
}

// --- Preview page ---
function PreviewPage({sw, onClose}){
  const embed = toEmbed(sw.previewUrl);
  return(
    <div className="preview-page">
      <div className="preview-bar">
        <Btn onClick={onClose} className="btn btn-sm" style={{display:"flex",alignItems:"center",gap:6}}><Icon n="back" s={12}/>Back</Btn>
        <span style={{fontSize:13,fontWeight:500,flex:1}}>{sw.name}</span>
        <StatusBadge status={sw.status}/>
      </div>
      <div style={{flex:1,overflow:"hidden",padding:"24px 28px",display:"flex",flexDirection:"column",position:"relative"}}>
        <PreviewBg/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:20,maxWidth:1060,margin:"0 auto",width:"100%",flex:1,minHeight:0,position:"relative",zIndex:1,overflow:"hidden"}}>
          <div style={{display:"flex",flexDirection:"column",gap:12,overflow:"hidden",minHeight:0}}>
            {embed?(
              <div
                style={{background:"#000",border:"1px solid var(--border)",position:"relative",paddingTop:"56.25%",overflow:"hidden",flexShrink:0}}
                onMouseEnter={()=>{ document.getElementById('cur').style.opacity='0'; document.getElementById('cur-r').style.opacity='0'; }}
                onMouseLeave={()=>{ document.getElementById('cur').style.opacity='1'; document.getElementById('cur-r').style.opacity='1'; }}
              >
                <iframe src={embed} title="Preview" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none",display:"block"}}/>
              </div>
            ):(
              <div style={{background:"var(--surface)",border:"1px solid var(--border)",position:"relative",paddingTop:"56.25%",flexShrink:0}}>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{color:"var(--muted)",fontSize:13}}>No preview available</span>
                </div>
              </div>
            )}
            {(sw.screenshots||[]).filter(Boolean).length>0&&(
              <div style={{flex:1,minHeight:180,position:"relative",overflow:"hidden"}}>
                <Carousel shots={sw.screenshots||[]}/>
              </div>
            )}
          </div>
          <div style={{border:"1px solid var(--border)",padding:"18px",display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}}>
            <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
              <div style={{fontSize:18,fontWeight:300,letterSpacing:"-.02em",marginBottom:3,flexShrink:0}}>{sw.name}</div>
              <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)",marginBottom:14,flexShrink:0}}>{sw.category} · v{sw.version}</div>
              <p style={{fontSize:13,color:"var(--muted)",lineHeight:1.7,fontWeight:300,overflowY:"auto",flex:1,paddingRight:4,minHeight:0,whiteSpace:"pre-wrap"}}>{sw.description}</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,paddingTop:14,borderTop:"1px solid var(--border)",marginTop:14,flexShrink:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)"}}>Status</span>
                <StatusBadge status={sw.status}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)"}}>Last update</span>
                <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--text)"}}>{fmtDate(sw.lastUpdate)}</span>
              </div>
              {sw.downloadUrl&&sw.downloadUrl!=="#"&&(
                <Btn onClick={()=>window.open(sw.downloadUrl,"_blank")} className="btn btn-primary btn-sm" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginTop:4}}><Icon n="dl" s={12}/>Download</Btn>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Follow Path Divider ---
function FollowPath(){
  const svgRef = useRef();
  useEffect(()=>{
    const svg = svgRef.current;
    if(!svg) return;
    const paths = Array.from(svg.querySelectorAll('.fpath'));
    const dots  = Array.from(svg.querySelectorAll('.fdot'));
    const anims = [];
    dots.forEach((dot, i)=>{
      const path = paths[i % paths.length];
      const len  = path.getTotalLength();
      let progress = (i / dots.length) * len;
      const a = anime({
        targets: { p: progress },
        p: progress + len,
        duration: 5000 + i * 600,
        easing: 'linear',
        loop: true,
        update(ins){
          const t  = ins.animations[0].currentValue % len;
          const pt = path.getPointAtLength(t);
          dot.setAttribute('cx', pt.x);
          dot.setAttribute('cy', pt.y);
        }
      });
      anims.push(a);
    });
    return ()=> anims.forEach(a=> a.pause());
  },[]);
  return (
    <div className="followpath-wrap">
      <svg ref={svgRef} viewBox="0 0 1200 100" preserveAspectRatio="none"
           style={{width:'100%',height:'100%',display:'block'}}>
        <defs>
          <linearGradient id="fpGrad" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%"   stopColor="rgba(232,232,232,0)"/>
            <stop offset="15%"  stopColor="rgba(232,232,232,.07)"/>
            <stop offset="85%"  stopColor="rgba(232,232,232,.07)"/>
            <stop offset="100%" stopColor="rgba(232,232,232,0)"/>
          </linearGradient>
        </defs>
        <path className="fpath" fill="none" stroke="url(#fpGrad)" strokeWidth="0.6"
          d="M0,50 C150,18 300,82 450,50 C600,18 750,82 900,50 C1050,18 1150,65 1200,50"/>
        <path className="fpath" fill="none" stroke="url(#fpGrad)" strokeWidth="0.6"
          d="M0,62 C180,32 360,88 540,58 C700,28 860,78 1020,55 C1110,42 1165,72 1200,62"/>
        <path className="fpath" fill="none" stroke="url(#fpGrad)" strokeWidth="0.6"
          d="M0,38 C120,68 280,18 480,42 C660,68 820,22 980,46 C1090,62 1155,30 1200,38"/>
        <circle className="fdot" r="2.2" fill="rgba(232,232,232,.85)" cx="0" cy="50"/>
        <circle className="fdot" r="1.3" fill="rgba(232,232,232,.45)" cx="0" cy="50"/>
        <circle className="fdot" r="2.2" fill="rgba(232,232,232,.85)" cx="0" cy="62"/>
        <circle className="fdot" r="1.3" fill="rgba(232,232,232,.45)" cx="0" cy="62"/>
        <circle className="fdot" r="2.2" fill="rgba(232,232,232,.85)" cx="0" cy="38"/>
        <circle className="fdot" r="1.3" fill="rgba(232,232,232,.45)" cx="0" cy="38"/>
        <circle className="fdot" r="1.6" fill="rgba(239,68,68,.75)"   cx="0" cy="50"/>
        <circle className="fdot" r="1.6" fill="rgba(239,68,68,.75)"   cx="0" cy="38"/>
      </svg>
    </div>
  );
}

// --- BlackHole Sphere ---
function BlackHole(){
  const canvasRef = useRef();
  const sceneRef = useRef();
  useEffect(()=>{
    const sphereEl = sceneRef.current.querySelector('.sphere-animation');
    const spherePathEls = sphereEl.querySelectorAll('.sphere path');
    const pathLength = spherePathEls.length;
    const aimations = [];
    anime.set(sphereEl, {scale: 1});
    const breathAnimation = anime({
      begin: function() {
        for(var i=0;i<pathLength;i++){
          aimations.push(anime({
            targets: spherePathEls[i],
            stroke: {value:['rgba(255,75,75,1)','rgba(80,80,80,.35)'], duration:500},
            translateX:[2,-4], translateY:[2,-4],
            easing:'easeOutQuad', autoplay:false
          }));
        }
      },
      update: function(ins){
        aimations.forEach(function(animation,i){
          var percent=(1-Math.sin((i*.35)+(.0022*ins.currentTime)))/2;
          animation.seek(animation.duration*percent);
        });
      },
      duration: Infinity, autoplay: false
    });
    const shadowAnimation = anime({
      targets:'#sphereGradient',
      x1:'25%',x2:'25%',y1:'0%',y2:'75%',
      duration:30000,easing:'easeOutQuint',autoplay:false
    },0);
    breathAnimation.play();
    shadowAnimation.play();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], animId;
    function resize(){ W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    const cx = ()=> W/2;
    const cy = ()=> H/2;
    const bhR = 90;
    class Particle {
      constructor(){this.reset(true);}
      reset(rand){
        const angle = Math.random()*Math.PI*2;
        const dist = rand ? (bhR + 60 + Math.random()*(Math.min(W,H)/2 - bhR - 20)) : (bhR + 80 + Math.random()*80);
        this.x = cx() + Math.cos(angle)*dist;
        this.y = cy() + Math.sin(angle)*dist;
        this.size = Math.random()*1.8 + 0.3;
        this.alpha = Math.random()*0.5 + 0.15;
        this.color = Math.random() > 0.7 ? `rgba(255,${100+Math.floor(Math.random()*80)},60,` : `rgba(232,232,232,`;
        this.orbitSpeed = (Math.random()*0.003+0.001) * (Math.random()>0.5?1:-1);
        this.angle = angle;
        this.dist = dist;
        this.pullSpeed = Math.random()*0.12 + 0.04;
        this.life = 1;
        this.decayDist = bhR + Math.random()*20;
      }
      update(){
        this.angle += this.orbitSpeed * (1 + (1/(this.dist/bhR)));
        this.dist -= this.pullSpeed * (1 + (bhR*1.8/Math.max(this.dist,1)));
        this.x = cx() + Math.cos(this.angle)*this.dist;
        this.y = cy() + Math.sin(this.angle)*this.dist;
        if(this.dist < this.decayDist){ this.life -= 0.06; }
        if(this.life <= 0 || this.dist < bhR - 10) this.reset(false);
      }
      draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI*2);
        ctx.fillStyle = this.color + (this.alpha * this.life) + ')';
        ctx.fill();
      }
    }
    class DiskArc {
      constructor(r, tilt, speed, color, width){
        this.r = r; this.tilt = tilt; this.speed = speed;
        this.color = color; this.width = width;
        this.angle = Math.random()*Math.PI*2;
        this.span = Math.PI*(0.4+Math.random()*0.9);
      }
      draw(){
        this.angle += this.speed;
        ctx.save();
        ctx.translate(cx(), cy());
        ctx.rotate(this.tilt);
        ctx.scale(1, 0.28);
        ctx.beginPath();
        ctx.arc(0, 0, this.r, this.angle, this.angle + this.span);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.stroke();
        ctx.restore();
      }
    }
    for(let i=0;i<120;i++) particles.push(new Particle());
    const disks = [
      new DiskArc(bhR+18, -0.3, 0.004, 'rgba(255,100,50,.18)', 2),
      new DiskArc(bhR+30, -0.3, 0.003, 'rgba(255,140,60,.10)', 1.5),
      new DiskArc(bhR+44, -0.3, 0.002, 'rgba(255,80,40,.07)', 1),
      new DiskArc(bhR+14, -0.25, -0.005, 'rgba(200,100,255,.08)', 1.5),
    ];
    function draw(){
      ctx.clearRect(0,0,W,H);
      const grad = ctx.createRadialGradient(cx(),cy(),bhR-10,cx(),cy(),bhR+50);
      grad.addColorStop(0,'rgba(255,80,50,.06)');
      grad.addColorStop(0.5,'rgba(255,120,60,.03)');
      grad.addColorStop(1,'transparent');
      ctx.beginPath();
      ctx.arc(cx(),cy(),bhR+50,0,Math.PI*2);
      ctx.fillStyle=grad;
      ctx.fill();
      disks.forEach(d=>d.draw());
      particles.forEach(p=>{ p.update(); p.draw(); });
      animId = requestAnimationFrame(draw);
    }
    draw();
    return ()=>{ cancelAnimationFrame(animId); ro.disconnect(); breathAnimation.pause(); };
  },[]);
  return (
    <div className="blackhole-wrap">
      <div className="blackhole-scene" ref={sceneRef}>
        <canvas ref={canvasRef} id="blackhole-canvas"/>
        <div className="blackhole-glow"/>
        <div className="blackhole-ring"/>
        <div className="blackhole-ring2"/>
        <div className="blackhole-distort"/>
        <div className="sphere-animation">
          <svg className="sphere" viewBox="0 0 440 440" stroke="rgba(80,80,80,.35)">
            <defs>
              <linearGradient id="sphereGradient" x1="5%" x2="5%" y1="0%" y2="15%">
                <stop stopColor="#373734" offset="0%"/>
                <stop stopColor="#242423" offset="50%"/>
                <stop stopColor="#0D0D0C" offset="100%"/>
              </linearGradient>
            </defs>
            <path d="M361.604 361.238c-24.407 24.408-51.119 37.27-59.662 28.727-8.542-8.543 4.319-35.255 28.726-59.663 24.408-24.407 51.12-37.269 59.663-28.726 8.542 8.543-4.319 35.255-28.727 59.662z"/>
            <path d="M360.72 360.354c-35.879 35.88-75.254 54.677-87.946 41.985-12.692-12.692 6.105-52.067 41.985-87.947 35.879-35.879 75.254-54.676 87.946-41.984 12.692 12.692-6.105 52.067-41.984 87.946z"/>
            <path d="M357.185 356.819c-44.91 44.91-94.376 68.258-110.485 52.149-16.11-16.11 7.238-65.575 52.149-110.485 44.91-44.91 94.376-68.259 110.485-52.15 16.11 16.11-7.239 65.576-52.149 110.486z"/>
            <path d="M350.998 350.632c-53.21 53.209-111.579 81.107-130.373 62.313-18.794-18.793 9.105-77.163 62.314-130.372 53.209-53.21 111.579-81.108 130.373-62.314 18.794 18.794-9.105 77.164-62.314 130.373z"/>
            <path d="M343.043 342.677c-59.8 59.799-125.292 91.26-146.283 70.268-20.99-20.99 10.47-86.483 70.269-146.282 59.799-59.8 125.292-91.26 146.283-70.269 20.99 20.99-10.47 86.484-70.27 146.283z"/>
            <path d="M334.646 334.28c-65.169 65.169-136.697 99.3-159.762 76.235-23.065-23.066 11.066-94.593 76.235-159.762s136.697-99.3 159.762-76.235c23.065 23.065-11.066 94.593-76.235 159.762z"/>
            <path d="M324.923 324.557c-69.806 69.806-146.38 106.411-171.031 81.76-24.652-24.652 11.953-101.226 81.759-171.032 69.806-69.806 146.38-106.411 171.031-81.76 24.652 24.653-11.953 101.226-81.759 171.032z"/>
            <path d="M312.99 312.625c-73.222 73.223-153.555 111.609-179.428 85.736-25.872-25.872 12.514-106.205 85.737-179.428s153.556-111.609 179.429-85.737c25.872 25.873-12.514 106.205-85.737 179.429z"/>
            <path d="M300.175 299.808c-75.909 75.909-159.11 115.778-185.837 89.052-26.726-26.727 13.143-109.929 89.051-185.837 75.908-75.908 159.11-115.778 185.837-89.051 26.726 26.726-13.143 109.928-89.051 185.836z"/>
            <path d="M284.707 284.34c-77.617 77.617-162.303 118.773-189.152 91.924-26.848-26.848 14.308-111.534 91.924-189.15C265.096 109.496 349.782 68.34 376.63 95.188c26.849 26.849-14.307 111.535-91.923 189.151z"/>
            <path d="M269.239 267.989c-78.105 78.104-163.187 119.656-190.035 92.807-26.849-26.848 14.703-111.93 92.807-190.035 78.105-78.104 163.187-119.656 190.035-92.807 26.849 26.848-14.703 111.93-92.807 190.035z"/>
            <path d="M252.887 252.52C175.27 330.138 90.584 371.294 63.736 344.446 36.887 317.596 78.043 232.91 155.66 155.293 233.276 77.677 317.962 36.521 344.81 63.37c26.85 26.848-14.307 111.534-91.923 189.15z"/>
            <path d="M236.977 236.61C161.069 312.52 77.867 352.389 51.14 325.663c-26.726-26.727 13.143-109.928 89.052-185.837 75.908-75.908 159.11-115.777 185.836-89.05 26.727 26.726-13.143 109.928-89.051 185.836z"/>
            <path d="M221.067 220.7C147.844 293.925 67.51 332.31 41.639 306.439c-25.873-25.873 12.513-106.206 85.736-179.429C200.6 53.786 280.931 15.4 306.804 41.272c25.872 25.873-12.514 106.206-85.737 179.429z"/>
            <path d="M205.157 204.79c-69.806 69.807-146.38 106.412-171.031 81.76-24.652-24.652 11.953-101.225 81.759-171.031 69.806-69.807 146.38-106.411 171.031-81.76 24.652 24.652-11.953 101.226-81.759 171.032z"/>
            <path d="M189.247 188.881c-65.169 65.169-136.696 99.3-159.762 76.235-23.065-23.065 11.066-94.593 76.235-159.762s136.697-99.3 159.762-76.235c23.065 23.065-11.066 94.593-76.235 159.762z"/>
            <path d="M173.337 172.971c-59.799 59.8-125.292 91.26-146.282 70.269-20.991-20.99 10.47-86.484 70.268-146.283 59.8-59.799 125.292-91.26 146.283-70.269 20.99 20.991-10.47 86.484-70.269 146.283z"/>
            <path d="M157.427 157.061c-53.209 53.21-111.578 81.108-130.372 62.314-18.794-18.794 9.104-77.164 62.313-130.373 53.21-53.209 111.58-81.108 130.373-62.314 18.794 18.794-9.105 77.164-62.314 130.373z"/>
            <path d="M141.517 141.151c-44.91 44.91-94.376 68.259-110.485 52.15-16.11-16.11 7.239-65.576 52.15-110.486 44.91-44.91 94.375-68.258 110.485-52.15 16.109 16.11-7.24 65.576-52.15 110.486z"/>
            <path d="M125.608 125.241c-35.88 35.88-75.255 54.677-87.947 41.985-12.692-12.692 6.105-52.067 41.985-87.947C115.525 43.4 154.9 24.603 167.592 37.295c12.692 12.692-6.105 52.067-41.984 87.946z"/>
            <path d="M109.698 109.332c-24.408 24.407-51.12 37.268-59.663 28.726-8.542-8.543 4.319-35.255 28.727-59.662 24.407-24.408 51.12-37.27 59.662-28.727 8.543 8.543-4.319 35.255-28.726 59.663z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

// --- App ---
function App(){
  const [swList, setSwList]       = useState([]);
  const [storeInfo, setStoreInfo] = useState(DEFAULT_STORE);
  const [loading, setLoading]     = useState(true);
  const [previewSw, setPreviewSw] = useState(null);
  const [toast, setToast]         = useState(null);

  useEffect(()=>{
    DB.load()
      .then(data => {
        if(data.storeInfo) setStoreInfo({...DEFAULT_STORE, ...data.storeInfo});
        if(data.swList && data.swList.length > 0) setSwList(data.swList);
      })
      .catch(()=>{})
      .finally(()=> setLoading(false));
  },[]);

  const showToast = (msg, type) => { setToast({msg,type}); setTimeout(()=>setToast(null),2800); };

  if(previewSw) return <PreviewPage sw={previewSw} onClose={()=>setPreviewSw(null)}/>;

  if(loading) return(
    <div style={{position:"fixed",inset:0,background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,zIndex:9999}}>
      <div style={{width:32,height:32,border:"1px solid var(--border)",borderTop:"1px solid var(--text)",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)",letterSpacing:".1em",textTransform:"uppercase"}}>Loading</span>
      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
    </div>
  );

  return(
    <div style={{position:"relative",minHeight:"100vh"}}>
      {toast&&<Toast msg={toast.msg} type={toast.type}/>}

      <div className="anim-in">
        <nav className="nav">
          <div className="nav-logo">{storeInfo.storeName}<span>/{storeInfo.storeTagline}</span></div>
          <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)"}}>{swList.length} tools</span>
        </nav>

        <BlackHole/>

        <div className="hero">
          <div className="hero-eyebrow">{storeInfo.storeName} — catalog</div>
          <h1 className="hero-title">{storeInfo.storeTagline.split(" ").map((w,i)=>i%2===1?<em key={i}> {w}</em>:<span key={i}>{i>0?" ":""}{w}</span>)}</h1>
          <p className="hero-sub">{storeInfo.storeDescription}</p>
        </div>

        <div className="stats-bar">
          {[["total",swList.length],["active",swList.filter(s=>s.status==="works"||s.status==="available").length],["maintenance",swList.filter(s=>s.status==="maintenance").length],["not works",swList.filter(s=>s.status==="not-works").length]].map(([l,v])=>(
            <div key={l} className="stat"><div className="stat-val">{v}</div><div className="stat-label">{l}</div></div>
          ))}
        </div>

        <div className="tool-grid">
          {swList.map((sw,i)=>(
            <Card key={sw.id} sw={sw} index={i}
              onDownload={()=>{ if(sw.downloadUrl&&sw.downloadUrl!=="#")window.open(sw.downloadUrl,"_blank"); showToast("Downloading "+sw.name); }}
              onPreview={()=>setPreviewSw(sw)}
            />
          ))}
          {swList.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:"64px",color:"var(--muted)",fontSize:13}}>No tools yet.</div>}
        </div>

        <FollowPath/>

        <div className="footer">
          <span className="footer-text">© {new Date().getFullYear()} {storeInfo.storeName}</span>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {[
              {name:"github",   href:storeInfo.githubUrl,    path:"M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"},
              {name:"instagram",href:storeInfo.instagramUrl, path:"M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 00-1.417.923A3.927 3.927 0 00.42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 001.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 00-.923-1.417A3.911 3.911 0 0013.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 01-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 01-.92-.598 2.48 2.48 0 01-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 100 1.92.96.96 0 000-1.92zm-4.27 1.122a4.109 4.109 0 100 8.217 4.109 4.109 0 000-8.217zm0 1.441a2.667 2.667 0 110 5.334 2.667 2.667 0 010-5.334z"},
              {name:"twitter",  href:storeInfo.twitterUrl,   path:"M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"},
              {name:"discord",  href:storeInfo.discordUrl,   path:"M13.545 2.907a13.227 13.227 0 00-3.257-1.011.05.05 0 00-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 00-3.658 0 8.258 8.258 0 00-.412-.833.051.051 0 00-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 00-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 003.995 2.02.05.05 0 00.056-.019c.308-.42.582-.863.818-1.329a.05.05 0 00-.01-.059.051.051 0 00-.018-.011 8.875 8.875 0 01-1.248-.595.05.05 0 01-.02-.066.051.051 0 01.015-.019c.084-.063.168-.129.248-.195a.05.05 0 01.051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 01.053.007c.08.066.164.132.248.195a.051.051 0 01-.004.085 8.254 8.254 0 01-1.249.594.05.05 0 00-.03.03.052.052 0 00.003.041c.24.465.515.909.817 1.329a.05.05 0 00.056.019 13.235 13.235 0 004.001-2.02.049.049 0 00.021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 00-.02-.019zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612z"},
            ].filter(s=>s.href).map(({name, href, path})=>(
              <a key={name} href={href} target="_blank" rel="noopener noreferrer"
                data-h="1"
                style={{color:"var(--muted)",transition:"color .15s",display:"flex",alignItems:"center"}}
                onMouseEnter={e=>e.currentTarget.style.color="var(--text)"}
                onMouseLeave={e=>e.currentTarget.style.color="var(--muted)"}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                  <path d={path}/>
                </svg>
              </a>
            ))}
          </div>
          <span className="footer-text">Powered by DevVault</span>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
