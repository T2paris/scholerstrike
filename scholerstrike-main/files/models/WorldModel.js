// ═══════════════════════════════════════════════════════════
// SCHOLAR STRIKE — world.js  (mundo e regiões)
// Reconstruído com inspiração em Pokémon FireRed
// 5 regiões: Oakvale → Ironforge → Silverwind → Shadowmere → Torn Veil
// ═══════════════════════════════════════════════════════════
'use strict';

// ── TIPOS DE BLOCO ──────────────────────────────────────────
const T = {
  GRASS:0, WALL:1, WATER:2, PATH:3, TREE:4,
  RUIN:5, PORTAL:6, BUILDING:7, DUNGEON:8, LAVA:9
};

// ── HELPER: converte string legível em array de tiles ───────
function _parseMap(s) {
  return s.trim().split(/\s+/).map(Number);
}

// ── PALETAS DE CORES POR TEMA ───────────────────────────────
const TILE_PALETTES = {
  // Oakvale Hollow — floresta verdejante (Pallet Town / Route 1)
  forest: {
    0: ['#1e3218','#243b1e','#2a4424'],
    1: ['#4a4a4a','#555555','#3d3d3d'],
    2: ['#1a3a5c','#1e4068','#224674'],
    3: ['#5c4a2e','#6b573a','#7a6446'],
    4: ['#2d6b28','#3a8c33'],
    5: ['#3a3a2a','#4a4a3a'],
    6: ['#7838ff','#9050ff'],
    7: ['#5a4a3a','#6b5b4b'],
    8: ['#2a1a1a','#3a2a2a'],
    9: ['#8b2500','#a03000']
  },
  // Ironforge Depths — montanha rochosa (Pewter City / Mt. Moon)
  mountain: {
    0: ['#2a3a20','#304228','#283820'],
    1: ['#6b6b6b','#7a7a7a','#5c5c5c'],
    2: ['#1a3050','#1e3658'],
    3: ['#6b5a3a','#7a6948','#8a7858'],
    4: ['#2d6b28','#3a8c33'],
    5: ['#4a4a3a','#5a5a4a'],
    6: ['#7838ff','#9050ff'],
    7: ['#6a5a4a','#7b6b5b'],
    8: ['#1a0a0a','#2a1a1a','#150808'],
    9: ['#8b2500','#a03000']
  },
  // Silverwind Coast — litoral (Cerulean City / Sea Route)
  coastal: {
    0: ['#2a4a20','#305228','#284820'],
    1: ['#8a8a7a','#9a9a8a','#7a7a6a'],
    2: ['#1a4a7c','#1e5088','#225694'],
    3: ['#c4a86a','#d4b87a','#b49858'],
    4: ['#2d7b38','#3a9c43'],
    5: ['#5a5a4a','#6a6a5a'],
    6: ['#7838ff','#9050ff'],
    7: ['#7a6a5a','#8b7b6b'],
    8: ['#2a1a1a','#3a2a2a'],
    9: ['#8b2500','#a03000']
  },
  // Shadowmere Ruins — ruínas sombrias (Lavender Town)
  ruins: {
    0: ['#1a2a18','#20321e','#182a16'],
    1: ['#3a3a3a','#4a4a4a','#2d2d2d'],
    2: ['#0a2a4c','#0e3058'],
    3: ['#4a3a1e','#59492d','#3a2a10'],
    4: ['#1d5b18','#2a7c23'],
    5: ['#5a4a3a','#6a5a4a','#7a6a5a'],
    6: ['#a040ff','#b060ff'],
    7: ['#4a3a2a','#5b4b3b'],
    8: ['#1a0a0a','#2a1a1a'],
    9: ['#8b2500','#a03000']
  },
  // Torn Veil — vulcânico (Victory Road / Indigo Plateau)
  volcanic: {
    0: ['#1a1a10','#222218','#1c1c14'],
    1: ['#2a2a2a','#3a3a3a','#1d1d1d'],
    2: ['#0a1a3c','#0e2048'],
    3: ['#3a2a0e','#49391d','#2a1a00'],
    4: ['#1d4b18','#2a6c23'],
    5: ['#4a3a2a','#5a4a3a'],
    6: ['#ff40a0','#ff60b0'],
    7: ['#3a2a1a','#4b3b2b'],
    8: ['#0a0000','#1a0a0a','#100505'],
    9: ['#c83200','#e04800','#ff6000']
  }
};

// ═══════════════════════════════════════════════════════════
// NPCs POR REGIÃO
// ═══════════════════════════════════════════════════════════
const REGION_NPCS = {
  oakvale: [
    {
      id: 'npc_oak_1', name: 'Mestre Aldric', imgSrc: 'h3',
      lines: [
        'Bem-vindo a Oakvale Hollow, jovem estudioso!',
        'Este é um lugar de aprendizagem e descoberta.',
        'Enfrenta os inimigos nos campos e responde às perguntas para ficares mais forte!',
        'Boa sorte na tua jornada, herói.'
      ]
    },
    {
      id: 'npc_oak_2', name: 'Conselheira Elara', imgSrc: 'h6',
      lines: [
        'Cada batalha é uma oportunidade de aprender.',
        'Responde corretamente e o teu poder crescerá!',
        'Procura o portal a norte — leva-te para Ironforge Depths.'
      ]
    }
  ],
  ironforge: [
    {
      id: 'npc_iron_1', name: 'Mineiro Thorin', imgSrc: 'h5',
      lines: [
        'As cavernas de Ironforge guardam segredos antigos.',
        'Cuidado com os Golems de Pedra — são resistentes!',
        'A este fica o caminho para a costa de Silverwind.'
      ]
    },
    {
      id: 'npc_iron_2', name: 'Forjadora Bram', imgSrc: 'h7',
      lines: [
        'Eu forjo armas com o conhecimento que ganhas nas batalhas.',
        'Quanto mais aprendes, mais forte te tornas.',
        'Continua a estudar e nada te poderá parar!'
      ]
    }
  ],
  silverwind: [
    {
      id: 'npc_silver_1', name: 'Capitã Marina', imgSrc: 'h4',
      lines: [
        'As correntes de Silverwind são traiçoeiras.',
        'Os monstros aquáticos são mais fortes do que parecem!',
        'A leste ficam as Ruínas de Shadowmere... tem cuidado.'
      ]
    },
    {
      id: 'npc_silver_2', name: 'Pescador Gil', imgSrc: 'h2',
      lines: [
        'Já pesquei muitas coisas estranhas nestas águas.',
        'Os Krakens menores são comuns por aqui.',
        'Se sobreviveres à costa, estarás pronto para as ruínas.'
      ]
    }
  ],
  shadowmere: [
    {
      id: 'npc_shadow_1', name: 'Espírito Errante', imgSrc: 'h8',
      lines: [
        'As ruínas de Shadowmere estão amaldiçoadas...',
        'Os espectros aqui alimentam-se da ignorância.',
        'Só o conhecimento verdadeiro pode banir as sombras.'
      ]
    },
    {
      id: 'npc_shadow_2', name: 'Guardião das Ruínas', imgSrc: 'h9',
      lines: [
        'Eu vigiei estas ruínas durante séculos.',
        'A norte encontra-se o Torn Veil — o véu rasgado.',
        'Apenas os mais sábios sobrevivem ao que lá está.'
      ]
    }
  ],
  torn_veil: [
    {
      id: 'npc_torn_1', name: 'Oráculo do Véu', imgSrc: 'h1',
      lines: [
        'Chegaste ao Torn Veil, a fronteira do conhecimento.',
        'Aqui, a lava purifica os que não estão preparados.',
        'Derrota os guardiões finais e prova o teu valor!'
      ]
    },
    {
      id: 'npc_torn_2', name: 'Sentinela Final', imgSrc: 'h7',
      lines: [
        'Os Titãs da Ignorância guardam o caminho.',
        'Cada resposta certa enfraquece o véu.',
        'Tu és a última esperança... não falhas!'
      ]
    }
  ]
};

// ═══════════════════════════════════════════════════════════
// INIMIGOS POR REGIÃO (dificuldade crescente)
// ═══════════════════════════════════════════════════════════
const REGION_ENEMIES = {
  oakvale: [
    { name: 'Lobo Sombrio',        emoji: '🐺', hp: 20, atk: 6,  xp: 15, def: 1 },
    { name: 'Espírito da Floresta', emoji: '🌿', hp: 25, atk: 7,  xp: 20, def: 2 },
    { name: 'Corvo Arcano',        emoji: '🐦', hp: 15, atk: 8,  xp: 18, def: 1 },
    { name: 'Slime Verdejante',    emoji: '🟢', hp: 18, atk: 5,  xp: 12, def: 1 }
  ],
  ironforge: [
    { name: 'Golem de Pedra',       emoji: '🪨', hp: 35, atk: 10, xp: 30, def: 4 },
    { name: 'Morcego das Cavernas', emoji: '🦇', hp: 25, atk: 9,  xp: 25, def: 2 },
    { name: 'Serpente Cristalina',  emoji: '🐍', hp: 30, atk: 11, xp: 28, def: 3 },
    { name: 'Mineiro Corrompido',   emoji: '⛏️', hp: 28, atk: 10, xp: 26, def: 3 }
  ],
  silverwind: [
    { name: 'Kraken Menor',       emoji: '🐙', hp: 40, atk: 11, xp: 35, def: 3 },
    { name: 'Sereia Sombria',     emoji: '🧜', hp: 35, atk: 12, xp: 32, def: 2 },
    { name: 'Tritão Guerreiro',   emoji: '🔱', hp: 45, atk: 10, xp: 38, def: 5 },
    { name: 'Caranguejo Titânico',emoji: '🦀', hp: 38, atk: 13, xp: 34, def: 4 }
  ],
  shadowmere: [
    { name: 'Espectro do Erro',    emoji: '👻', hp: 45, atk: 13, xp: 45, def: 3, sprite: 'battle_assets/espectro_erro.png' },
    { name: 'Sombra Errante',      emoji: '🌑', hp: 50, atk: 14, xp: 50, def: 4, sprite: 'battle_assets/sombra_errante.png' },
    { name: 'Esqueleto Arcano',    emoji: '💀', hp: 40, atk: 15, xp: 42, def: 2 },
    { name: 'Banshee Iletrada',    emoji: '😱', hp: 42, atk: 16, xp: 48, def: 3 }
  ],
  torn_veil: [
    { name: 'Golem do Esquecimento', emoji: '🗿', hp: 60, atk: 15, xp: 60, def: 5, sprite: 'battle_assets/golem_esquecimento.png' },
    { name: 'Dragão do Vazio',       emoji: '🐉', hp: 80, atk: 18, xp: 80, def: 6 },
    { name: 'Titã da Ignorância',    emoji: '👹', hp: 100, atk: 20, xp: 100, def: 7 },
    { name: 'Fénix Corrompida',      emoji: '🔥', hp: 70, atk: 17, xp: 70, def: 4 }
  ]
};

// ═══════════════════════════════════════════════════════════
// MAPAS — 25×18 tiles cada (inspirados em Pokémon FireRed)
//
// Legenda: 0=Relva 1=Parede 2=Água 3=Caminho 4=Árvore
//          5=Ruína 6=Portal 7=Edifício 8=Dungeon 9=Lava
// ═══════════════════════════════════════════════════════════

// ┌─────────────────────────────────────────────────────────┐
// │  REGIÃO 1 — OAKVALE HOLLOW  (Pallet Town / Route 1)    │
// │  Vila inicial rodeada de floresta, lago a sul           │
// │  Portal norte → Ironforge Depths                        │
// └─────────────────────────────────────────────────────────┘
const _oakvaleData = _parseMap(`
  4 4 4 4 4 4 4 4 4 4 4 6 6 4 4 4 4 4 4 4 4 4 4 4 4
  4 0 0 0 4 0 0 0 0 0 0 3 3 0 0 0 0 0 0 4 0 0 0 0 4
  4 0 0 0 0 0 0 0 0 0 0 3 3 0 0 0 0 0 0 0 0 0 0 0 4
  4 0 0 7 7 3 3 3 3 3 3 3 3 3 3 3 3 3 3 7 7 0 0 0 4
  4 0 0 7 7 0 0 0 0 0 0 3 3 0 0 0 0 0 0 7 7 0 0 0 4
  4 0 0 0 0 0 0 0 0 0 0 3 3 0 0 0 0 0 0 0 0 0 0 0 4
  4 0 0 0 0 0 0 0 0 0 0 3 3 0 0 0 0 0 0 0 0 0 0 0 4
  4 0 0 4 0 0 0 0 0 0 0 3 3 0 0 0 0 0 0 0 4 0 0 0 4
  4 0 0 0 0 0 0 0 0 0 0 3 3 0 0 0 0 0 0 0 0 0 0 0 4
  4 0 0 0 0 0 0 0 0 0 0 3 3 0 0 0 0 0 0 0 0 0 0 0 4
  4 0 0 0 0 0 0 0 0 0 0 3 3 0 0 0 0 0 0 0 0 0 0 0 4
  4 0 0 7 7 3 3 3 3 3 3 3 3 3 3 3 3 3 3 7 7 0 0 0 4
  4 0 0 7 7 0 0 4 0 0 0 3 3 0 0 0 4 0 0 7 7 0 0 0 4
  4 0 0 0 0 0 0 0 0 0 0 3 3 0 0 0 0 0 0 0 0 0 0 0 4
  4 0 0 0 0 4 0 0 0 0 0 3 3 0 0 0 0 4 0 0 0 0 0 0 4
  4 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 4
  4 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 4
  4 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 4
`);

// ┌─────────────────────────────────────────────────────────┐
// │  REGIÃO 2 — IRONFORGE DEPTHS  (Pewter City / Mt. Moon) │
// │  Montanha rochosa com cavernas e dungeons               │
// │  Portal sul → Oakvale  |  Portal leste → Silverwind    │
// └─────────────────────────────────────────────────────────┘
const _ironforgeData = _parseMap(`
  1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
  1 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 1
  1 0 0 0 0 0 0 0 0 0 0 3 3 0 0 0 0 0 0 0 8 8 0 0 1
  1 0 0 8 8 0 0 0 0 0 3 3 3 0 0 0 0 0 0 0 8 8 0 0 1
  1 0 0 8 8 0 0 1 0 0 3 0 0 0 0 1 0 0 0 0 0 0 0 0 1
  1 0 0 0 0 0 0 0 0 0 3 0 0 0 0 0 0 0 0 0 0 0 0 0 1
  1 0 0 0 0 0 0 0 0 3 3 0 0 0 0 0 0 0 0 0 1 1 0 0 1
  1 0 0 1 1 0 0 0 0 3 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1
  1 0 0 0 0 0 0 0 3 3 0 0 7 7 0 0 0 0 0 0 0 0 0 3 6
  1 0 0 0 0 0 0 0 3 0 0 0 7 7 0 0 0 0 0 0 0 0 0 3 6
  1 0 0 0 0 0 0 0 3 3 0 0 0 0 0 0 0 0 0 1 0 0 0 0 1
  1 0 0 0 0 0 0 0 0 3 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1
  1 0 0 7 7 0 0 0 0 3 3 0 0 0 0 0 0 0 0 0 0 0 0 0 1
  1 0 0 7 7 0 0 1 0 0 3 0 0 1 1 0 0 0 0 8 8 0 0 0 1
  1 0 0 0 0 0 0 0 0 0 3 0 0 0 0 0 0 0 0 8 8 0 0 0 1
  1 0 0 0 0 0 0 0 0 0 3 3 3 0 0 0 0 0 0 0 0 0 0 0 1
  1 0 0 0 0 0 0 0 0 0 0 3 3 0 0 0 0 0 0 0 0 0 0 0 1
  1 1 1 1 1 1 1 1 1 1 1 6 6 1 1 1 1 1 1 1 1 1 1 1 1
`);

// ┌─────────────────────────────────────────────────────────┐
// │  REGIÃO 3 — SILVERWIND COAST  (Cerulean / Sea Route)   │
// │  Costa com muita água, pontes e caminhos de areia       │
// │  Portal oeste → Ironforge  |  Portal leste → Shadowmere│
// └─────────────────────────────────────────────────────────┘
const _silverwindData = _parseMap(`
  4 4 4 4 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 4 4 4 4 4 4
  4 0 0 0 2 2 2 2 2 2 2 2 2 2 2 2 2 2 0 0 0 0 0 0 4
  4 0 0 0 0 0 2 2 2 2 2 2 2 2 2 2 0 0 0 0 0 7 7 0 4
  4 0 7 7 0 0 0 2 2 2 2 2 2 2 2 0 0 0 0 0 0 7 7 0 4
  4 0 7 7 0 0 0 0 2 2 2 3 3 2 2 0 0 0 0 0 0 0 0 0 4
  6 3 0 0 0 0 0 0 0 2 3 3 3 3 0 0 0 0 0 0 0 0 0 0 4
  6 3 0 0 0 0 0 0 0 0 3 0 0 3 0 0 0 4 0 0 0 0 0 0 4
  4 0 0 0 0 4 0 0 0 0 3 0 0 3 0 0 0 0 0 0 0 0 0 0 4
  4 0 0 0 0 0 0 0 3 3 3 0 0 3 3 3 0 0 0 0 0 0 0 0 4
  3 3 3 3 3 3 3 3 3 0 0 0 0 0 0 3 3 3 3 3 3 3 3 3 3
  4 0 0 0 0 0 0 0 3 3 0 0 0 0 3 3 0 0 0 0 0 0 0 0 4
  4 0 0 0 0 0 0 0 0 3 0 0 0 0 3 0 0 0 4 0 0 0 0 3 6
  4 0 0 7 7 0 0 0 0 3 3 3 3 3 3 0 0 0 0 0 0 0 0 3 6
  4 0 0 7 7 0 0 4 0 0 0 0 0 0 0 0 0 0 0 7 7 0 0 0 4
  4 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 7 7 0 0 0 4
  4 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 4
  4 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 4
  4 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 4
`);

// ┌─────────────────────────────────────────────────────────┐
// │  REGIÃO 4 — SHADOWMERE RUINS  (Lavender Town)          │
// │  Ruínas antigas e sombrias com espectros                │
// │  Portal oeste → Silverwind  |  Portal norte → Torn Veil│
// └─────────────────────────────────────────────────────────┘
const _shadowmereData = _parseMap(`
  1 1 1 1 1 1 1 1 1 1 1 6 6 1 1 1 1 1 1 1 1 1 1 1 1
  1 0 0 0 0 0 5 5 0 0 0 3 3 0 0 0 5 5 0 0 0 0 0 0 1
  1 0 0 0 0 0 5 5 0 0 0 3 3 0 0 0 5 5 0 0 0 0 0 0 1
  1 0 0 5 5 0 0 0 0 0 3 3 3 3 0 0 0 0 0 5 5 0 0 0 1
  1 0 0 5 5 0 0 0 0 0 3 0 0 3 0 0 0 0 0 5 5 0 0 0 1
  6 3 0 0 0 0 0 0 0 0 3 0 0 3 0 0 0 0 0 0 0 0 0 0 1
  6 3 0 0 0 0 0 0 0 3 3 0 0 3 3 0 0 0 0 0 0 0 0 0 1
  1 0 0 0 1 0 0 0 0 3 0 0 0 0 3 0 0 0 0 1 0 0 0 0 1
  1 0 0 0 0 0 0 0 3 3 0 0 0 0 3 3 0 0 0 0 0 0 0 0 1
  3 3 3 3 3 3 3 3 3 0 0 7 7 0 0 3 3 3 3 3 3 3 3 3 3
  1 0 0 0 0 0 0 0 3 3 0 7 7 0 3 3 0 0 0 0 0 0 0 0 1
  1 0 0 0 0 0 0 0 0 3 0 0 0 0 3 0 0 0 0 0 0 0 0 0 1
  1 0 0 5 5 5 0 0 0 3 3 3 3 3 3 0 0 0 5 5 5 0 0 0 1
  1 0 0 5 5 5 0 0 0 0 0 3 3 0 0 0 0 0 5 5 5 0 0 0 1
  1 0 0 5 5 5 0 0 0 0 0 3 3 0 0 0 0 0 5 5 5 0 0 0 1
  1 0 0 0 0 0 0 0 0 0 0 3 3 0 0 0 0 0 0 0 0 0 0 0 1
  1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1
  1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
`);

// ┌─────────────────────────────────────────────────────────┐
// │  REGIÃO 5 — TORN VEIL  (Victory Road / Indigo Plateau) │
// │  Terreno vulcânico final com lava e dungeons            │
// │  Portal sul → Shadowmere Ruins                          │
// └─────────────────────────────────────────────────────────┘
const _tornVeilData = _parseMap(`
  1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
  1 9 9 0 0 0 1 9 9 9 0 0 0 0 9 9 9 1 0 0 0 9 9 9 1
  1 9 0 0 0 0 0 9 9 0 0 0 0 0 0 9 0 0 0 0 0 0 9 9 1
  1 0 0 8 8 0 0 0 0 0 3 3 3 0 0 0 0 0 8 8 0 0 0 0 1
  1 0 0 8 8 0 0 1 0 0 3 0 0 0 0 1 0 0 8 8 0 0 0 0 1
  1 0 0 0 0 0 0 0 0 0 3 0 0 0 0 0 0 0 0 0 0 0 0 0 1
  1 9 0 0 0 0 0 0 0 3 3 0 0 3 3 0 0 0 0 0 0 0 9 0 1
  1 9 9 0 1 0 0 0 0 3 0 0 0 0 3 0 0 0 1 0 0 9 9 0 1
  1 0 0 0 0 0 0 0 3 3 0 0 0 0 3 3 0 0 0 0 0 0 0 0 1
  3 3 3 3 3 3 3 3 3 0 0 7 7 0 0 3 3 3 3 3 3 3 3 3 3
  1 0 0 0 0 0 0 0 3 3 0 7 7 0 3 3 0 0 0 0 0 0 0 0 1
  1 9 0 0 0 0 0 0 0 3 0 0 0 0 3 0 0 0 0 0 0 0 9 0 1
  1 9 9 0 0 0 0 0 0 3 3 3 3 3 3 0 0 0 0 0 0 9 9 0 1
  1 0 0 0 0 0 0 1 0 0 0 3 3 0 0 0 1 0 0 0 0 0 0 0 1
  1 0 0 0 0 0 0 0 0 0 0 3 3 0 0 0 0 0 0 0 0 0 0 0 1
  1 9 9 0 0 0 9 0 0 0 0 3 3 0 0 0 0 9 0 0 0 9 9 0 1
  1 9 9 9 0 0 9 9 0 0 0 3 3 0 0 0 9 9 0 0 9 9 9 0 1
  1 1 1 1 1 1 1 1 1 1 1 6 6 1 1 1 1 1 1 1 1 1 1 1 1
`);

// ═══════════════════════════════════════════════════════════
// DEFINIÇÃO DOS MAPAS
// ═══════════════════════════════════════════════════════════
const MAPS = {
  // ── Região 1: Oakvale Hollow ──────────────────────────────
  oakvale: {
    name: 'Oakvale Hollow',
    w: 25, h: 18,
    data: _oakvaleData,
    palette: 'forest',
    spawn: { x: 12, y: 8 },
    encRate: 0,
    encZones: [],
    portals: [
      { tx: 11, ty: 0, to: 'ironforge', spawnX: 12, spawnY: 16 },
      { tx: 12, ty: 0, to: 'ironforge', spawnX: 12, spawnY: 16 }
    ],
    npcs: [
      { tx: 12, ty: 4,  npcId: 'npc_oak_1' },
      { tx: 18, ty: 13, npcId: 'npc_oak_2' }
    ]
  },

  // ── Região 2: Ironforge Depths ────────────────────────────
  ironforge: {
    name: 'Ironforge Depths',
    w: 25, h: 18,
    data: _ironforgeData,
    palette: 'mountain',
    spawn: { x: 12, y: 16 },
    encRate: 0.004,
    encZones: [
      { x1: 1, y1: 1, x2: 8,  y2: 8  },
      { x1: 14,y1: 1, x2: 23, y2: 8  },
      { x1: 1, y1: 10,x2: 8,  y2: 16 },
      { x1: 14,y1: 10,x2: 23, y2: 16 }
    ],
    portals: [
      { tx: 11, ty: 17, to: 'oakvale',    spawnX: 12, spawnY: 1 },
      { tx: 12, ty: 17, to: 'oakvale',    spawnX: 12, spawnY: 1 },
      { tx: 24, ty: 8,  to: 'silverwind', spawnX: 1,  spawnY: 6 },
      { tx: 24, ty: 9,  to: 'silverwind', spawnX: 1,  spawnY: 6 }
    ],
    npcs: [
      { tx: 5,  ty: 5,  npcId: 'npc_iron_1' },
      { tx: 15, ty: 11, npcId: 'npc_iron_2' }
    ]
  },

  // ── Região 3: Silverwind Coast ────────────────────────────
  silverwind: {
    name: 'Silverwind Coast',
    w: 25, h: 18,
    data: _silverwindData,
    palette: 'coastal',
    spawn: { x: 1, y: 6 },
    encRate: 0.004,
    encZones: [
      { x1: 1, y1: 5, x2: 8,  y2: 9  },
      { x1: 14,y1: 5, x2: 23, y2: 9  },
      { x1: 1, y1: 10,x2: 8,  y2: 15 },
      { x1: 14,y1: 10,x2: 23, y2: 15 }
    ],
    portals: [
      { tx: 0, ty: 5,  to: 'ironforge',  spawnX: 23, spawnY: 9 },
      { tx: 0, ty: 6,  to: 'ironforge',  spawnX: 23, spawnY: 9 },
      { tx: 24,ty: 11, to: 'shadowmere', spawnX: 1,  spawnY: 6 },
      { tx: 24,ty: 12, to: 'shadowmere', spawnX: 1,  spawnY: 6 }
    ],
    npcs: [
      { tx: 5,  ty: 8,  npcId: 'npc_silver_1' },
      { tx: 18, ty: 6,  npcId: 'npc_silver_2' }
    ]
  },

  // ── Região 4: Shadowmere Ruins ────────────────────────────
  shadowmere: {
    name: 'Shadowmere Ruins',
    w: 25, h: 18,
    data: _shadowmereData,
    palette: 'ruins',
    spawn: { x: 1, y: 6 },
    encRate: 0.005,
    encZones: [
      { x1: 1, y1: 1, x2: 9,  y2: 8  },
      { x1: 14,y1: 1, x2: 23, y2: 8  },
      { x1: 1, y1: 10,x2: 9,  y2: 16 },
      { x1: 14,y1: 10,x2: 23, y2: 16 }
    ],
    portals: [
      { tx: 0,  ty: 5,  to: 'silverwind', spawnX: 23, spawnY: 12 },
      { tx: 0,  ty: 6,  to: 'silverwind', spawnX: 23, spawnY: 12 },
      { tx: 11, ty: 0,  to: 'torn_veil',  spawnX: 12, spawnY: 16 },
      { tx: 12, ty: 0,  to: 'torn_veil',  spawnX: 12, spawnY: 16 }
    ],
    npcs: [
      { tx: 5,  ty: 7,  npcId: 'npc_shadow_1' },
      { tx: 18, ty: 4,  npcId: 'npc_shadow_2' }
    ]
  },

  // ── Região 5: Torn Veil ───────────────────────────────────
  torn_veil: {
    name: 'Torn Veil',
    w: 25, h: 18,
    data: _tornVeilData,
    palette: 'volcanic',
    spawn: { x: 12, y: 16 },
    encRate: 0.006,
    encZones: [
      { x1: 1, y1: 1, x2: 9,  y2: 8  },
      { x1: 14,y1: 1, x2: 23, y2: 8  },
      { x1: 1, y1: 10,x2: 9,  y2: 16 },
      { x1: 14,y1: 10,x2: 23, y2: 16 }
    ],
    portals: [
      { tx: 11, ty: 17, to: 'shadowmere', spawnX: 12, spawnY: 1 },
      { tx: 12, ty: 17, to: 'shadowmere', spawnX: 12, spawnY: 1 }
    ],
    npcs: [
      { tx: 5,  ty: 5,  npcId: 'npc_torn_1' },
      { tx: 18, ty: 11, npcId: 'npc_torn_2' }
    ]
  }
};

// ═══════════════════════════════════════════════════════════
// WORLD STATE — objecto principal consultado pelo renderer
// ═══════════════════════════════════════════════════════════
const World = {
  currentRegion: 'oakvale',
  get region()  { return MAPS[this.currentRegion]; },
  get enemies() { return REGION_ENEMIES[this.currentRegion]; },
  get npcs()    { return REGION_NPCS[this.currentRegion]; },
  get palette() { return TILE_PALETTES[MAPS[this.currentRegion].palette]; },
};
window.World = World;

// ═══════════════════════════════════════════════════════════
// GETTERS USADOS PELO RENDERER  (corrigido — NÃO aninhados)
// ═══════════════════════════════════════════════════════════
function getMapData() { return World.region.data; }
function getMapW()    { return World.region.w; }
function getMapH()    { return World.region.h; }

function getEncRate() {
  return Math.min(World.region.encRate, 0.006);
}

function getEncZones() {
  return World.region.encZones;
}

function getPortals() {
  return World.region.portals;
}

function getTileColor(t, tx, ty) {
  const pal = World.palette;
  const cols = pal[t] || pal[T.GRASS] || ['#1e3218','#243b1e'];
  const hash = Math.floor(Math.abs(Math.sin(tx * 12.9898 + ty * 78.233) * 43758.5453));
  return cols[hash % cols.length];
}

function getNpcPositions() {
  const region  = World.region;
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

// Exports globais para game.js e battle.js
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

// ═══════════════════════════════════════════════════════════
// TRANSIÇÃO DE REGIÃO
// ═══════════════════════════════════════════════════════════
function transitionToRegion(regionId, spawnX, spawnY) {
  const S = window.S;
  const fade = document.getElementById('fade');

  // Garantir que não entra em batalha durante a transição
  S.inBattle  = false;
  S.dialogNpc = null;
  S.qCache    = []; // limpa cache — nova região, novos inimigos

  fade.style.opacity = '1';
  setTimeout(() => {
    World.currentRegion = regionId;
    const region = World.region;
    S.px = spawnX * 32;
    S.py = spawnY * 32;
    S.cooldown = 3;

    const loc = document.getElementById('location');
    document.getElementById('regionText').textContent = region.name;
    loc.textContent = region.name;
    loc.style.opacity = '1';
    setTimeout(() => { loc.style.opacity = '0'; }, 3000);
    setTimeout(() => { fade.style.opacity = '0'; }, 100);

    window.updateHud && window.updateHud(); // ← actualiza HUD com nova região

    window.genQuestion && window.genQuestion()
      .then(q => S.qCache.push(q)).catch(() => {});
  }, 400);
}
window.transitionToRegion = transitionToRegion;

// ═══════════════════════════════════════════════════════════
// VERIFICAR PORTAL
// ═══════════════════════════════════════════════════════════
function checkPortal(px, py) {
  const S = window.S;
  if (S.cooldown > 0) return false; // guarda extra

  const tx = Math.floor(px / 32);
  const ty = Math.floor(py / 32);
  const portal = getPortals().find(p => p.tx === tx && (p.ty === ty || p.ty === ty + 1));
  if (portal) {
    S.cooldown = 3; // ← reset explícito antes da transição
    transitionToRegion(portal.to, portal.spawnX, portal.spawnY);
    return true;
  }
  return false;
}
window.checkPortal = checkPortal;
