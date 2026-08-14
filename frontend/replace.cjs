const fs = require('fs');
const files = [
  'd:/mods apps/frontend/src/pages/Home.jsx', 
  'd:/mods apps/frontend/src/components/Footer.jsx', 
  'd:/mods apps/frontend/src/components/Navbar.jsx'
];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let n = c.replace(/\b(gap|p|m|px|py|mx|my|pt|pb|pl|pr|mt|mb|ml|mr)-(sm|md|lg|xl|xs)\b/g, '$1-stitch-$2');
  fs.writeFileSync(f, n);
});
console.log('done');
