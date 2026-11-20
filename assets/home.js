// INSCULPE — homepage : la demande qui traverse les couches, puis la vue parc.

const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pause = (ms) => new Promise((r) => setTimeout(r, calme ? 0 : ms));

// ── 1. Le bien, couche par couche ─────────────────────────────
(function () {
  const stage = document.getElementById('stage');
  const demo = document.getElementById('demo');
  if (!stage || !demo) return;

  const ORDRE = ['lieux', 'inventaire', 'personnes', 'regles', 'demandes', 'carnet'];
  const SCENARIOS = {
    maison: {
      message: 'La moquette de la chambre est à nettoyer.',
      reponse: 'Nettoyage de la moquette : 480 €, prix ferme, jeudi à 9 h. Je confirme ?',
      cible: { room: 'chambre', eq: 'moquette', who: 'proprio' },
      detail: {
        lieux: 'Chambre, 2ᵉ étage',
        inventaire: 'Moquette en laine, 28 m², posée en 2021',
        personnes: 'Vous décidez, votre assistante suit',
        regles: 'Votre accord au-delà de 300 €',
        demandes: 'Nettoyage à 480 €, jeudi à 9 h',
        carnet: 'Noté au carnet de la maison',
      },
    },
    studio: {
      message: 'Plus de chauffage depuis hier soir.',
      reponse: 'Bien reçu. Un chauffagiste passe demain entre 8 h et 10 h. C\'est à la charge du propriétaire, il est prévenu.',
      cible: { room: 'cuisine', eq: 'chaudiere', who: 'occupant' },
      detail: {
        lieux: 'Cuisine, studio Paris 9ᵉ',
        inventaire: 'Chaudière gaz de 2009, hors garantie',
        personnes: 'Signalé par la locataire',
        regles: 'Équipement usé : à la charge du propriétaire',
        demandes: 'Chauffagiste prévenu, demain 8 h',
        carnet: 'Gravé au carnet du studio',
      },
    },
    immeuble: {
      message: 'L\'interphone du hall ne marche plus.',
      reponse: 'Merci du signalement. C\'est couvert par le contrat d\'entretien de l\'immeuble : un technicien passe aujourd\'hui.',
      cible: { room: 'entree', eq: 'interphone', who: 'pro' },
      detail: {
        lieux: 'Hall, parties communes',
        inventaire: 'Interphone, sous contrat d\'entretien',
        personnes: 'Signalé par un copropriétaire',
        regles: 'Couvert par le contrat : rien à valider',
        demandes: 'Technicien attendu aujourd\'hui',
        carnet: 'Gravé au carnet de l\'immeuble',
      },
    },
  };

  const plates = Object.fromEntries([...stage.querySelectorAll('.plate')].map((p) => [p.dataset.layer, p]));
  const labels = Object.fromEntries([...stage.querySelectorAll('.labels li')].map((l) => [l.dataset.layer, l]));
  const readout = document.getElementById('readout');
  const msgIn = document.getElementById('msgIn');
  const msgOut = document.getElementById('msgOut');
  const tabs = [...demo.querySelectorAll('.tab')];

  let tour = 0;          // jeton : toute séquence plus ancienne s'arrête
  let auto = true;       // l'enchaînement automatique cesse au premier clic
  let visible = true;

  function eteindre() {
    stage.querySelectorAll('.is-on, .is-seen, .is-lit').forEach((e) => e.classList.remove('is-on', 'is-seen', 'is-lit'));
    Object.values(labels).forEach((l) => { l.querySelector('span').textContent = ''; });
    readout.querySelector('b').textContent = '';
    readout.querySelector('span').textContent = '';
  }

  function allumer(couche, sc) {
    const plate = plates[couche];
    const label = labels[couche];
    stage.querySelectorAll('.is-on').forEach((e) => { e.classList.remove('is-on'); e.classList.add('is-seen'); });
    plate.classList.add('is-on');
    label.classList.add('is-on');
    label.querySelector('span').textContent = sc.detail[couche];
    readout.querySelector('b').textContent = label.querySelector('b').textContent;
    readout.querySelector('span').textContent = sc.detail[couche];

    const sel = {
      lieux: `[data-room="${sc.cible.room}"]`,
      inventaire: `[data-eq="${sc.cible.eq}"]`,
      personnes: `[data-who="${sc.cible.who}"]`,
      demandes: '.ticket--new, .ticket-lines',
      carnet: '.engrave',
    }[couche];
    if (sel) plate.querySelectorAll(sel).forEach((e) => e.classList.add('is-lit'));
  }

  async function jouer(cle) {
    const moi = ++tour;
    const sc = SCENARIOS[cle];
    const vivant = () => moi === tour;

    tabs.forEach((t) => {
      const on = t.dataset.sc === cle;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-pressed', on);
    });
    eteindre();
    msgOut.classList.add('is-off');
    msgOut.textContent = sc.reponse;

    // le message s'écrit
    demo.classList.add('is-typing');
    if (calme) {
      msgIn.textContent = sc.message;
    } else {
      msgIn.textContent = '';
      for (const lettre of sc.message) {
        if (!vivant()) return;
        msgIn.textContent += lettre;
        await pause(26);
      }
    }
    await pause(350);
    if (!vivant()) return;
    demo.classList.remove('is-typing');

    // il traverse les six couches, de bas en haut
    for (const couche of ORDRE) {
      if (!vivant()) return;
      allumer(couche, sc);
      await pause(couche === 'carnet' ? 1100 : 820);
    }
    if (!vivant()) return;
    msgOut.classList.remove('is-off');

    // puis l'exemple suivant, tant que personne n'a pris la main
    await pause(5200);
    if (!vivant() || !auto || calme || !visible) return;
    const cles = Object.keys(SCENARIOS);
    jouer(cles[(cles.indexOf(cle) + 1) % cles.length]);
  }

  tabs.forEach((t) => t.addEventListener('click', () => { auto = false; jouer(t.dataset.sc); }));

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: .2 }).observe(stage);
  }

  // assemblage de la pile, puis première démonstration
  if (calme) {
    stage.classList.add('is-ready');
    jouer('maison');
  } else {
    stage.classList.add('is-pre');
    requestAnimationFrame(() => requestAnimationFrame(async () => {
      stage.classList.remove('is-pre');
      await pause(1150);
      stage.classList.add('is-ready');
      jouer('maison');
    }));
  }
})();

// ── 2. Du bien au parc ────────────────────────────────────────
(function () {
  const stage = document.getElementById('parcStage');
  if (!stage) return;
  const resume = document.getElementById('parcResume');
  const pour = document.getElementById('parcPour');
  const lien = document.getElementById('parcLien');
  const batiment = stage.querySelector('.batiment');
  const segs = [...document.querySelectorAll('.parc-switch .seg')];

  const LOTS = [
    ['Maison, Paris 16ᵉ', 'cours'], ['Studio, Paris 9ᵉ', 'cours'], ['T2, Lyon 3ᵉ', 'accord'], ['T3, Bordeaux', ''],
    ['Studio, Lille', ''], ['T2, Paris 11ᵉ', ''], ['T4, Nantes', 'cours'], ['Studio, Paris 18ᵉ', ''],
    ['T2, Marseille 6ᵉ', ''], ['T3, Paris 15ᵉ', ''], ['Studio, Rennes', ''], ['T2, Toulouse', ''],
  ];
  const ETATS = { cours: 'Demande en cours', accord: 'Accord attendu', '': 'Rien à signaler' };
  const IMMEUBLE_ETATS = ['', '', '', 'cours', '', '', '', '', '', 'accord', '', ''];

  const VUES = {
    un: {
      resume: 'Maison, Paris 16ᵉ. Une demande en cours, rien n\'attend votre accord.',
      pour: 'Pour celles et ceux qui veulent un seul contact pour toute la maison.',
      lien: ['Voir l\'offre Ma maison', 'proprietaire-occupant.html'],
    },
    douze: {
      resume: 'Douze lots. Trois demandes en cours, un devis attend votre accord.',
      pour: 'Pour les propriétaires qui gèrent leurs biens en direct.',
      lien: ['Voir l\'offre Propriétaires', 'proprietaires-bailleurs.html'],
    },
    immeuble: {
      resume: 'Immeuble Voltaire, douze lots. Une intervention en cours, un devis attend le syndic.',
      pour: 'Pour les agences, syndics et administrateurs de biens.',
      lien: ['Voir l\'offre pro', 'pros.html'],
    },
  };

  const tuiles = LOTS.map(([nom, etat]) => {
    const el = document.createElement('div');
    el.className = 'bien';
    el.dataset.etat = etat;
    el.innerHTML = '<span class="bien-nom"></span><span class="bien-couches"><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="bien-etat"></span>';
    el.querySelector('.bien-nom').textContent = nom;
    el.querySelector('.bien-etat').textContent = ETATS[etat];
    stage.appendChild(el);
    return el;
  });

  let vue = 'un';

  function poser(el, x, y, w, h) {
    el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    el.style.width = Math.round(w) + 'px';
    el.style.height = Math.round(h) + 'px';
  }

  function disposer() {
    const W = stage.clientWidth;
    const g = 12;
    stage.dataset.vue = vue;

    if (vue === 'un') {
      const w = Math.min(380, W), h = 210;
      tuiles.forEach((t, i) => {
        t.classList.toggle('is-out', i > 0);
        poser(t, (W - w) / 2, 10, w, h);
        if (i === 0) { t.dataset.etat = 'cours'; t.querySelector('.bien-nom').textContent = LOTS[0][0]; t.querySelector('.bien-etat').textContent = 'Moquette de la chambre : nettoyage jeudi à 9 h'; }
      });
      stage.style.height = h + 20 + 'px';
    }

    if (vue === 'douze') {
      const cols = W >= 820 ? 4 : W >= 520 ? 3 : 2;
      const w = (W - g * (cols - 1)) / cols, h = 74;
      tuiles.forEach((t, i) => {
        t.classList.remove('is-out');
        t.dataset.etat = LOTS[i][1];
        t.querySelector('.bien-nom').textContent = LOTS[i][0];
        t.querySelector('.bien-etat').textContent = ETATS[LOTS[i][1]];
        poser(t, (i % cols) * (w + g), Math.floor(i / cols) * (h + g), w, h);
      });
      stage.style.height = Math.ceil(12 / cols) * (h + g) - g + 'px';
    }

    if (vue === 'immeuble') {
      const w = Math.min(230, (W - 40) / 2), h = 44, gi = 6, marge = 14;
      const largeur = w * 2 + gi, x0 = (W - largeur) / 2, y0 = marge + 4;
      tuiles.forEach((t, i) => {
        const etage = 5 - Math.floor(i / 2);   // lot 1 au rez-de-chaussée
        t.classList.remove('is-out');
        t.dataset.etat = IMMEUBLE_ETATS[i];
        t.querySelector('.bien-nom').textContent = 'Lot ' + (i + 1);
        t.querySelector('.bien-etat').textContent = ETATS[IMMEUBLE_ETATS[i]];
        poser(t, x0 + (i % 2) * (w + gi), y0 + etage * (h + gi), w, h);
      });
      const haut = 6 * (h + gi) - gi;
      batiment.style.transform = `translate(${Math.round(x0 - marge)}px, 4px)`;
      batiment.style.width = Math.round(largeur + marge * 2) + 'px';
      batiment.style.height = Math.round(haut + marge * 2) + 'px';
      stage.style.height = haut + marge * 2 + 8 + 'px';
    }
  }

  function choisir(v) {
    vue = v;
    segs.forEach((s) => {
      const on = s.dataset.vue === v;
      s.classList.toggle('is-on', on);
      s.setAttribute('aria-pressed', on);
    });
    resume.textContent = VUES[v].resume;
    pour.textContent = VUES[v].pour;
    lien.textContent = VUES[v].lien[0];
    lien.href = VUES[v].lien[1];
    disposer();
  }

  segs.forEach((s) => s.addEventListener('click', () => choisir(s.dataset.vue)));
  window.addEventListener('resize', disposer);
  disposer();
})();

document.getElementById('year').textContent = new Date().getFullYear();
