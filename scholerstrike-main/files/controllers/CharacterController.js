// ═══════════════════════════════════════════════════════════
// SCHOLAR STRIKE — controllers/CharacterController.js
// Selecção de herói, disciplina, preview e entrada no mundo
// ═══════════════════════════════════════════════════════════
'use strict';

const DISC_ICONS = { arithmancer:'🔢', bioshaman:'🌿', wordweaver:'📖', sophist:'🦉' };

function buildHeroes() {
  const grid = document.getElementById('modelGrid');
  grid.innerHTML = '';
  HEROES.forEach(h => {
    const btn = document.createElement('div');
    btn.className = 'model-btn';
    btn.setAttribute('data-hero-id', h.id);

    const imgEl = document.createElement('img');
    imgEl.className = 'model-hero-img';
    imgEl.alt = h.name;
    imgEl.src = (window.IMG && window.IMG[h.img]) || h.img;
    btn.appendChild(imgEl);

    const info = document.createElement('div'); info.className = 'model-card-info';
    const nm   = document.createElement('div'); nm.className   = 'model-name'; nm.textContent = h.name;
    const sub  = document.createElement('div'); sub.className  = 'model-sub';  sub.textContent = h.sub;
    info.appendChild(nm); info.appendChild(sub);
    btn.appendChild(info);

    btn.addEventListener('click', () => {
      document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      S.hero = h;
      drawPreview(h);
      const ni = document.getElementById('nameInput');
      if (!ni.value || HEROES.some(hh => hh.name === ni.value)) ni.value = h.name;
    });
    grid.appendChild(btn);
  });
}

function drawPreview(h) {
  const stage = document.getElementById('previewStage');
  if (!stage) return;
  stage.innerHTML = '';
  const imgEl = document.createElement('img');
  imgEl.src = (window.IMG && window.IMG[h.img]) || h.img;
  imgEl.alt = h.name;
  stage.appendChild(imgEl);
  const nameEl = document.createElement('div');
  nameEl.className = 'preview-hero-name';
  nameEl.innerHTML = `<h2>${h.name}</h2><span>${h.sub}</span>`;
  stage.appendChild(nameEl);
}

function buildDisciplines() {
  const grid = document.getElementById('disciplineGrid');
  grid.innerHTML = '';
  DISCIPLINES.forEach(d => {
    const div  = document.createElement('div');
    div.className = 'discipline';
    const icon = DISC_ICONS[d.id] || '✦';
    div.innerHTML = `<span class="disc-icon">${icon}</span><h4>${d.name}</h4><p>${d.desc}</p>`;
    div.addEventListener('click', () => {
      document.querySelectorAll('.discipline').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');
      S.disc = d;
    });
    grid.appendChild(div);
  });
}

// ── DOM READY ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (!window.MockServer || !window.MockServer.getSession()) {
    showScreen('authScreen');
  }

  document.getElementById('startBtn').addEventListener('click', () => {
    showScreen('characterScreen');
    buildHeroes();
    buildDisciplines();
    window._injectApiKeyUI();
  });

  document.getElementById('backHomeBtn').addEventListener('click', () => showScreen('homeScreen'));

  // Mini menu em jogo
  const menuToggle = document.getElementById('gameMenuToggle');
  const menuDrop   = document.getElementById('gameMenuDropdown');
  menuToggle.addEventListener('click', e => {
    e.stopPropagation();
    menuDrop.classList.toggle('hidden');
  });
  document.addEventListener('click', () => menuDrop.classList.add('hidden'));
  menuDrop.addEventListener('click', e => e.stopPropagation());

  // Botão "Voltar ao Início" — limpa estado e para RAF antes de sair
  document.getElementById('menuHomeBtn').addEventListener('click', () => {
    if (confirm('Tens a certeza que queres voltar ao início?\nO progresso actual será perdido.')) {
      menuDrop.classList.add('hidden');
      S.inBattle  = false;
      S.enemy     = null;
      S.curQ      = null;
      S.qCache    = [];
      S.dialogNpc = null;
      window.stopWorld();
      showScreen('homeScreen');
    }
  });

  document.getElementById('enterWorldBtn').addEventListener('click', () => {
    if (!S.hero) { alert('Escolhe um herói!'); return; }
    if (!S.disc) { alert('Escolhe uma disciplina!'); return; }
    S.heroName = document.getElementById('nameInput').value.trim() || 'Aveline';

    const keyInput = document.getElementById('apiKeyInput');
    const apiKey   = keyInput ? keyInput.value.trim() : '';
    window.ANTHROPIC_API_KEY = apiKey;
    if (apiKey) localStorage.setItem('ss_api_key', apiKey);

    if (!apiKey) {
      const go = confirm('⚠️ Nenhuma chave API definida.\n\nAs batalhas usarão perguntas de reserva.\n\nContinuar sem IA?');
      if (!go) return;
    }

    // Atribuir sprites não escolhidos aos NPCs de Oakvale (respeitando o género)
    if (window.World && window.World.npcs) {
      const maleHeroes = window.HEROES.filter(h => h.id !== S.hero.id && h.gender === 'M');
      const femaleHeroes = window.HEROES.filter(h => h.id !== S.hero.id && h.gender === 'F');

      const oak1 = window.World.npcs.find(n => n.id === 'npc_oak_1'); // Mestre Aldric (Masculino)
      const oak2 = window.World.npcs.find(n => n.id === 'npc_oak_2'); // Conselheira Elara (Feminino)
      
      if (oak1 && maleHeroes.length > 0) oak1.imgSrc = maleHeroes[0].img;
      if (oak2 && femaleHeroes.length > 0) oak2.imgSrc = femaleHeroes[0].img;
    }

    if (window.World) World.currentRegion = 'oakvale';
    showScreen('gameScreen');
    window.startWorld();
  });

  // Upload de ficheiro de estudo
  const fz = document.getElementById('fileZone');
  const fi = document.getElementById('fileInput');
  fz.addEventListener('click', () => fi.click());
  fz.addEventListener('dragover',  e => { e.preventDefault(); fz.style.borderColor = 'var(--gold)'; });
  fz.addEventListener('dragleave', () => { fz.style.borderColor = ''; });
  fz.addEventListener('drop', e => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) window.loadStudyFile(e.dataTransfer.files[0]);
  });
  fi.addEventListener('change', () => { if (fi.files[0]) window.loadStudyFile(fi.files[0]); });
});
