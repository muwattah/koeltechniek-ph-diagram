
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
