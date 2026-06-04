// ═══════════════════════════════════════════════════════════
// SCHOLAR STRIKE — models/BattleModel.js
// Dados e lógica pura de batalha (sem DOM/UI)
// ═══════════════════════════════════════════════════════════
'use strict';

// Fallback de inimigos caso world.js não esteja carregado
const ENEMIES_DATA = [
  { name:'Golem do Esquecimento', emoji:'🪨', sprite:'battle_assets/golem_esquecimento.png', hp:30, atk:8,  xp:25, def:2 },
  { name:'Dragão do Vazio',       emoji:'🐉', hp:50, atk:12, xp:40, def:4 },
  { name:'Espectro do Erro',      emoji:'👻', sprite:'battle_assets/espectro_erro.png',      hp:25, atk:10, xp:30, def:1 },
  { name:'Titã da Ignorância',    emoji:'👹', hp:70, atk:15, xp:60, def:5 },
  { name:'Sombra do Tempo',       emoji:'🌑', hp:40, atk:11, xp:35, def:3 },
];

// ── ESCALA DE DIFICULDADE ──────────────────────────────────
function getDifficultyLabel(S) {
  const lv = S.level || 1;
  const xp = S.enemy ? (S.enemy.xp || 0) : 0;

  let tier;
  if      (lv <= 2)  tier = (xp >= 45)  ? 2 : 1;
  else if (lv <= 4)  tier = (xp >= 60)  ? 3 : 2;
  else if (lv <= 7)  tier = (xp >= 80)  ? 4 : 3;
  else if (lv <= 10) tier = (xp >= 100) ? 5 : 4;
  else               tier = 5;

  const TIERS = [
    null,
    { label:'Iniciante ⭐',     descriptor:'very basic — single-fact recall, straightforward wording, obvious distractors' },
    { label:'Aprendiz ⭐⭐',    descriptor:'beginner — recall plus simple application, one plausible wrong answer' },
    { label:'Intermédio ⭐⭐⭐', descriptor:'intermediate — application and light analysis, two plausible wrong answers' },
    { label:'Avançado ⭐⭐⭐⭐', descriptor:'advanced — analysis and evaluation, three plausible wrong answers with subtle differences' },
    { label:'Mestre ⭐⭐⭐⭐⭐',  descriptor:'expert / master — synthesis, nuanced edge-cases, all four options highly plausible' },
  ];
  return { level:tier, ...TIERS[tier] };
}

window.getDifficultyLabel = getDifficultyLabel;
window.ENEMIES_DATA       = ENEMIES_DATA;
