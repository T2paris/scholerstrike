// ═══════════════════════════════════════════════════════════
// SCHOLAR STRIKE — auth.js
// Mock Server de Autenticação (localStorage como base de dados)
// ═══════════════════════════════════════════════════════════
'use strict';

const MockServer = (() => {
  const DB_KEY = 'ss_users_db';
  const SESSION_KEY = 'ss_session';

  // ── Base de dados interna (localStorage) ─────────────────
  function _getDB() {
    try { return JSON.parse(localStorage.getItem(DB_KEY)) || {}; }
    catch { return {}; }
  }
  function _saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  // ── Hash simples (não criptográfica, apenas para demo) ────
  function _hash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h.toString(16);
  }

  // ── Simula latência de rede ───────────────────────────────
  function _delay(ms = 350) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ── Validações ────────────────────────────────────────────
  function _validateUsername(u) {
    if (!u || u.length < 3) return 'O nome de utilizador deve ter pelo menos 3 caracteres.';
    if (u.length > 20) return 'O nome de utilizador não pode ter mais de 20 caracteres.';
    if (!/^[a-zA-Z0-9_]+$/.test(u)) return 'Apenas letras, números e _ são permitidos.';
    return null;
  }
  function _validatePassword(p) {
    if (!p || p.length < 6) return 'A palavra-passe deve ter pelo menos 6 caracteres.';
    if (p.length > 50) return 'Palavra-passe demasiado longa.';
    return null;
  }

  // ── API Pública ────────────────────────────────────────────

  /** Registo de novo utilizador */
  async function register(username, password, confirmPassword) {
    await _delay();
    const u = username.trim();
    const errU = _validateUsername(u);
    if (errU) return { ok: false, error: errU };
    if (password !== confirmPassword) return { ok: false, error: 'As palavras-passe não coincidem.' };
    const errP = _validatePassword(password);
    if (errP) return { ok: false, error: errP };

    const db = _getDB();
    if (db[u.toLowerCase()]) return { ok: false, error: 'Esse nome de utilizador já existe.' };

    db[u.toLowerCase()] = {
      username: u,
      passwordHash: _hash(password),
      createdAt: new Date().toISOString(),
      saveData: null,
    };
    _saveDB(db);

    // Auto-login após registo
    const session = { username: u, loginAt: new Date().toISOString() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return { ok: true, username: u };
  }

  /** Login de utilizador existente */
  async function login(username, password) {
    await _delay();
    const u = username.trim();
    const db = _getDB();
    const record = db[u.toLowerCase()];
    if (!record) return { ok: false, error: 'Utilizador não encontrado.' };
    if (record.passwordHash !== _hash(password)) return { ok: false, error: 'Palavra-passe incorreta.' };

    const session = { username: record.username, loginAt: new Date().toISOString() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return { ok: true, username: record.username, saveData: record.saveData };
  }

  /** Terminar sessão */
  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  /** Obter sessão atual */
  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch { return null; }
  }

  /** Guardar progresso do jogador */
  function saveProgress(saveData) {
    const session = getSession();
    if (!session) return;
    const db = _getDB();
    const key = session.username.toLowerCase();
    if (db[key]) {
      db[key].saveData = { ...saveData, savedAt: new Date().toISOString() };
      _saveDB(db);
    }
  }

  /** Listar todos os utilizadores (para debug/admin) */
  function listUsers() {
    const db = _getDB();
    return Object.values(db).map(u => ({
      username: u.username,
      createdAt: u.createdAt,
      hasSave: !!u.saveData,
    }));
  }

  return { register, login, logout, getSession, saveProgress, listUsers };
})();

window.MockServer = MockServer;

// ═══════════════════════════════════════════════════════════
// AUTH UI — Controlador dos ecrãs de login/registo
// ═══════════════════════════════════════════════════════════
window.AuthUI = (() => {

  function init() {
    // Botões do ecrã de auth
    _bind('authLoginTab',    () => _switchTab('login'));
    _bind('authRegisterTab', () => _switchTab('register'));
    _bind('loginSubmitBtn',  _handleLogin);
    _bind('registerSubmitBtn', _handleRegister);
    _bind('logoutBtn',       _handleLogout);
    _bind('homeLogoutBtn',   _handleLogout); // Fix #2 — faltava listener

    // Enter key nos inputs
    ['loginUsername','loginPassword'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('keydown', e => { if(e.key==='Enter') _handleLogin(); });
    });
    ['regUsername','regPassword','regConfirm'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('keydown', e => { if(e.key==='Enter') _handleRegister(); });
    });

    // Verificar sessão existente
    const session = MockServer.getSession();
    if (session) {
      _onLoginSuccess(session.username, null);
    }
  }

  function _bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  }

  function _switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('authLoginTab');
    const regTab   = document.getElementById('authRegisterTab');
    if (tab === 'login') {
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
      loginTab.classList.add('auth-tab-active');
      regTab.classList.remove('auth-tab-active');
    } else {
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
      loginTab.classList.remove('auth-tab-active');
      regTab.classList.add('auth-tab-active');
    }
    _clearErrors();
  }

  function _setError(formId, msg) {
    const el = document.getElementById(formId + 'Error');
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  }
  function _clearErrors() {
    document.querySelectorAll('.auth-error').forEach(el => {
      el.textContent = ''; el.classList.add('hidden');
    });
  }
  function _setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.dataset.originalText = btn.dataset.originalText || btn.textContent;
    btn.textContent = loading ? '⏳ A aguardar...' : btn.dataset.originalText;
  }

  async function _handleLogin() {
    _clearErrors();
    const u = document.getElementById('loginUsername').value;
    const p = document.getElementById('loginPassword').value;
    _setLoading('loginSubmitBtn', true);
    const res = await MockServer.login(u, p);
    _setLoading('loginSubmitBtn', false);
    if (!res.ok) { _setError('loginForm', res.error); return; }
    _onLoginSuccess(res.username, res.saveData);
  }

  async function _handleRegister() {
    _clearErrors();
    const u  = document.getElementById('regUsername').value;
    const p  = document.getElementById('regPassword').value;
    const p2 = document.getElementById('regConfirm').value;
    _setLoading('registerSubmitBtn', true);
    const res = await MockServer.register(u, p, p2);
    _setLoading('registerSubmitBtn', false);
    if (!res.ok) { _setError('registerForm', res.error); return; }
    _onLoginSuccess(res.username, null);
  }

  function _handleLogout() {
    if (!confirm('Tens a certeza que queres terminar sessão?')) return;
    MockServer.logout();
    // Limpar estado do jogo
    if (window.S) { window.S.hero=null; window.S.disc=null; window.S.heroName='Aveline'; }
    showScreen('authScreen');
    _switchTab('login');
    // Limpar inputs
    ['loginUsername','loginPassword','regUsername','regPassword','regConfirm'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }

  function _onLoginSuccess(username, saveData) {
    // Mostrar nome do utilizador logado no menu superior
    const userBadge = document.getElementById('loggedUserBadge');
    if (userBadge) userBadge.textContent = '👤 ' + username;
    const homeBadge = document.getElementById('homeUserBadge'); // Fix #14
    if (homeBadge) homeBadge.textContent = '👤 ' + username;

    // Atualizar o botão "Começar Aventura" com o nome do utilizador
    const startBtn = document.getElementById('startBtn');
    if (startBtn) startBtn.textContent = 'Começar Aventura + ' + username;

    // Pré-preencher o nome do herói com o username
    const nameInput = document.getElementById('nameInput');
    if (nameInput) nameInput.value = username;

    // Restaurar progresso guardado se existir
    if (saveData && window.S) {
      if (saveData.hp    != null) window.S.hp    = saveData.hp;
      if (saveData.maxHp != null) window.S.maxHp = saveData.maxHp;
      if (saveData.mp    != null) window.S.mp    = saveData.mp;
      if (saveData.maxMp != null) window.S.maxMp = saveData.maxMp;
      if (saveData.xp    != null) window.S.xp    = saveData.xp;
      if (saveData.level != null) window.S.level = saveData.level;
      if (saveData.heroName) window.S.heroName = saveData.heroName;
    }

    // Navegar para o ecrã inicial do jogo.
    // Usa setTimeout para garantir que o game.js (carregado a seguir) já definiu showScreen.
    setTimeout(() => {
      if (window.showScreen) window.showScreen('homeScreen');
    }, 0);
  }

  return { init };
})();

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.AuthUI.init();
});
