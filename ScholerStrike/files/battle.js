// ═══════════════════════════════════════════════════════════
// SCHOLAR STRIKE — battle.js  (AI quiz + RPG battle)
// ═══════════════════════════════════════════════════════════
'use strict';

// Fallback de inimigos caso world.js não esteja carregado
const ENEMIES_DATA = [
  { name:'Golem do Esquecimento', emoji:'🪨', hp:30, atk:8,  xp:25, def:2 },
  { name:'Dragão do Vazio',       emoji:'🐉', hp:50, atk:12, xp:40, def:4 },
  { name:'Espectro do Erro',      emoji:'👻', hp:25, atk:10, xp:30, def:1 },
  { name:'Titã da Ignorância',    emoji:'👹', hp:70, atk:15, xp:60, def:5 },
  { name:'Sombra do Tempo',       emoji:'🌑', hp:40, atk:11, xp:35, def:3 },
];

// ── BARRAS DE BATALHA ──────────────────────────────────────
function updateBattleBars() {
  const S = window.S;
  const pp = (S.hp / S.maxHp * 100).toFixed(1);
  const ep = Math.max(0, S.enemyHp / S.enemy.hp * 100).toFixed(1);
  document.getElementById('playerHpBar').style.width = pp + '%';
  document.getElementById('enemyHpBar').style.width  = ep + '%';
  document.getElementById('playerHpVal').textContent = `${S.hp}/${S.maxHp}`;
  document.getElementById('enemyHpVal').textContent  = `${Math.max(0,S.enemyHp)}/${S.enemy.hp}`;
  window.updateHud && window.updateHud();
}

// ── INICIAR BATALHA ────────────────────────────────────────
function startBattle() {
  const S = window.S;
  S.cooldown = 15;
  S.inBattle = true;
  S.qCount   = 0;

  const e = window.getRandomEnemy
    ? window.getRandomEnemy()
    : { ...ENEMIES_DATA[Math.floor(Math.random() * ENEMIES_DATA.length)] };
  S.enemy   = e;
  S.enemyHp = e.hp;

  document.getElementById('battleEnemyName').textContent  = e.name;
  document.getElementById('enemySprite').textContent      = e.emoji;
  document.getElementById('playerSprite').textContent     = S.hero ? _heroEmoji(S.hero.id) : '🧙';
  document.getElementById('battlePlayerName').textContent = S.heroName;

  updateBattleBars();
  setLog(`<span class="blog-info">⚔ ${e.name} aparece! Responde correctamente para atacar!</span>`);
  window.showScreen('battleScreen');
  loadNextQuestion();
}
window.startBattle = startBattle;

function _heroEmoji(id) {
  const m = { h1:'⚔️',h2:'🪓',h3:'💀',h4:'🏹',h5:'🪖',h6:'🔮',h7:'🛡️',h8:'🐉',h9:'☀️' };
  return m[id] || '🧙';
}

function setLog(html) {
  document.getElementById('battleLog').innerHTML = html;
}

// ── GERAÇÃO DE PERGUNTAS COM IA ────────────────────────────
async function genQuestion() {
  const S = window.S;
  const hasStudyMaterial = S.studyText && S.studyText.length > 60;
  const subject = S.disc ? S.disc.subject : 'conhecimento geral';

  let prompt;

  if (hasStudyMaterial) {
    // Seleciona excerto aleatório para variar as perguntas ao longo do documento
    const maxStart = Math.max(0, S.studyText.length - 2500);
    const start    = Math.floor(Math.random() * maxStart);
    const excerpt  = S.studyText.slice(start, start + 2500);

    prompt = `És um professor a criar perguntas de escolha múltipla para um jogo RPG educativo em português europeu.

O aluno carregou o seguinte material de estudo. A tua pergunta DEVE ser baseada EXCLUSIVAMENTE neste conteúdo:
"""
${excerpt}
"""

REGRAS OBRIGATÓRIAS:
- A pergunta tem de ser sobre algo explicitamente mencionado no texto acima
- Usa a terminologia e os conceitos do próprio texto
- NÃO inventes informação que não esteja no texto
- As 4 opções devem ser plausíveis mas com apenas 1 correcta
- Escreve em português europeu

Responde APENAS com este JSON (sem markdown, sem texto extra):
{"question":"pergunta baseada no texto","options":["opção A","opção B","opção C","opção D"],"correct":0,"explanation":"explicação com referência ao texto"}

"correct" é o índice 0-3 da resposta correcta.`;
  } else {
    prompt = `És um professor a criar perguntas de escolha múltipla para um jogo RPG educativo em português europeu.

Tema: ${subject}

Cria 1 pergunta educativa e interessante com 4 opções (apenas 1 correcta).

Responde APENAS com este JSON (sem markdown):
{"question":"pergunta","options":["opção A","opção B","opção C","opção D"],"correct":0,"explanation":"explicação"}

"correct" é o índice 0-3 da resposta correcta.`;
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 700,
      messages:   [{ role:'user', content:prompt }],
    }),
  });

  if (!res.ok) throw new Error('API ' + res.status);
  const data = await res.json();
  const text = data.content.map(b => b.text || '').join('');
  const m    = text.match(/\{[\s\S]*?\}/);
  if (!m) throw new Error('no JSON');
  return JSON.parse(m[0]);
}
window.genQuestion = genQuestion;

// ── CARREGAR PRÓXIMA PERGUNTA ──────────────────────────────
async function loadNextQuestion() {
  const S   = window.S;
  const qt  = document.getElementById('questionText');
  const og  = document.getElementById('optionsGrid');
  const ld  = document.getElementById('aiLoading');
  const qs  = document.getElementById('questionSubject');

  qt.style.display = 'none';
  og.style.display = 'none';
  ld.classList.remove('hidden');

  // Indicar se usa material ou disciplina
  const hasStudy = S.studyText && S.studyText.length > 60;
  qs.textContent = hasStudy
    ? `📚 ${S.studyFile || 'Material carregado'} ✦ PERGUNTA #${S.qCount + 1}`
    : `${(S.disc?.name || 'Geral').toUpperCase()} ✦ PERGUNTA #${S.qCount + 1}`;

  try {
    let q;
    if (S.qCache.length > 0) {
      q = S.qCache.shift();
    } else {
      q = await genQuestion();
    }
    // Pré-carregar a próxima em background
    genQuestion().then(nq => S.qCache.push(nq)).catch(() => {});

    S.curQ = q;
    S.qCount++;

    ld.classList.add('hidden');
    qt.textContent  = q.question;
    qt.style.display = 'block';

    og.innerHTML = '';
    og.style.display = 'grid';
    ['A','B','C','D'].forEach((ltr, i) => {
      const btn = document.createElement('button');
      btn.className   = 'option-btn';
      btn.textContent = `${ltr}) ${q.options[i] || '?'}`;
      btn.addEventListener('click', () => handleAnswer(i, btn));
      og.appendChild(btn);
    });

  } catch (err) {
    console.error('genQuestion falhou:', err);
    ld.classList.add('hidden');
    useFallback();
  }
}

// ── FALLBACK (sem ligação à API) ───────────────────────────
function useFallback() {
  const S = window.S;
  const fallbacks = [
    { question:'Qual é a capital de Portugal?',           options:['Lisboa','Porto','Coimbra','Braga'],             correct:0, explanation:'Lisboa é a capital de Portugal desde 1255.' },
    { question:'Quantos lados tem um hexágono?',          options:['5','6','7','8'],                                correct:1, explanation:'Hexágono vem do grego "hex" (seis).' },
    { question:'Qual o maior planeta do sistema solar?',  options:['Saturno','Neptuno','Júpiter','Urano'],          correct:2, explanation:'Júpiter tem mais massa que todos os outros planetas juntos.' },
    { question:'Quem escreveu "Os Lusíadas"?',            options:['Eça de Queirós','Fernando Pessoa','Camões','Saramago'], correct:2, explanation:'Luís de Camões publicou Os Lusíadas em 1572.' },
    { question:'Qual o símbolo químico do ouro?',         options:['Or','Go','Au','Ag'],                            correct:2, explanation:'Au vem do latim "aurum".' },
  ];
  const q = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  S.curQ = q; S.qCount++;

  document.getElementById('questionSubject').textContent = 'PERGUNTA GERAL (sem ligação à API)';
  const qt = document.getElementById('questionText');
  const og = document.getElementById('optionsGrid');
  qt.textContent = q.question; qt.style.display = 'block';
  og.innerHTML = ''; og.style.display = 'grid';
  ['A','B','C','D'].forEach((ltr, i) => {
    const btn = document.createElement('button');
    btn.className   = 'option-btn';
    btn.textContent = `${ltr}) ${q.options[i]}`;
    btn.addEventListener('click', () => handleAnswer(i, btn));
    og.appendChild(btn);
  });
}

// ── RESPOSTA DO JOGADOR ────────────────────────────────────
function handleAnswer(idx, btn) {
  const S = window.S;
  const q = S.curQ;
  document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

  if (idx === q.correct) {
    btn.classList.add('correct');
    const dmg = S.atk + Math.floor(Math.random() * 8);
    S.enemyHp -= dmg;
    S.mp = Math.min(S.maxMp, S.mp + 2);
    setLog(`<span class="blog-def">✅ Correcto! ${q.explanation}</span><br><span class="blog-atk">⚔ ${S.heroName} causa ${dmg} de dano!</span>`);
  } else {
    document.querySelectorAll('.option-btn')[q.correct].classList.add('correct');
    btn.classList.add('wrong');
    const def  = S.def || 4;
    const raw  = S.enemy.atk + Math.floor(Math.random() * 6);
    const dmg  = Math.max(1, raw - def);
    S.hp = Math.max(0, S.hp - dmg);
    setLog(`<span class="blog-atk">❌ Errado! Resposta: ${'ABCD'[q.correct]}) ${q.options[q.correct]}</span><br><span class="blog-info">💥 ${S.enemy.name} causa ${dmg} de dano!</span>`);
  }

  updateBattleBars();

  setTimeout(() => {
    if (S.enemyHp <= 0)  victory();
    else if (S.hp <= 0)  defeat();
    else                 loadNextQuestion();
  }, 1900);
}

// ── VITÓRIA / DERROTA ──────────────────────────────────────
function victory() {
  const S  = window.S;
  const xg = S.enemy.xp;
  S.xp += xg;
  S.mp  = Math.min(S.maxMp, S.mp + 5);
  setLog(`<span class="blog-def">🏆 Vitória! ${S.enemy.name} derrotado!</span><br><span class="blog-info">✨ +${xg} XP ganhos!</span>`);
  setTimeout(() => { S.xp >= S.xpNext ? doLevelUp() : endBattle(); }, 2000);
}

function defeat() {
  const S = window.S;
  setLog(`<span class="blog-atk">💀 Foste derrotado... O conhecimento permanece contigo.</span>`);
  S.hp = Math.max(5, Math.floor(S.maxHp * 0.3));
  setTimeout(endBattle, 2500);
}

function endBattle() {
  const S = window.S;
  S.inBattle = false;
  S.enemy    = null;
  window.updateHud && window.updateHud();
  window.showScreen('gameScreen');
  document.getElementById('gameScreen').style.display = '';
}

// ── LEVEL UP ───────────────────────────────────────────────
function doLevelUp() {
  const S = window.S;
  S.level++;
  S.xp    -= S.xpNext;
  S.xpNext = Math.floor(S.xpNext * 1.4);
  const hg = 8  + Math.floor(Math.random() * 6);
  const mg = 3  + Math.floor(Math.random() * 4);
  const ag = 2  + Math.floor(Math.random() * 3);
  const dg = 1  + Math.floor(Math.random() * 2);
  S.maxHp += hg; S.hp = S.maxHp;
  S.maxMp += mg; S.mp = S.maxMp;
  S.atk   += ag;
  S.def   += dg;

  document.getElementById('levelUpMsg').textContent = `Alcançaste o Nível ${S.level}!`;
  document.getElementById('levelUpStats').innerHTML =
    `<div class="stat-gain">❤️ +${hg} HP Máximo</div>
     <div class="stat-gain">💧 +${mg} MP Máximo</div>
     <div class="stat-gain">⚔️ +${ag} Ataque</div>
     <div class="stat-gain">🛡️ +${dg} Defesa</div>`;

  document.getElementById('levelUpScreen').classList.remove('hidden');
  document.getElementById('battleScreen').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('levelUpOkBtn').addEventListener('click', () => {
    document.getElementById('levelUpScreen').classList.add('hidden');
    endBattle();
  });
});
