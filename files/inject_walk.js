const fs = require('fs');
const path = require('path');

const walkFolder = path.join(__dirname, 'walk_animation_images');
const htmlPath = path.join(__dirname, 'index.html');

if (!fs.existsSync(walkFolder)) {
    console.error('ERRO: A pasta "walk_animation_images" não foi encontrada.');
    process.exit(1);
}

const files = fs.readdirSync(walkFolder)
    .filter(f => f.match(/\.(png|jpg|jpeg|gif)$/i))
    .sort();

if (files.length === 0) {
    console.error('ERRO: Nenhuma imagem encontrada na pasta "walk_animation_images"!');
    process.exit(1);
}

console.log(`Encontradas ${files.length} imagens. A atualizar o index.html...`);

let html = fs.readFileSync(htmlPath, 'utf8');

files.forEach((file, idx) => {
    const p = path.join(walkFolder, file);
    const b64 = fs.readFileSync(p).toString('base64');
    let ext = file.split('.').pop().toLowerCase();
    if (ext === 'jpg') ext = 'jpeg';
    
    const key = `"h1_walk_${idx}"`;
    const newEntry = `${key}: "data:image/${ext};base64,${b64}"`;
    
    // Procura por "h1_walk_X": "data:image/..." e substitui
    const regex = new RegExp(`"h1_walk_${idx}"\\s*:\\s*"data:image/[a-z]+;base64,[^"]+"`, 'g');
    
    if (html.match(regex)) {
        html = html.replace(regex, newEntry);
        console.log(`Atualizada a frame ${idx} (substituiu a existente)`);
    } else {
        // Se por acaso não existir, adiciona no topo
        html = html.replace('window.IMG = {', `window.IMG = {\n  ${newEntry},`);
        console.log(`Adicionada nova frame ${idx}`);
    }
});

fs.writeFileSync(htmlPath, html);
console.log('✅ Animação de caminhada (walk) atualizada com sucesso no seu jogo!');
