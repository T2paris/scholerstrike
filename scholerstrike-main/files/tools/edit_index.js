const fs = require('fs');
const path = require('path');
const indexPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');
if (content.includes('trees.js') && !content.includes('houses.js')) {
    content = content.replace('<script src="trees.js"></script>', '<script src="trees.js"></script>\n<script src="houses.js"></script>');
    fs.writeFileSync(indexPath, content);
    console.log('✅ index.html atualizado!');
} else if (content.includes('houses.js')) {
    console.log('ℹ️ houses.js já está no index.html');
} else {
    console.log('❌ Não foi possível encontrar trees.js no index.html');
}
