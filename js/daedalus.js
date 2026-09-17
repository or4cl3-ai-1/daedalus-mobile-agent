(async function(){
  try {
    const [a,b] = await Promise.all([
      fetch('js/daedalus.p1.js?v=21').then(r => r.text()),
      fetch('js/daedalus.p2.js?v=21').then(r => r.text())
    ]);
    (0, eval)(a + b);
  } catch (e) {
    console.error('Daedalus failed to load', e);
    var s = document.getElementById('headerStatus');
    if (s) s.textContent = 'Load error';
  }
})();
