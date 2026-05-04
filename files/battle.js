// ═══════════════════════════════════════════════════════════
// SCHOLAR STRIKE — battle.js  (AI quiz + RPG battle)
// ═══════════════════════════════════════════════════════════
'use strict';

// Fallback de inimigos caso world.js não esteja carregado
const ENEMIES_DATA = [
  { name:'Golem do Esquecimento', emoji:'🪨', sprite:'battle_assets/golem_esquecimento.png', hp:30, atk:8,  xp:25, def:2 },
  { name:'Dragão do Vazio',       emoji:'🐉', hp:50, atk:12, xp:40, def:4 },
  { name:'Espectro do Erro',      emoji:'👻', sprite:'battle_assets/espectro_erro.png', hp:25, atk:10, xp:30, def:1 },
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

// ── ESCALA DE DIFICULDADE ──────────────────────────────────
/**
 * Retorna um objecto { level:1-5, label, descriptor } com base no nível
 * do jogador e nos stats do inimigo actual.
 *
 * Tier  Player level  Enemy XP   Label        Prompt descriptor
 * 1     1-2           <30        Iniciante    very basic, single-fact recall
 * 2     3-4           30-44      Aprendiz     recall + simple application
 * 3     5-7           45-59      Intermédio   application + some analysis
 * 4     8-10          60-79      Avançado     analysis + evaluation
 * 5     11+           80+        Mestre       synthesis, edge-cases, expert nuance
 */
function getDifficultyLabel(S) {
  const lv  = S.level || 1;
  const xp  = S.enemy ? (S.enemy.xp || 0) : 0;

  let tier;
  // Fix #12: tier determinado principalmente pelo nível do jogador; XP do inimigo apenas ajusta ±1 tier
  if      (lv <= 2)  tier = (xp >= 45) ? 2 : 1;
  else if (lv <= 4)  tier = (xp >= 60) ? 3 : 2;
  else if (lv <= 7)  tier = (xp >= 80) ? 4 : 3;
  else if (lv <= 10) tier = (xp >= 100) ? 5 : 4;
  else               tier = 5;

  const TIERS = [
    null,
    { label: 'Iniciante ⭐',    descriptor: 'very basic — single-fact recall, straightforward wording, obvious distractors' },
    { label: 'Aprendiz ⭐⭐',   descriptor: 'beginner — recall plus simple application, one plausible wrong answer' },
    { label: 'Intermédio ⭐⭐⭐', descriptor: 'intermediate — application and light analysis, two plausible wrong answers' },
    { label: 'Avançado ⭐⭐⭐⭐', descriptor: 'advanced — analysis and evaluation, three plausible wrong answers with subtle differences' },
    { label: 'Mestre ⭐⭐⭐⭐⭐',  descriptor: 'expert / master — synthesis, nuanced edge-cases, all four options highly plausible' },
  ];
  return { level: tier, ...TIERS[tier] };
}
window.getDifficultyLabel = getDifficultyLabel;

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

  // Compute difficulty for this fight (re-evaluated on level-up via doLevelUp)
  S.difficulty = getDifficultyLabel(S);

  document.getElementById('battleEnemyName').textContent  = e.name;

  // Render enemy sprite: use image if available, fallback to emoji
  const enemySpriteEl = document.getElementById('enemySprite');
  if (e.sprite) {
    enemySpriteEl.innerHTML = `<img src="${e.sprite}" alt="${e.name}" class="enemy-sprite-img">`;
    enemySpriteEl.classList.add('has-img');
  } else {
    enemySpriteEl.textContent = e.emoji;
    enemySpriteEl.classList.remove('has-img');
  }

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
  const log = document.getElementById('battleLog');
  const screen = document.getElementById('battleScreen');
  log.innerHTML = html;
  log.classList.remove('hidden');
  screen.classList.add('showing-log');
}

// ── GERAÇÃO DE PERGUNTAS COM IA (Claude) ───────────────────
async function genQuestion() {
  const S = window.S;

  // ── Guardar se há chave API ────────────────────────────────
  const apiKey = (window.ANTHROPIC_API_KEY || '').trim();
  if (!apiKey) {
    throw Object.assign(new Error('Chave API não configurada'), { code: 'NO_KEY' });
  }

  const hasStudyMaterial = S.studyText && S.studyText.length > 60;
  const subject = S.disc ? S.disc.subject : 'conhecimento geral';

  // ── Difficulty context ─────────────────────────────────────
  const diff = (S.difficulty && S.difficulty.descriptor)
    ? S.difficulty
    : getDifficultyLabel(S);
  const diffLine = `Dificuldade da pergunta (OBRIGATÓRIO): ${diff.descriptor}.`;

  let prompt;

  if (hasStudyMaterial) {
    // Excerto aleatório para cobrir partes diferentes do documento em cada pergunta
    const maxStart = Math.max(0, S.studyText.length - 2500);
    const start    = Math.floor(Math.random() * maxStart);
    const excerpt  = S.studyText.slice(start, start + 2500);

    prompt = `És um professor a criar perguntas de escolha múltipla para um jogo RPG educativo em português europeu.

O aluno carregou o seguinte material de estudo. A tua pergunta DEVE ser baseada EXCLUSIVAMENTE neste conteúdo:
"""
${excerpt}
"""

${diffLine}

REGRAS OBRIGATÓRIAS:
- A pergunta tem de ser sobre algo explicitamente mencionado no texto acima
- Usa a terminologia e os conceitos do próprio texto
- NÃO inventes informação que não esteja no texto
- Ajusta o grau de dificuldade conforme a instrução acima
- Escreve em português europeu

Responde APENAS com este JSON (sem markdown, sem texto extra):
{"question":"pergunta baseada no texto","options":["opção A","opção B","opção C","opção D"],"correct":0,"explanation":"explicação com referência ao texto"}

"correct" é o índice 0-3 da resposta correcta.`;
  } else {
    prompt = `És um professor a criar perguntas de escolha múltipla para um jogo RPG educativo em português europeu.

Tema: ${subject}
${diffLine}

Cria 1 pergunta educativa e interessante com 4 opções (apenas 1 correcta).
Ajusta o vocabulário, a profundidade conceptual e a plausibilidade dos distratores conforme a dificuldade indicada.

Responde APENAS com este JSON (sem markdown):
{"question":"pergunta","options":["opção A","opção B","opção C","opção D"],"correct":0,"explanation":"explicação"}

"correct" é o índice 0-3 da resposta correcta.`;
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-5',
      max_tokens: 700,
      messages:   [{ role:'user', content:prompt }],
    }),
  });

  if (res.status === 401) {
    throw Object.assign(new Error('Chave API inválida ou expirada'), { code: 'BAD_KEY' });
  }
  if (!res.ok) throw new Error('Erro API: ' + res.status);

  const data = await res.json();
  const rawText = data.content.map(b => b.text || '').join('');

  // Extração robusta de JSON — apanha o primeiro objecto {...} completo
  const m = rawText.match(/\{[\s\S]*?"correct"\s*:\s*\d[\s\S]*?\}/);
  if (!m) throw new Error('Resposta da IA não contém JSON válido');
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
  document.getElementById('battleLog').classList.add('hidden');
  document.getElementById('battleScreen').classList.remove('showing-log');
  ld.classList.remove('hidden');

  // Indicar se usa material ou disciplina + badge de dificuldade
  const hasStudy = S.studyText && S.studyText.length > 60;
  const diff     = S.difficulty || getDifficultyLabel(S);
  const diffBadge = `<span class="diff-badge diff-tier-${diff.level}" title="Dificuldade: ${diff.label}">${diff.label}</span>`;
  if (hasStudy) {
    qs.innerHTML = `📚 ${S.studyFile || 'Material carregado'} ✦ PERGUNTA #${S.qCount + 1} ${diffBadge}`;
  } else {
    qs.innerHTML = `${(S.disc?.name || 'Geral').toUpperCase()} ✦ PERGUNTA #${S.qCount + 1} ${diffBadge}`;
  }

  try {
    let q;
    if (S.qCache.length > 0) {
      q = S.qCache.shift();
    } else {
      q = await genQuestion();
    }

    // Pré-carregar a próxima pergunta em segundo plano
    genQuestion().then(nq => S.qCache.push(nq)).catch(() => {});

    S.curQ = q;
    S.qCount++;

    ld.classList.add('hidden');
    qt.textContent   = q.question;
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
    if (err.code === 'NO_KEY') {
      qs.innerHTML = '⚠️ Sem chave API — <span style="font-size:12px;color:#bbb">configura em Seleção de Herói</span>';
    } else if (err.code === 'BAD_KEY') {
      qs.innerHTML = '🚫 Chave API inválida — <span style="font-size:12px;color:#bbb">verifica a tua chave sk-ant-...</span>';
    }
    useFallback();
  }
}

// ── FALLBACK (sem ligação à API) ───────────────────────────
// Fix #17: perguntas específicas por disciplina em vez de fixas genéricas
function useFallback() {
  const S = window.S;
  const allFallbacks = {
    arithmancer: [
      { question:'Quanto é 15²?', options:['115','225','155','205'], correct:1, explanation:'15² = 225.' },
      { question:'Qual é o resultado de √144?', options:['11','12','13','14'], correct:1, explanation:'√144 = 12.' },
      { question:'Quantos lados tem um hexágono?', options:['5','6','7','8'], correct:1, explanation:'Hexágono vem do grego "hex" (seis).' },
      { question:'Qual é o valor de π (pi) arredondado a 2 casas?', options:['3,12','3,14','3,16','3,18'], correct:1, explanation:'π ≈ 3,14159...' },
    ],
    bioshaman: [
      { question:'Qual é a unidade básica da vida?', options:['Átomo','Célula','Molécula','Órgão'], correct:1, explanation:'A célula é a unidade estrutural e funcional de todos os seres vivos.' },
      { question:'Qual é o maior órgão do corpo humano?', options:['Fígado','Pulmão','Pele','Coração'], correct:2, explanation:'A pele é o maior órgão do corpo humano.' },
      { question:'Qual o papel da clorofila nas plantas?', options:['Digestão','Fotosíntese','Reprodução','Respiração'], correct:1, explanation:'A clorofila capta luz para a fotosíntese.' },
      { question:'Quantos cromossomas tem uma célula humana normal?', options:['23','44','46','48'], correct:2, explanation:'As células humanas têm 46 cromossomas (23 pares).' },
    ],
    wordweaver: [
      { question:'Quem escreveu "Os Lusíadas"?', options:['Eça de Queirós','Fernando Pessoa','Camões','Saramago'], correct:2, explanation:'Luís de Camões publicou Os Lusíadas em 1572.' },
      { question:'Quantas vogais tem o alfabeto português?', options:['4','5','6','7'], correct:1, explanation:'O alfabeto português tem 5 vogais: a, e, i, o, u.' },
      { question:'Qual é a figura de estilo em "o mar sorriu"?', options:['Metáfora','Personificação','Hipérbole','Aliteração'], correct:1, explanation:'Atribuir ação humana a elemento inanimado é personificação.' },
      { question:'O que é um pleonasmo?', options:['Rima interna','Repetição redundante','Sílaba tónica','Figura de som'], correct:1, explanation:'Pleonasmo é a repetição de uma ideia já expressa (ex: "subir para cima").' },
    ],
    sophist: [
      { question:'Quem é considerado o pai da filosofia ocidental?', options:['Platão','Aristóteles','Sócrates','Tales'], correct:2, explanation:'Sócrates é frequentemente considerado o pai da filosofia ocidental.' },
      { question:'Qual é a máxima de Descartes?', options:['"O homem é o lobo do homem"','"Cogito, ergo sum"','"A vida não examinada não vale a pena"','"O ser é"'], correct:1, explanation:'Descartes: "Penso, logo existo" (Cogito, ergo sum).' },
      { question:'O que estuda a Epistemologia?', options:['O belo','O conhecimento','A moral','A existência'], correct:1, explanation:'Epistemologia estuda a natureza, origens e limites do conhecimento.' },
      { question:'Qual é o princípio da não-contradição em lógica?', options:['Algo pode ser e não ser ao mesmo tempo','Nada pode ser e não ser ao mesmo tempo','Toda proposição é verdadeira','Toda proposição é falsa'], correct:1, explanation:'Aristóteles: uma coisa não pode ser e não ser ao mesmo tempo e sob o mesmo aspeto.' },
    ],
  };
  const discId = S.disc ? S.disc.id : null;
  const pool = (discId && allFallbacks[discId])
    ? allFallbacks[discId]
    : [
        { question:'Qual é a capital de Portugal?', options:['Lisboa','Porto','Coimbra','Braga'], correct:0, explanation:'Lisboa é a capital de Portugal desde 1255.' },
        { question:'Qual o símbolo químico do ouro?', options:['Or','Go','Au','Ag'], correct:2, explanation:'Au vem do latim "aurum".' },
        { question:'Qual o maior planeta do sistema solar?', options:['Saturno','Neptuno','Júpiter','Urano'], correct:2, explanation:'Júpiter tem mais massa que todos os outros planetas juntos.' },
      ];

  const q = pool[Math.floor(Math.random() * pool.length)];
  S.curQ = q; S.qCount++;

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
  setTimeout(() => {
    if (S.xp >= S.xpNext) {
      doLevelUp();
    } else if (window.World && window.World.currentRegion === 'torn_veil') {
      showGameComplete(); // Fix #16: zona final — mostrar ecrã de conclusão
    } else {
      endBattle();
    }
  }, 2000);
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
  S.cooldown = 2; // Fix #10: previne batalha imediata ao regressar ao mapa
  window.updateHud && window.updateHud();
  window.showScreen('gameScreen');
  document.getElementById('gameScreen').style.display = '';
}

// ── JOGO COMPLETO ─────────────────────────────────────────
function showGameComplete() {
  const S = window.S;
  S.inBattle = false;
  S.enemy    = null;
  const statsEl = document.getElementById('completeStats');
  if (statsEl) {
    statsEl.innerHTML =
      `<div class="stat-gain">🎓 Herói: ${S.heroName}</div>
       <div class="stat-gain">⚔️ Nível atingido: ${S.level}</div>
       <div class="stat-gain">✨ XP acumulado: ${S.xp}</div>
       <div class="stat-gain">❤️ HP final: ${S.hp}/${S.maxHp}</div>`;
  }
  const scr = document.getElementById('gameCompleteScreen');
  if (scr) scr.classList.remove('hidden');
  document.getElementById('battleScreen').classList.add('hidden');
  const gameMenu = document.getElementById('gameMenu');
  if (gameMenu) gameMenu.classList.add('hidden');
}
window.showGameComplete = showGameComplete;

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

  // Re-compute difficulty after levelling up so remaining battle questions scale
  S.difficulty = getDifficultyLabel(S);

  document.getElementById('levelUpMsg').textContent = `Alcançaste o Nível ${S.level}!`;
  document.getElementById('levelUpStats').innerHTML =
    `<div class="stat-gain">❤️ +${hg} HP Máximo</div>
     <div class="stat-gain">💧 +${mg} MP Máximo</div>
     <div class="stat-gain">⚔️ +${ag} Ataque</div>
     <div class="stat-gain">🛡️ +${dg} Defesa</div>
     <div class="stat-gain diff-tier-${S.difficulty.level}">📊 Dificuldade → ${S.difficulty.label}</div>`;

  // Clear question cache — difficulty changed, stale questions may be too easy
  S.qCache = [];

  document.getElementById('levelUpScreen').classList.remove('hidden');
  document.getElementById('battleScreen').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  // Fix #3: encadear level-ups em caso de XP overflow
  document.getElementById('levelUpOkBtn').addEventListener('click', () => {
    document.getElementById('levelUpScreen').classList.add('hidden');
    const S = window.S;
    if (S && S.xp >= S.xpNext) {
      doLevelUp(); // encadear próximo level-up
    } else {
      // Fix #16: após level-up no torn_veil, mostrar conclusão se inimigo já estava morto
      if (window.World && window.World.currentRegion === 'torn_veil' && S && !S.inBattle) {
        showGameComplete();
      } else {
        endBattle();
      }
    }
  });

  // Ligar botão de conclusão do jogo
  const completeBtn = document.getElementById('completeOkBtn');
  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      const scr = document.getElementById('gameCompleteScreen');
      if (scr) scr.classList.add('hidden');
      if (window.stopWorld) window.stopWorld();
      if (window.showScreen) window.showScreen('homeScreen');
    });
  }
});
