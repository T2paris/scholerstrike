// ═══════════════════════════════════════════════════════════
// SCHOLAR STRIKE — views/MapView.js
// Renderização do mapa, NPCs e jogador no canvas
// ═══════════════════════════════════════════════════════════
'use strict';

// ── RENDERER CENTRAL (Y-SORTING) ────────────────────────────
function drawScene(cx, cy, now) {
  const map = getMapData(), mw = getMapW(), mh = getMapH();

  if (!map || !mw || !mh) {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#f4d98d';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('A carregar mundo...', VIEW_W/2, VIEW_H/2);
    ctx.textAlign = 'left';
    return;
  }

  const stx = Math.floor(cx/TILE), sty = Math.floor(cy/TILE);
  const etx = Math.min(mw, stx + Math.ceil(VIEW_W/TILE) + 2);
  const ety = Math.min(mh, sty + Math.ceil(VIEW_H/TILE) + 2);

  // 1. CAMADA 1: CHÃO
  for (let ty = Math.max(0,sty); ty < ety; ty++) {
    for (let tx = Math.max(0,stx); tx < etx; tx++) {
      const t  = map[ty*mw+tx];
      const sx = tx*TILE - cx, sy = ty*TILE - cy;

      if ((t===0||t===4||t===7) && TEX.grassReady) {
        ctx.drawImage(TEX.grassImg, 0, 0, TEX.grassImg.width, TEX.grassImg.height, sx, sy, TILE, TILE);
      } else if (t !== 0 && t !== 4 && t !== 7 && t !== 2) {
        ctx.fillStyle = getTileColor(t, tx, ty);
        ctx.fillRect(sx, sy, TILE, TILE);
      } else if (t === 2 && !TEX.waterReady) {
        ctx.fillStyle = getTileColor(t, tx, ty);
        ctx.fillRect(sx, sy, TILE, TILE);
      }

      if (t === 1) {
        ctx.fillStyle = 'rgba(255,255,255,.04)'; ctx.fillRect(sx+1, sy+1, TILE-2, 4);
        ctx.fillStyle = 'rgba(0,0,0,.3)';        ctx.fillRect(sx, sy+TILE-3, TILE, 3);
      }
      if (t === 3) {
        if (TEX.pathReady) {
          ctx.drawImage(TEX.pathImg, 0, 0, TEX.pathImg.width, TEX.pathImg.height, sx, sy, TILE, TILE);
        } else {
          ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(sx+3, sy+3, TILE-6, TILE-6);
        }
      }
      if (t === 2) {
        ctx.fillStyle = '#306898';
        ctx.fillRect(sx, sy, TILE, TILE);
        const frame = Math.floor(now / 250) % 4;
        for (let py = 0; py < TILE; py += 4) {
          for (let px = 0; px < TILE; px += 4) {
             let gx = Math.floor((tx * TILE + px) / 4);
             let gy = Math.floor((ty * TILE + py) / 4);
             let cx2 = gx % 8;
             let cy2 = gy % 8;
             let rowDir = (cy2 % 4 < 2) ? 1 : -1;
             let offset = (frame * rowDir + 8) % 8;
             let baseShift = (cy2 % 2 === 0) ? 0 : 4;
             let wave = (cx2 + offset + baseShift) % 8;
             if (wave <= 1) {
                ctx.fillStyle = '#68A0D8'; ctx.fillRect(sx + px, sy + py, 4, 4);
             } else if (wave >= 4 && wave <= 5) {
                ctx.fillStyle = '#184068'; ctx.fillRect(sx + px, sy + py, 4, 4);
             }
          }
        }
      }
      if (t === 9) { // Lava
        const l = now/1000;
        const pulse = Math.sin(l + tx*0.5 + ty*0.5);
        ctx.fillStyle = `rgba(255,60,0,${0.15+pulse*0.05})`; ctx.fillRect(sx, sy, TILE, TILE);
        const flowY  = Math.floor(Math.sin(l*1.5+tx)*4);
        ctx.fillStyle = `rgba(255,100,0,${0.3+Math.cos(l+ty)*0.1})`; ctx.fillRect(sx, sy+8+flowY, TILE, 6);
        const flowY2 = Math.floor(Math.cos(l*2+ty)*3);
        ctx.fillStyle = `rgba(255,170,0,${0.2+Math.sin(l+tx)*0.1})`; ctx.fillRect(sx, sy+22+flowY2, TILE, 4);
        const seed = tx*31 + ty*17;
        const cycleSpeed = 1000 + (seed%1000);
        const cycle = (now%cycleSpeed)/cycleSpeed;
        const bx = sx + 4 + (seed%(TILE-8));
        const by = sy + TILE - Math.floor(cycle*TILE);
        if (cycle > 0.2 && cycle < 0.8) {
          const bPhase = Math.sin((cycle-0.2)/0.6*Math.PI);
          const bSize = Math.floor(bPhase*4);
          if (bSize > 0) {
            ctx.fillStyle = `rgba(255,120,0,${0.6*bPhase})`; ctx.beginPath(); ctx.arc(bx, by, bSize*1.5, 0, Math.PI*2); ctx.fill();
            const iSize = Math.max(1, Math.floor(bSize*0.8));
            ctx.fillStyle = `rgba(255,220,0,${0.9*bPhase})`; ctx.beginPath(); ctx.arc(bx, by, iSize, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = `rgba(255,255,255,${0.4*bPhase})`; ctx.beginPath(); ctx.arc(bx-iSize*0.3, by-iSize*0.3, iSize*0.3, 0, Math.PI*2); ctx.fill();
          }
        }
      }
    }
  }

  // 2. RECOLHER ENTIDADES PARA Y-SORTING
  const entities = [];

  // Objetos do Mapa
  for (let ty = Math.max(0,sty); ty < ety; ty++) {
    for (let tx = Math.max(0,stx); tx < etx; tx++) {
      const t  = map[ty*mw+tx];
      if (t >= 4 && t <= 8) {
        const leftIs = tx>0 && map[ty*mw+(tx-1)]===t;
        const topIs  = ty>0 && map[(ty-1)*mw+tx]===t;
        if (t === 4 || (!leftIs && !topIs)) {
           let sortY = (ty+1)*TILE;
           let hw=1, hh=1;
           if (t === 5 || t === 7 || t === 8) { 
             hw=2; hh=2; if (tx+2<mw && map[ty*mw+(tx+2)]===t) hw=3; if (ty+2<mh && map[(ty+2)*mw+tx]===t) hh=3; 
             sortY = (ty+hh)*TILE; 
           } else if (t === 6) { 
             hw=1; hh=1; if (tx+1<mw && map[ty*mw+(tx+1)]===6) hw=2; if (ty+1<mh && map[(ty+1)*mw+tx]===6) hh=2; 
             sortY = (ty+hh)*TILE; 
           }
           entities.push({ type: 'mapObj', t, tx, ty, w:hw*TILE, h:hh*TILE, sortY });
        }
      }
    }
  }

  // NPCs
  getNpcPositions().forEach(n => {
    if (!n.npc) return;
    let px = n.tx * TILE;
    let py = n.ty * TILE;
    const baseNpc = window.World && World.region && World.region.npcs && World.region.npcs.find(bn => bn.npcId === n.npc.id);
    if (baseNpc && baseNpc.realX !== undefined) {
      px = baseNpc.realX;
      py = baseNpc.realY;
    }
    entities.push({ type: 'npc', n, px, py, sortY: py + TILE });
  });

  // Jogador
  entities.push({ type: 'player', sortY: S.py + TILE });

  // 3. ORDENAR Y-SORTING
  entities.sort((a, b) => a.sortY - b.sortY);

  // 4. DESENHAR CAMADA 2
  entities.forEach(ent => {
    if (ent.type === 'player') {
      _drawPlayerRaw(cx, cy, now);
    } else if (ent.type === 'npc') {
      _drawNpcRaw(ent, cx, cy, now);
    } else if (ent.type === 'mapObj') {
      _drawMapObjRaw(ent, cx, cy, now);
    }
  });
}

// ── FUNÇÕES DE DESENHO ESPECÍFICAS ──────────────────────────
function _drawPlayerRaw(cx, cy, now) {
  const sx = S.px - cx, sy = S.py - cy;
  const col = S.disc ? _discColor(S.disc.id) : '#4fd36d';
  _drawHeroSprite(ctx, cx, cy, S.px, S.py, S.hero ? S.hero.id : null, S.hero ? S.hero.img : null, S.facingLeft, S.isMoving, now, col);
  _drawPlayerName(sx, sy, S.heroName, false);
}

function _drawNpcRaw(ent, cx, cy, now) {
  const sx = ent.px - cx, sy = ent.py - cy;
  if (sx<-TILE||sx>VIEW_W+TILE||sy<-TILE||sy>VIEW_H+TILE) return;

  let heroId = null;
  let heroImg = ent.n.npc.imgSrc;
  if (heroImg && heroImg.startsWith('h')) heroId = heroImg;

  _drawHeroSprite(ctx, cx, cy, ent.px, ent.py, heroId, heroImg, true, false, now, '#8b6914');
  _drawPlayerName(sx, sy, ent.n.npc.name, true);

  if (S.nearNpc && S.nearNpc.npc === ent.n.npc) {
    ctx.fillStyle = '#f5d479'; ctx.font = 'bold 14px serif';
    ctx.fillText('!', sx+16, sy-22);
  }
}

function _drawMapObjRaw(ent, cx, cy, now) {
  const sx = ent.tx*TILE - cx, sy = ent.ty*TILE - cy;
  const { t, w, h } = ent;

  if (t === 4) { // Árvore
    if (TEX.treesReady && TEX.treeTiles.length > 0) {
      const hsh = Math.abs(Math.sin(ent.tx*12.9898+ent.ty*78.233)*43758.5453);
      const idx = Math.floor(hsh) % TEX.treeTiles.length;
      const tImg = TEX.treeTiles[idx];
      if (tImg && tImg.complete) {
        const treeH = TILE*2;
        const treeW = treeH*(tImg.width/tImg.height);
        ctx.drawImage(tImg, sx+(TILE-treeW)/2, sy+TILE-treeH, treeW, treeH);
      }
    } else {
      ctx.fillStyle = '#5c3a1e'; ctx.fillRect(sx+12, sy+18, 8, 14);
      ctx.fillStyle = '#2d6b28'; ctx.beginPath(); ctx.arc(sx+16, sy+14, 12, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#3a8c33'; ctx.beginPath(); ctx.arc(sx+13, sy+10, 8, 0, Math.PI*2);  ctx.fill();
    }
  }
  else if (t === 5) { // Ruína
    ctx.fillStyle = 'rgba(255,255,255,.03)'; ctx.fillRect(sx,sy,w,h);
    ctx.fillStyle = 'rgba(0,0,0,.22)';       ctx.fillRect(sx+8,sy+8,w-16,h-16);
  }
  else if (t === 6) { // Portal
    if (TEX.portalReady && TEX.portalImg && TEX.portalImg.complete) {
      const aspect = TEX.portalImg.width / TEX.portalImg.height;
      const scale = 1.6; // Maior que o herói, mas não monstruoso
      const pulse = 1.0+Math.sin(now/500)*0.05;
      const dw = w * scale * pulse;
      const dh = dw / aspect;
      // Desenhar o portal alinhado pelo TOPO do tile para não ser cortado pela borda do ecrã
      // Adicionar um pequeno efeito de flutuação suave
      const floatY = Math.sin(now / 600) * 4;
      ctx.drawImage(TEX.portalImg, sx - (dw - w)/2, sy - 8 + floatY, dw, dh);
    } else {
      // Portal desenhado puramente em Canvas (GIGANTE e TRANSPARENTE)
      const p = 0.4 + Math.sin(now/400)*0.3; // Pulso principal
      
      const scale = 4.5; // Escala massiva
      const dw = w * scale;
      const dh = h * scale;
      const dx = sx - (dw - w) / 2;
      const dy = sy - (dh - h) / 2;
      
      // Borda exterior brilhante (Apenas linhas, sem fundo nenhum!)
      ctx.strokeStyle = `rgba(200, 100, 255, ${p + 0.3})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(dx+4, dy+4, dw-8, dh-8);
      
      // Retângulo interior apenas em contorno (sem fundo preenchido) a pulsar
      const innerShrink = 16 + Math.sin(now/200)*6;
      ctx.strokeStyle = `rgba(160, 80, 255, ${p + 0.1})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(dx + innerShrink, dy + innerShrink, dw - innerShrink*2, dh - innerShrink*2);
      
      // Linhas rúnicas diagonais
      ctx.strokeStyle = `rgba(230, 180, 255, ${p + 0.4})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(dx+4, dy+4); ctx.lineTo(dx+dw-4, dy+dh-4);
      ctx.moveTo(dx+dw-4, dy+4); ctx.lineTo(dx+4, dy+dh-4);
      ctx.stroke();
      
      // Núcleo central pequeno
      ctx.fillStyle = `rgba(255, 230, 255, ${0.8 + Math.sin(now/150)*0.2})`;
      ctx.beginPath();
      ctx.arc(sx + w/2, sy + h/2, 10 + Math.sin(now/300)*4, 0, Math.PI*2);
      ctx.fill();
    }
  }
  else if (t === 7) { // Edifício
    if (TEX.housesReady && TEX.houseTiles.length > 0) {
      const hsh = Math.abs(Math.sin(ent.tx*45.123+ent.ty*98.765)*43758.5453);
      const idx = Math.floor(hsh) % TEX.houseTiles.length;
      const hImg = TEX.houseTiles[idx];
      if (hImg && hImg.complete) {
        const scale = 3.0;
        const dw = w * scale;
        const dh = h * scale;
        const dx = sx + (w - dw) / 2;
        const dy = sy + (h - dh);
        ctx.drawImage(hImg, dx, dy, dw, dh);
      }
    } else {
      ctx.fillStyle='rgba(255,255,255,.06)'; ctx.fillRect(sx,sy,w,h);
      ctx.fillStyle='rgba(0,0,0,.2)';        ctx.fillRect(sx+8,sy+8,w-16,h-16);
    }
  }
  else if (t === 8) { // Dungeon
    ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(sx+8,sy+8,w-16,h-16);
    ctx.fillStyle='rgba(100,50,150,.35)';
    ctx.beginPath(); ctx.arc(sx+w/2,sy+h/2,15,0,Math.PI*2); ctx.fill();
  }
}

// ── RENDERER — CORE SPRITE (HERO) ───────────────────────────
function _drawHeroSprite(ctx, cx, cy, px, py, heroId, heroImgSrc, facingLeft, isMoving, now, fallbackColor) {
  const sx = px - cx, sy = py - cy;
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.beginPath(); ctx.ellipse(sx+16, sy+TILE-3, 10, 4, 0, 0, Math.PI*2); ctx.fill();

  let heroImgKey = heroImgSrc;
  if (heroId === 'h1') {
    if (isMoving) {
      const wf = Math.floor(now/150) % 5;
      if (TEX.heroes[`h1_walk_${wf}`]) heroImgKey = `h1_walk_${wf}`;
    } else {
      const idF = Math.floor(now/300) % 4;
      if (TEX.heroes[`h1_idle_${idF}`]) heroImgKey = `h1_idle_${idF}`;
    }
  }

  if (heroImgKey && TEX.heroes[heroImgKey]) {
    const img = TEX.heroes[heroImgKey];

    if (!img.complete || img.width === 0 || img.height === 0) {
      _drawPlayerFallback(sx, sy, fallbackColor);
      return;
    }

    let numFrames = 1;
    if (img.width >= img.height*2 && heroId !== 'h1') {
      numFrames = Math.max(1, Math.round(img.width/img.height));
    }
    const frameW   = img.width / numFrames;
    const frameH   = img.height;
    const frameIdx = (isMoving && numFrames > 1) ? Math.floor(now/150) % numFrames : 0;
    const sourceX  = frameIdx * frameW;

    const dstH = 40;
    const dstW = dstH * (frameW / frameH);
    const drawX = sx + 16 - dstW/2;
    const drawY = sy + TILE - dstH;

    ctx.save();
    ctx.imageSmoothingEnabled = frameW > 128;

    if (!facingLeft) {
      ctx.translate(sx+16, sy+12);
      ctx.scale(-1, 1);
      ctx.drawImage(img, sourceX, 0, frameW, frameH, -(dstW/2), drawY-(sy+12), dstW, dstH);
    } else {
      ctx.drawImage(img, sourceX, 0, frameW, frameH, drawX, drawY, dstW, dstH);
    }
    ctx.restore();
  } else {
    _drawPlayerFallback(sx, sy, fallbackColor);
  }
}

function _drawPlayerFallback(sx, sy, col) {
  ctx.fillStyle = col || '#4fd36d'; ctx.fillRect(sx+4, sy+8, 24, 20);
  ctx.fillStyle = '#f5d479'; ctx.beginPath(); ctx.arc(sx+16, sy+10, 8, 0, Math.PI*2); ctx.fill();
}

function _drawPlayerName(sx, sy, name, isNpc) {
  ctx.textAlign = 'center';
  const nw = Math.min(name.length*5+8, 72);
  ctx.fillStyle = 'rgba(0,0,0,.72)'; ctx.fillRect(sx+16-nw/2, sy-14, nw, 12);
  ctx.fillStyle = '#f4d98d'; ctx.font = '7px monospace';
  ctx.fillText(name.slice(0,14), sx+16, sy-5);
  ctx.textAlign = 'left';
}

function _discColor(id) {
  return {arithmancer:'#f2a65a',bioshaman:'#7ccf93',wordweaver:'#86b6f6',sophist:'#d89dd0'}[id]||'#4fd36d';
}

// Exports globais
window.drawScene = drawScene;
