// ═══════════════════════════════════════════════════════════
// SCHOLAR STRIKE — views/BattleView.js
// Elementos visuais do ecrã de batalha
// ═══════════════════════════════════════════════════════════
'use strict';

// ── BARRAS DE BATALHA ──────────────────────────────────────
function updateBattleBars() {
  const S  = window.S;
  const pp = (S.hp / S.maxHp * 100).toFixed(1);
  const ep = Math.max(0, S.enemyHp / S.enemy.hp * 100).toFixed(1);
  document.getElementById('playerHpBar').style.width = pp + '%';
  document.getElementById('enemyHpBar').style.width  = ep + '%';
  document.getElementById('playerHpVal').textContent = `${S.hp}/${S.maxHp}`;
  document.getElementById('enemyHpVal').textContent  = `${Math.max(0, S.enemyHp)}/${S.enemy.hp}`;
  window.updateHud && window.updateHud();
}

// Efeito de shake no painel de batalha quando o jogador sofre dano
function _shakePlayer() {
  const wrap = document.querySelector('.battle-player') || document.querySelector('.battle-wrap');
  if (!wrap) return;
  wrap.classList.remove('battle-shake');
  void wrap.offsetWidth; // reflow para reiniciar animação
  wrap.classList.add('battle-shake');
  setTimeout(() => wrap.classList.remove('battle-shake'), 400);
}

// Flash na barra de HP
function _flashHpBar(type) {
  const bar = document.getElementById('playerHpBar');
  if (!bar) return;
  bar.classList.remove('hp-flash-hit', 'hp-flash-heal');
  void bar.offsetWidth;
  bar.classList.add(type === 'hit' ? 'hp-flash-hit' : 'hp-flash-heal');
  setTimeout(() => bar.classList.remove('hp-flash-hit', 'hp-flash-heal'), 450);
}

// Log de batalha
function setLog(html) {
  const log    = document.getElementById('battleLog');
  const screen = document.getElementById('battleScreen');
  log.innerHTML = html;
  log.classList.remove('hidden');
  screen.classList.add('showing-log');
}

// Exports globais
window.updateBattleBars = updateBattleBars;
window._shakePlayer     = _shakePlayer;
window._flashHpBar      = _flashHpBar;
window.setLog           = setLog;
