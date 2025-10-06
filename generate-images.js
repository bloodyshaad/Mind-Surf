const fs = require('fs');
const path = require('path');

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// Function to generate SVG logo
function generateLogoSVG(size) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="50" height="50" rx="10" fill="#000000"/>
    <circle cx="25" cy="24" r="15" stroke="#FFFFFF" stroke-width="2"/>
    <path d="M15 24C15 24 18 18 25 18C32 18 35 24 35 24" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
    <circle cx="20" cy="20" r="2" fill="#FFFFFF"/>
    <circle cx="30" cy="20" r="2" fill="#FFFFFF"/>
</svg>`;
}

// Function to generate favicon SVG
function generateFaviconSVG(size) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#000000"/>
    <circle cx="16" cy="16" r="10" stroke="#FFFFFF" stroke-width="1.5"/>
    <path d="M10 16C10 16 12 12 16 12C20 12 22 16 22 16" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="13" cy="14" r="1.5" fill="#FFFFFF"/>
    <circle cx="19" cy="14" r="1.5" fill="#FFFFFF"/>
</svg>`;
}

// Function to generate Apple Touch Icon SVG
function generateAppleTouchIconSVG(size) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="180" height="180" rx="40" fill="#000000"/>
    <circle cx="90" cy="90" r="50" stroke="#FFFFFF" stroke-width="6"/>
    <path d="M60 90C60 90 70 70 90 70C110 70 120 90 120 90" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
    <circle cx="75" cy="80" r="6" fill="#FFFFFF"/>
    <circle cx="105" cy="80" r="6" fill="#FFFFFF"/>
    <text x="90" y="145" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle">MindSurf</text>
</svg>`;
}

// Function to generate OG Image SVG
function generateOGImageSVG() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#000000"/>
    
    <!-- Background Pattern -->
    <circle cx="100" cy="100" r="150" fill="#1A1A1A" opacity="0.5"/>
    <circle cx="1100" cy="530" r="200" fill="#1A1A1A" opacity="0.5"/>
    <circle cx="600" cy="315" r="250" fill="#1A1A1A" opacity="0.3"/>
    
    <!-- Logo -->
    <circle cx="300" cy="315" r="80" stroke="#FFFFFF" stroke-width="8"/>
    <path d="M250 315C250 315 265 280 300 280C335 280 350 315 350 315" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>
    <circle cx="280" cy="300" r="8" fill="#FFFFFF"/>
    <circle cx="320" cy="300" r="8" fill="#FFFFFF"/>
    
    <!-- Text -->
    <text x="500" y="280" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="#FFFFFF">MindSurf</text>
    <text x="500" y="350" font-family="Arial, sans-serif" font-size="36" fill="#A3A3A3">Navigate Your Stress Journey</text>
    <text x="500" y="420" font-family="Arial, sans-serif" font-size="24" fill="#737373">Teen Stress Management Platform</text>
</svg>`;
}

// Function to generate Screenshot SVG
function generateScreenshotSVG(number) {
    const titles = {
        1: 'Interactive Stress Quiz',
        2: 'Personalized Results & Solutions'
    };
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1280" height="720" viewBox="0 0 1280 720" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1280" height="720" fill="#FAFAFA"/>
    
    <!-- Header -->
    <rect width="1280" height="80" fill="#000000"/>
    <circle cx="60" cy="40" r="20" stroke="#FFFFFF" stroke-width="2"/>
    <path d="M50 40C50 40 53 35 60 35C67 35 70 40 70 40" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
    <text x="100" y="50" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF">MindSurf</text>
    
    <!-- Content -->
    <text x="640" y="200" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#000000" text-anchor="middle">${titles[number]}</text>
    
    <!-- Card -->
    <rect x="240" y="250" width="800" height="400" rx="16" fill="#FFFFFF" stroke="#E5E5E5" stroke-width="2"/>
    
    ${number === 1 ? `
    <!-- Quiz Content -->
    <text x="280" y="300" font-family="Arial, sans-serif" font-size="20" font-weight="600" fill="#000000">How often do you feel overwhelmed?</text>
    <rect x="280" y="330" width="720" height="60" rx="8" fill="#F5F5F5" stroke="#D4D4D4" stroke-width="2"/>
    <text x="300" y="365" font-family="Arial, sans-serif" font-size="16" fill="#525252">Rarely or never</text>
    <rect x="280" y="410" width="720" height="60" rx="8" fill="#F5F5F5" stroke="#D4D4D4" stroke-width="2"/>
    <text x="300" y="445" font-family="Arial, sans-serif" font-size="16" fill="#525252">Sometimes (1-2 times per week)</text>
    <rect x="280" y="490" width="720" height="60" rx="8" fill="#000000"/>
    <text x="300" y="525" font-family="Arial, sans-serif" font-size="16" fill="#FFFFFF">Often (3-4 times per week)</text>
    ` : `
    <!-- Results Content -->
    <circle cx="640" cy="400" r="80" fill="none" stroke="#000000" stroke-width="8"/>
    <text x="640" y="415" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#000000" text-anchor="middle">65%</text>
    <text x="640" y="500" font-family="Arial, sans-serif" font-size="24" fill="#525252" text-anchor="middle">Moderate Stress Level</text>
    <rect x="280" y="540" width="720" height="80" rx="8" fill="#F0F9FF" stroke="#0284C7" stroke-width="2"/>
    <text x="300" y="575" font-family="Arial, sans-serif" font-size="16" font-weight="600" fill="#0C4A6E">Recommended Actions</text>
    <text x="300" y="600" font-family="Arial, sans-serif" font-size="14" fill="#0C4A6E">✓ Practice daily stress-reduction techniques</text>
    `}
</svg>`;
}

// Write all SVG files
console.log('Generating MindSurf images...\n');

// Generate icons
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
iconSizes.forEach(size => {
    const svg = generateLogoSVG(size);
    const filename = `icon-${size}x${size}.svg`;
    fs.writeFileSync(path.join(assetsDir, filename), svg);
    console.log(`✓ Generated ${filename}`);
});

// Generate favicons
const faviconSizes = [16, 32];
faviconSizes.forEach(size => {
    const svg = generateFaviconSVG(size);
    const filename = `favicon-${size}x${size}.svg`;
    fs.writeFileSync(path.join(assetsDir, filename), svg);
    console.log(`✓ Generated ${filename}`);
});

// Generate Apple Touch Icon
const appleTouchIcon = generateAppleTouchIconSVG(180);
fs.writeFileSync(path.join(assetsDir, 'apple-touch-icon.svg'), appleTouchIcon);
console.log('✓ Generated apple-touch-icon.svg');

// Generate OG Image
const ogImage = generateOGImageSVG();
fs.writeFileSync(path.join(assetsDir, 'og-image.svg'), ogImage);
console.log('✓ Generated og-image.svg');

// Generate Screenshots
[1, 2].forEach(num => {
    const screenshot = generateScreenshotSVG(num);
    fs.writeFileSync(path.join(assetsDir, `screenshot${num}.svg`), screenshot);
    console.log(`✓ Generated screenshot${num}.svg`);
});

console.log('\n✅ All images generated successfully!');
console.log(`📁 Images saved to: ${assetsDir}`);
console.log('\n📝 Note: SVG files are generated. For PNG conversion, you can:');
console.log('   1. Use an online converter (e.g., cloudconvert.com)');
console.log('   2. Use ImageMagick: convert input.svg output.png');
console.log('   3. Use Inkscape: inkscape input.svg --export-png=output.png');
console.log('   4. Open in browser and screenshot');
console.log('\n💡 SVG files work great for web and can be used directly!');
