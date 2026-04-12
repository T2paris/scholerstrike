// ═══════════════════════════════════════════════════════════
// SCHOLAR STRIKE — game.js  (motor do mundo)
// ═══════════════════════════════════════════════════════════
'use strict';

const TILE   = 32;
const VIEW_W = 320;
const VIEW_H = 180;

const HEROES = [
  { id:'h1', name:'Cavaleira',       sub:'Guerreira de Armadura',  img:'h1' },
  { id:'h2', name:'Orc',             sub:'Berserker Orc',           img:'h2' },
  { id:'h3', name:'Necromante',      sub:'Mago Sombrio',            img:'h3' },
  { id:'h4', name:'Arqueira Élfica', sub:'Ranger Élfica',           img:'h4' },
  { id:'h5', name:'Bárbaro',         sub:'Guerreiro do Norte',      img:'h5' },
  { id:'h6', name:'Feiticeira',      sub:'Maga Arcana',             img:'h6' },
  { id:'h7', name:'Paladina',        sub:'Guardiã Luminosa',        img:'h7' },
  { id:'h8', name:'Cavaleiro Dragão',sub:'Guerreiro Dracónico',     img:'h8' },
  { id:'h9', name:'Paladino Dourado',sub:'Campeão Sagrado',         img:'h9' },
];

const DISCIPLINES = [
  { id:'arithmancer', name:'Arithmancer', desc:'Matemática – dano explosivo.',   subject:'matemática, álgebra, geometria, cálculo' },
  { id:'bioshaman',   name:'Bioshaman',   desc:'Biologia – cura e sustentação.', subject:'biologia, anatomia, ecologia, células, evolução' },
  { id:'wordweaver',  name:'Wordweaver',  desc:'Línguas – controlo e fluxo.',    subject:'língua portuguesa, gramática, literatura, linguística' },
  { id:'sophist',     name:'Sophist',     desc:'Filosofia – defesa e pressão.',  subject:'filosofia, ética, lógica, epistemologia, metafísica' },
];

// Estado global
const S = {
  hero:null, disc:null, heroName:'Aveline',
  studyText:'', studyFile:'',
  hp:40, maxHp:40, mp:20, maxMp:20,
  xp:0, xpNext:100, level:1, atk:12, def:4,
  px:1*32, py:16*32, running:false, facingLeft:false, isMoving:false,
  inBattle:false, enemy:null, enemyHp:0,
  dialogNpc:null, dialogLine:0, nearNpc:null,
  qCache:[], curQ:null, qCount:0,
  cooldown:0,
};
window.S = S;

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
let raf = null, lastT = 0;

// ── TEXTURAS ────────────────────────────────────────────────
const TEX = { grassImg: null, grassReady: false, pathImg: null, pathReady: false, treeTiles: [], treesReady: false, houseTiles: [], housesReady: false, waterTiles: [], waterReady: false, portalImg: null, portalReady: false, heroes: {} };

(function loadTextures(){
  const img = new Image();
  img.onload = () => {
    TEX.grassImg = img;
    TEX.grassReady = true;
  };
  img.src = (window.IMG&&window.IMG['grass'])||'assets/world/grass.png';

  const pImg = new Image();
  pImg.onload = () => {
    TEX.pathImg = pImg;
    TEX.pathReady = true;
  };
  pImg.src = (window.IMG&&window.IMG['path'])||'assets/world/path.png';

  HEROES.forEach(h => {
      if(window.IMG && window.IMG[h.img]) {
          const hi = new Image();
          hi.src = window.IMG[h.img];
          TEX.heroes[h.img] = hi;
      }
  });

  for(let i=0; i<5; i++) {
      if(window.IMG && window.IMG[`h1_walk_${i}`]) {
          const hi = new Image();
          hi.src = window.IMG[`h1_walk_${i}`];
          TEX.heroes[`h1_walk_${i}`] = hi;
      }
  }

  for(let i=0; i<4; i++) {
      if(window.IMG && window.IMG[`h1_idle_${i}`]) {
          const hi = new Image();
          hi.src = window.IMG[`h1_idle_${i}`];
          TEX.heroes[`h1_idle_${i}`] = hi;
      }
  }

  let waterLoadedCount = 0;
  for(let i=0; i<10; i++) {
      if(window.IMG && window.IMG[`water_${i}`]) {
          const wi = new Image();
          wi.onload = () => { 
              waterLoadedCount++;
              if (waterLoadedCount > 0) TEX.waterReady = true;
          };
          wi.src = window.IMG[`water_${i}`];
          TEX.waterTiles.push(wi);
      }
  }
  console.log("%c [TEX] Water assets detected: " + TEX.waterTiles.length, "color: #00d2ff; font-weight: bold;");

  if(window.TREE_IMGS){
      let count = 0;
      for(let i=0; i<window.TREE_IMGS.length; i++) {
        const tImg = new Image();
        tImg.onload = () => {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = tImg.width; tempCanvas.height = tImg.height;
            const ctxT = tempCanvas.getContext('2d');
            ctxT.drawImage(tImg, 0, 0);
            const imgD = ctxT.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const d = imgD.data;
            for(let p=0; p<d.length; p+=4) {
               if(d[p]>235 && d[p+1]>235 && d[p+2]>235) d[p+3] = 0;
            }
            ctxT.putImageData(imgD, 0, 0);

            const finalImg = new Image();
            finalImg.onload = () => {
                TEX.treeTiles[i] = finalImg;
                count++;
                if(count === window.TREE_IMGS.length) TEX.treesReady = true;
            };
            finalImg.src = tempCanvas.toDataURL('image/png');
        };
        tImg.src = window.TREE_IMGS[i];
      }
  }

  if(window.HOUSE_IMGS){
      let count = 0;
      for(let i=0; i<window.HOUSE_IMGS.length; i++) {
        const tImg = new Image();
        tImg.onload = () => {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = tImg.width; tempCanvas.height = tImg.height;
            const ctxH = tempCanvas.getContext('2d');
            ctxH.drawImage(tImg, 0, 0);
            const imgD = ctxH.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const d = imgD.data;
            for(let p=0; p<d.length; p+=4) {
               if(d[p]>235 && d[p+1]>235 && d[p+2]>235) d[p+3] = 0;
            }
            ctxH.putImageData(imgD, 0, 0);

            const finalImg = new Image();
            finalImg.onload = () => {
                TEX.houseTiles[i] = finalImg;
                count++;
                if(count === window.HOUSE_IMGS.length) TEX.housesReady = true;
            };
            finalImg.src = tempCanvas.toDataURL('image/png');
        };
        tImg.src = window.HOUSE_IMGS[i];
      }
  }
  if(window.IMG && window.IMG['portal']){
      const pImg = new Image();
      pImg.onload = () => {
          TEX.portalImg = pImg;
          TEX.portalReady = true;
      };
      pImg.src = window.IMG['portal'];
  }
})();

function camPos() {
  const mw = getMapW(), mh = getMapH();
  return {
    cx: Math.max(0, Math.min(S.px - VIEW_W/2, mw*TILE - VIEW_W)),
    cy: Math.max(0, Math.min(S.py - VIEW_H/2, mh*TILE - VIEW_H)),
  };
}

function walkable(px, py) {
  const map=getMapData(), mw=getMapW(), mh=getMapH();
  const check=(x,y)=>{
    if(x<0||y<0||x>=mw||y>=mh) return false;
    const t=map[y*mw+x];
    // Bloqueio direto
    if(t===1||t===2||t===4||t===7||t===8||t===9||t===5) return false;
    
    // Árvore (t=4): bloqueia 2 cubos verticais (este e o de baixo)
    if(y+1<mh && map[(y+1)*mw+x]===4) return false;

    return true;
  };

  // Hitbox refinada (pés do herói)
  // TILE=32. Vamos usar uma caixa de 16x8 centrada na base do herói.
  const hbW = 16, hbH = 8;
  const hx1 = px + (TILE - hbW)/2;
  const hx2 = hx1 + hbW - 1;
  const hy1 = py + TILE - hbH;
  const hy2 = py + TILE - 1;

  // Verificar os 4 cantos da hitbox pequena
  return check(Math.floor(hx1/TILE), Math.floor(hy1/TILE)) &&
         check(Math.floor(hx2/TILE), Math.floor(hy1/TILE)) &&
         check(Math.floor(hx1/TILE), Math.floor(hy2/TILE)) &&
         check(Math.floor(hx2/TILE), Math.floor(hy2/TILE));
}

function inEncZone(px,py){
  const tx=Math.floor(px/TILE), ty=Math.floor(py/TILE);
  return getEncZones().some(z=>tx>=z.x1&&tx<=z.x2&&ty>=z.y1&&ty<=z.y2);
}

function nearestNpc(px,py){
  const tx=Math.floor(px/TILE), ty=Math.floor(py/TILE);
  return getNpcPositions().find(n=>Math.abs(n.tx-tx)<=1&&Math.abs(n.ty-ty)<=1)||null;
}

// ── RENDERER ───────────────────────────────────────────────
function drawMap(cx,cy){
  const map=getMapData(), mw=getMapW(), mh=getMapH();
  const stx=Math.floor(cx/TILE), sty=Math.floor(cy/TILE);
  const etx=Math.min(mw,stx+Math.ceil(VIEW_W/TILE)+2);
  const ety=Math.min(mh,sty+Math.ceil(VIEW_H/TILE)+2);
  const now=Date.now();

  // CAMADA 1: CHÃO (Relva, Caminhos, Água, Lava)
  for(let ty=Math.max(0,sty);ty<ety;ty++){
    for(let tx=Math.max(0,stx);tx<etx;tx++){
      const t=map[ty*mw+tx];
      const sx=tx*TILE-cx, sy=ty*TILE-cy;

      // Fundo básico
      if((t===0 || t===4 || t===7) && TEX.grassReady){
        ctx.drawImage(TEX.grassImg, 0, 0, TEX.grassImg.width, TEX.grassImg.height, sx, sy, TILE, TILE);
      } else if (t!==0 && t!==4 && t!==7 && t!==2) {
        // Para água (t=2), não desenhamos cor sólida se a textura estiver pronta para evitar cintilação
        ctx.fillStyle = getTileColor(t, tx, ty);
        ctx.fillRect(sx, sy, TILE, TILE);
      } else if (t === 2 && !TEX.waterReady) {
        ctx.fillStyle = getTileColor(t, tx, ty);
        ctx.fillRect(sx, sy, TILE, TILE);
      }

      if(t===1){
        ctx.fillStyle='rgba(255,255,255,.04)'; ctx.fillRect(sx+1,sy+1,TILE-2,4);
        ctx.fillStyle='rgba(0,0,0,.3)';        ctx.fillRect(sx,sy+TILE-3,TILE,3);
      }
      if(t===3){
        if(TEX.pathReady){
            ctx.drawImage(TEX.pathImg, 0, 0, TEX.pathImg.width, TEX.pathImg.height, sx, sy, TILE, TILE);
        } else {
            ctx.fillStyle='rgba(255,255,255,.05)'; ctx.fillRect(sx+3,sy+3,TILE-6,TILE-6);
        }
      }
      if(t===2){ // Água
        if(TEX.waterReady && TEX.waterTiles.length > 0) {
            const frameIndex = Math.floor(now / 200) % TEX.waterTiles.length;
            const wImg = TEX.waterTiles[frameIndex];
            if (wImg) {
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(wImg, sx, sy, TILE, TILE);
            }
        } else {
            const wt=now/800;
            ctx.fillStyle='rgba(100,200,255,.09)';
            ctx.fillRect(sx,sy+8+Math.sin(wt+tx)*2,TILE,4);
            ctx.fillRect(sx,sy+18+Math.cos(wt+ty)*2,TILE,3);
        }
      }
      if (t===9) { // Lava
        const l = now / 1000;
        const pulse = Math.sin(l + tx * 0.5 + ty * 0.5);
        ctx.fillStyle = `rgba(255, 60, 0, ${0.15 + pulse * 0.05})`;
        ctx.fillRect(sx, sy, TILE, TILE);

        // Crust / flow
        const flowY = Math.floor(Math.sin(l * 1.5 + tx) * 4);
        ctx.fillStyle = `rgba(255, 100, 0, ${0.3 + Math.cos(l + ty) * 0.1})`;
        ctx.fillRect(sx, sy + 8 + flowY, TILE, 6);

        const flowY2 = Math.floor(Math.cos(l * 2 + ty) * 3);
        ctx.fillStyle = `rgba(255, 170, 0, ${0.2 + Math.sin(l + tx) * 0.1})`;
        ctx.fillRect(sx, sy + 22 + flowY2, TILE, 4);

        // Random bubbles per tile
        const seed = (tx * 31 + ty * 17);
        const cycleSpeed = 1000 + (seed % 1000); // 1 to 2 seconds
        const cycle = (now % cycleSpeed) / cycleSpeed; // 0.0 to 1.0
        
        const bx = sx + 4 + (seed % (TILE - 8));
        const by = sy + TILE - Math.floor(cycle * TILE);
        
        // Bubble life
        if (cycle > 0.2 && cycle < 0.8) {
            const bPhase = Math.sin((cycle - 0.2) / 0.6 * Math.PI); // 0 -> 1 -> 0
            const bSize = Math.floor(bPhase * 4); 
            if (bSize > 0) {
                // outer orange glow
                ctx.fillStyle = `rgba(255, 120, 0, ${0.6 * bPhase})`;
                ctx.beginPath();
                ctx.arc(bx, by, bSize * 1.5, 0, Math.PI * 2);
                ctx.fill();

                // inner bright yellow heat
                const innerSize = Math.max(1, Math.floor(bSize * 0.8));
                ctx.fillStyle = `rgba(255, 220, 0, ${0.9 * bPhase})`;
                ctx.beginPath();
                ctx.arc(bx, by, innerSize, 0, Math.PI * 2);
                ctx.fill();

                // additive highlight
                ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * bPhase})`;
                ctx.beginPath();
                ctx.arc(bx - innerSize*0.3, by - innerSize*0.3, innerSize*0.3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
      }
    }
  }

  // CAMADA 2: OBJETOS (Árvores, Casas, Portais, Ruínas)
  for(let ty=Math.max(0,sty);ty<ety;ty++){
    for(let tx=Math.max(0,stx);tx<etx;tx++){
      const t=map[ty*mw+tx];
      const sx=tx*TILE-cx, sy=ty*TILE-cy;

      if(t===4){ // Árvore
        if(TEX.treesReady) {
            const hsh = Math.abs(Math.sin(tx * 12.9898 + ty * 78.233) * 43758.5453);
            const idx = Math.floor(hsh) % TEX.treeTiles.length;
            const tImg = TEX.treeTiles[idx];
            if (tImg) {
                const w = 40;
                const h = 40 * (tImg.height / tImg.width);
                ctx.drawImage(tImg, sx + (TILE - w)/2, sy + TILE - h, w, h);
            }
        } else {
            ctx.fillStyle='#5c3a1e'; ctx.fillRect(sx+12,sy+18,8,14);
            ctx.fillStyle='#2d6b28'; ctx.beginPath(); ctx.arc(sx+16,sy+14,12,0,Math.PI*2); ctx.fill();
            ctx.fillStyle='#3a8c33'; ctx.beginPath(); ctx.arc(sx+13,sy+10,8,0,Math.PI*2);  ctx.fill();
        }
      }
      if(t===5){ // Ruína
        const leftIs5 = (tx>0) && map[ty*mw+(tx-1)]===5;
        const topIs5  = (ty>0) && map[(ty-1)*mw+tx]===5;
        if(!leftIs5 && !topIs5) {
            let hw = 2, hh = 2;
            if (tx+2 < mw && map[ty*mw+(tx+2)] === 5) hw = 3; 
            if (ty+2 < mh && map[(ty+2)*mw+tx] === 5) hh = 3;
            const w = hw * TILE, h = hh * TILE;
            ctx.fillStyle='rgba(255,255,255,.03)';
            ctx.fillRect(sx, sy, w, h);
            ctx.fillStyle='rgba(0,0,0,.22)'; 
            ctx.fillRect(sx+8, sy+8, w-16, h-16);
        }
      }
      if(t===6){ // Portal
        const leftIs6 = (tx>0) && map[ty*mw+(tx-1)]===6;
        const topIs6  = (ty>0) && map[(ty-1)*mw+tx]===6;
        if(!leftIs6 && !topIs6) {
            let hw = 1, hh = 1;
            if (tx+1 < mw && map[ty*mw+(tx+1)] === 6) hw = 2;
            if (ty+1 < mh && map[(ty+1)*mw+tx] === 6) hh = 2;
            const w = hw * TILE, h = hh * TILE;
            
            if(TEX.portalReady) {
                const pulse = 1.0 + Math.sin(now/500) * 0.05;
                const dw = w * pulse;
                const dh = h * pulse;
                const ox = (dw - w) / 2;
                const oy = (dh - h) / 2;
                ctx.drawImage(TEX.portalImg, sx - ox, sy - oy, dw, dh);
            } else {
                const p=0.35+Math.sin(now/400)*0.2;
                ctx.fillStyle=`rgba(120,60,255,${p})`; ctx.fillRect(sx+8,sy+8,w-16,h-16);
                ctx.strokeStyle=`rgba(220,180,255,${p+0.1})`; ctx.lineWidth=1;
                ctx.strokeRect(sx+4,sy+4,w-8,h-8);
            }
        }
      }
      if(t===7){ // Edifício
        const leftIs7 = (tx>0) && map[ty*mw+(tx-1)]===7;
        const topIs7  = (ty>0) && map[(ty-1)*mw+tx]===7;
        if(!leftIs7 && !topIs7) {
            let hw = 2, hh = 2;
            if (tx+2 < mw && map[ty*mw+(tx+2)] === 7) hw = 3; 
            if (ty+2 < mh && map[(ty+2)*mw+tx] === 7) hh = 3;
            const w = hw * TILE, h = hh * TILE;
            if(TEX.housesReady) {
                const hsh = Math.abs(Math.sin(tx * 45.123 + ty * 98.765) * 43758.5453);
                const idx = Math.floor(hsh) % TEX.houseTiles.length;
                const hImg = TEX.houseTiles[idx];
                if (hImg) {
                    ctx.drawImage(hImg, sx, sy, w, h);
                }
            } else {
                ctx.fillStyle='rgba(255,255,255,.06)'; ctx.fillRect(sx, sy, w, h);
                ctx.fillStyle='rgba(0,0,0,.2)'; ctx.fillRect(sx+8, sy+8, w-16, h-16);
            }
        }
      }
      if(t===8){ // Dungeon
        const leftIs8 = (tx>0) && map[ty*mw+(tx-1)]===8;
        const topIs8  = (ty>0) && map[(ty-1)*mw+tx]===8;
        if(!leftIs8 && !topIs8) {
            let hw = 2, hh = 2;
            if (tx+2 < mw && map[ty*mw+(tx+2)] === 8) hw = 3; 
            if (ty+2 < mh && map[(ty+2)*mw+tx] === 8) hh = 3;
            const w = hw * TILE, h = hh * TILE;
            ctx.fillStyle='rgba(0,0,0,.55)'; 
            ctx.fillRect(sx+8, sy+8, w-16, h-16);
            ctx.fillStyle='rgba(100,50,150,.35)';
            ctx.beginPath(); ctx.arc(sx+w/2, sy+h/2, 15, 0, Math.PI*2); ctx.fill();
        }
      }
    }
  }
}

function drawNpcs(cx,cy){
  ctx.textAlign='center';
  getNpcPositions().forEach(n=>{
    if(!n.npc) return;
    const sx=n.tx*TILE-cx, sy=n.ty*TILE-cy;
    if(sx<-TILE||sx>VIEW_W+TILE||sy<-TILE||sy>VIEW_H+TILE) return;
    ctx.fillStyle='#8b6914'; ctx.fillRect(sx+8,sy+6,16,20);
    ctx.fillStyle='#f5d479'; ctx.beginPath(); ctx.arc(sx+16,sy+8,7,0,Math.PI*2); ctx.fill();
    const nw=Math.min(n.npc.name.length*5+8,72);
    ctx.fillStyle='rgba(0,0,0,.75)'; ctx.fillRect(sx+16-nw/2,sy-16,nw,12);
    ctx.fillStyle='#f4d98d'; ctx.font='7px monospace';
    ctx.fillText(n.npc.name.slice(0,14),sx+16,sy-7);
    if(S.nearNpc&&S.nearNpc.npc===n.npc){
      ctx.fillStyle='#f5d479'; ctx.font='bold 14px serif';
      ctx.fillText('!',sx+16,sy-22);
    }
  });
  ctx.textAlign='left';
}

function drawPlayer(cx,cy,now){
  const sx=S.px-cx, sy=S.py-cy;
  ctx.imageSmoothingEnabled = false; // Corrigir desfocado
  ctx.fillStyle='rgba(0,0,0,.3)';
  ctx.beginPath(); ctx.ellipse(sx+16,sy+TILE-3,10,4,0,0,Math.PI*2); ctx.fill();
  
  let heroImgKey = S.hero.img;
  if(S.hero && S.hero.id === 'h1') {
      if (S.isMoving) {
          const walkFrame = Math.floor(now / 150) % 5;
          if (TEX.heroes[`h1_walk_${walkFrame}`]) {
              heroImgKey = `h1_walk_${walkFrame}`;
          }
      } else {
          const idleFrame = Math.floor(now / 300) % 4;
          if (TEX.heroes[`h1_idle_${idleFrame}`]) {
              heroImgKey = `h1_idle_${idleFrame}`;
          }
      }
  }

  if (S.hero && TEX.heroes[heroImgKey]) {
      const img = TEX.heroes[heroImgKey];
      // Caso a imagem tenha carregado e tenha um tamanho válido
      if (img.width > 0 && img.height > 0) {
          // Se for uma sprite sheet horizontal, numFrames será > 1
          // Mas se for uma imagem HD gerada avulsa (ex: 512x512 ou 1024x576), vai ser vista como 1 ou 2 frames conforme aspecto
          // Vamos assumir que heroImgKey avulso gerado pela AI é frame único
          let numFrames = 1;
          let isSpriteSheet = false;
          // Uma sprite sheet horizontal tem a largura muito maior que a altura.
          if (img.width >= img.height * 2 && S.hero.id !== 'h1') {
              numFrames = Math.max(1, Math.round(img.width / img.height));
              isSpriteSheet = true;
          }
          const frameW = img.width / numFrames;
          const frameH = img.height;
          
          let frameIndex = 0;
          if (S.isMoving && numFrames > 1) {
              frameIndex = Math.floor(now / 150) % numFrames;
          }
          const sourceX = frameIndex * frameW;

          // Se a imagem for gerada por IA com aspecto diferente (ex: 16:9), adaptamos a escala ao invés de deformar
          const dstH = 40;
          const dstW = dstH * (frameW / frameH);
          const drawOffsetX = sx + 16 - (dstW / 2); // centrar no sx+16
          const drawOffsetY = sy + TILE - dstH;     // assentar no chão
          
          ctx.save();
          // Permitir smoothing só se for imagem enorme (HD) para evitar o glitch de "cores de pixel". 
          // Se for menor (pixel art real), mantemos false.
          if (frameW > 128) {
              ctx.imageSmoothingEnabled = true;
          }
          
          if (!S.facingLeft) {
              // Virado para a direita: inverter no eixo X (o centro é sx+16)
              ctx.translate(sx + 16, sy + 12);
              ctx.scale(-1, 1);
              ctx.drawImage(img, sourceX, 0, frameW, frameH, - (dstW / 2), drawOffsetY - (sy + 12), dstW, dstH);
          } else {
              // Virado para a esquerda (default)
              ctx.drawImage(img, sourceX, 0, frameW, frameH, drawOffsetX, drawOffsetY, dstW, dstH);
          }
          ctx.restore();
      }
  } else {
      const col=S.disc?_discColor(S.disc.id):'#4fd36d';
      ctx.fillStyle=col; ctx.fillRect(sx+4,sy+8,24,20);
      ctx.fillStyle='#f5d479'; ctx.beginPath(); ctx.arc(sx+16,sy+10,8,0,Math.PI*2); ctx.fill();
  }
  ctx.textAlign='center';
  ctx.fillStyle='rgba(0,0,0,.72)'; ctx.fillRect(sx-4,sy-14,40,12);
  ctx.fillStyle='#f4d98d'; ctx.font='7px monospace';
  ctx.fillText(S.heroName.slice(0,9),sx+16,sy-5);
  ctx.textAlign='left';
}

function _discColor(id){
  return {arithmancer:'#f2a65a',bioshaman:'#7ccf93',wordweaver:'#86b6f6',sophist:'#d89dd0'}[id]||'#4fd36d';
}

// ── INPUT ───────────────────────────────────────────────────
const keys={};
window.addEventListener('keydown',e=>{
  keys[e.key]=true;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault();
  if(e.key==='e'||e.key==='E') handleInteract();
  if(e.key==='Shift') S.running=true;
  if(e.key==='Escape') closeDialogue();
});
window.addEventListener('keyup',e=>{
  keys[e.key]=false;
  if(e.key==='Shift') S.running=false;
});

function handleInteract(){
  if(S.inBattle) return;
  if(S.dialogNpc){advanceDialogue();return;}
  if(S.nearNpc) openDialogue(S.nearNpc.npc);
}

function openDialogue(npc){
  if(!npc) return;
  S.dialogNpc=npc; S.dialogLine=0;
  document.getElementById('dialogueName').textContent=npc.name;
  document.getElementById('dialogueText').textContent=npc.lines[0];
  const pc=document.getElementById('portraitCanvas');
  const pctx=pc.getContext('2d'); pctx.clearRect(0,0,pc.width,pc.height);
  const img=new Image();
  img.onload=()=>{
    pctx.imageSmoothingEnabled=false;
    const sc=Math.max(img.width/pc.width,img.height/pc.height);
    pctx.drawImage(img,0,0,img.width,img.height,(pc.width-img.width/sc)/2,0,img.width/sc,img.height/sc);
  };
  img.src=(window.IMG&&window.IMG[npc.imgSrc])||('assets/heroes/'+npc.imgSrc);
  document.getElementById('dialogue').classList.remove('hidden');
  document.getElementById('prompt').classList.add('hidden');
}

function advanceDialogue(){
  S.dialogLine++;
  if(S.dialogLine>=S.dialogNpc.lines.length) closeDialogue();
  else document.getElementById('dialogueText').textContent=S.dialogNpc.lines[S.dialogLine];
}

function closeDialogue(){
  S.dialogNpc=null;
  document.getElementById('dialogue').classList.add('hidden');
}

// ── LOOP ────────────────────────────────────────────────────
function tick(now){
  if(!raf) return;
  const dt=Math.min((now-lastT)/1000,0.1); lastT=now;

  if(!S.inBattle&&!S.dialogNpc){
    const spd=S.running?110:62;
    let dx=0,dy=0;
    if(keys['ArrowLeft']||keys['a']||keys['A'])  dx-=1;
    if(keys['ArrowRight']||keys['d']||keys['D']) dx+=1;
    if(keys['ArrowUp']||keys['w']||keys['W'])    dy-=1;
    if(keys['ArrowDown']||keys['s']||keys['S'])  dy+=1;
    
    // Atualizar direção se ele se mexer no eixo X
    if(dx < 0) S.facingLeft = true;
    if(dx > 0) S.facingLeft = false;

    if(dx||dy) {
      S.isMoving = true;
      if(dx&&dy){dx*=0.707;dy*=0.707;}
      const nx=S.px+dx*spd*dt, ny=S.py+dy*spd*dt;
      if(walkable(nx,S.py)) S.px=nx;
      if(walkable(S.px,ny)) S.py=ny;
    } else {
      S.isMoving = false;
    }
    if(S.cooldown<=0) checkPortal(S.px,S.py);
  }

  canvas.width=VIEW_W; canvas.height=VIEW_H;
  const{cx,cy}=camPos();
  drawMap(cx,cy); drawNpcs(cx,cy); drawPlayer(cx,cy,now);

  const nn=nearestNpc(S.px,S.py); S.nearNpc=nn;
  const pr=document.getElementById('prompt');
  if(nn&&!S.dialogNpc&&!S.inBattle){
    pr.textContent=`Fala com ${nn.npc.name} (E)`; pr.classList.remove('hidden');
  } else pr.classList.add('hidden');

  if(S.cooldown>0) S.cooldown-=dt;
  if(S.isMoving && !S.inBattle && !S.dialogNpc && S.cooldown<=0 && inEncZone(S.px,S.py) && Math.random()<getEncRate()){
    window.startBattle&&window.startBattle();
  }

  raf=requestAnimationFrame(tick);
}

// ── HUD ─────────────────────────────────────────────────────
function updateHud(){
  document.getElementById('hudName').textContent  =S.heroName;
  document.getElementById('hudClass').textContent =S.disc?S.disc.name:'';
  document.getElementById('hpFill').style.width   =(S.hp/S.maxHp*100)+'%';
  document.getElementById('mpFill').style.width   =(S.mp/S.maxMp*100)+'%';
  document.getElementById('xpFill').style.width   =(S.xp/S.xpNext*100)+'%';
  document.getElementById('hpText').textContent   =`${S.hp}/${S.maxHp}`;
  document.getElementById('mpText').textContent   =`${S.mp}/${S.maxMp}`;
  document.getElementById('xpText').textContent   =`${S.xp}/${S.xpNext}`;
  document.getElementById('levelText').textContent=S.level;
  document.getElementById('regionText').textContent=window.World?World.region.name:'Oakvale Hollow';
}
window.updateHud=updateHud;

// ── START ────────────────────────────────────────────────────
function startWorld(){
  const spawn=(window.World&&World.region.spawn)||{x:8,y:9};
  S.px=spawn.x*TILE; S.py=spawn.y*TILE;
  S.inBattle=false; S.dialogNpc=null; S.cooldown=2;
  canvas.width=VIEW_W; canvas.height=VIEW_H;
  canvas.style.width='100vw'; canvas.style.height='100vh';
  updateHud();
  const rn=window.World?World.region.name:'Oakvale Hollow';
  const loc=document.getElementById('location');
  loc.textContent=rn; loc.style.opacity='1';
  setTimeout(()=>{loc.style.opacity='0';},2800);
  if(raf) cancelAnimationFrame(raf);
  lastT=performance.now(); raf=requestAnimationFrame(tick);
  window.genQuestion&&window.genQuestion().then(q=>S.qCache.push(q)).catch(()=>{});
}
window.startWorld=startWorld;

// ── CHARACTER SELECT ─────────────────────────────────────────
function buildHeroes(){
  const grid=document.getElementById('modelGrid'); grid.innerHTML='';
  HEROES.forEach(h=>{
    const btn=document.createElement('div'); btn.className='model-btn';

    // Imagem do herói em tamanho real (recortada ao conteúdo)
    const imgEl=document.createElement('img');
    imgEl.className='model-hero-img';
    imgEl.alt=h.name;
    // Usar a imagem directamente — CSS trata do tamanho e crop
    imgEl.src=(window.IMG&&window.IMG[h.img])||h.img;
    imgEl.style.cssText='width:100%;height:160px;object-fit:cover;object-position:center top;display:block;border-radius:6px 6px 0 0;image-rendering:pixelated;';
    btn.appendChild(imgEl);

    const nm=document.createElement('div'); nm.className='model-name'; nm.textContent=h.name;
    const sub=document.createElement('div'); sub.className='model-sub'; sub.textContent=h.sub;
    btn.appendChild(nm); btn.appendChild(sub);

    btn.addEventListener('click',()=>{
      document.querySelectorAll('.model-btn').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected'); S.hero=h; drawPreview(h);
    });
    grid.appendChild(btn);
  });
}

function drawPreview(h){
  // Em vez de canvas, usar <img> directamente na preview-stage
  const stage = document.querySelector('.preview-stage');
  stage.innerHTML = '';

  const imgEl = document.createElement('img');
  imgEl.src = (window.IMG&&window.IMG[h.img])||h.img;
  imgEl.alt = h.name;
  imgEl.style.cssText = [
    'height:100%',
    'max-width:100%',
    'object-fit:contain',
    'object-position:center top',
    'image-rendering:pixelated',
    'display:block',
    'margin:0 auto',
  ].join(';');
  stage.appendChild(imgEl);
}

function buildDisciplines(){
  const grid=document.getElementById('disciplineGrid'); grid.innerHTML='';
  DISCIPLINES.forEach(d=>{
    const div=document.createElement('div'); div.className='discipline';
    div.innerHTML=`<h4>${d.name}</h4><p>${d.desc}</p>`;
    div.addEventListener('click',()=>{
      document.querySelectorAll('.discipline').forEach(el=>el.classList.remove('selected'));
      div.classList.add('selected'); S.disc=d;
    });
    grid.appendChild(div);
  });
}

function showScreen(id){
  ['homeScreen','characterScreen','gameScreen','battleScreen','levelUpScreen']
    .forEach(s=>document.getElementById(s).classList.add('hidden'));
  const el=document.getElementById(id);
  el.classList.remove('hidden');
  if(id==='gameScreen') el.style.display='';
}
window.showScreen=showScreen;

document.addEventListener('DOMContentLoaded',()=>{
  showScreen('homeScreen');
  document.getElementById('startBtn').addEventListener('click',()=>{
    showScreen('characterScreen'); buildHeroes(); buildDisciplines();
  });
  document.getElementById('backHomeBtn').addEventListener('click',()=>showScreen('homeScreen'));
  document.getElementById('enterWorldBtn').addEventListener('click',()=>{
    if(!S.hero){alert('Escolhe um herói!');return;}
    if(!S.disc){alert('Escolhe uma disciplina!');return;}
    S.heroName=document.getElementById('nameInput').value.trim()||'Aveline';
    if(window.World) World.currentRegion='oakvale';
    showScreen('gameScreen'); startWorld();
  });
  const fz=document.getElementById('fileZone'), fi=document.getElementById('fileInput');
  fz.addEventListener('click',()=>fi.click());
  fz.addEventListener('dragover',e=>{e.preventDefault();fz.style.borderColor='var(--gold)';});
  fz.addEventListener('dragleave',()=>{fz.style.borderColor='';});
  fz.addEventListener('drop',e=>{e.preventDefault();if(e.dataTransfer.files[0])loadStudyFile(e.dataTransfer.files[0]);});
  fi.addEventListener('change',()=>{if(fi.files[0])loadStudyFile(fi.files[0]);});
});

function loadStudyFile(file){
  S.studyFile=file.name;
  const loaded=document.getElementById('fileLoaded');
  const zone=document.getElementById('fileZone');
  loaded.textContent=`⏳ A carregar ${file.name}...`;
  loaded.style.display='block';

  const isPdf=file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf');
  if(isPdf){
    _extractPdfText(file).then(text=>{
      S.studyText=text;
      S.qCache=[]; // limpar cache para usar novo material
      loaded.textContent=`✅ PDF: ${file.name} (${text.length} car. extraídos)`;
      zone.classList.add('loaded');
    }).catch(err=>{
      loaded.textContent=`⚠️ Erro no PDF: ${err.message} — tenta .txt`;
    });
  } else {
    const r=new FileReader();
    r.onload=()=>{
      S.studyText=r.result;
      S.qCache=[]; // limpar cache para usar novo material
      loaded.textContent=`✅ ${file.name} (${S.studyText.length} car.)`;
      zone.classList.add('loaded');
    };
    r.onerror=()=>{ loaded.textContent='⚠️ Erro ao ler ficheiro.'; };
    r.readAsText(file,'utf-8');
  }
}

async function _extractPdfText(file){
  // Carregar pdf.js se não estiver carregado
  if(!window.pdfjsLib){
    await new Promise((res,rej)=>{
      const s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      s.onload=res; s.onerror=()=>rej(new Error('Falha ao carregar pdf.js'));
      document.head.appendChild(s);
    });
    pdfjsLib.GlobalWorkerOptions.workerSrc=
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
  const buf=await file.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data:buf}).promise;
  const loaded=document.getElementById('fileLoaded');
  let text='';
  for(let i=1;i<=pdf.numPages;i++){
    loaded.textContent=`⏳ Página ${i}/${pdf.numPages}...`;
    const page=await pdf.getPage(i);
    const content=await page.getTextContent();
    text+=content.items.map(it=>it.str).join(' ')+'\n';
  }
  return text.trim();
}
