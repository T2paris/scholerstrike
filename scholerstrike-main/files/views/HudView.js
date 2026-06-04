// ═══════════════════════════════════════════════════════════
// SCHOLAR STRIKE — views/HudView.js
// HUD do jogo e gestão de ecrãs
// ═══════════════════════════════════════════════════════════
'use strict';

// ── HUD ─────────────────────────────────────────────────────
function updateHud() {
  const S = window.S;
  document.getElementById('hudName').textContent   = S.heroName;
  document.getElementById('hudClass').textContent  = S.disc ? S.disc.name : '';
  document.getElementById('hpFill').style.width    = (S.hp/S.maxHp*100) + '%';
  document.getElementById('mpFill').style.width    = (S.mp/S.maxMp*100) + '%';
  document.getElementById('xpFill').style.width    = (S.xp/S.xpNext*100) + '%';
  document.getElementById('hpText').textContent    = `${S.hp}/${S.maxHp}`;
  document.getElementById('mpText').textContent    = `${S.mp}/${S.maxMp}`;
  document.getElementById('xpText').textContent    = `${S.xp}/${S.xpNext}`;
  document.getElementById('levelText').textContent = S.level;
  document.getElementById('regionText').textContent =
    window.World ? World.region.name : 'Oakvale Hollow';
}

// ── GESTÃO DE ECRÃS ─────────────────────────────────────────
function showScreen(id) {
  ['authScreen','homeScreen','characterScreen','gameScreen','battleScreen','levelUpScreen','gameCompleteScreen']
    .forEach(s => { const el = document.getElementById(s); if (el) el.classList.add('hidden'); });
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('hidden');
  if (id === 'gameScreen') el.style.display = '';
  const gameMenu = document.getElementById('gameMenu');
  if (id === 'gameScreen' || id === 'battleScreen') {
    gameMenu.classList.remove('hidden');
  } else {
    gameMenu.classList.add('hidden');
  }
  const dd = document.getElementById('gameMenuDropdown');
  if (dd) dd.classList.add('hidden');
}

// Exports globais
window.updateHud  = updateHud;
window.showScreen = showScreen;
