const fs = require('fs');
const path = require('path');

const imgPaths = [
    'C:/Users/arist/.gemini/antigravity/brain/8d2a9107-b46a-4225-b28e-9d60be5234d5/media__1775959318619.png',
    'C:/Users/arist/.gemini/antigravity/brain/8d2a9107-b46a-4225-b28e-9d60be5234d5/media__1775960499352.png',
    'C:/Users/arist/.gemini/antigravity/brain/8d2a9107-b46a-4225-b28e-9d60be5234d5/media__1775960499374.png',
    'C:/Users/arist/.gemini/antigravity/brain/8d2a9107-b46a-4225-b28e-9d60be5234d5/media__1775960499395.png',
    'C:/Users/arist/.gemini/antigravity/brain/8d2a9107-b46a-4225-b28e-9d60be5234d5/media__1775960499438.png',
    'C:/Users/arist/.gemini/antigravity/brain/8d2a9107-b46a-4225-b28e-9d60be5234d5/media__1775960499451.png'
];

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const imgStart = html.indexOf('window.IMG = {');
if (imgStart === -1) {
    console.error("Could not find window.IMG in index.html");
    process.exit(1);
}
const firstBrace = html.indexOf('{', imgStart);

let injections = '';
let count = 0;
imgPaths.forEach((p, i) => {
    if (fs.existsSync(p)) {
        const b64 = fs.readFileSync(p, 'base64');
        injections += `\n  "water_${i}": "data:image/png;base64,${b64}",`;
        count++;
    } else {
        console.error("Missing file: " + p);
    }
});

const newHtml = html.slice(0, firstBrace + 1) + injections + html.slice(firstBrace + 1);

fs.writeFileSync(indexPath, newHtml, 'utf8');
console.log("Successfully injected " + count + " water images!");
