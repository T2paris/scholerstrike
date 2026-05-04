const fs = require('fs');
const path = require('path');

const treesFolder = path.join(__dirname, 'new_trees');
const jsPath = path.join(__dirname, 'trees.js');

if (!fs.existsSync(treesFolder)) {
    console.error('ERRO: A pasta "new_trees" não foi encontrada.');
    process.exit(1);
}

const files = fs.readdirSync(treesFolder)
    .filter(f => f.match(/\.(png|jpg|jpeg|gif)$/i))
    .sort();

if (files.length === 0) {
    console.error('ERRO: Nenhuma imagem encontrada na pasta "new_trees"!');
    process.exit(1);
}

console.log(`Encontrada(s) ${files.length} imagem(ns) de árvore. A substituir as texturas em trees.js...`);

let jsContent = 'window.TREE_IMGS = [\n';

files.forEach((file, idx) => {
    const p = path.join(treesFolder, file);
    const b64 = fs.readFileSync(p).toString('base64');
    let ext = file.split('.').pop().toLowerCase();
    if (ext === 'jpg') ext = 'jpeg';
    
    jsContent += `  "data:image/${ext};base64,${b64}"${idx < files.length - 1 ? ',' : ''}\n`;
});

jsContent += '];\n';

// Substitui completamente o arquivo trees.js antigo com as novas imagens
fs.writeFileSync(jsPath, jsContent);

console.log('✅ Árvores substituídas com sucesso! Agora o mapa usará apenas a(s) árvore(s) que colocou na pasta.');
