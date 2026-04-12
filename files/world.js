// ═══════════════════════════════════════════════════════════
// SCHOLAR STRIKE — world.js
// Mapa completo de Eidolon: 5 regiões, NPCs, lore, transições
// ═══════════════════════════════════════════════════════════
'use strict';

// ── TILE IDs ────────────────────────────────────────────────
// 0=erva  1=parede  2=água  3=caminho  4=árvore
// 5=ruína 6=portal  7=edifício  8=dungeon  9=lava
const T = { GRASS:0, WALL:1, WATER:2, PATH:3, TREE:4,
            RUIN:5,  PORTAL:6, BUILD:7, DUNG:8, LAVA:9 };

// ── PALETAS POR TIPO DE TILE ────────────────────────────────
const TILE_PALETTES = {
  // Oakvale — verde sombrio
  oakvale: {
    [T.GRASS]: ['#1e3218','#243b1e','#1a2e16','#203820'],
    [T.WALL]:  ['#2c2040','#332550','#28183a'],
    [T.WATER]: ['#1a3a5c','#1e4470','#173352'],
    [T.PATH]:  ['#4a3520','#524030','#402e18'],
    [T.TREE]:  ['#1a3a18','#224d20','#163015'],
    [T.BUILD]: ['#3a2e4a','#2e2438','#42364e'],
    [T.PORTAL]:['#2a1060','#3d1888','#1a0840'],
  },
  // Rota Cinzenta — floresta corrupta, tons púrpura
  grey_route: {
    [T.GRASS]: ['#1c1a28','#221e30','#181620'],
    [T.WALL]:  ['#3a2840','#44304c','#2e2038'],
    [T.WATER]: ['#0e1a30','#121e38','#0a1428'],
    [T.PATH]:  ['#3a2818','#443020','#2e2010'],
    [T.TREE]:  ['#1a1428','#241c34','#14102a'],
    [T.RUIN]:  ['#2c2030','#362838','#241828'],
    [T.PORTAL]:['#2a1060','#3d1888','#1a0840'],
  },
  // Velorith — cidade em ruínas, pedra e cinza
  velorith: {
    [T.GRASS]: ['#1a1820','#1e1c24','#16141e'],
    [T.WALL]:  ['#383040','#423848','#2e2838'],
    [T.WATER]: ['#0c1824','#10202e','#081418'],
    [T.PATH]:  ['#2e2a34','#363240','#26222e'],
    [T.RUIN]:  ['#2a2230','#342a3c','#201a28'],
    [T.BUILD]: ['#302838','#3a3042','#26202e'],
    [T.PORTAL]:['#2a1060','#3d1888','#1a0840'],
  },
  // Abismo Arcano — dungeon profunda, preto e roxo
  arcane_abyss: {
    [T.GRASS]: ['#0e0c18','#12101e','#0a0814'],
    [T.WALL]:  ['#1c1428','#241c34','#14101e'],
    [T.WATER]: ['#0a0c28','#0e1030','#060820'],
    [T.PATH]:  ['#1e1428','#281c34','#14101e'],
    [T.RUIN]:  ['#1c1020','#24182c','#140c18'],
    [T.DUNG]:  ['#100c1c','#180e24','#0c0814'],
    [T.LAVA]:  ['#4a1400','#5c1a00','#3a0e00'],
    [T.PORTAL]:['#2a1060','#3d1888','#1a0840'],
  },
  // Véu Rasgado — zona final, vermelho e negro
  torn_veil: {
    [T.GRASS]: ['#1a0808','#200c0c','#140606'],
    [T.WALL]:  ['#280c0c','#321010','#1e0808'],
    [T.WATER]: ['#1a0414','#22061c','#12020e'],
    [T.PATH]:  ['#2e1010','#381414','#240c0c'],
    [T.RUIN]:  ['#241010','#2e1414','#1a0c0c'],
    [T.LAVA]:  ['#5c1000','#781600','#440c00'],
    [T.PORTAL]:['#600010','#800018','#440008'],
  },
};

// ── ENEMY POOLS POR REGIÃO ──────────────────────────────────
const REGION_ENEMIES = {
  oakvale: [
    { name:'Golem do Esquecimento', emoji:'🪨', hp:25, atk:6,  xp:20, def:2 },
    { name:'Sombra Errante',        emoji:'👤', hp:20, atk:7,  xp:18, def:1 },
  ],
  grey_route: [
    { name:'Espectro do Erro',      emoji:'👻', hp:30, atk:10, xp:30, def:3 },
    { name:'Árvore Corrompida',     emoji:'🌑', hp:40, atk:8,  xp:35, def:5 },
    { name:'Lobo das Trevas',       emoji:'🐺', hp:28, atk:12, xp:32, def:2 },
  ],
  velorith: [
    { name:'Scholar Corrompido',    emoji:'🧟', hp:45, atk:14, xp:45, def:4 },
    { name:'Guardião de Pedra',     emoji:'🗿', hp:60, atk:10, xp:50, def:8 },
    { name:'Sombra do Tempo',       emoji:'⌛', hp:38, atk:15, xp:48, def:3 },
  ],
  arcane_abyss: [
    { name:'Titã da Ignorância',    emoji:'👹', hp:80, atk:18, xp:70, def:6 },
    { name:'Dragão do Vazio',       emoji:'🐉', hp:65, atk:20, xp:65, def:5 },
    { name:'Elemental do Caos',     emoji:'🌀', hp:55, atk:22, xp:60, def:4 },
  ],
  torn_veil: [
    { name:'O Véu Incarnado',       emoji:'👁️', hp:100, atk:25, xp:100, def:8 },
    { name:'Sombra Absoluta',       emoji:'🌑', hp:90,  atk:22, xp:90,  def:7 },
  ],
};

// ── NPC POOLS POR REGIÃO ────────────────────────────────────
const REGION_NPCS = {
  oakvale: [
    { id:'mestre_arion', name:'Mestre Arion (Professor)', imgSrc:'3',
      lines:[
        'Bem-vindo a Oakvale Hollow. O conhecimento aqui é a tua única arma.',
        'O Véu Rasgado só pode ser combatido por mentes ágeis. Carrega armas e não hesites em atacar!',
        'Quando enfrentares inimigos, eles farão perguntas da tua disciplina. Responde corretamente para causar dano severo!'
      ]},
    { id:'sentinela_vanya', name:'Sentinela Vanya (Desafiante)', imgSrc:'6',
      lines:[
        'Vais para a Rota Cinzenta? Muitos Scholars com o triplo do teu nível não sobreviveram.',
        'Duvido que saibas distinguir uma poção de um manuscrito. Mostra-me o que vales.',
        'Não me faças arrepender de te deixar passar. A morte aguarda-te.'
      ]},
  ],
  grey_route: [
    { id:'batedor_eryth', name:'Batedor Eryth (Conselheiro)', imgSrc:'5',
      lines:[
        'Esta floresta foi corrompida. Mantém-te nas zonas iluminadas, o escuro está repleto de feras.',
        'Ao entrar em Velorith não confies nos magos ilusionistas. Eles vão enganar-te.',
        'Um conselho vital: evite o centro da floresta, a magia sombria atrai criaturas à noite.'
      ]},
    { id:'viajante_sorridente', name:'Viajante Sorridente (Enganador)', imgSrc:'2',
      lines:[
        'Olá amigo! Há um atalho completamente seguro a sul! Não precisas de te preocupar com monstros...',
        'Não te preocupes com bestas, não há nenhuma nesta floresta relaxante!',
        'Avança sem medo! O portal de lava não queima.'
      ]},
  ],
  velorith: [
    { id:'bibliotecaria', name:'A Bibliotecária (Arquivista)', imgSrc:'6',
      lines:[
        'Velorith tem a verdadeira história oculta do Véu. O conhecimento antigo foi o que nos arruinou.',
        'Cada resposta incorreta que dás nas batalhas dilui a magia destas ruínas.',
        'A lenda diz que a resposta final está no Véu Rasgado.'
      ]},
    { id:'mercadora_elara', name:'Mercadora Elara (Conselheira)', imgSrc:'4',
      lines:[
        'Os portais podem enganar os olhos. Observa bem as pedras roxas.',
        'Que portas e portais abrem para caminhos curtos ou longos? Segue sempre o musgo mais denso.',
      ]},
  ],
  arcane_abyss: [
    { id:'eco_desespero', name:'Eco do Desespero (Sombra)', imgSrc:'3',
      lines:[
        'Nem os Arquimestres originais sobreviveram à lava do abismo...',
        'Se tu passares, é porque um mortal comum não teria essa força... o teu fim aproxima-se.',
        'A tua falência aqui apenas será mais cinza no chão.'
      ]},
    { id:'ilusao_pura', name:'Ilusão Pura (Enganador)', imgSrc:'6',
      lines:[
        'O calor aqui não faz nenhum mal. Caminha sobre as zonas quentes de magma vermelhas, elas agora não queimam.',
        'A criatura do Vazio odeia quem ataca. Fica apenas parado.',
      ]},
  ],
  torn_veil: [
    { id:'oraculo_final', name:'O Observador (Oráculo)', imgSrc:'5',
      lines:[
        'Só os que questionam tudo encontram a última resposta. Estás assim tão pronto?',
        'O final nunca é um simples portal. Tens de aprender a atravessar o inevitável.',
      ]},
  ],
};

// ── MAPAS DAS 5 REGIÕES ─────────────────────────────────────
// Cada mapa: 32 colunas × 18 linhas = 576 tiles
// Portais: tile 6 = transição para próxima região

const MAPS = {

  // ── OAKVALE HOLLOW (zona inicial) ──────────────────────────
  oakvale: {
    w:32, h:18,
    name: 'Oakvale Hollow',
    palette: 'oakvale',
    music: 'oakvale',
    encRate: 0.003,
    spawn: { x:1, y:16 },
    portals: [
      { tx:30, ty:9, to:'grey_route', spawnX:2, spawnY:9 },
    ],
    data: [
      1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,0,0,0,1,
      1,0,4,4,0,0,0,7,7,0,0,0,4,0,0,0,0,0,4,4,0,0,0,0,0,0,4,0,0,0,0,1,
      1,0,4,0,0,0,0,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,0,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,1,
      1,0,0,0,0,0,7,7,0,0,3,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,4,0,0,0,7,7,0,0,3,0,0,3,0,0,2,2,2,2,0,0,0,0,0,0,0,4,4,0,0,1,
      1,0,0,0,0,0,0,0,0,0,3,0,0,3,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,0,0,3,3,3,3,3,3,3,0,0,3,3,3,3,0,0,3,3,3,3,3,3,3,3,3,3,3,6,1,
      1,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,6,1,
      1,0,4,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1,
      1,0,0,0,3,0,0,7,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,3,0,1,
      1,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,4,4,0,0,0,0,0,0,3,0,1,
      1,0,4,4,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,3,0,1,
      1,0,0,0,9,9,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1,
      1,0,0,0,9,9,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,1,
      1,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    ],
    npcs: [
      { tx:7,  ty:5, npcId:'mestre_arion' },
      { tx:22, ty:4, npcId:'sentinela_vanya' },
    ],
    encZones: [
      { x1:15, y1:1,  x2:30, y2:7  },
      { x1:1,  y1:11, x2:15, y2:16 },
      { x1:20, y1:11, x2:30, y2:16 },
    ],
  },

  // ── ROTA CINZENTA (floresta corrompida) ────────────────────
  grey_route: {
    w:32, h:18,
    name: 'Rota Cinzenta',
    palette: 'grey_route',
    music: 'grey_route',
    encRate: 0.005,
    spawn: { x:2, y:9 },
    portals: [
      { tx:1,  ty:9,  to:'oakvale',    spawnX:29, spawnY:9 },
      { tx:30, ty:9,  to:'velorith',   spawnX:2,  spawnY:9 },
    ],
    data: [
      1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
      1,0,4,4,0,4,4,4,0,0,4,4,0,0,0,0,4,4,4,0,0,4,4,0,0,4,4,4,0,0,0,1,
      1,0,4,0,0,4,0,4,5,5,4,0,0,0,0,0,4,0,4,0,0,4,0,0,0,4,0,4,0,0,0,1,
      1,0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,4,0,0,4,0,0,0,0,0,0,5,5,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,4,0,1,
      1,4,4,0,0,4,0,0,0,0,0,0,5,5,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,4,0,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,0,0,1,
      1,6,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,6,1,
      1,6,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,6,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,4,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0,0,5,5,0,0,0,0,0,4,0,1,
      1,0,4,4,0,0,0,0,5,5,0,0,0,0,0,5,5,0,0,0,0,0,5,5,0,0,0,0,0,4,0,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,1,
      1,0,4,4,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,0,1,
      1,0,0,0,0,4,4,4,0,0,4,4,0,0,0,0,4,4,0,0,0,4,4,4,0,0,4,4,4,0,0,1,
      1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    ],
    npcs: [
      { tx:6,  ty:8, npcId:'batedor_eryth' },
      { tx:22, ty:9, npcId:'viajante_sorridente' },
    ],
    encZones: [
      { x1:2, y1:1,  x2:30, y2:7  },
      { x1:2, y1:10, x2:30, y2:16 },
    ],
  },

  // ── VELORITH (cidade em ruínas) ────────────────────────────
  velorith: {
    w:32, h:18,
    name: 'Velorith, Cidade das Ruínas',
    palette: 'velorith',
    music: 'velorith',
    encRate: 0.004,
    spawn: { x:2, y:9 },
    portals: [
      { tx:1,  ty:9,  to:'grey_route',   spawnX:29, spawnY:9 },
      { tx:30, ty:9,  to:'arcane_abyss', spawnX:2,  spawnY:9 },
      { tx:16, ty:1,  to:'arcane_abyss', spawnX:16, spawnY:15 },
    ],
    data: [
      1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
      1,0,5,5,0,0,5,5,5,0,0,0,5,5,0,3,3,0,5,5,0,0,0,5,5,5,0,0,5,5,0,1,
      1,0,5,5,0,0,5,0,5,0,0,0,5,5,0,3,3,0,5,5,0,0,0,5,0,5,0,0,5,5,0,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,7,7,7,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,7,7,7,0,0,0,0,1,
      1,0,7,0,7,0,0,0,0,0,5,5,0,0,0,3,3,0,0,0,5,5,0,0,7,0,7,0,0,0,0,1,
      1,0,7,7,7,0,0,0,0,0,5,5,0,0,0,3,3,0,0,0,5,5,0,0,7,7,7,0,0,0,0,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,6,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,6,1,
      1,6,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,6,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,7,7,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,7,7,0,0,0,0,1,
      1,0,7,7,0,0,5,5,0,0,0,0,5,5,0,3,3,0,5,5,0,0,0,0,0,7,7,0,0,0,0,1,
      1,0,0,0,0,0,5,5,0,0,0,0,5,5,0,3,3,0,5,5,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,5,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,5,0,1,
      1,0,5,5,0,0,5,5,0,0,0,5,5,0,0,3,3,0,0,5,5,0,0,0,5,5,0,0,5,5,0,1,
      1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    ],
    npcs: [
      { tx:12, ty:5,  npcId:'bibliotecaria'   },
      { tx:20, ty:12, npcId:'mercadora_elara' },
    ],
    encZones: [
      { x1:2,  y1:1,  x2:14, y2:7  },
      { x1:18, y1:1,  x2:30, y2:7  },
      { x1:2,  y1:10, x2:14, y2:16 },
      { x1:18, y1:10, x2:30, y2:16 },
    ],
  },

  // ── ABISMO ARCANO (dungeon profunda) ───────────────────────
  arcane_abyss: {
    w:32, h:18,
    name: 'Abismo Arcano',
    palette: 'arcane_abyss',
    music: 'abyss',
    encRate: 0.007,
    spawn: { x:2, y:9 },
    portals: [
      { tx:1,  ty:9,  to:'velorith',  spawnX:29, spawnY:9 },
      { tx:16, ty:16, to:'velorith',  spawnX:16, spawnY:2 },
      { tx:30, ty:9,  to:'torn_veil', spawnX:2,  spawnY:9 },
    ],
    data: [
      1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
      1,8,8,8,0,0,0,0,8,8,8,8,0,0,0,9,9,0,0,0,8,8,0,0,0,0,8,8,8,0,0,1,
      1,8,0,8,0,0,0,0,8,0,0,8,0,0,9,9,9,9,0,0,8,8,0,0,0,0,8,0,8,0,0,1,
      1,8,8,8,0,0,0,0,8,8,8,8,0,0,9,9,9,9,0,0,0,0,0,0,0,0,8,8,8,0,0,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,0,0,0,0,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,8,0,0,0,0,0,0,0,1,
      1,0,9,9,0,0,8,8,0,0,9,9,0,0,0,0,9,9,0,0,0,0,8,8,0,9,9,9,9,0,0,1,
      1,0,9,9,0,0,0,0,0,0,9,9,0,0,0,0,9,9,0,0,0,0,0,0,0,9,9,9,9,0,0,1,
      1,6,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,6,1,
      1,6,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,6,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,8,8,0,0,0,0,0,0,8,8,0,0,9,9,0,0,0,0,8,8,0,0,0,0,0,0,8,8,0,1,
      1,0,8,8,0,0,9,9,0,0,8,8,0,0,9,9,9,9,9,9,8,8,0,0,9,9,0,0,8,8,0,1,
      1,0,0,0,0,0,9,9,0,0,0,0,0,0,9,9,9,9,9,9,0,0,0,0,9,9,0,0,0,0,0,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,8,0,0,0,0,0,0,0,0,0,0,0,0,6,6,0,0,0,0,0,0,0,0,0,0,0,0,8,0,1,
      1,0,8,8,0,9,9,9,9,9,9,9,0,0,0,3,3,0,0,0,9,9,0,0,0,9,9,0,8,8,0,1,
      1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    ],
    npcs: [
      { tx:16, ty:5, npcId:'eco_desespero' },
      { tx:11, ty:6, npcId:'ilusao_pura' }, // Colocado intencionalmente na lava
    ],
    encZones: [
      { x1:2, y1:1,  x2:30, y2:7  },
      { x1:2, y1:10, x2:30, y2:16 },
    ],
  },

  // ── VÉU RASGADO (zona final) ───────────────────────────────
  torn_veil: {
    w:32, h:18,
    name: 'O Véu Rasgado',
    palette: 'torn_veil',
    music: 'torn_veil',
    encRate: 0.009,
    spawn: { x:2, y:9 },
    portals: [
      { tx:1, ty:9, to:'arcane_abyss', spawnX:29, spawnY:9 },
    ],
    data: [
      1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
      1,0,0,5,5,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,0,5,5,0,0,0,0,5,5,0,0,1,
      1,9,9,5,5,0,0,0,0,5,5,0,0,9,9,0,0,9,9,0,0,5,5,0,0,0,0,5,5,9,9,1,
      1,9,9,0,0,0,0,0,0,0,0,0,0,9,9,0,0,9,9,0,0,0,0,0,0,0,0,0,0,9,9,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,5,0,0,9,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,9,0,0,5,0,0,1,
      1,0,5,5,0,9,9,0,0,0,0,9,9,0,0,0,0,0,9,9,0,0,0,0,9,9,0,5,5,0,0,1,
      1,0,0,0,0,0,0,0,0,0,0,9,9,0,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,0,1,
      1,6,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,
      1,6,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,0,5,5,0,9,9,0,0,0,0,0,0,9,9,0,0,9,9,0,0,0,0,0,9,9,0,5,5,0,0,1,
      1,0,5,0,0,9,9,0,9,9,0,0,0,9,9,0,0,9,9,0,0,0,9,9,9,9,0,0,5,0,0,1,
      1,0,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0,0,0,0,0,0,9,9,0,0,0,0,0,0,0,1,
      1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
      1,9,9,0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,9,9,1,
      1,9,9,5,5,0,0,0,0,5,5,0,0,0,9,9,0,9,9,0,0,5,5,0,0,0,0,5,5,9,9,1,
      1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    ],
    npcs: [
      { tx:16, ty:8, npcId:'oraculo_final' },
    ],
    encZones: [
      { x1:2, y1:1,  x2:30, y2:7  },
      { x1:2, y1:10, x2:30, y2:16 },
    ],
  },
};

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
    npc: npcPool[n.npcId],
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
  const portal = getPortals().find(p => p.tx === tx && p.ty === ty);
  if (portal) {
    transitionToRegion(portal.to, portal.spawnX, portal.spawnY);
    return true;
  }
  return false;
}
window.checkPortal = checkPortal;
