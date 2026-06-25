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
let changedFiles = 0;

files.forEach(file => {
  if (file.includes('CustomSearchBar') || file.includes('Navbar.jsx')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let hasChanges = false;
  
  // Find <input ... placeholder="Search..." ... />
  // We need to match <input ... /> safely.
  const inputRegex = /<input[^>]*placeholder="Search[^>]*>/gi;
  
  content = content.replace(inputRegex, (match) => {
    hasChanges = true;
    
    // Extract props
    const getProp = (name) => {
      const regex = new RegExp(`(?:\\s|^)${name}=({[^}]+}|"[^"]+"|'[^']+')`);
      const m = match.match(regex);
      return m ? m[1] : null;
    };
    
    const value = getProp('value');
    const onChange = getProp('onChange');
    const onFocus = getProp('onFocus');
    const placeholder = getProp('placeholder');
    const name = getProp('name') || '"text"';
    
    // Construct CustomSearchBar
    let props = [];
    if (value) props.push(`value=${value}`);
    if (onChange) props.push(`onChange=${onChange}`);
    if (onFocus) props.push(`onFocus=${onFocus}`);
    if (placeholder) props.push(`placeholder=${placeholder}`);
    if (name) props.push(`name=${name}`);
    
    return `<CustomSearchBar ${props.join(' ')} />`;
  });
  
  if (hasChanges) {
    // Determine relative path to CustomSearchBar
    const fileDir = path.dirname(file);
    const componentPath = path.join(srcDir, 'components', 'CustomSearchBar');
    let relativePath = path.relative(fileDir, componentPath).replace(/\\/g, '/');
    if (!relativePath.startsWith('.')) relativePath = './' + relativePath;
    
    const importStmt = `import CustomSearchBar from '${relativePath}';\n`;
    
    // add import after the last import
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLine = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLine + 1) + importStmt + content.slice(endOfLine + 1);
    } else {
      content = importStmt + content;
    }
    
    fs.writeFileSync(file, content);
    changedFiles++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Finished. Updated ${changedFiles} files.`);
