const fs = require('fs');
let c = fs.readFileSync('d:/mods apps/frontend/src/pages/SinglePost.jsx', 'utf8');

c = c.replace(/<FallbackImage src=\{([^}]+)\} fallbackType=(['"])[^'"]+\2 alt=\{([^}]+)\} className=(['"])([^'"]+)\4 \/>/g, '<img src={$1} alt={$3} className=$4$5$4 />');
c = c.replace(/import FallbackImage from '\.\.\/components\/FallbackImage';\n/, '');
c = c.replace(/glass-card/g, 'bg-white rounded-lg shadow-md border border-gray-200');
c = c.replace(/<motion\.div[^>]*>/g, '<div>');
c = c.replace(/<\/motion\.div>/g, '</div>');
c = c.replace(/import \{ motion \} from 'framer-motion';\n/, '');

fs.writeFileSync('d:/mods apps/frontend/src/pages/SinglePost.jsx', c);
