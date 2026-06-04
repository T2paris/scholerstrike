// ═══════════════════════════════════════════════════════════
// SCHOLAR STRIKE — controllers/BattleController.js
// Fluxo de batalha: início, perguntas, respostas, vitória/derrota
// ═══════════════════════════════════════════════════════════
'use strict';

// Contador de respostas certas consecutivas
let _streak = 0;

// ── INICIAR BATALHA ────────────────────────────────────────
function startBattle() {
  const S  = window.S;
  S.cooldown = 15;
  S.inBattle = true;
  S.qCount   = 0;
  _streak    = 0;

  const e = window.getRandomEnemy
    ? window.getRandomEnemy()
    : { ...ENEMIES_DATA[Math.floor(Math.random() * ENEMIES_DATA.length)] };
  S.enemy   = e;
  S.enemyHp = e.hp;
  S.difficulty = getDifficultyLabel(S);

  document.getElementById('battleEnemyName').textContent = e.name;

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

  window.updateBattleBars();
  window.setLog(`<span class="blog-info">⚔ ${e.name} aparece! Responde correctamente para atacar!</span>`);
  window.showScreen('battleScreen');
  loadNextQuestion();
}
window.startBattle = startBattle;

function _heroEmoji(id) {
  const m = { h1:'⚔️',h2:'🪓',h3:'💀',h4:'🏹',h5:'🪖',h6:'🔮',h7:'🛡️',h8:'🐉',h9:'☀️' };
  return m[id] || '🧙';
}

// ── CARREGAR PRÓXIMA PERGUNTA ──────────────────────────────
async function loadNextQuestion() {
  const S  = window.S;
  const qt = document.getElementById('questionText');
  const og = document.getElementById('optionsGrid');
  const ld = document.getElementById('aiLoading');
  const qs = document.getElementById('questionSubject');

  qt.style.display = 'none';
  og.style.display = 'none';
  document.getElementById('battleLog').classList.add('hidden');
  document.getElementById('battleScreen').classList.remove('showing-log');
  ld.classList.remove('hidden');

  const hasStudy  = S.studyText && S.studyText.length > 60;
  const diff      = S.difficulty || getDifficultyLabel(S);
  const diffBadge = `<span class="diff-badge diff-tier-${diff.level}" title="Dificuldade: ${diff.label}">${diff.label}</span>`;
  const streakBadge = _streak >= 2
    ? `<span class="streak-badge">🔥 x${_streak}</span>`
    : '';

  if (hasStudy) {
    qs.innerHTML = `📚 ${S.studyFile || 'Material carregado'} ✦ PERGUNTA #${S.qCount + 1} ${diffBadge}${streakBadge}`;
  } else {
    qs.innerHTML = `${(S.disc?.name || 'Geral').toUpperCase()} ✦ PERGUNTA #${S.qCount + 1} ${diffBadge}${streakBadge}`;
  }

  try {
    let q;
    if (S.qCache.length > 0) {
      q = S.qCache.shift();
    } else {
      q = await window.genQuestion();
    }

    // Pré-carregar próxima pergunta em background
    window.genQuestion().then(nq => S.qCache.push(nq)).catch(() => {});

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
function useFallback() {
  const S = window.S;
  const allFallbacks = {
    arithmancer: [
      { question:'Quanto é 15²?',                                options:['115','225','155','205'],                                        correct:1, explanation:'15² = 225.' },
      { question:'Qual é o resultado de √144?',                  options:['11','12','13','14'],                                            correct:1, explanation:'√144 = 12.' },
      { question:'Quantos lados tem um hexágono?',               options:['5','6','7','8'],                                                correct:1, explanation:'Hexágono vem do grego "hex" (seis).' },
      { question:'Qual é o valor de π arredondado a 2 casas?',   options:['3,12','3,14','3,16','3,18'],                                    correct:1, explanation:'π ≈ 3,14159...' },
    ],
    bioshaman: [
      { question:'Qual é a unidade básica da vida?',             options:['Átomo','Célula','Molécula','Órgão'],                            correct:1, explanation:'A célula é a unidade estrutural e funcional de todos os seres vivos.' },
      { question:'Qual é o maior órgão do corpo humano?',        options:['Fígado','Pulmão','Pele','Coração'],                             correct:2, explanation:'A pele é o maior órgão do corpo humano.' },
      { question:'Qual o papel da clorofila nas plantas?',       options:['Digestão','Fotosíntese','Reprodução','Respiração'],             correct:1, explanation:'A clorofila capta luz para a fotosíntese.' },
      { question:'Quantos cromossomas tem uma célula humana?',   options:['23','44','46','48'],                                            correct:2, explanation:'As células humanas têm 46 cromossomas (23 pares).' },
    ],
    wordweaver: [
      { question:'Quem escreveu "Os Lusíadas"?',                 options:['Eça de Queirós','Fernando Pessoa','Camões','Saramago'],         correct:2, explanation:'Luís de Camões publicou Os Lusíadas em 1572.' },
      { question:'Quantas vogais tem o alfabeto português?',     options:['4','5','6','7'],                                                correct:1, explanation:'O alfabeto português tem 5 vogais: a, e, i, o, u.' },
      { question:'Qual a figura de estilo em "o mar sorriu"?',   options:['Metáfora','Personificação','Hipérbole','Aliteração'],           correct:1, explanation:'Atribuir ação humana a elemento inanimado é personificação.' },
      { question:'O que é um pleonasmo?',                        options:['Rima interna','Repetição redundante','Sílaba tónica','Figura de som'], correct:1, explanation:'Pleonasmo é a repetição de uma ideia já expressa.' },
    ],
    sophist: [
      { question:'Quem é o pai da filosofia ocidental?',         options:['Platão','Aristóteles','Sócrates','Tales'],                     correct:2, explanation:'Sócrates é frequentemente considerado o pai da filosofia ocidental.' },
      { question:'Qual é a máxima de Descartes?',                options:['"O homem é o lobo do homem"','"Cogito, ergo sum"','"A vida não examinada não vale a pena"','"O ser é"'], correct:1, explanation:'Descartes: "Penso, logo existo".' },
      { question:'O que estuda a Epistemologia?',                options:['O belo','O conhecimento','A moral','A existência'],             correct:1, explanation:'Epistemologia estuda a natureza, origens e limites do conhecimento.' },
      { question:'Qual o princípio da não-contradição?',         options:['Algo pode ser e não ser ao mesmo tempo','Nada pode ser e não ser ao mesmo tempo','Toda proposição é verdadeira','Toda proposição é falsa'], correct:1, explanation:'Aristóteles: uma coisa não pode ser e não ser ao mesmo tempo e sob o mesmo aspeto.' },
    ],
  };

  const discId = S.disc ? S.disc.id : null;
  const pool   = (discId && allFallbacks[discId]) ? allFallbacks[discId] : [
    { question:'Qual é a capital de Portugal?', options:['Lisboa','Porto','Coimbra','Braga'],  correct:0, explanation:'Lisboa é a capital de Portugal desde 1255.' },
    { question:'Qual o símbolo químico do ouro?', options:['Or','Go','Au','Ag'],              correct:2, explanation:'Au vem do latim "aurum".' },
    { question:'Qual o maior planeta do sistema solar?', options:['Saturno','Neptuno','Júpiter','Urano'], correct:2, explanation:'Júpiter tem mais massa que todos os outros planetas juntos.' },
  ];

  const q      = pool[Math.floor(Math.random() * pool.length)];
  S.curQ       = q;
  S.qCount++;

  const qt = document.getElementById('questionText');
  const og = document.getElementById('optionsGrid');
  qt.textContent   = q.question;
  qt.style.display = 'block';
  og.innerHTML     = '';
  og.style.display = 'grid';
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
    _streak++;
    btn.classList.add('correct');

    const mult = _streak >= 5 ? 2.0
               : _streak >= 3 ? 1.5
               : _streak >= 2 ? 1.25
               : 1.0;
    const baseDmg = S.atk + Math.floor(Math.random() * 8);
    const dmg     = Math.round(baseDmg * mult);
    S.enemyHp -= dmg;
    S.mp = Math.min(S.maxMp, S.mp + 2);

    let comboHtml = '';
    if (_streak >= 2) {
      comboHtml = `<br><span class="blog-combo">🔥 COMBO x${_streak}! ×${mult.toFixed(2)} dano!</span>`;
    }

    window.setLog(`<span class="blog-def">✅ Correcto! ${q.explanation}</span><br><span class="blog-atk">⚔ ${S.heroName} causa ${dmg} de dano!${comboHtml.replace('<br>','')}</span>`);

  } else {
    _streak = 0;
    document.querySelectorAll('.option-btn')[q.correct].classList.add('correct');
    btn.classList.add('wrong');

    const raw = S.enemy.atk + Math.floor(Math.random() * 6);
    const dmg = Math.max(1, raw - (S.def || 4));
    S.hp = Math.max(0, S.hp - dmg);

    window._shakePlayer();
    window._flashHpBar('hit');

    window.setLog(`<span class="blog-atk">❌ Errado! Resposta: ${'ABCD'[q.correct]}) ${q.options[q.correct]}</span><br><span class="blog-info">💥 ${S.enemy.name} causa ${dmg} de dano!</span>`);
  }

  window.updateBattleBars();

  setTimeout(() => {
    if (S.enemyHp <= 0) victory();
    else if (S.hp <= 0) defeat();
    else                loadNextQuestion();
  }, 1200);
}

// ── VITÓRIA / DERROTA ──────────────────────────────────────
function victory() {
  const S  = window.S;
  _streak  = 0;
  const xg = S.enemy.xp;
  S.xp += xg;
  S.mp  = Math.min(S.maxMp, S.mp + 5);
  window.setLog(`<span class="blog-def">🏆 Vitória! ${S.enemy.name} derrotado!</span><br><span class="blog-info">✨ +${xg} XP ganhos!</span>`);
  setTimeout(() => {
    if (S.xp >= S.xpNext) {
      doLevelUp();
    } else if (window.World && window.World.currentRegion === 'torn_veil') {
      showGameComplete();
    } else {
      endBattle();
    }
  }, 2000);
}

function defeat() {
  const S = window.S;
  _streak = 0;
  window.setLog(`<span class="blog-atk">💀 Foste derrotado... O conhecimento permanece contigo.</span>`);
  S.hp = Math.max(5, Math.floor(S.maxHp * 0.3));
  setTimeout(endBattle, 2500);
}

function endBattle() {
  const S    = window.S;
  S.inBattle = false;
  S.enemy    = null;
  S.cooldown = 3;
  window.updateHud && window.updateHud();
  window.showScreen('gameScreen');
  document.getElementById('gameScreen').style.display = '';
}

// ── JOGO COMPLETO ──────────────────────────────────────────
function showGameComplete() {
  const S    = window.S;
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
  const S  = window.S;
  S.level++;
  S.xp    -= S.xpNext;
  S.xpNext = Math.floor(S.xpNext * 1.4);

  const hg = 8 + Math.floor(Math.random() * 6);
  const mg = 3 + Math.floor(Math.random() * 4);
  const ag = 2 + Math.floor(Math.random() * 3);
  const dg = 1 + Math.floor(Math.random() * 2);
  S.maxHp += hg; S.hp = S.maxHp;
  S.maxMp += mg; S.mp = S.maxMp;
  S.atk   += ag;
  S.def   += dg;

  S.difficulty = getDifficultyLabel(S);
  S.qCache     = [];

  window._flashHpBar('heal');

  document.getElementById('levelUpMsg').textContent = `Alcançaste o Nível ${S.level}!`;
  document.getElementById('levelUpStats').innerHTML =
    `<div class="stat-gain">❤️ +${hg} HP Máximo</div>
     <div class="stat-gain">💧 +${mg} MP Máximo</div>
     <div class="stat-gain">⚔️ +${ag} Ataque</div>
     <div class="stat-gain">🛡️ +${dg} Defesa</div>
     <div class="stat-gain diff-tier-${S.difficulty.level}">📊 Dificuldade → ${S.difficulty.label}</div>`;

  document.getElementById('levelUpScreen').classList.remove('hidden');
  document.getElementById('battleScreen').classList.add('hidden');
}

// ── DOM READY ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('levelUpOkBtn').addEventListener('click', () => {
    document.getElementById('levelUpScreen').classList.add('hidden');
    const S = window.S;
    if (S && S.xp >= S.xpNext) {
      doLevelUp();
    } else if (window.World && window.World.currentRegion === 'torn_veil' && S && !S.inBattle) {
      showGameComplete();
    } else {
      endBattle();
    }
  });

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
