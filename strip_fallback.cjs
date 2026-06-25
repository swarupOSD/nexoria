const fs = require('fs');
let c = fs.readFileSync('d:/mods apps/frontend/src/pages/SinglePost.jsx', 'utf8');

c = c.replace(/<FallbackImage/g, '<img');

fs.writeFileSync('d:/mods apps/frontend/src/pages/SinglePost.jsx', c);
