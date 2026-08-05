const fs = require('fs');
const file = 'src/lib/store.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\} as ([a-zA-Z<>]+);/g, '} as unknown as $1;');
fs.writeFileSync(file, content);
