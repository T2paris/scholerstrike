// ═══════════════════════════════════════════════════════════
// SCHOLAR STRIKE — services/StudyFileService.js
// Upload de ficheiros de estudo e gestão da API key UI
// ═══════════════════════════════════════════════════════════
'use strict';

// ── API KEY UI ───────────────────────────────────────────────
function _injectApiKeyUI() {
  const existingInput = document.getElementById('apiKeyInput');
  if (!existingInput) {
    const fileZone = document.getElementById('fileZone');
    if (!fileZone) return;
    const section = document.createElement('div');
    section.className = 'api-key-section';
    section.innerHTML = `
      <div class="section-label">🤖 Chave API — Anthropic Claude</div>
      <div class="api-key-wrap">
        <input id="apiKeyInput" class="input api-key-input" type="password"
          placeholder="sk-ant-api03-..." autocomplete="off"
          spellcheck="false" aria-label="Chave API Anthropic">
        <button class="btn-icon" id="apiKeyToggle" title="Mostrar/ocultar chave" type="button">👁</button>
      </div>
      <div class="api-key-hint" id="apiKeyHint">
        🔑 Necessária para gerar perguntas com IA.
        <a href="https://console.anthropic.com/keys" target="_blank" rel="noopener noreferrer">Obter chave →</a>
      </div>
      <div class="api-key-status" id="apiKeyStatus"></div>
    `;
    const parent  = fileZone.closest('.preview-config') || fileZone.parentElement.parentElement;
    parent.insertBefore(section, fileZone.parentElement);
  }

  const ki = document.getElementById('apiKeyInput');
  if (!ki || ki.dataset.apiInitialized) return;
  ki.dataset.apiInitialized = 'true';

  const saved = localStorage.getItem('ss_api_key') || '';
  if (saved) { ki.value = saved; _setApiStatus('saved'); }

  const toggleBtn = document.getElementById('apiKeyToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isPass = ki.type === 'password';
      ki.type = isPass ? 'text' : 'password';
      toggleBtn.textContent = isPass ? '🙈' : '👁';
    });
  }

  ki.addEventListener('input', () => {
    const v = ki.value.trim();
    if (!v)                  _setApiStatus('');
    else if (v.startsWith('sk-ant-')) _setApiStatus('valid');
    else                     _setApiStatus('invalid');
  });
}

function _setApiStatus(status) {
  const el = document.getElementById('apiKeyStatus');
  if (!el) return;
  const map = {
    valid:   ['✅ Formato de chave válido',            'api-key-status status-ok'],
    invalid: ['⚠️ A chave deve começar com sk-ant-',  'api-key-status status-warn'],
    saved:   ['💾 Chave carregada do armazenamento',   'api-key-status status-ok'],
  };
  if (map[status]) { [el.textContent, el.className] = map[status]; }
  else             { el.textContent = ''; el.className = 'api-key-status'; }
}

// ── FICHEIRO DE ESTUDO ───────────────────────────────────────
function loadStudyFile(file) {
  const S = window.S;
  S.studyFile = file.name;
  const loaded = document.getElementById('fileLoaded');
  const zone   = document.getElementById('fileZone');
  loaded.textContent = `⏳ A carregar ${file.name}...`;
  loaded.style.display = 'block';

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (isPdf) {
    _extractPdfText(file).then(text => {
      S.studyText = text; S.qCache = [];
      loaded.textContent = `✅ PDF: ${file.name} (${text.length} car. extraídos)`;
      zone.classList.add('loaded');
    }).catch(err => {
      loaded.textContent = `⚠️ Erro no PDF: ${err.message} — tenta .txt`;
    });
  } else {
    const r = new FileReader();
    r.onload  = () => { S.studyText = r.result; S.qCache = []; loaded.textContent = `✅ ${file.name} (${S.studyText.length} car.)`; zone.classList.add('loaded'); };
    r.onerror = () => { loaded.textContent = '⚠️ Erro ao ler ficheiro.'; };
    r.readAsText(file, 'utf-8');
  }
}

async function _extractPdfText(file) {
  if (!window.pdfjsLib) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src     = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      s.onload  = res;
      s.onerror = () => rej(new Error('Falha ao carregar pdf.js'));
      document.head.appendChild(s);
    });
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
  const buf  = await file.arrayBuffer();
  const pdf  = await pdfjsLib.getDocument({ data: buf }).promise;
  const lEl  = document.getElementById('fileLoaded');
  let text   = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    lEl.textContent = `⏳ Página ${i}/${pdf.numPages}...`;
    const page    = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(it => it.str).join(' ') + '\n';
  }
  return text.trim();
}

// Exports globais
window._injectApiKeyUI = _injectApiKeyUI;
window.loadStudyFile   = loadStudyFile;
