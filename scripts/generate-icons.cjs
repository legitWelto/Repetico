const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Android adaptive icon sizes per density
const densities = [
  { folder: 'mipmap-ldpi',    size: 36,  fgSize: 54 },
  { folder: 'mipmap-mdpi',    size: 48,  fgSize: 72 },
  { folder: 'mipmap-hdpi',    size: 72,  fgSize: 108 },
  { folder: 'mipmap-xhdpi',   size: 96,  fgSize: 144 },
  { folder: 'mipmap-xxhdpi',  size: 144, fgSize: 216 },
  { folder: 'mipmap-xxxhdpi', size: 192, fgSize: 288 },
];

async function generateIcons() {
  const iconPath = path.join(__dirname, '..', 'assets', 'icon-only.png');
  const resDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

  if (!fs.existsSync(iconPath)) {
    console.error('Icon not found at:', iconPath);
    return;
  }

  console.log('Generating Android launcher icons from assets/icon-only.png...');

  for (const density of densities) {
    const outDir = path.join(resDir, density.folder);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    // ic_launcher.png - Full icon (with background baked in)
    await sharp(iconPath)
      .resize(density.size, density.size, { fit: 'cover' })
      .png()
      .toFile(path.join(outDir, 'ic_launcher.png'));

    // ic_launcher_round.png - Circular crop
    const roundMask = Buffer.from(
      `<svg width="${density.size}" height="${density.size}">
        <circle cx="${density.size / 2}" cy="${density.size / 2}" r="${density.size / 2}" fill="white"/>
      </svg>`
    );
    await sharp(iconPath)
      .resize(density.size, density.size, { fit: 'cover' })
      .composite([{ input: roundMask, blend: 'dest-in' }])
      .png()
      .toFile(path.join(outDir, 'ic_launcher_round.png'));

    // ic_launcher_foreground.png - Adaptive icon foreground (larger canvas with padding)
    // The foreground should be 108dp, with the icon within the center 66dp safe zone
    // fgSize = density.fgSize (108dp equivalent at this density)
    const fgSize = density.fgSize;
    const iconInFg = Math.round(fgSize * 0.60); // Icon at ~60% of foreground for safe zone
    const iconBuffer = await sharp(iconPath)
      .resize(iconInFg, iconInFg, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: fgSize,
        height: fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: iconBuffer, gravity: 'centre' }])
      .png()
      .toFile(path.join(outDir, 'ic_launcher_foreground.png'));

    console.log(`  ✓ ${density.folder} (${density.size}px icon, ${density.fgSize}px foreground)`);
  }

  // Update adaptive icon background color to match the icon's dark blue
  const bgColorPath = path.join(resDir, 'values', 'ic_launcher_background.xml');
  fs.writeFileSync(bgColorPath,
    `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#1a2744</color>\n</resources>\n`
  );
  console.log('  ✓ Updated adaptive icon background color to #1a2744');

  console.log('Done! All Android launcher icons have been generated.');
}

generateIcons().catch(console.error);
