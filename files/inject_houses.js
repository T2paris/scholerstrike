const fs = require('fs');
const path = require('path');

const housesFolder = path.join(__dirname, 'new_houses');
const jsPath = path.join(__dirname, 'houses.js');

if (!fs.existsSync(housesFolder)) {
    console.error('ERRO: A pasta "new_houses" não foi encontrada.');
    process.exit(1);
}

const files = fs.readdirSync(housesFolder)
    .filter(f => f.match(/\.(png|jpg|jpeg|gif)$/i))
    .sort();

if (files.length === 0) {
    console.error('ERRO: Nenhuma imagem encontrada na pasta "new_houses"!');
    process.exit(1);
}

console.log(`Encontrada(s) ${files.length} imagem(ns) de casa. A gerar houses.js...`);

let jsContent = 'window.HOUSE_IMGS = [\n';

files.forEach((file, idx) => {
    const p = path.join(housesFolder, file);
    const b64 = fs.readFileSync(p).toString('base64');
    let ext = file.split('.').pop().toLowerCase();
    if (ext === 'jpg') ext = 'jpeg';
    
    jsContent += `  "data:image/${ext};base64,${b64}"${idx < files.length - 1 ? ',' : ''}\n`;
});

jsContent += '];\n';

fs.writeFileSync(jsPath, jsContent);

console.log('✅ houses.js gerado com sucesso!');
