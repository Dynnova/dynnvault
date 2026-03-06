// ============================================================
// auth.js — PIN auth with salt, rate limiting, Supabase sync
// ============================================================

const S = {
  get(k){ try{ const v=localStorage.getItem(k); return v?{value:v}:null; }catch(e){ return null; } },
  set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} },
  del(k){ try{ localStorage.removeItem(k); }catch(e){} },
  hash: async function(p, salt){
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(p+(salt||"")));
    return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("");
  },
  genSalt(){ return Array.from(crypto.getRandomValues(new Uint8Array(16))).map(x=>x.toString(16).padStart(2,"0")).join(""); }
};

// Rate limiting: max 5 attempts, 5 min lockout
const RL = {
  KEY_ATTEMPTS: "adminLoginAttempts",
  KEY_LOCKOUT:  "adminLockoutUntil",
  MAX: 5,
  LOCKOUT_MS: 5 * 60 * 1000,
  isLocked(){
    const r = S.get(RL.KEY_LOCKOUT);
    if(!r) return false;
    if(Date.now() < parseInt(r.value)) return true;
    S.del(RL.KEY_LOCKOUT); S.del(RL.KEY_ATTEMPTS); return false;
  },
  remainingSecs(){
    const r = S.get(RL.KEY_LOCKOUT);
    if(!r) return 0;
    return Math.ceil((parseInt(r.value) - Date.now()) / 1000);
  },
  fail(){
    const r = S.get(RL.KEY_ATTEMPTS);
    const n = r ? parseInt(r.value)+1 : 1;
    S.set(RL.KEY_ATTEMPTS, String(n));
    if(n >= RL.MAX){ S.set(RL.KEY_LOCKOUT, String(Date.now()+RL.LOCKOUT_MS)); S.del(RL.KEY_ATTEMPTS); }
    return RL.MAX - n;
  },
  success(){ S.del(RL.KEY_ATTEMPTS); S.del(RL.KEY_LOCKOUT); },
  attemptsLeft(){
    const r = S.get(RL.KEY_ATTEMPTS);
    return r ? RL.MAX - parseInt(r.value) : RL.MAX;
  }
};
