function toonValidatie(){
  document.getElementById('menuCard').classList.add('hidden');
  document.getElementById('inputCard').classList.add('hidden');
  document.getElementById('resultCard').classList.remove('hidden');
  document.getElementById('diagramWrap').classList.add('hidden');

  const refs = ['R134a','R513A','R410A','R32'];
  const issues = [];
  const refArr = (typeof REF !== 'undefined' && Array.isArray(REF)) ? REF : [];
  if (refArr.length !== 80) issues.push('REF.length = ' + refArr.length + ' (verwacht 80)');
  const counts = {};
  refs.forEach(r => counts[r] = 0);
  refArr.forEach(t => { if (counts[t.ref] !== undefined) counts[t.ref]++; });
  refs.forEach(r => {
    if (counts[r] !== 20) issues.push(r + ': ' + counts[r] + ' tests (verwacht 20)');
  });
  const sh = (typeof SH_GRID !== 'undefined') ? SH_GRID : (window.SH_GRID || {});
  const sc = (typeof SC_GRID !== 'undefined') ? SC_GRID : (window.SC_GRID || {});
  refs.forEach(r => {
    if (!sh[r] || !Array.isArray(sh[r]) || !sh[r].length) issues.push('SH_GRID.' + r + ' ontbreekt');
    if (!sc[r] || !Array.isArray(sc[r]) || !sc[r].length) issues.push('SC_GRID.' + r + ' ontbreekt');
  });

  let html = '<div class="step"><h3>Integriteitscontrole</h3>';
  if (issues.length === 0) {
    html += '<p class="ok">✓ REF.length = 80 · 20 tests per koudemiddel · SH_GRID + SC_GRID aanwezig voor alle 4</p>';
  } else {
    html += '<p class="error">✗ Problemen:</p><ul>' + issues.map(i => '<li class="error">' + i + '</li>').join('') + '</ul>';
  }
  html += '<p style="font-size:0.75rem;color:#94a3b8">SH: ' + refs.map(r => r + '=' + ((sh[r]&&sh[r].length)||0) + 'P').join(', ') + '<br>';
  html += 'SC: ' + refs.map(r => r + '=' + ((sc[r]&&sc[r].length)||0) + 'P').join(', ') + '</p></div>';

  if (refArr.length === 0) {
    html += '<div class="step"><p class="error">Geen referentietests geladen – validatie niet mogelijk.</p></div>';
    document.getElementById('resultaat').innerHTML = html;
    return;
  }

  const byRef = runValidation();
  let totalOk = 0, totalFail = 0;
  html += '<div class="step"><h3>Validatie vs CoolProp 8.0.0</h3><p style="font-size:0.8rem;color:#94a3b8">2D-interpolatie op SH/SC-grids. Afwijkingen t.o.v. referentiewaarden.</p></div>';

  for (const ref of refs) {
    const rows = byRef[ref] || [];
    const ok = rows.filter(r => !r.error);
    const fail = rows.filter(r => r.error);
    totalOk += ok.length;
    totalFail += fail.length;
    const abs = s => Math.abs(parseFloat(s) || 0);
    const mean = a => a.length ? a.reduce((x,y) => x+y, 0) / a.length : 0;
    const maxv = a => a.length ? Math.max(...a) : 0;
    const dCOPs = ok.map(r => abs(r.dCOP));
    const dws = ok.map(r => abs(r.dw));
    html += '<div class="step"><h3>' + ref + ' – ' + ok.length + '/' + rows.length + ' OK';
    if (fail.length) html += ' <span class="error">(' + fail.length + ' failed)</span>';
    html += '</h3>';
    html += '<p>mean |COP| = <span class="value">' + mean(dCOPs).toFixed(2) + '%</span> · max |COP| = <span class="value">' + maxv(dCOPs).toFixed(2) + '%</span><br>';
    html += 'mean |w| = <span class="value">' + mean(dws).toFixed(2) + '%</span> · max |w| = <span class="value">' + maxv(dws).toFixed(2) + '%</span></p></div>';
  }
  html += '<div class="step"><h3>Totaal</h3><p class="result-big">' + totalOk + ' / ' + (totalOk+totalFail) + ' passed</p>';
  if (totalOk + totalFail !== 80) html += '<p class="warn">Let op: niet alle 80 tests zijn uitgevoerd (REF.length of grids).</p>';
  html += '</div>';
  document.getElementById('resultaat').innerHTML = html;
}
let huidigeKeuze=0;
const veldSets={1:['Te','Tzuig'],2:['Tc','Tvloe'],3:['Te','Tc','Tzuig','Tvloe','eta'],4:['Te','Tc','Tzuig','Tvloe','eta'],5:['Te','Tc','Tzuig','Tvloe','eta'],6:['Te','Tc','Tzuig','Tvloe','eta'],7:['Te','Tc','Tzuig','Tvloe','eta'],8:['Te','Tc'],9:['Te','Tc','Tzuig','Tvloe','eta','Qcomp'],10:['Te','Tc','Tzuig','Tvloe','eta','Qcomp'],11:['Te','Tc','Tzuig','Tvloe','eta','Qcomp'],12:['Te','Tc','Tzuig','Tvloe','eta','Qcomp']};
function kies(nr){
  huidigeKeuze=nr;
  document.getElementById('menuCard').classList.add('hidden');
  document.getElementById('resultCard').classList.add('hidden');
  document.getElementById('inputCard').classList.remove('hidden');
  const titels={1:'1. Oververhitting',2:'2. Onderkoeling',3:'3. Specifiek koelvermogen q₀',4:'4. Specifiek condensorvermogen qc',5:'5. Specifieke compressorarbeid w',6:'6. Koelfactor EER/COP_R',7:'7. Warmtefactor COP_H',8:'8. Drukverhouding π',9:'9. Massastroom',10:'10. Totaal koelvermogen',11:'11. Totaal condensorvermogen',12:'12. Complete set'};
  document.getElementById('inputTitel').innerHTML=titels[nr];
  const velden=veldSets[nr];
  let html='<label>Koudemiddel</label><select id="ref"><option value="R134a">R-134a</option><option value="R513A">R-513A</option><option value="R410A">R-410A</option><option value="R32">R-32</option></select>';
  if(velden.includes('Te')) html+='<label>Verdampingstemperatuur (°C)</label><input type="number" id="Te" step="0.1" value="-13">';
  if(velden.includes('Tc')) html+='<label>Condensatietemperatuur (°C)</label><input type="number" id="Tc" step="0.1" value="37">';
  if(velden.includes('Tzuig')) html+='<label>Zuiggastemperatuur T₁ (°C)</label><input type="number" id="Tzuig" step="0.1" value="30">';
  if(velden.includes('Tvloe')) html+='<label>Vloeistoftemperatuur (°C)</label><input type="number" id="Tvloe" step="0.1" value="26">';
  if(velden.includes('eta')) html+='<label>Isentropisch rendement ηis</label><input type="number" id="eta" step="0.01" min="0.5" max="1" value="0.70">';
  if(velden.includes('Qcomp')) html+='<label>Compressorvermogen (kW) – optioneel</label><input type="number" id="Qcomp" step="0.01" value="1.34">';
  document.getElementById('inputVelden').innerHTML=html;
}
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
