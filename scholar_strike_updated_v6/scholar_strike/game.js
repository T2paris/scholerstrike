/*
 * Main entry point for the Scholar Strike prototype.
 *
 * This module sets up basic UI interactions and provides a
 * foundation upon which future game systems (character selection,
 * world generation, battle mechanics, AI story creation, etc.) can be
 * built. The goal at this stage is to separate concerns: UI code
 * lives here, styles live in styles.css, and new modules can be
 * imported as needed.
 */

// Constants controlling the game rendering scale. Once we implement a
// map renderer, these values can be used to compute tile sizes.
// Tile size and viewport dimensions. These are defined as constants
// rather than exported values since this script is included directly
// in the page without module semantics.
const TILE = 32;
const VIEW_W = 320;
const VIEW_H = 180;
const SCALE = 3;

// Element references
const homeScreen = document.getElementById('homeScreen');
const characterScreen = document.getElementById('characterScreen');
const gameScreen = document.getElementById('gameScreen');

const startBtn = document.getElementById('startBtn');
const backHomeBtn = document.getElementById('backHomeBtn');
const enterWorldBtn = document.getElementById('enterWorldBtn');

const nameInput = document.getElementById('nameInput');
const disciplineGrid = document.getElementById('disciplineGrid');
const modelGrid = document.getElementById('modelGrid');

const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');

// Hero options. In this revised design all heroes are variations of a
// scholar/mage archetype. The player isn’t choosing between combat
// classes like guerreiros or assassinos; instead, they select an
// appearance for their mage character. Each option represents a
// different look but shares the same underlying abilities. The real
// specialization comes from the chosen school discipline (math,
// history, science, literature).
const availableHeroes = [
  { id: 'hero1', name: 'Cavaleira',      className: 'Guerreira de Armadura',     image: 'assets/heroes/1.png' },
  { id: 'hero2', name: 'Orc',            className: 'Berserker Orc',            image: 'assets/heroes/2.png' },
  { id: 'hero3', name: 'Necromante',     className: 'Mago Sombrio',             image: 'assets/heroes/3.png' },
  { id: 'hero4', name: 'Arqueira Élfica', className: 'Ranger Élfica',           image: 'assets/heroes/4.png' },
  { id: 'hero5', name: 'Bárbaro',        className: 'Guerreiro do Norte',        image: 'assets/heroes/5.png' },
  { id: 'hero6', name: 'Feiticeira',     className: 'Maga Arcana',              image: 'assets/heroes/6.png' },
  { id: 'hero7', name: 'Paladina',       className: 'Guardião Luminoso',         image: 'assets/heroes/7.png' },
  { id: 'hero8', name: 'Cavaleiro Dragão',className:'Guerreiro Dracónico',       image: 'assets/heroes/8.png' },
  { id: 'hero9', name: 'Paladino Dourado',className:'Campeão Sagrado',           image: 'assets/heroes/9.png' },
  { id: 'hero10', name: '...',className:'...',           image: 'assets/heroes/10.png' },
  { id: 'hero11', name: '...',className:'...',           image: 'assets/heroes/11.png' },
];

const availableDisciplines = [
  { id: 'arithmancer', name: 'Arithmancer', description: 'Mathematics – burst damage.' },
  { id: 'bioshaman',   name: 'Bioshaman',   description: 'Biology – sustain and remedies.' },
  { id: 'wordweaver',  name: 'Wordweaver',  description: 'Languages – control and flow.' },
  { id: 'sophist',     name: 'Sophist',     description: 'Philosophy – defense and pressure.' },
];

// Utility to switch screen visibility
function showScreen(screen) {
  homeScreen.classList.add('hidden');
  characterScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');
  screen.classList.remove('hidden');
}

// Initialize UI event handlers

// DEBUG: show an alert when the script is loaded to verify that the
// script executes correctly when the page is opened via file://. This
// should be removed or commented out in production. If you see
// this alert when loading index.html, it means the script is running.
alert('game.js loaded');
function initUI() {
  // Start button leads to character selection
  startBtn.addEventListener('click', () => {
    showScreen(characterScreen);
    populateHeroes();
    populateDisciplines();
  });

  // Back button returns to home
  backHomeBtn.addEventListener('click', () => {
    showScreen(homeScreen);
  });

  // Enter world begins the game with selected options
  enterWorldBtn.addEventListener('click', () => {
    // TODO: validate name, hero and discipline selection
    showScreen(gameScreen);
    const hero = characterScreen.dataset.selectedHero;
    const discipline = characterScreen.dataset.selectedDiscipline;
    document.getElementById('hudName').textContent = nameInput.value || 'Aventurero';
    document.getElementById('hudClass').textContent = availableDisciplines.find(d => d.id === discipline)?.name || 'Disciplina';
    // The region text can be updated as the player moves around
  });

  // Handle file upload
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) {
      fileInfo.textContent = '';
      return;
    }
    fileInfo.textContent = `Carregaste: ${file.name}`;
    readStudyFile(file);
  });
}

// Populate hero selection grid
function populateHeroes() {
  modelGrid.innerHTML = '';
  availableHeroes.forEach(hero => {
    const btn = document.createElement('div');
    btn.className = 'model-btn';
    btn.dataset.heroId = hero.id;
    btn.innerHTML = `
      <canvas class="model-canvas"></canvas>
      <div class="model-name">${hero.name}</div>
      <div class="model-sub">${hero.className}</div>
    `;
    btn.addEventListener('click', () => {
      // Mark selection
      document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      characterScreen.dataset.selectedHero = hero.id;
      // TODO: update preview canvas when assets are available
    });
    modelGrid.appendChild(btn);
  });
}

// Populate discipline selection grid
function populateDisciplines() {
  disciplineGrid.innerHTML = '';
  availableDisciplines.forEach(disc => {
    const div = document.createElement('div');
    div.className = 'discipline';
    div.innerHTML = `
      <h4>${disc.name}</h4>
      <p>${disc.description}</p>
    `;
    div.addEventListener('click', () => {
      document.querySelectorAll('.discipline').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');
      characterScreen.dataset.selectedDiscipline = disc.id;
    });
    disciplineGrid.appendChild(div);
  });
}

// Read the uploaded study material. This function currently reads
// plain text files; support for PDFs will require a library like
// pdf.js, which can be integrated later. The extracted text is
// logged to the console for now and can be passed to an AI service
// in future iterations.
function readStudyFile(file) {
  if (file.type === 'application/pdf') {
    // TODO: integrate pdf.js to parse PDFs
    const reader = new FileReader();
    reader.onload = () => {
      console.warn('PDF parsing not yet implemented.');
    };
    reader.readAsArrayBuffer(file);
  } else {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      console.log('Conteúdo do material de estudo:', text);
      // TODO: process text for concept extraction and AI prompts
    };
    reader.readAsText(file, 'utf-8');
  }
}

// Kick off the UI setup once the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  initUI();
});
