function uitvoeren(){
  const get=id=>{const el=document.getElementById(id);if(!el)return undefined;const v=parseFloat(el.value);return isNaN(v)?undefined:v;};
  const inp={ref:document.getElementById('ref')?.value||'R134a',Te:get('Te'),Tc:get('Tc'),Tzuig:get('Tzuig'),Tvloe:get('Tvloe'),eta:get('eta'),Qcomp:get('Qcomp')};
  const r=berekenCyclus(inp);
  const fouten=valideer(r);
  let html='';
  if(fouten.length){
    html='<div class="step" style="border-left-color:#f87171"><h3 class="error">Controleer invoer</h3>'+fouten.map(f=>'<p class="error">• '+f+'</p>').join('')+'</div>';
  } else if(huidigeKeuze===1){
    html='<div class="step"><h3>ΔT_over</h3><span class="formula">ΔT_over = T_zuig − T_e</span><br>= '+(r.Tzuig||0).toFixed(1)+' − '+r.Te.toFixed(1)+' = <span class="value">'+r.SH.toFixed(1)+' K</span><div class="result-big">'+r.SH.toFixed(1)+' K</div></div>';
  } else if(huidigeKeuze===2){
    html='<div class="step"><h3>ΔT_onder</h3><span class="formula">ΔT_onder = T_c − T_vloe</span><br>= '+r.Tc.toFixed(1)+' − '+(r.Tvloe||0).toFixed(1)+' = <span class="value">'+r.SC.toFixed(1)+' K</span><div class="result-big">'+r.SC.toFixed(1)+' K</div></div>';
  } else {
    html='<div class="step"><h3>Toestanden (2D CoolProp-grids)</h3>ref='+r.ref+' Te='+r.Te.toFixed(1)+'°C Pe='+r.Pe.toFixed(2)+' bar<br>Tc='+r.Tc.toFixed(1)+'°C Pc='+r.Pc.toFixed(2)+' bar<br>SH='+r.SH.toFixed(1)+'K SC='+r.SC.toFixed(1)+'K η='+r.eta.toFixed(2)+'<br><br>h1='+r.h1.toFixed(1)+' h2s='+r.h2s.toFixed(1)+' h2='+r.h2.toFixed(1)+'<br>h3='+r.h3.toFixed(1)+' h4='+r.h4.toFixed(1)+'</div>';
    html+='<div class="step"><h3>Resultaten</h3>q0 = <span class="value">'+r.q0.toFixed(1)+' kJ/kg</span><br>w = <span class="value">'+r.w.toFixed(1)+' kJ/kg</span><br>qc = <span class="value">'+r.qc.toFixed(1)+' kJ/kg</span><br>COP_R = <span class="value">'+r.COP_R.toFixed(2)+'</span><br>COP_H = <span class="value">'+r.COP_H.toFixed(2)+'</span><br>π = <span class="value">'+r.pi.toFixed(2)+'</span>';
    if(r.m!==null) html+='<br>ṁ = '+r.m.toFixed(4)+' kg/s<br>Qevap = '+r.Qevap.toFixed(2)+' kW<br>Qcond = '+r.Qcond.toFixed(2)+' kW';
    html+='<div class="result-big">COP_R = '+r.COP_R.toFixed(2)+'</div></div>';
  }
  document.getElementById('inputCard').classList.add('hidden');
  document.getElementById('resultCard').classList.remove('hidden');
  document.getElementById('resultaat').innerHTML=html;
  if(huidigeKeuze>=3 && !fouten.length){document.getElementById('diagramWrap').classList.remove('hidden'); tekenPH(r);}
  else document.getElementById('diagramWrap').classList.add('hidden');
}
function tekenPH(r){
  const canvas=document.getElementById('phCanvas'),ctx=canvas.getContext('2d');
  const W=canvas.width,H=canvas.height; ctx.clearRect(0,0,W,H);
  const tab=data[r.ref]||data.R134a;
  const hs=[r.h1,r.h2,r.h3,r.h4]; tab.forEach(pt=>{hs.push(pt[2]);hs.push(pt[3]);});
  let hMin=Math.max(80,Math.min(...hs)-25),hMax=Math.min(650,Math.max(...hs)+35);
  let pMin=Math.max(0.2,Math.min(r.Pe,r.Pc)*0.45),pMax=Math.min(50,Math.max(r.Pe,r.Pc)*1.9);
  const left=70,right=25,top=28,bottom=48,plotW=W-left-right,plotH=H-top-bottom;
  const x=h=>left+(h-hMin)/(hMax-hMin)*plotW;
  const y=p=>{const lp=Math.log10(Math.max(p,0.1));return top+plotH-(lp-Math.log10(pMin))/(Math.log10(pMax)-Math.log10(pMin))*plotH;};
  ctx.fillStyle='#0f172a';ctx.fillRect(0,0,W,H);
  ctx.beginPath();ctx.strokeStyle='#38bdf8';ctx.lineWidth=2.4;
  tab.forEach((pt,i)=>{const xx=x(pt[2]),yy=y(pt[1]);i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);});ctx.stroke();
  ctx.beginPath();ctx.strokeStyle='#f472b6';ctx.lineWidth=2.4;
  tab.forEach((pt,i)=>{const xx=x(pt[3]),yy=y(pt[1]);i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);});ctx.stroke();
  ctx.strokeStyle='#4ade80';ctx.lineWidth=2.8;
  ctx.beginPath();ctx.moveTo(x(r.h4),y(r.Pe));ctx.lineTo(x(r.h1),y(r.Pe));ctx.lineTo(x(r.h2),y(r.Pc));ctx.lineTo(x(r.h3),y(r.Pc));ctx.lineTo(x(r.h4),y(r.Pe));ctx.stroke();
  [{h:r.h1,p:r.Pe,l:'1'},{h:r.h2s,p:r.Pc,l:'2s'},{h:r.h2,p:r.Pc,l:'2'},{h:r.h3,p:r.Pc,l:'3'},{h:r.h4,p:r.Pe,l:'4'}].forEach(pt=>{
    ctx.beginPath();ctx.fillStyle=pt.l==='2s'?'#a78bfa':'#fbbf24';
    ctx.arc(x(pt.h),y(pt.p),6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#0f172a';ctx.font='bold 10px system-ui';ctx.fillText(pt.l,x(pt.h)-3,y(pt.p)+3);
  });
  ctx.fillStyle='#38bdf8';ctx.font='bold 12px system-ui';ctx.fillText(r.ref+' – 2D CoolProp',left,16);
}
function terug(){
  document.getElementById('menuCard').classList.remove('hidden');
  document.getElementById('inputCard').classList.add('hidden');
  document.getElementById('resultCard').classList.add('hidden');
  document.getElementById('diagramWrap').classList.add('hidden');
}
console.log('2D CoolProp engine ready');
