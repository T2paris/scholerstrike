// ═══════════════════════════════════════════════════════════
// SCHOLAR STRIKE — services/TextureLoader.js
// Carregamento de todas as texturas (sprites, tiles, etc.)
// ═══════════════════════════════════════════════════════════
'use strict';

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
let raf = null, lastT = 0;

// ── TEXTURAS ────────────────────────────────────────────────
const TEX = {
  grassImg:null, grassReady:false,
  pathImg:null,  pathReady:false,
  treeTiles:[], treesReady:false,
  houseTiles:[], housesReady:false,
  waterTiles:[], waterReady:false,
  portalImg:null, portalReady:false,
  heroes:{},
};

// Carrega texturas dos heróis apenas quando o jogo inicia
function _loadHeroTextures() {
  if (!window.IMG) return;

  HEROES.forEach(h => {
    if (window.IMG[h.img] && !TEX.heroes[h.img]) {
      const hi = new Image();
      hi.src = window.IMG[h.img];
      TEX.heroes[h.img] = hi;
    }
  });
  for (let i = 0; i < 5; i++) {
    const k = `h1_walk_${i}`;
    if (window.IMG[k] && !TEX.heroes[k]) {
      const hi = new Image(); hi.src = window.IMG[k]; TEX.heroes[k] = hi;
    }
  }
  for (let i = 0; i < 4; i++) {
    const k = `h1_idle_${i}`;
    if (window.IMG[k] && !TEX.heroes[k]) {
      const hi = new Image(); hi.src = window.IMG[k]; TEX.heroes[k] = hi;
    }
  }
}

(function loadTextures() {
  // Relva
  const img = new Image();
  img.onload = () => { TEX.grassImg = img; TEX.grassReady = true; };
  img.src = (window.IMG && window.IMG['grass']) || 'assets/world/grass.png';

  // Caminho
  const pImg = new Image();
  pImg.onload = () => { TEX.pathImg = pImg; TEX.pathReady = true; };
  pImg.src = (window.IMG && window.IMG['path']) || 'assets/world/path.png';

  // Água — espera TODOS os frames antes de marcar waterReady
  let waterExpected = 0, waterLoadedCount = 0;
  for (let i = 0; i < 10; i++) {
    if (window.IMG && window.IMG[`water_${i}`]) {
      waterExpected++;
      const wi = new Image();
      wi.onload = () => {
        waterLoadedCount++;
        if (waterLoadedCount >= waterExpected) TEX.waterReady = true;
      };
      wi.src = window.IMG[`water_${i}`];
      TEX.waterTiles.push(wi);
    }
  }
  console.log(`%c[TEX] Water assets: ${TEX.waterTiles.length}`, 'color:#00d2ff;font-weight:bold');

  // Árvores (com remoção de fundo branco)
  if (window.TREE_IMGS) {
    let count = 0;
    for (let i = 0; i < window.TREE_IMGS.length; i++) {
      const tImg = new Image();
      tImg.onload = () => {
        const tc = document.createElement('canvas');
        tc.width = tImg.width; tc.height = tImg.height;
        const ctxT = tc.getContext('2d');
        ctxT.drawImage(tImg, 0, 0);
        const imgD = ctxT.getImageData(0, 0, tc.width, tc.height);
        const d = imgD.data;
        for (let p = 0; p < d.length; p += 4) {
          if (d[p] > 235 && d[p+1] > 235 && d[p+2] > 235) d[p+3] = 0;
        }
        ctxT.putImageData(imgD, 0, 0);
        const fi = new Image();
        fi.onload = () => {
          TEX.treeTiles[i] = fi; count++;
          if (count === window.TREE_IMGS.length) TEX.treesReady = true;
        };
        fi.src = tc.toDataURL('image/png');
      };
      tImg.src = window.TREE_IMGS[i];
    }
  }

  // Casas (com remoção de fundo branco)
  if (window.HOUSE_IMGS) {
    let count = 0;
    for (let i = 0; i < window.HOUSE_IMGS.length; i++) {
      const tImg = new Image();
      tImg.onload = () => {
        const tc = document.createElement('canvas');
        tc.width = tImg.width; tc.height = tImg.height;
        const ctxH = tc.getContext('2d');
        ctxH.drawImage(tImg, 0, 0);
        const imgD = ctxH.getImageData(0, 0, tc.width, tc.height);
        const d = imgD.data;
        for (let p = 0; p < d.length; p += 4) {
          if (d[p] > 235 && d[p+1] > 235 && d[p+2] > 235) d[p+3] = 0;
        }
        ctxH.putImageData(imgD, 0, 0);
        const fi = new Image();
        fi.onload = () => {
          TEX.houseTiles[i] = fi; count++;
          if (count === window.HOUSE_IMGS.length) TEX.housesReady = true;
        };
        fi.src = tc.toDataURL('image/png');
      };
      tImg.src = window.HOUSE_IMGS[i];
    }
  }

  // Portal (com remoção de fundo branco)
  if (window.IMG && window.IMG['portal']) {
    const tImg = new Image();
    tImg.onload = () => {
      const tc = document.createElement('canvas');
      tc.width = tImg.width; tc.height = tImg.height;
      const ctxP = tc.getContext('2d');
      ctxP.drawImage(tImg, 0, 0);
      const imgD = ctxP.getImageData(0, 0, tc.width, tc.height);
      const d = imgD.data;
      const bgR = d[0], bgG = d[1], bgB = d[2];
      for (let p = 0; p < d.length; p += 4) {
        // Remover a cor de fundo (tolerância para artefactos jpeg/compressão)
        if (Math.abs(d[p] - bgR) < 15 && Math.abs(d[p+1] - bgG) < 15 && Math.abs(d[p+2] - bgB) < 15) {
            d[p+3] = 0; // Transparente
        }
      }
      ctxP.putImageData(imgD, 0, 0);
      const fi = new Image();
      fi.onload = () => { TEX.portalImg = fi; TEX.portalReady = true; };
      fi.src = tc.toDataURL('image/png');
    };
    tImg.src = window.IMG['portal'];
  }
})();

// Exports globais
window.canvas = canvas;
window.ctx    = ctx;
window.TEX    = TEX;
window._loadHeroTextures = _loadHeroTextures;
// raf e lastT são geridos pelo GameController
window._raf   = { get() { return raf; }, set(v) { raf = v; } };
window._lastT = { get() { return lastT; }, set(v) { lastT = v; } };
