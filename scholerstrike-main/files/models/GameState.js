// ═══════════════════════════════════════════════════════════
// SCHOLAR STRIKE — models/GameState.js
// Estado global do jogo, constantes e definições de heróis/disciplinas
// ═══════════════════════════════════════════════════════════
'use strict';

const TILE   = 32;
const VIEW_W = 320;
const VIEW_H = 180;

const HEROES = [
  { id:'h1', name:'Cavaleira',        sub:'Guerreira de Armadura',  img:'h1', gender:'F' },
  { id:'h2', name:'Orc',              sub:'Berserker Orc',           img:'h2', gender:'M' },
  { id:'h3', name:'Necromante',       sub:'Mago Sombrio',            img:'h3', gender:'M' },
  { id:'h4', name:'Arqueira Élfica',  sub:'Ranger Élfica',           img:'h4', gender:'F' },
  { id:'h5', name:'Bárbaro',          sub:'Guerreiro do Norte',      img:'h5', gender:'M' },
  { id:'h6', name:'Feiticeira',       sub:'Maga Arcana',             img:'h6', gender:'F' },
  { id:'h7', name:'Paladina',         sub:'Guardiã Luminosa',        img:'h7', gender:'F' },
  { id:'h8', name:'Cavaleiro Dragão', sub:'Guerreiro Dracónico',     img:'h8', gender:'M' },
  { id:'h9', name:'Paladino Dourado', sub:'Campeão Sagrado',         img:'h9', gender:'M' },
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
  px:1*32, py:16*32, running:false,
  facingLeft:true,
  isMoving:false,
  inBattle:false, enemy:null, enemyHp:0,
  dialogNpc:null, dialogLine:0, nearNpc:null,
  qCache:[], curQ:null, qCount:0,
  cooldown:0,
};

// Exports globais
window.S           = S;
window.HEROES      = HEROES;
window.DISCIPLINES = DISCIPLINES;
window.TILE        = TILE;
window.VIEW_W      = VIEW_W;
window.VIEW_H      = VIEW_H;
