// ═══════════════════════════════════════════════════════════
// SCHOLAR STRIKE — controllers/InputController.js
// Gestão de input do teclado
// ═══════════════════════════════════════════════════════════
'use strict';

const keys = {};

window.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault();
  if (e.key==='e'||e.key==='E') handleInteract();
  if (e.key==='Shift') window.S.running = true;
  if (e.key==='Escape') window.closeDialogue();
});

window.addEventListener('keyup', e => {
  keys[e.key] = false;
  if (e.key==='Shift') window.S.running = false;
});

function handleInteract() {
  const S = window.S;
  if (S.inBattle) return;
  if (S.dialogNpc) { window.advanceDialogue(); return; }
  if (S.nearNpc)   window.openDialogue(S.nearNpc.npc);
}

// Exports globais
window.keys           = keys;
window.handleInteract = handleInteract;
