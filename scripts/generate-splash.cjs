const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateSplash() {
    const logoPath = path.join(__dirname, '..', 'public', 'Logo.png');
    const splashPath = path.join(__dirname, '..', 'assets', 'splash.png');
    const splashSize = 2732; // Large enough for all Android splash screens

    console.log('Generating improved splash screen...');

    if (!fs.existsSync(logoPath)) {
        console.error('Logo not found at:', logoPath);
        return;
    }

    try {
        // 1. Create a white background
        const background = sharp({
            create: {
                width: splashSize,
                height: splashSize,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
        });

        // 2. Resize the logo to fit in the center (e.g., 40% of the splash size to ensure it's not cropped)
        const logoBuffer = await sharp(logoPath)
            .resize({
                width: Math.floor(splashSize * 0.4),
                height: Math.floor(splashSize * 0.4),
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .toBuffer();

        // 3. Composite logo onto white background
        await background
            .composite([{ input: logoBuffer, gravity: 'center' }])
            .toFile(splashPath);

        console.log('Successfully generated assets/splash.png with white background and centered logo.');
    } catch (err) {
        console.error('Error generating splash:', err);
    }
}

generateSplash();
