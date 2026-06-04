// ═══════════════════════════════════════════════════════════
// SCHOLAR STRIKE — views/DialogueView.js
// Janela de diálogo com NPCs
// ═══════════════════════════════════════════════════════════
'use strict';

function openDialogue(npc) {
  if (!npc) return;
  const S = window.S;
  S.dialogNpc = npc; S.dialogLine = 0;
  document.getElementById('dialogueName').textContent = npc.name;
  document.getElementById('dialogueText').textContent = npc.lines[0];
  const pc   = document.getElementById('portraitCanvas');
  const pctx = pc.getContext('2d');
  pctx.clearRect(0, 0, pc.width, pc.height);
  const img  = new Image();
  img.onload = () => {
    pctx.imageSmoothingEnabled = false;
    const sc = Math.max(img.width/pc.width, img.height/pc.height);
    pctx.drawImage(img, 0, 0, img.width, img.height,
      (pc.width-img.width/sc)/2, 0, img.width/sc, img.height/sc);
  };
  img.src = (window.IMG && window.IMG[npc.imgSrc]) || ('assets/heroes/' + npc.imgSrc);
  document.getElementById('dialogue').classList.remove('hidden');
  document.getElementById('prompt').classList.add('hidden');
}

function advanceDialogue() {
  const S = window.S;
  S.dialogLine++;
  if (S.dialogLine >= S.dialogNpc.lines.length) closeDialogue();
  else document.getElementById('dialogueText').textContent = S.dialogNpc.lines[S.dialogLine];
}

function closeDialogue() {
  window.S.dialogNpc = null;
  document.getElementById('dialogue').classList.add('hidden');
}

// Exports globais
window.openDialogue    = openDialogue;
window.advanceDialogue = advanceDialogue;
window.closeDialogue   = closeDialogue;
