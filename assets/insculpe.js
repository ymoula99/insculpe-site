// ── Étoiles de la carte nocturne ──
(function () {
  const zone = document.querySelector('[data-stars]');
  if (!zone) return;
  const n = +zone.dataset.stars || 80;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    const size = Math.random() < .85 ? 1 : 2;
    s.style.cssText = 'position:absolute;border-radius:50%;background:#fff;' +
      'width:' + size + 'px;height:' + size + 'px;' +
      'left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 72) + '%;' +
      'opacity:' + (0.25 + Math.random() * 0.7) + ';';
    frag.appendChild(s);
  }
  zone.appendChild(frag);
})();

// ── Ticker de hachage ──
(function () {
  const el = document.getElementById('hashTrack');
  if (!el) return;
  const parts = [
    'lun. 19:42 <b>·</b> Message reçu — Studio, Paris IX',
    'lun. 19:43 <b>·</b> Chauffagiste prévenu',
    'mar. 08:10 <b>·</b> Intervention planifiée jeudi 10 h',
    'jeu. 10:36 <b>·</b> Réparé — photo à l\'appui',
    'jeu. 10:37 <b>·</b> Propriétaire informé',
    'ven. 09:04 <b>·</b> Devis 180 € — soumis au propriétaire',
    'ven. 09:41 <b>·</b> Devis accepté — intervention confirmée',
    'sam. 11:20 <b>·</b> Point mensuel adressé au propriétaire',
    'dim. 21:02 <b>·</b> Message reçu — T2, Lyon 3e',
    'dim. 21:03 <b>·</b> Pris en charge — locataire rassuré',
  ];
  const line = parts.join('   ———   ') + '   ———   ';
  el.innerHTML = line + line;
})();

// ── Carrousel : palettes ──
(function () {
  const rail = document.getElementById('rail');
  const prev = document.getElementById('pPrev');
  const next = document.getElementById('pNext');
  if (!rail) return;
  const step = () => {
    const card = rail.querySelector('.card');
    return card ? card.getBoundingClientRect().width + 22 : 420;
  };
  const update = () => {
    prev.disabled = rail.scrollLeft <= 4;
    next.disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 4;
  };
  prev.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));
  rail.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// ── Révélation au défilement + jauge ──
(function () {
  const els = document.querySelectorAll('.reveal');
  const gauge = document.getElementById('gauge');
  if (!('IntersectionObserver' in window)) {
    els.forEach(e => e.classList.add('in'));
    if (gauge) gauge.classList.add('in');
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: .12, rootMargin: '0px 0px -30px 0px' });
  els.forEach((e, i) => { e.style.transitionDelay = (i % 3) * .09 + 's'; io.observe(e); });
  if (gauge) io.observe(gauge);
})();

document.getElementById('year').textContent = new Date().getFullYear();
