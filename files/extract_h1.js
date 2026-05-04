const fs = require('fs');
const html = fs.readFileSync('c:/Users/arist/Downloads/New folder/ScholerStrike/files/index.html', 'utf8');
const match = html.match(/"h1"\s*:\s*"data:image\/png;base64,([^"]+)"/);
if (match) {
  const buffer = Buffer.from(match[1], 'base64');
  fs.writeFileSync('c:/Users/arist/Downloads/New folder/ScholerStrike/files/h1.png', buffer);
  console.log('Saved h1.png');
} else {
  console.log('No match found');
}
