const fs = require('fs');
const indexHtmlPath = 'C:\\Users\\Aristides Paris\\Downloads\\scholerstrike-main\\scholerstrike-main\\files\\index.html';

try {
    let html = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Find where the script tags start
    const marker = '<script src="data/assets.js"></script>';
    const index = html.indexOf(marker);
    
    if (index !== -1) {
        // Keep everything before the scripts
        html = html.substring(0, index);
        
        // Append the correct script tags
        html += `<!-- Assets (dados base64) -->
<script src="data/assets.js"></script>
<script src="data/grass.js"></script>
<script src="data/water.js"></script>
<script src="data/path.js"></script>
<script src="data/trees.js"></script>
<script src="data/houses.js"></script>

<!-- Models -->
<script src="models/GameState.js"></script>
<script src="models/WorldModel.js"></script>
<script src="models/BattleModel.js"></script>

<!-- Services -->
<script src="services/TextureLoader.js"></script>
<script src="services/ApiService.js"></script>
<script src="services/StudyFileService.js"></script>

<!-- Views -->
<script src="views/MapView.js"></script>
<script src="views/HudView.js"></script>
<script src="views/DialogueView.js"></script>
<script src="views/BattleView.js"></script>

<!-- Controllers -->
<script src="controllers/AuthController.js"></script>
<script src="controllers/InputController.js"></script>
<script src="controllers/GameController.js"></script>
<script src="controllers/CharacterController.js"></script>
<script src="controllers/BattleController.js"></script>

</body>
</html>
`;
        fs.writeFileSync(indexHtmlPath, html);
        console.log('Successfully fixed index.html');
    } else {
        console.error('Could not find script marker in index.html');
    }
} catch (e) {
    console.error('Error fixing index.html:', e);
}
