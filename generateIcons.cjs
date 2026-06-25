const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function createIcons() {
  const sourcePath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\dff4feba-1a93-47ae-9382-28eb10f75bf5\\media__1782368527641.jpg';
  const pubDir = 'd:\\mods apps\\frontend\\public';
  
  try {
    const metadata = await sharp(sourcePath).metadata();
    
    // The mic is around the left-center. Let's extract a square region.
    // The image looks to be 1920x1080 approx.
    const size = metadata.height;
    // offset 15% from left to center the mic text "NEXORIA"
    const leftOffset = Math.floor(metadata.width * 0.15); 
    
    const base = sharp(sourcePath).extract({ left: leftOffset, top: 0, width: size, height: size });

    await base.clone().resize(192, 192).toFile(path.join(pubDir, 'icon-192x192.png'));
    await base.clone().resize(512, 512).toFile(path.join(pubDir, 'icon-512x512.png'));
    
    // Convert to a favicon as well to replace the SVG if they want
    await base.clone().resize(32, 32).toFile(path.join(pubDir, 'favicon.png'));
    
    console.log('Icons created successfully in public directory using sharp!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

createIcons();
