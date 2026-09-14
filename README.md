<p align="center">
  <img src="https://img.shields.io/badge/Scholar%20Strike-RPG%20Educativo-8B5CF6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+PHRleHQgeD0iNCIgeT0iMTgiIGZvbnQtc2l6ZT0iMTgiPuKaljwvdGV4dD48L3N2Zz4=" alt="Scholar Strike">
  <br>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Canvas_API-000000?style=flat-square&logo=html5&logoColor=white" alt="Canvas API">
  <img src="https://img.shields.io/badge/Claude_AI-191919?style=flat-square&logo=anthropic&logoColor=white" alt="Claude AI">
</p>

<h1 align="center">⚔ Scholar Strike</h1>
<h3 align="center"><em>A Arena do Conhecimento — Where Knowledge is Your Weapon</em></h3>

<p align="center">
  A dark-fantasy educational RPG where you upload your own study material and battle enemies by answering AI-generated quiz questions. Built entirely with vanilla HTML, CSS, and JavaScript — no frameworks, no build tools.
</p>

---

## 🎮 What is Scholar Strike?

**Scholar Strike** is a browser-based educational RPG that transforms studying into an epic adventure. Players choose a hero, pick a discipline, upload their study notes (`.txt` or `.pdf`), and enter a dark-fantasy world where **knowledge is the only weapon**.

Battles are fought by answering multiple-choice questions generated in real-time by **Claude AI** (Anthropic), adapted from the player's own study material. The harder the enemy, the harder the question.

> *"Escolhe um herói, carrega o teu material de estudo e entra num mundo dark fantasy onde o conhecimento é a tua arma."*

---

## ✨ Features

### 🗡️ Core Gameplay
- **5 interconnected regions** to explore — from lush forests to volcanic wastelands
- **Pokémon-style turn-based battles** powered by AI-generated quiz questions
- **20+ unique enemies** with scaling difficulty across all regions
- **9 playable heroes** with custom pixel-art sprites
- **Level-up system** with HP, MP, ATK, DEF, and XP progression
- **NPC dialogue system** with unique characters per region

### 🤖 AI-Powered Learning
- **Upload your own study material** (`.txt` or `.pdf`) — the AI generates questions from your content
- **Anthropic Claude integration** for real-time, context-aware question generation
- **5 difficulty tiers** (Iniciante → Mestre) that scale with player level and enemy strength
- **4 disciplines** — Arithmancer (Math), Bioshaman (Biology), Wordweaver (Languages), Sophist (Philosophy)

### 🏰 World & Exploration
| Region | Theme | Inspiration |
|--------|-------|-------------|
| **Oakvale Hollow** | Verdant forest village | Pallet Town / Route 1 |
| **Ironforge Depths** | Rocky mountain caverns | Pewter City / Mt. Moon |
| **Silverwind Coast** | Coastal waters & sandy bridges | Cerulean City / Sea Route |
| **Shadowmere Ruins** | Haunted ancient ruins | Lavender Town |
| **Torn Veil** | Volcanic endgame wasteland | Victory Road / Indigo Plateau |

### 🔐 User System
- Account creation & login (localStorage-based mock server)
- Progress saving and restoration per user
- Session persistence across browser reloads

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- An **Anthropic API key** ([get one here](https://console.anthropic.com/keys)) for AI-generated questions

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/scholerstrike.git

# Navigate to the project
cd scholerstrike

# Open in browser — no build step required!
# Simply open files/index.html in your browser
```

Or just double-click `files/index.html` — it works out of the box.

### Setup

1. **Open** `files/index.html` in your browser
2. **Create an account** or log in
3. **Choose a hero** from the 9 available characters
4. **Select a discipline** (Math, Biology, Languages, or Philosophy)
5. **Paste your Anthropic API key** in the configuration field
6. **Upload study material** (optional — `.txt` or `.pdf`)
7. **Enter the world** and start your adventure!

---

## 🎯 How to Play

| Control | Action |
|---------|--------|
| `WASD` / Arrow Keys | Move your character |
| `E` | Interact with NPCs / Continue dialogue |
| `Shift` | Sprint |

- Walk through grass zones to trigger **random encounters**
- Answer the AI-generated question correctly to deal damage
- Wrong answers let the enemy attack you
- Defeat enemies to earn **XP** and level up
- Find **portals** to travel between regions
- Talk to **NPCs** for lore and guidance

---

## 🏗️ Architecture

Scholar Strike follows a clean **MVC (Model-View-Controller)** architecture with a services layer:

```
files/
├── index.html                 # Single-page app entry point
├── styles.css                 # Full UI styling (46KB)
│
├── models/                    # Data & State
│   ├── GameState.js           # Global state, heroes, disciplines
│   ├── WorldModel.js          # Maps, regions, NPCs, enemies, tile palettes
│   └── BattleModel.js         # Enemy data, difficulty scaling
│
├── views/                     # UI Rendering
│   ├── MapView.js             # Canvas-based tile map renderer
│   ├── HudView.js             # HP/MP/XP bars, player info
│   ├── DialogueView.js        # NPC dialogue boxes
│   └── BattleView.js          # Battle scene UI & animations
│
├── controllers/               # Logic & Flow
│   ├── AuthController.js      # Login/register, session management
│   ├── GameController.js      # Game loop, screen management
│   ├── InputController.js     # Keyboard input handling
│   ├── CharacterController.js # Hero selection, configuration
│   └── BattleController.js    # Battle flow, damage, leveling
│
├── services/                  # External Integrations
│   ├── ApiService.js          # Claude AI question generation
│   ├── TextureLoader.js       # Sprite & texture management
│   └── StudyFileService.js    # File upload, PDF parsing, API key UI
│
├── data/                      # Asset data (base64 sprites, tiles)
│   ├── assets.js              # Hero sprite sheets
│   ├── grass.js, water.js     # Terrain tile data
│   ├── path.js, trees.js      # Path & vegetation tiles
│   ├── houses.js, portal.js   # Structure & portal tiles
│
└── battle_assets/             # Battle scene images (PNG)
    ├── grass_platform.png
    ├── golem_esquecimento.png
    ├── espectro_erro.png
    └── sombra_errante.png
```

### Key Design Decisions
- **Zero dependencies** — pure HTML/CSS/JS, no npm, no bundler
- **Canvas rendering** for the overworld map with tile-based collision
- **localStorage** as a mock database for auth and save data
- **Direct browser access** to the Anthropic API (client-side)
- **PDF.js** loaded on-demand via CDN for PDF study material parsing

---

## 🧠 AI Question Generation

Scholar Strike uses the **Anthropic Claude API** (`claude-sonnet-4-20250514`) to generate educational questions dynamically:

1. If the player uploaded study material, a random 2500-character excerpt is sent as context
2. The AI generates a multiple-choice question **exclusively based on that content**
3. Difficulty scales across 5 tiers based on player level and enemy XP value
4. Questions are pre-cached in the background for seamless gameplay

| Tier | Label | Description |
|------|-------|-------------|
| ⭐ | Iniciante | Basic recall, obvious distractors |
| ⭐⭐ | Aprendiz | Simple application, one plausible wrong answer |
| ⭐⭐⭐ | Intermédio | Application + light analysis, two plausible distractors |
| ⭐⭐⭐⭐ | Avançado | Analysis + evaluation, three plausible distractors |
| ⭐⭐⭐⭐⭐ | Mestre | Synthesis, nuanced edge-cases, all options highly plausible |

---

## 🌐 Language

The game interface is in **European Portuguese** (Português Europeu). All UI text, NPC dialogue, enemy names, and AI-generated questions are in Portuguese.

---

## 📝 License

This project is open source. See the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">
  <strong>⚔ Scholar Strike</strong> — Onde o conhecimento é a tua arma.<br>
  <em>Built with ❤️ and vanilla JavaScript</em>
</p>
