const fs = require('fs');
const path = require('path');

const imgPath = 'C:\\Users\\Aristides Paris\\.gemini\\antigravity-ide\\brain\\9a554da7-6d89-4f95-a51b-66711155d9f4\\rpg_portal_white_bg_1780539291655.png';
const portalJsPath = 'C:\\Users\\Aristides Paris\\Downloads\\scholerstrike-main\\scholerstrike-main\\files\\data\\portal.js';
const indexHtmlPath = 'C:\\Users\\Aristides Paris\\Downloads\\scholerstrike-main\\scholerstrike-main\\files\\index.html';

try {
    const imgBase64 = fs.readFileSync(imgPath).toString('base64');
    const dataUri = `data:image/png;base64,${imgBase64}`;
    
    // Create data/portal.js
    const portalJsContent = `window.IMG = window.IMG || {};\nwindow.IMG['portal'] = '${dataUri}';\n`;
    fs.writeFileSync(portalJsPath, portalJsContent);
    console.log('Created data/portal.js');
    
    // Update index.html
    let html = fs.readFileSync(indexHtmlPath, 'utf8');
    if (!html.includes('<script src="data/portal.js"></script>')) {
        html = html.replace('<script src="data/houses.js"></script>', '<script src="data/houses.js"></script>\n<script src="data/portal.js"></script>');
        fs.writeFileSync(indexHtmlPath, html);
        console.log('Updated index.html to include portal.js');
    }
} catch (e) {
    console.error('Error during portal injection:', e);
}
