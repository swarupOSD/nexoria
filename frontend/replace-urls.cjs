const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function findAndReplace(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findAndReplace(filePath);
    } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;

      // 1. Replace Socket.io URLs
      content = content.replace(/'https:\/\/nexoria-backend-mt5e\.onrender\.com'/g, "'http://localhost:5000'");

      // 2. Replace /api URLs (fetch calls, etc)
      content = content.replace(/https:\/\/nexoria-backend-mt5e\.onrender\.com\/api/g, "/api");
      
      // 3. Replace baseUrl in NexoriaMusic (which is currently just the domain without /api)
      // Actually, after the above replacements, if there's any remaining `https://nexoria-backend-mt5e.onrender.com`
      // it should probably be removed (since they append /api manually or something)
      content = content.replace(/https:\/\/nexoria-backend-mt5e\.onrender\.com/g, "");

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
      }
    }
  });
}

findAndReplace(directoryPath);
