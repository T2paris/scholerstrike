// ═══════════════════════════════════════════════════════════
// SCHOLAR STRIKE — controllers/GameController.js
// Loop principal, colisão, câmara, cutscene, encontros
// ═══════════════════════════════════════════════════════════
'use strict';

// ── CÂMARA ──────────────────────────────────────────────────
function camPos() {
  const mw = getMapW(), mh = getMapH();
  return {
    cx: Math.max(0, Math.min(S.px - VIEW_W/2, mw*TILE - VIEW_W)),
    cy: Math.max(0, Math.min(S.py - VIEW_H/2, mh*TILE - VIEW_H)),
  };
}

// ── COLISÃO ─────────────────────────────────────────────────
function walkable(px, py) {
  const map = getMapData(), mw = getMapW(), mh = getMapH();
  if (!map || !mw || !mh) return false;

  const check = (x, y) => {
    if (x < 0 || y < 0 || x >= mw || y >= mh) return false;
    const t = map[y*mw+x];
    if (t===1||t===2||t===4||t===7||t===8||t===9||t===5) return false;
    return true;
  };

  const hbW = 16, hbH = 8;
  const hx1 = px + (TILE - hbW)/2;
  const hx2 = hx1 + hbW - 1;
  const hy1 = py + TILE - hbH;
  const hy2 = py + TILE - 1;

  let isWalkable = check(Math.floor(hx1/TILE), Math.floor(hy1/TILE)) &&
                   check(Math.floor(hx2/TILE), Math.floor(hy1/TILE)) &&
                   check(Math.floor(hx1/TILE), Math.floor(hy2/TILE)) &&
                   check(Math.floor(hx2/TILE), Math.floor(hy2/TILE));

  if (isWalkable) {
    const npcs = getNpcPositions();
    for (let i = 0; i < npcs.length; i++) {
      const n = npcs[i];
      let npx = n.tx * TILE;
      let npy = n.ty * TILE;
      const baseNpc = window.World && window.World.region && window.World.region.npcs && window.World.region.npcs.find(bn => bn.npcId === n.npc.id);
      if (baseNpc && baseNpc.realX !== undefined) {
        npx = baseNpc.realX;
        npy = baseNpc.realY;
      }
      
      const nx1 = npx + (TILE - hbW)/2;
      const nx2 = nx1 + hbW - 1;
      const ny1 = npy + TILE - hbH;
      const ny2 = npy + TILE - 1;

      if (hx1 <= nx2 && hx2 >= nx1 && hy1 <= ny2 && hy2 >= ny1) {
        return false; // Hit NPC
      }
    }
  }

  return isWalkable;
}

function inEncZone(px, py) {
  const tx = Math.floor(px/TILE), ty = Math.floor(py/TILE);
  return getEncZones().some(z => tx>=z.x1&&tx<=z.x2&&ty>=z.y1&&ty<=z.y2);
}

function nearestNpc(px, py) {
  const tx = Math.floor(px/TILE), ty = Math.floor(py/TILE);
  return getNpcPositions().find(n => Math.abs(n.tx-tx)<=1 && Math.abs(n.ty-ty)<=1) || null;
}

// ── LOOP PRINCIPAL ──────────────────────────────────────────
function tick(now) {
  if (!window._raf.get()) return;

  try {
    const dt = Math.min((now - window._lastT.get())/1000, 0.1);
    window._lastT.set(now);

    // --- LÓGICA DE CUTSCENE INICIAL ---
    if (S.inCutscene) {
      const aldricBase = window.World && World.region && World.region.npcs && World.region.npcs.find(n => n.npcId === 'npc_oak_1');
      if (aldricBase) {
        const targetY = 7 * TILE; // 1 tile acima do jogador
        
        if (aldricBase.realY === undefined) {
          aldricBase.realX = aldricBase.tx * TILE;
          aldricBase.realY = aldricBase.ty * TILE;
        }
        
        if (S.cutsceneStep === 0) {
          if (aldricBase.realY < targetY) {
            aldricBase.realY += 60 * dt;
            if (aldricBase.realY >= targetY) {
              aldricBase.realY = targetY;
              S.cutsceneStep = 1;
            }
          }
        }
        
        if (S.cutsceneStep === 1 && !S.dialogNpc) {
          const npcData = World.npcs.find(n => n.id === 'npc_oak_1');
          if (npcData) {
            window.openDialogue(npcData);
            S.cutsceneStep = 2;
          }
        }
        
        if (S.cutsceneStep === 2 && !S.dialogNpc) {
          S.inCutscene = false;
          S.hasSeenIntro = true;
        }
      } else {
        S.inCutscene = false;
      }
    }

    if (!S.inBattle && !S.dialogNpc && !S.inCutscene) {
      const spd = S.running ? 110 : 62;
      let dx = 0, dy = 0;
      if (keys['ArrowLeft'] ||keys['a']||keys['A']) dx -= 1;
      if (keys['ArrowRight']||keys['d']||keys['D']) dx += 1;
      if (keys['ArrowUp']   ||keys['w']||keys['W']) dy -= 1;
      if (keys['ArrowDown'] ||keys['s']||keys['S']) dy += 1;

      if (dx < 0) S.facingLeft = true;
      if (dx > 0) S.facingLeft = false;

      if (dx || dy) {
        S.isMoving = true;
        if (dx && dy) { dx *= 0.707; dy *= 0.707; }
        const nx = S.px + dx*spd*dt, ny = S.py + dy*spd*dt;
        if (walkable(nx, S.py)) S.px = nx;
        if (walkable(S.px, ny)) S.py = ny;
      } else {
        S.isMoving = false;
      }

      if (S.cooldown <= 0) checkPortal(S.px, S.py);
    }

    // Renderização
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    const { cx, cy } = camPos();
    if (window.drawScene) window.drawScene(cx, cy, now);

    // NPC próximo
    const nn = nearestNpc(S.px, S.py);
    S.nearNpc = nn;
    const pr = document.getElementById('prompt');
    if (nn && !S.dialogNpc && !S.inBattle) {
      pr.textContent = `Fala com ${nn.npc.name} (E)`;
      pr.classList.remove('hidden');
    } else {
      pr.classList.add('hidden');
    }

    if (S.cooldown > 0) S.cooldown -= dt;

    // Encontros aleatórios
    if (S.isMoving && !S.inBattle && !S.dialogNpc && S.cooldown <= 0 &&
        inEncZone(S.px, S.py) && Math.random() < getEncRate()) {
      window.startBattle && window.startBattle();
    }

    window._raf.set(requestAnimationFrame(tick));

  } catch (err) {
    console.error('💥 SCHOLAR STRIKE — tick() crash:', err);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#ff6b6b';
    ctx.font = '7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Erro interno — ver consola (F12)', VIEW_W/2, VIEW_H/2 - 8);
    ctx.fillStyle = '#f4d98d';
    ctx.fillText(err.message.slice(0, 50), VIEW_W/2, VIEW_H/2 + 6);
    ctx.textAlign = 'left';
    setTimeout(() => {
      if (window._raf.get()) { window._raf.set(requestAnimationFrame(tick)); }
    }, 2000);
  }
}

// ── START / STOP ────────────────────────────────────────────
function startWorld() {
  window._loadHeroTextures();

  const spawn = (window.World && World.region.spawn) || { x:8, y:9 };
  S.px = spawn.x * TILE;
  S.py = spawn.y * TILE;
  S.inBattle  = false;
  S.dialogNpc = null;
  S.cooldown  = 2;
  
  // Lógica de Cutscene Inicial
  if (window.World && World.currentRegion === 'oakvale' && !S.hasSeenIntro) {
    S.inCutscene = true;
    S.cutsceneStep = 0;
  } else {
    S.inCutscene = false;
  }

  canvas.width  = VIEW_W;
  canvas.height = VIEW_H;
  canvas.style.width  = '100vw';
  canvas.style.height = '100vh';

  window.updateHud();

  const rn  = window.World ? World.region.name : 'Oakvale Hollow';
  const loc = document.getElementById('location');
  loc.textContent = rn; loc.style.opacity = '1';
  setTimeout(() => { loc.style.opacity = '0'; }, 2800);

  if (window._raf.get()) cancelAnimationFrame(window._raf.get());
  window._lastT.set(performance.now());
  window._raf.set(requestAnimationFrame(tick));

  // Pré-carregar primeira pergunta
  window.genQuestion && window.genQuestion()
    .then(q => S.qCache.push(q))
    .catch(() => {});
}

function stopWorld() {
  if (window._raf.get()) { cancelAnimationFrame(window._raf.get()); window._raf.set(null); }
}

// Exports globais
window.startWorld = startWorld;
window.stopWorld  = stopWorld;
window.camPos     = camPos;
