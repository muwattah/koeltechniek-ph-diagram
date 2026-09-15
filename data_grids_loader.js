// Assemble SH/SC grids from window.SH_PART / window.SC_PART
// Scripts order: sh_sparse_a, sh_sparse_b, sc_R*, then this loader
window.SH_PART = window.SH_PART || {};
window.SC_PART = window.SC_PART || {};
window.SH_GRID = window.SH_PART;
window.SC_GRID = window.SC_PART;
var SH_GRID = window.SH_GRID;
var SC_GRID = window.SC_GRID;
// Integrity log
(function(){
  var refs = ['R134a','R513A','R410A','R32'];
  var shOk = refs.every(function(r){ return SH_GRID[r] && SH_GRID[r].length; });
  var scOk = refs.every(function(r){ return SC_GRID[r] && SC_GRID[r].length; });
  console.log('Grids loaded: SH=' + (shOk?'OK':'MISSING') + ' SC=' + (scOk?'OK':'MISSING'),
    'SH keys=' + Object.keys(SH_GRID).join(','),
    'SC keys=' + Object.keys(SC_GRID).join(','));
})();
