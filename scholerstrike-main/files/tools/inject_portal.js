const fs = require('fs');
const imgPath = 'C:\\Users\\arist\\.gemini\\antigravity\\brain\\8d2a9107-b46a-4225-b28e-9d60be5234d5\\media__1775963156821.png';
const htmlPath = 'c:\\Users\\arist\\Downloads\\New folder\\ScholerStrike\\files\\index.html';

try {
    const imgBase64 = fs.readFileSync(imgPath).toString('base64');
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    const portalDataUri = `data:image/png;base64,${imgBase64}`;
    const portalEntry = `    "portal": "${portalDataUri}",\n`;
    
    // Inject at the start of window.IMG
    if (html.includes('window.IMG = {')) {
        html = html.replace('window.IMG = {', 'window.IMG = {\n' + portalEntry);
        fs.writeFileSync(htmlPath, html);
        console.log('Successfully injected portal sprite into index.html');
    } else {
        console.error('Could not find window.IMG in index.html');
    }
} catch (e) {
    console.error('Error during injection:', e);
}
