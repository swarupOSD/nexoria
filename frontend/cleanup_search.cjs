const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (let file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findFiles(filePath, files);
    } else if (filePath.endsWith('.jsx')) {
      files.push(filePath);
    }
  }
  return files;
}

const files = findFiles(srcDir);

files.forEach(file => {
  if (file.includes('CustomSearchBar') || file.includes('Navbar.jsx')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // We match the full CustomSearchBar tag including internal > characters.
  // Then we capture the trailing junk until the next />.
  // We make sure the trailing junk is short and starts with whitespace/className.
  const cleanupRegex = /(<CustomSearchBar[\s\S]*?\/>)([\s\S]*?\/>)/g;
  
  if (cleanupRegex.test(content)) {
    content = content.replace(cleanupRegex, (match, tag, trailing) => {
      // If trailing is short and doesn't contain another tag like <div>
      if (trailing.length < 300 && !trailing.includes('<div') && trailing.includes('className')) {
        return tag;
      }
      // Or if trailing is just ` />`
      if (trailing.trim() === '/>') {
        return tag;
      }
      return match;
    });
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Cleaned up', file);
  }
});
