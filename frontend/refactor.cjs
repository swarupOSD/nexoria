const fs = require('fs');
let data = fs.readFileSync('src/components/Navbar.jsx', 'utf8');
data = data.replace(/className="flex-1 overflow-y-auto p-6 space-y-6/g, 'className="flex-1 overflow-y-auto p-4 space-y-4');
data = data.replace(/px-4 py-3/g, 'px-3 py-2.5');
data = data.replace(/rounded-2xl/g, 'rounded-xl active:scale-[0.98]');
data = data.replace(/p-6 border-t/g, 'p-4 border-t'); 
fs.writeFileSync('src/components/Navbar.jsx', data);
