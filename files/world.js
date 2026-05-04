//

// ── WORLD STATE ─────────────────────────────────────────────
const World = {
  currentRegion: 'oakvale',
  get region()  { return MAPS[this.currentRegion]; },
  get enemies() { return REGION_ENEMIES[this.currentRegion]; },
  get npcs()    { return REGION_NPCS[this.currentRegion]; },
  get palette() { return TILE_PALETTES[MAPS[this.currentRegion].palette]; },
};
window.World = World;

// ── GETTERS USADOS PELO RENDERER ────────────────────────────
function getMapData()     { return World.region.data; }
function getMapW()        { return World.region.w; }
function getMapH()        { return World.region.h; }
function getEncRate()     { return World.region.encRate; }
function getEncZones()    { return World.region.encZones; }
function getPortals()     { return World.region.portals; }
function getTileColor(t, tx, ty) {
  const pal = World.palette;
  const cols = pal[t] || pal[T.GRASS] || ['#1e3218','#243b1e'];
  const hash = Math.floor(Math.abs(Math.sin(tx * 12.9898 + ty * 78.233) * 43758.5453));
  return cols[hash % cols.length];
}
function getNpcPositions() {
  const region = World.region;
  const npcPool = World.npcs;
  return (region.npcs || []).map(n => ({
    tx: n.tx, ty: n.ty,
    npc: npcPool.find(npc => npc.id === n.npcId),
  })).filter(n => n.npc);
}
function getRandomEnemy() {
  const pool = World.enemies;
  return { ...pool[Math.floor(Math.random() * pool.length)] };
}

window.getMapData      = getMapData;
window.getMapW         = getMapW;
window.getMapH         = getMapH;
window.getEncRate      = getEncRate;
window.getEncZones     = getEncZones;
window.getPortals      = getPortals;
window.getTileColor    = getTileColor;
window.getNpcPositions = getNpcPositions;
window.getRandomEnemy  = getRandomEnemy;
window.T               = T;

// ── TRANSIÇÃO DE REGIÃO ─────────────────────────────────────
function transitionToRegion(regionId, spawnX, spawnY) {
  const S = window.S;
  const fade = document.getElementById('fade');

  // Fade out
  fade.style.opacity = '1';
  setTimeout(() => {
    World.currentRegion = regionId;
    const region = World.region;

    S.px = spawnX * 32;
    S.py = spawnY * 32;
    S.cooldown = 3;

    // Show location banner
    const loc = document.getElementById('location');
    document.getElementById('regionText').textContent = region.name;
    loc.textContent = region.name;
    loc.style.opacity = '1';
    setTimeout(() => { loc.style.opacity = '0'; }, 3000);

    // Fade in
    setTimeout(() => { fade.style.opacity = '0'; }, 100);

    // Pre-fetch question for new region
    window.genQuestion && window.genQuestion()
      .then(q => S.qCache.push(q)).catch(() => {});

  }, 400);
}
window.transitionToRegion = transitionToRegion;

// ── VERIFICAR PORTAL ─────────────────────────────────────────
function checkPortal(px, py) {
  const tx = Math.floor(px / 32);
  const ty = Math.floor(py / 32);
  // Portais ocupam 2 tiles (ty e ty+1) — detetar ambos (Fix #5)
  const portal = getPortals().find(p => p.tx === tx && (p.ty === ty || p.ty === ty + 1));
  if (portal) {
    transitionToRegion(portal.to, portal.spawnX, portal.spawnY);
    return true;
  }
  return false;
}
window.checkPortal = checkPortal;
