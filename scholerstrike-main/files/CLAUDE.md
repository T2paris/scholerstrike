# CLAUDE.md — Scholar Strike

## Project Overview
Scholar Strike is an educational RPG game where players learn by battling enemies through AI-generated quiz questions. Correct answers power combat attacks. The game combines gaming, AI, and education into a single browser-based experience.

**GitHub:** https://github.com/T2paris/scholerstrike
**Deployment:** Netlify (self-contained, static site)
**Developer:** T2 (Aristides Paris) — college student at ESMAD, Politécnico do Porto, Portugal

---

## Tech Stack
- **Frontend:** Vanilla JavaScript, HTML5, CSS3 (no frameworks)
- **AI Integration:** Anthropic Claude API (`/v1/messages` endpoint) for quiz question generation
- **PDF Parsing:** pdf.js for extracting text from uploaded study materials
- **Assets:** Pixel-art sprites embedded as base64 data URIs
- **Deployment:** Static site on Netlify — everything runs client-side

---

## File Structure
```
scholerstrike/
├── index.html      # Main entry point, game shell, UI structure
├── styles.css      # All styling, pixel-art aesthetic, animations
├── game.js         # Core game logic, state management, hero classes, NPC system
├── battle.js       # Battle system, quiz integration, combat mechanics
├── world.js        # World map, regions, navigation, portal system
└── CLAUDE.md       # This file
```

---

## Core Game Systems

### Hero Classes (9 total, mapped to academic disciplines)
Each class has unique stats and abilities tied to a field of study. Examples:
- Scholar → General Studies
- Engineer → Engineering/Tech
- Historian → History/Humanities
- Medic → Health Sciences
- Artist → Arts/Design
- Scientist → Natural Sciences
- Coder → Computer Science
- Linguist → Languages/Literature
- Mathematician → Mathematics

### World Regions (5 total)
Five distinct regions on the world map, each with themed enemies and challenges. Players navigate between regions via portals.

### NPC Archetypes
- **Teachers** — Give knowledge/hints, friendly interactions
- **Challengers** — Initiate quiz battles
- **Advisors** — Provide guidance and tips
- **Deceivers** — Trick the player, misleading information

### Battle System
1. Player encounters an enemy or challenger NPC
2. AI generates quiz questions based on uploaded study material (PDF)
3. Correct answer → player deals damage
4. Wrong answer → player takes damage
5. Battle ends when HP reaches 0 (player or enemy)

### AI Quiz System
- Player uploads a PDF with study material
- pdf.js extracts the text content
- Text is sent to Claude API as context
- Claude generates multiple-choice or open-ended questions
- Questions are used during battles as the combat mechanic
- **Fallback:** If API fails, the game uses a set of pre-defined backup questions

---

## API Integration
- **Endpoint:** `https://api.anthropic.com/v1/messages`
- **Model:** claude-sonnet (check current model string)
- **Auth:** API key sent via `x-api-key` header (also requires `Authorization: Bearer` header)
- **Important:** The `anthropic-dangerous-direct-browser-access: true` header is required for client-side calls

---

## Known Bugs (Previously Fixed — DO NOT Reintroduce)
1. **NPC Lookup Bug** — NPC interactions failed due to incorrect ID referencing. Fixed by standardizing NPC ID format across game.js and world.js.
2. **Missing API Authorization Header** — Quiz questions were falling back to defaults because the API call was missing the proper Authorization header. Fixed by adding both `x-api-key` and `Authorization: Bearer` headers.
3. **Portal Teleport Loop** — Moving through a portal would instantly teleport the player back. Fixed by adding a cooldown/debounce mechanism after portal entry.
4. **PDF Text Extraction** — pdf.js wasn't correctly extracting text from certain PDFs. Fixed by properly iterating through all pages and concatenating text content.

---

## Coding Conventions
- **Language:** All code in vanilla JS — no TypeScript, no React, no build tools
- **Style:** Functional approach, modular files, avoid global pollution
- **Assets:** All sprites/images are base64-encoded inline — no external image files
- **Comments:** Use clear Portuguese or English comments where helpful
- **Naming:** camelCase for variables/functions, UPPER_SNAKE for constants
- **No dependencies** other than pdf.js (loaded via CDN) and the Claude API

---

## Current State & Priorities
- The game is functional with all 5 regions, 9 classes, and the quiz battle system
- Focus is on polishing for a deployable, portfolio-ready version
- Potential improvements:
  - Better UI/UX feedback during battles
  - Save/load game progress (localStorage)
  - More varied question types
  - Sound effects and music
  - Mobile responsiveness
  - Leaderboard or XP tracking

---

## Developer Context
- T2 is a web development student learning Node.js, Express, REST APIs, and Sequelize in coursework
- Primary language: European Portuguese
- Communicates directly — prefers hands-on solutions over lengthy explanations
- Uses this project as a portfolio piece and learning tool
- Goal: make Scholar Strike a polished, unique project that demonstrates AI integration skills

---

## Rules for Claude Code
1. Always preserve the vanilla JS approach — do not introduce frameworks or build tools
2. Keep all assets as base64 inline — no external image files
3. Test API integration carefully — never remove the Authorization headers
4. Maintain the portal cooldown mechanism
5. When in doubt, ask before making architectural changes
6. Keep the pixel-art aesthetic consistent
7. All UI text can be in English (game is in English)
