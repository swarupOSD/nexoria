const fs = require('fs');
const path = require('path');

function refactorFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Add responsive modifiers to reduce spacing on mobile but keep desktop intact
  content = content.replace(/className="([^"]*)"/g, (match, classNames) => {
    let classes = classNames.split(' ');
    let newClasses = classes.map(c => {
      // Avoid modifying if already responsive
      if (classes.includes(`md:${c}`)) return c;
      
      if (c === 'p-6') return 'p-4 md:p-6';
      if (c === 'p-8') return 'p-4 md:p-8';
      if (c === 'p-10') return 'p-5 md:p-10';
      if (c === 'p-12') return 'p-6 md:p-12';
      if (c === 'px-6') return 'px-4 md:px-6';
      if (c === 'py-6') return 'py-4 md:py-6';
      if (c === 'px-8') return 'px-4 md:px-8';
      if (c === 'py-8') return 'py-4 md:py-8';
      if (c === 'gap-6') return 'gap-4 md:gap-6';
      if (c === 'gap-8') return 'gap-4 md:gap-8';
      if (c === 'space-y-6') return 'space-y-4 md:space-y-6';
      if (c === 'space-y-8') return 'space-y-4 md:space-y-8';
      if (c === 'mb-6') return 'mb-4 md:mb-6';
      if (c === 'mb-8') return 'mb-4 md:mb-8';
      if (c === 'mt-6') return 'mt-4 md:mt-6';
      if (c === 'mt-8') return 'mt-4 md:mt-8';
      
      // Also ensuring text size isn't overwhelmingly large on mobile admin panels
      if (c === 'text-3xl' && !classes.includes('md:text-3xl')) return 'text-2xl md:text-3xl';
      if (c === 'text-4xl' && !classes.includes('md:text-4xl')) return 'text-3xl md:text-4xl';
      
      return c;
    });
    
    newClasses = [...new Set(newClasses)];
    return `className="${newClasses.join(' ')}"`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored: ${path.basename(filePath)}`);
  }
}

function traverseDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath);
    } else if (file.endsWith('.jsx')) {
      refactorFile(fullPath);
    }
  }
}

const adminDir = path.join(__dirname, 'src', 'pages', 'Admin');
if (fs.existsSync(adminDir)) {
  traverseDirectory(adminDir);
  console.log('Done refactoring Admin Panel files!');
} else {
  console.error('Directory not found:', adminDir);
}
