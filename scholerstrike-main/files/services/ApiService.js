// ═══════════════════════════════════════════════════════════
// SCHOLAR STRIKE — services/ApiService.js
// Chamadas à API Claude para geração de perguntas
// ═══════════════════════════════════════════════════════════
'use strict';

// ── GERAÇÃO DE PERGUNTAS COM IA (Claude) ───────────────────
async function genQuestion() {
  const S = window.S;

  const apiKey = (window.ANTHROPIC_API_KEY || '').trim();
  if (!apiKey) {
    throw Object.assign(new Error('Chave API não configurada'), { code:'NO_KEY' });
  }

  const hasStudyMaterial = S.studyText && S.studyText.length > 60;
  const subject = S.disc ? S.disc.subject : 'conhecimento geral';

  const diff = (S.difficulty && S.difficulty.descriptor)
    ? S.difficulty : getDifficultyLabel(S);
  const diffLine = `Dificuldade da pergunta (OBRIGATÓRIO): ${diff.descriptor}.`;

  let prompt;

  if (hasStudyMaterial) {
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
      model:      'claude-sonnet-4-20250514',
      max_tokens: 700,
      messages:   [{ role:'user', content:prompt }],
    }),
  });

  if (res.status === 401) {
    throw Object.assign(new Error('Chave API inválida ou expirada'), { code:'BAD_KEY' });
  }
  if (!res.ok) throw new Error('Erro API: ' + res.status);

  const data    = await res.json();
  const rawText = data.content.map(b => b.text || '').join('');

  const m = rawText.match(/\{[\s\S]*?"correct"\s*:\s*\d[\s\S]*?\}/);
  if (!m) throw new Error('Resposta da IA não contém JSON válido');
  return JSON.parse(m[0]);
}
window.genQuestion = genQuestion;
