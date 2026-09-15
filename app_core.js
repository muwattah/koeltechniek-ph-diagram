var SH_GRID = window.SH_GRID || {};
var SC_GRID = window.SC_GRID || {};

function satProps(ref, T) {
  const tab = data[ref];
  if (!tab) return null;
  if (T < tab[0][0] - 0.01 || T > tab[tab.length-1][0] + 0.01) return null;
  if (T <= tab[0][0]) return {T:tab[0][0],P:tab[0][1],hf:tab[0][2],hg:tab[0][3],sf:tab[0][4],sg:tab[0][5]};
  if (T >= tab[tab.length-1][0]) { const r=tab[tab.length-1]; return {T:r[0],P:r[1],hf:r[2],hg:r[3],sf:r[4],sg:r[5]}; }
  for (let i=0;i<tab.length-1;i++) {
    const t1=tab[i][0], t2=tab[i+1][0];
    if (T>=t1 && T<=t2) {
      const f=(T-t1)/(t2-t1);
      return {T:T, P:tab[i][1]+f*(tab[i+1][1]-tab[i][1]), hf:tab[i][2]+f*(tab[i+1][2]-tab[i][2]),
        hg:tab[i][3]+f*(tab[i+1][3]-tab[i][3]), sf:tab[i][4]+f*(tab[i+1][4]-tab[i][4]), sg:tab[i][5]+f*(tab[i+1][5]-tab[i][5])};
    }
  }
  return null;
}
function TfromP(ref,P) {
  const tab=data[ref]; if(!tab) return null;
  if(P<tab[0][1]||P>tab[tab.length-1][1]) return null;
  for(let i=0;i<tab.length-1;i++) {
    const p1=tab[i][1],p2=tab[i+1][1];
    if(P>=p1&&P<=p2){const f=(P-p1)/(p2-p1); return tab[i][0]+f*(tab[i+1][0]-tab[i][0]);}
  }
  return null;
}
function interpT(pts,T,allowClamp) {
  const margin = 0.05;
  if (T < pts[0][0] - margin) return null;
  if (T > pts[pts.length-1][0] + margin) {
    if (allowClamp) return {h:pts[pts.length-1][1],s:pts[pts.length-1][2]};
    return null;
  }
  if (T <= pts[0][0]) return {h:pts[0][1],s:pts[0][2]};
  if (T >= pts[pts.length-1][0]) return {h:pts[pts.length-1][1],s:pts[pts.length-1][2]};
  for (let i=0;i<pts.length-1;i++) {
    const t1=pts[i][0],t2=pts[i+1][0];
    if (T>=t1 && T<=t2) {
      const f = t2===t1 ? 0 : (T-t1)/(t2-t1);
      return {h:pts[i][1]+f*(pts[i+1][1]-pts[i][1]), s:pts[i][2]+f*(pts[i+1][2]-pts[i][2])};
    }
  }
  return null;
}
function interpHS(grid,P,T,allowClamp) {
  if (!grid || !grid.length) return null;
  const marginP = 0.15;
  if (P < grid[0].P - marginP || P > grid[grid.length-1].P + marginP) return null;
  if (P <= grid[0].P) return interpT(grid[0].pts, T, allowClamp);
  if (P >= grid[grid.length-1].P) return interpT(grid[grid.length-1].pts, T, allowClamp);
  for (let i=0;i<grid.length-1;i++) {
    const p1=grid[i].P, p2=grid[i+1].P;
    if (P>=p1 && P<=p2) {
      const f = p2===p1 ? 0 : (P-p1)/(p2-p1);
      const r1 = interpT(grid[i].pts, T, allowClamp), r2 = interpT(grid[i+1].pts, T, allowClamp);
      if (!r1 || !r2) return null;
      return {h:r1.h+f*(r2.h-r1.h), s:r1.s+f*(r2.s-r1.s)};
    }
  }
  return null;
}
function findHsOnIsobar(pts,sTarget) {
  const sorted = pts.slice().sort((a,b)=>a[2]-b[2]);
  const marginS = 0.0005;
  if (sTarget < sorted[0][2] - marginS || sTarget > sorted[sorted.length-1][2] + marginS) return null;
  if (sTarget <= sorted[0][2]) return {h:sorted[0][1],T:sorted[0][0],s:sorted[0][2]};
  if (sTarget >= sorted[sorted.length-1][2]) return {h:sorted[sorted.length-1][1],T:sorted[sorted.length-1][0],s:sorted[sorted.length-1][2]};
  for (let i=0;i<sorted.length-1;i++) {
    const s1=sorted[i][2], s2=sorted[i+1][2];
    if (sTarget>=s1 && sTarget<=s2) {
      const f = s2===s1 ? 0 : (sTarget-s1)/(s2-s1);
      return {h:sorted[i][1]+f*(sorted[i+1][1]-sorted[i][1]), T:sorted[i][0]+f*(sorted[i+1][0]-sorted[i][0]), s:sTarget};
    }
  }
  return null;
}
function findHAtS(grid,P,sTarget) {
  if (!grid || !grid.length) return null;
  const marginP = 0.15;
  if (P < grid[0].P - marginP || P > grid[grid.length-1].P + marginP) return null;
  if (P <= grid[0].P) return findHsOnIsobar(grid[0].pts, sTarget);
  if (P >= grid[grid.length-1].P) return findHsOnIsobar(grid[grid.length-1].pts, sTarget);
  for (let i=0;i<grid.length-1;i++) {
    const p1=grid[i].P, p2=grid[i+1].P;
    if (P>=p1 && P<=p2) {
      const f = p2===p1 ? 0 : (P-p1)/(p2-p1);
      const r1 = findHsOnIsobar(grid[i].pts, sTarget), r2 = findHsOnIsobar(grid[i+1].pts, sTarget);
      if (!r1 || !r2) return null;
      return {h:r1.h+f*(r2.h-r1.h), T:r1.T+f*(r2.T-r1.T), s:sTarget};
    }
  }
  return null;
}
function berekenCyclus(inp) {
  const ref=inp.ref||'R134a';
  let Te=inp.Te,Tc=inp.Tc,Pe,Pc;
  if(inp.Pv>0){Pe=inp.Pv;Te=TfromP(ref,Pe);if(Te===null)return{error:'Verdampingsdruk buiten bereik.'};}
  else{const s=satProps(ref,Te);if(!s)return{error:'Te buiten bereik (−40…60°C).'};Pe=s.P;}
  if(inp.Pc>0){Pc=inp.Pc;Tc=TfromP(ref,Pc);if(Tc===null)return{error:'Condensatiedruk buiten bereik.'};}
  else{const s=satProps(ref,Tc);if(!s)return{error:'Tc buiten bereik (−40…60°C).'};Pc=s.P;}
  let SH=0,SC=0;
  if(inp.Tzuig!==undefined&&!isNaN(inp.Tzuig)) SH=inp.Tzuig-Te;
  if(inp.Tvloe!==undefined&&!isNaN(inp.Tvloe)) SC=Tc-inp.Tvloe;
  const T1=Te+Math.max(SH,0);
  const r1=interpHS(SH_GRID[ref],Pe,T1,false);
  if(!r1) return{error:'Geen superheat-data voor toestand 1.'};
  const h1=r1.h,s1=r1.s;
  const T3=Tc-Math.max(SC,0);
  const r3=interpHS(SC_GRID[ref],Pc,T3,true);
  if(!r3) return{error:'Geen subcool-data voor toestand 3.'};
  const h3=r3.h,h4=h3;
  const r2s=findHAtS(SH_GRID[ref],Pc,s1);
  if(!r2s) return{error:'Kon isentrope toestand 2s niet vinden.'};
  const h2s=r2s.h;
  const eta=(inp.eta>0&&inp.eta<=1)?inp.eta:0.70;
  const h2=h1+(h2s-h1)/eta;
  const q0=h1-h4,w=h2-h1,qc=h2-h3;
  const COP_R=q0/w,COP_H=qc/w,pi=Pc/Pe;
  let m=null,Wcomp=null,Qevap=null,Qcond=null;
  if(inp.Qcomp>0){Wcomp=inp.Qcomp;m=Wcomp/w;}
  else if(inp.m>0){m=inp.m;Wcomp=m*w;}
  if(m!==null){Qevap=m*q0;Qcond=m*qc;}
  let balans=null,balansPct=null;
  if(Qevap!==null&&Wcomp!==null&&Qcond!==null){
    balansPct=Math.abs(Qcond-(Qevap+Wcomp))/Math.max(Qcond,0.01)*100;
    balans=balansPct<2.5?'OK':'Afwijking';
  }
  return{ref,Te,Tc,Pe,Pc,SH,SC,eta,pi,
    st1:{T:T1,P:Pe,h:h1,s:s1},st2:{T:r2s.T,P:Pc,h:h2,s:null},
    st2s:{T:r2s.T,P:Pc,h:h2s,s:s1},st3:{T:T3,P:Pc,h:h3,s:r3.s},st4:{T:null,P:Pe,h:h4,s:null},
    h1,h2,h2s,h3,h4,q0,w,qc,COP_R,COP_H,m,Wcomp,Qevap,Qcond,balans,balansPct,
    Tzuig:inp.Tzuig,Tvloe:inp.Tvloe};
}
function valideer(r){
  if(r.error) return[r.error];
  const f=[];
  if(r.Tc<=r.Te) f.push('Tc moet > Te.');
  if(r.Pc<=r.Pe) f.push('Pc moet > Pe.');
  if(r.SH<-0.3) f.push('Oververhitting negatief.');
  if(r.SC<-0.3) f.push('Onderkoeling negatief.');
  if(r.eta<=0||r.eta>1) f.push('ηis tussen 0 en 1.');
  if(r.w<=0) f.push('w moet positief zijn.');
  if(r.q0<=0) f.push('q0 moet positief zijn.');
  if(r.h2s<=r.h1) f.push('h2s moet > h1.');
  if(r.h2<r.h2s-0.5) f.push('h2 mag niet < h2s.');
  return f;
}
function pct(calc,ref){if(!ref||Math.abs(ref)<1e-9)return'—';return((calc-ref)/Math.abs(ref)*100).toFixed(2)+'%';}
function pctNum(calc,ref){if(!ref||Math.abs(ref)<1e-9)return 0;return (calc-ref)/Math.abs(ref)*100;}
function runValidation(){
  const byRef={};
  for(const t of (typeof REF!=='undefined'?REF:[])){
    const r=berekenCyclus({ref:t.ref,Te:t.Te,Tc:t.Tc,Tzuig:t.Te+t.SH,Tvloe:t.Tc-t.SC,eta:t.eta});
    if(!byRef[t.ref]) byRef[t.ref]=[];
    if(r.error){byRef[t.ref].push({...t,error:r.error,pass:false});continue;}
    const dCOP = pctNum(r.COP_R, t.COP);
    const dw = pctNum(r.w, t.w);
    const pass = Math.abs(dCOP) < 2.0 && Math.abs(dw) < 2.0;
    byRef[t.ref].push({Te:t.Te,Tc:t.Tc,SH:t.SH,SC:t.SC,eta:t.eta,
      dh1:pct(r.h1,t.h1),dh2s:pct(r.h2s,t.h2s),dh2:pct(r.h2,t.h2),dh3:pct(r.h3,t.h3),
      dq0:pct(r.q0,t.q0),dw:pct(r.w,t.w),dCOP:pct(r.COP_R,t.COP),
      dCOP_n:dCOP, dw_n:dw, pass:pass,
      h1c:r.h1, h2sc:r.h2s, h2c:r.h2, h3c:r.h3, q0c:r.q0, wc:r.w, COPc:r.COP_R});
  }
  return byRef;
}
