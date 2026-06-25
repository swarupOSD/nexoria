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

  // Fix broken imports
  // If we see "import {\nimport CustomSearchBar", we move CustomSearchBar to the top.
  if (content.includes('import CustomSearchBar from')) {
    // Remove the bad import
    const badImportRegex = /import CustomSearchBar from '[^']+';\r?\n/g;
    let importsMatch = content.match(badImportRegex);
    if (importsMatch) {
      const imp = importsMatch[0];
      content = content.replace(badImportRegex, '');
      // Put it at the very top safely
      content = imp + content;
      changed = true;
    }
  }

  // Fix broken component tags
  // <CustomSearchBar value={search} placeholder="..." name="text" /> setSearch(e.target.value)}
  const brokenTagRegex = /<CustomSearchBar([^>]+)\/>\s*([a-zA-Z0-9_]+\(e\.target\.value\)\})/g;
  if (brokenTagRegex.test(content)) {
    content = content.replace(brokenTagRegex, (match, p1, p2) => {
      // p2 is like "setSearch(e.target.value)}"
      return `<CustomSearchBar${p1} onChange={(e) => ${p2} />`;
    });
    changed = true;
  }
  
  // also handle MovieBoxLayout.jsx which had multiple ones
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
