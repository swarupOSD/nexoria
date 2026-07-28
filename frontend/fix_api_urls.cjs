const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getRelativePathToApiSlice(filePath) {
  const fileDir = path.dirname(filePath);
  const apiSlicePath = path.join(srcDir, 'features', 'api', 'apiSlice.js');
  let relativePath = path.relative(fileDir, apiSlicePath).replace(/\\/g, '/');
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  return relativePath.replace('.js', '');
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Regex to find fetch('/api/...') or fetch(`/api/...`) or axios.get('/api/...')
      // We will look for anything starting with '/api/' or `/api/` in fetch/axios or upload endpoints
      const fetchRegex = /(fetch|axios\.(get|post|put|delete))\(\s*(['"`])\/api\//g;
      
      if (fetchRegex.test(content) || content.includes(`url = editingId ? \`/api/`) || content.includes(`endpoint = type === 'video' ? '/api/upload/video' : '/api/upload/image'`)) {
        
        // Add import if not exists
        if (!content.includes('BACKEND_URL')) {
          const relativePath = getRelativePathToApiSlice(fullPath);
          const importStmt = `import { BACKEND_URL } from '${relativePath}';\n`;
          // insert after last import
          const lastImportIndex = content.lastIndexOf('import ');
          if (lastImportIndex !== -1) {
            const nextLineIndex = content.indexOf('\n', lastImportIndex);
            content = content.slice(0, nextLineIndex + 1) + importStmt + content.slice(nextLineIndex + 1);
          } else {
            content = importStmt + content;
          }
        }

        // Replace all '/api/' with `${BACKEND_URL}/`
        // We have to be careful about replacing strings vs template literals
        // For '...': replace with `${BACKEND_URL}/...`
        content = content.replace(/'\/api\/([^']*)'/g, "`${BACKEND_URL}/$1`");
        // For "...": replace with `${BACKEND_URL}/...`
        content = content.replace(/"\/api\/([^"]*)"/g, "`${BACKEND_URL}/$1`");
        // For `...`: replace with `${BACKEND_URL}/...`
        content = content.replace(/`\/api\/([^`]*)`/g, "`${BACKEND_URL}/$1`");
        
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed:', fullPath);
      }
    }
  }
}

processDirectory(srcDir);
