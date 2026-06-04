const fs = require('fs');
const path = require('path');

const idleFolder = path.join(__dirname, 'idle_animation_images');
const htmlPath = path.join(__dirname, 'index.html');

if (!fs.existsSync(idleFolder)) {
    console.error('ERRO: A pasta "idle_animation_images" não foi encontrada. Crie essa pasta e coloque as 4 imagens lá!');
    process.exit(1);
}

const files = fs.readdirSync(idleFolder)
    .filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.gif'))
    .sort();

if (files.length === 0) {
    console.error('ERRO: Nenhuma imagem encontrada na pasta "idle_animation_images"!');
    process.exit(1);
}

console.log(`Encontradas ${files.length} imagens. A injetar no index.html...`);

let injectedImages = '';
files.forEach((file, idx) => {
    const p = path.join(idleFolder, file);
    const b64 = fs.readFileSync(p).toString('base64');
    let ext = file.split('.').pop();
    if (ext === 'jpg') ext = 'jpeg';
    injectedImages += `  "h1_idle_${idx}": "data:image/${ext};base64,${b64}",\n`;
});

let html = fs.readFileSync(htmlPath, 'utf8');

if (!html.includes('"h1_idle_0"')) {
    html = html.replace('window.IMG = {', `window.IMG = {\n${injectedImages}`);
    fs.writeFileSync(htmlPath, html);
    console.log('✅ Animação de repouso (idle) injetada com sucesso no seu jogo!');
} else {
    // Substituir as antigas se já existirem (removendo as antigas e colocando as novas)
    // Para simplificar: avisar o utilizador
    console.log('⚠️ As imagens de repouso já existem no index.html! Se quiser atualizar, limpe o index.html primeiro.');
}
