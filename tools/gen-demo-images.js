/**
 * Generate SVG images as data URLs for the sample room.
 * Run: node tools/gen-demo-images.js
 * Outputs updated sample-room.json with embedded images.
 */
const fs = require('fs');
const path = require('path');

const svgs = {};

// --- Background: study room with wood paneling and floor ---
svgs.background = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4a3c2a"/>
      <stop offset="100%" stop-color="#3a2e1e"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2a1e12"/>
      <stop offset="100%" stop-color="#1a1208"/>
    </linearGradient>
  </defs>
  <rect width="800" height="420" fill="url(#wall)"/>
  <rect y="420" width="800" height="180" fill="url(#floor)"/>
  <line x1="0" y1="420" x2="800" y2="420" stroke="#5a4a30" stroke-width="3"/>
  <rect y="320" width="800" height="100" fill="#3d2e1a" opacity="0.35"/>
  <line x1="0" y1="320" x2="800" y2="320" stroke="#5a4a30" stroke-width="1.5"/>
  <line x1="0" y1="470" x2="800" y2="470" stroke="#221a0e" stroke-width="0.5" opacity="0.4"/>
  <line x1="0" y1="520" x2="800" y2="520" stroke="#221a0e" stroke-width="0.5" opacity="0.4"/>
  <line x1="0" y1="570" x2="800" y2="570" stroke="#221a0e" stroke-width="0.5" opacity="0.4"/>
  <line x1="100" y1="420" x2="100" y2="600" stroke="#221a0e" stroke-width="0.3" opacity="0.3"/>
  <line x1="250" y1="420" x2="250" y2="600" stroke="#221a0e" stroke-width="0.3" opacity="0.3"/>
  <line x1="400" y1="420" x2="400" y2="600" stroke="#221a0e" stroke-width="0.3" opacity="0.3"/>
  <line x1="550" y1="420" x2="550" y2="600" stroke="#221a0e" stroke-width="0.3" opacity="0.3"/>
  <line x1="700" y1="420" x2="700" y2="600" stroke="#221a0e" stroke-width="0.3" opacity="0.3"/>
  <ellipse cx="400" cy="150" rx="350" ry="200" fill="#6a5a3a" opacity="0.06"/>
</svg>`;

// --- Painting: ship at sea in gold frame ---
svgs.painting = `
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="100">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2a4a6a"/>
      <stop offset="100%" stop-color="#6a8aaa"/>
    </linearGradient>
  </defs>
  <rect width="140" height="100" rx="2" fill="#b8860b"/>
  <rect x="3" y="3" width="134" height="94" rx="1" fill="#daa520"/>
  <rect x="8" y="8" width="124" height="84" fill="url(#sky)"/>
  <rect x="8" y="55" width="124" height="37" fill="#1a3a5a"/>
  <path d="M8,60 Q40,55 70,62 Q100,68 132,58" fill="none" stroke="#3a6a8a" stroke-width="0.8"/>
  <path d="M8,70 Q50,65 90,72 Q120,76 132,68" fill="none" stroke="#2a5a7a" stroke-width="0.5"/>
  <path d="M55,42 L55,65 L85,65 L80,42 Z" fill="#5a3a1a"/>
  <line x1="65" y1="25" x2="65" y2="65" stroke="#3a2a10" stroke-width="1.5"/>
  <path d="M65,25 L85,35 L65,45 Z" fill="#e8d8c8" opacity="0.9"/>
  <path d="M65,30 L48,40 L65,50 Z" fill="#e0d0c0" opacity="0.8"/>
  <circle cx="120" cy="30" r="10" fill="#e8a040" opacity="0.6"/>
  <circle cx="120" cy="30" r="6" fill="#f0c060" opacity="0.7"/>
  <rect x="8" y="8" width="124" height="84" fill="none" stroke="#8a6a10" stroke-width="1"/>
</svg>`;

// --- Bookshelf ---
svgs.bookshelf = `
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="200">
  <rect width="120" height="200" fill="#4a3018"/>
  <rect x="0" y="0" width="5" height="200" fill="#3a2010"/>
  <rect x="115" y="0" width="5" height="200" fill="#3a2010"/>
  <rect x="5" y="0" width="110" height="5" fill="#6a4a28"/>
  <rect x="5" y="48" width="110" height="5" fill="#6a4a28"/>
  <rect x="5" y="98" width="110" height="5" fill="#6a4a28"/>
  <rect x="5" y="148" width="110" height="5" fill="#6a4a28"/>
  <rect x="5" y="195" width="110" height="5" fill="#6a4a28"/>
  <rect x="10" y="6" width="12" height="40" fill="#8b2020" rx="1"/>
  <rect x="24" y="10" width="10" height="36" fill="#2a4a2a" rx="1"/>
  <rect x="36" y="8" width="14" height="38" fill="#1a3a6a" rx="1"/>
  <rect x="52" y="6" width="8" height="40" fill="#6a2a4a" rx="1"/>
  <rect x="62" y="11" width="12" height="35" fill="#4a4a1a" rx="1"/>
  <rect x="76" y="7" width="10" height="39" fill="#3a1a1a" rx="1"/>
  <rect x="88" y="9" width="14" height="37" fill="#2a3a4a" rx="1"/>
  <rect x="12" y="55" width="14" height="40" fill="#4a2020" rx="1"/>
  <rect x="28" y="58" width="10" height="37" fill="#1a4a4a" rx="1"/>
  <rect x="40" y="54" width="12" height="42" fill="#6a5a20" rx="1"/>
  <rect x="54" y="56" width="16" height="40" fill="#3a2a5a" rx="1"/>
  <rect x="72" y="59" width="10" height="37" fill="#5a3a1a" rx="1"/>
  <rect x="84" y="55" width="14" height="41" fill="#2a5a3a" rx="1"/>
  <rect x="10" y="105" width="16" height="40" fill="#5a1a3a" rx="1"/>
  <rect x="28" y="108" width="10" height="37" fill="#3a5a2a" rx="1"/>
  <rect x="40" y="104" width="12" height="42" fill="#1a2a5a" rx="1"/>
  <rect x="54" y="107" width="8" height="38" fill="#6a4a1a" rx="1"/>
  <rect x="64" y="105" width="14" height="40" fill="#2a2a2a" rx="1"/>
  <rect x="80" y="109" width="12" height="36" fill="#5a2a20" rx="1"/>
  <rect x="94" y="106" width="10" height="39" fill="#1a5a5a" rx="1"/>
  <rect x="14" y="155" width="10" height="37" fill="#4a3a2a" rx="1"/>
  <rect x="26" y="152" width="14" height="42" fill="#2a1a4a" rx="1"/>
  <rect x="42" y="156" width="12" height="37" fill="#5a5a1a" rx="1"/>
  <rect x="56" y="153" width="10" height="41" fill="#1a3a3a" rx="1"/>
  <rect x="68" y="155" width="16" height="38" fill="#6a2a2a" rx="1"/>
  <rect x="86" y="154" width="12" height="40" fill="#3a4a2a" rx="1"/>
</svg>`;

// --- Desk ---
svgs.desk = `
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="120">
  <defs>
    <linearGradient id="dtop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7a5232"/>
      <stop offset="100%" stop-color="#6a4226"/>
    </linearGradient>
  </defs>
  <rect x="5" y="10" width="210" height="15" rx="2" fill="url(#dtop)"/>
  <rect x="5" y="10" width="210" height="3" fill="#8a6242" opacity="0.6"/>
  <rect x="10" y="25" width="200" height="85" fill="#5a3a1e"/>
  <rect x="10" y="25" width="200" height="2" fill="#4a2a10"/>
  <rect x="60" y="35" width="100" height="30" rx="1" fill="#6a4a28" stroke="#4a3018" stroke-width="1"/>
  <rect x="95" y="48" width="30" height="4" rx="2" fill="#b8860b"/>
  <rect x="15" y="110" width="8" height="10" fill="#4a2a10"/>
  <rect x="197" y="110" width="8" height="10" fill="#4a2a10"/>
  <rect x="25" y="2" width="20" height="10" rx="1" fill="#d4c4a0" opacity="0.5"/>
  <circle cx="170" cy="8" r="5" fill="#2a2a2a" opacity="0.3"/>
</svg>`;

// --- Drawer ---
svgs.drawer = `
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40">
  <rect width="120" height="40" rx="2" fill="#7a5030"/>
  <rect x="2" y="2" width="116" height="36" rx="1" fill="#6a4528" stroke="#5a3820" stroke-width="1"/>
  <rect x="8" y="6" width="104" height="28" rx="1" fill="#5a3a1e" opacity="0.5"/>
  <rect x="42" y="15" width="36" height="5" rx="2.5" fill="#c0960b" stroke="#a07a08" stroke-width="0.5"/>
  <circle cx="60" cy="28" r="3" fill="#2a1a0a"/>
  <rect x="59" y="28" width="2" height="5" fill="#2a1a0a"/>
</svg>`;

// --- Safe ---
svgs.safe = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="80">
  <defs>
    <linearGradient id="sf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6a6a6a"/>
      <stop offset="100%" stop-color="#4a4a4a"/>
    </linearGradient>
  </defs>
  <rect width="100" height="80" rx="3" fill="url(#sf)" stroke="#888" stroke-width="2"/>
  <rect x="5" y="5" width="90" height="70" rx="2" fill="#555" stroke="#666" stroke-width="1"/>
  <circle cx="50" cy="40" r="16" fill="#3a3a3a" stroke="#777" stroke-width="2"/>
  <circle cx="50" cy="40" r="12" fill="#444" stroke="#666" stroke-width="1"/>
  <circle cx="50" cy="40" r="2" fill="#888"/>
  <line x1="50" y1="26" x2="50" y2="30" stroke="#999" stroke-width="1"/>
  <line x1="50" y1="50" x2="50" y2="54" stroke="#999" stroke-width="1"/>
  <line x1="36" y1="40" x2="40" y2="40" stroke="#999" stroke-width="1"/>
  <line x1="60" y1="40" x2="64" y2="40" stroke="#999" stroke-width="1"/>
  <line x1="50" y1="40" x2="50" y2="29" stroke="#cc3333" stroke-width="1.5"/>
  <rect x="75" y="32" width="12" height="16" rx="3" fill="#777" stroke="#999" stroke-width="1"/>
  <text x="50" y="17" text-anchor="middle" font-size="6" fill="#888" font-family="serif">VAULT</text>
</svg>`;

// --- Clock ---
svgs.clock = `
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
  <circle cx="40" cy="40" r="38" fill="#3a3a3a" stroke="#666" stroke-width="2"/>
  <circle cx="40" cy="40" r="34" fill="#f5f0e0"/>
  <circle cx="40" cy="40" r="32" fill="#f0ebd5" stroke="#aa9a70" stroke-width="1"/>
  <line x1="40" y1="10" x2="40" y2="14" stroke="#333" stroke-width="2"/>
  <line x1="40" y1="66" x2="40" y2="70" stroke="#333" stroke-width="2"/>
  <line x1="10" y1="40" x2="14" y2="40" stroke="#333" stroke-width="2"/>
  <line x1="66" y1="40" x2="70" y2="40" stroke="#333" stroke-width="2"/>
  <text x="40" y="20" text-anchor="middle" font-size="7" fill="#333" font-family="serif">12</text>
  <text x="61" y="43" text-anchor="middle" font-size="7" fill="#333" font-family="serif">3</text>
  <text x="40" y="66" text-anchor="middle" font-size="7" fill="#333" font-family="serif">6</text>
  <text x="19" y="43" text-anchor="middle" font-size="7" fill="#333" font-family="serif">9</text>
  <line x1="40" y1="40" x2="41" y2="58" stroke="#222" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="40" y1="40" x2="21" y2="50" stroke="#222" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="40" cy="40" r="2.5" fill="#333"/>
  <circle cx="40" cy="40" r="1" fill="#aa8840"/>
</svg>`;

// --- Door ---
svgs.door = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="180">
  <defs>
    <linearGradient id="dr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#5a3d20"/>
      <stop offset="50%" stop-color="#6a4a28"/>
      <stop offset="100%" stop-color="#4a3018"/>
    </linearGradient>
  </defs>
  <rect width="100" height="180" fill="#3a2510"/>
  <rect x="5" y="3" width="90" height="174" rx="1" fill="url(#dr)"/>
  <rect x="15" y="12" width="70" height="55" rx="2" fill="#5a3a1e" stroke="#4a2a10" stroke-width="1.5"/>
  <rect x="15" y="78" width="70" height="55" rx="2" fill="#5a3a1e" stroke="#4a2a10" stroke-width="1.5"/>
  <rect x="15" y="144" width="70" height="28" rx="2" fill="#5a3a1e" stroke="#4a2a10" stroke-width="1.5"/>
  <circle cx="78" cy="95" r="6" fill="#b8860b" stroke="#8a6a08" stroke-width="1"/>
  <circle cx="78" cy="95" r="2.5" fill="#daa520"/>
  <circle cx="78" cy="108" r="3" fill="#1a0a00"/>
  <rect x="77" y="108" width="2" height="6" fill="#1a0a00"/>
  <rect x="7" y="30" width="4" height="12" rx="1" fill="#8a7a50"/>
  <rect x="7" y="130" width="4" height="12" rx="1" fill="#8a7a50"/>
</svg>`;

// --- Rug ---
svgs.rug = `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="60">
  <defs>
    <pattern id="rp" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="#8B2252"/>
      <rect x="5" y="5" width="10" height="10" fill="#6a1a40" opacity="0.5"/>
      <path d="M0,0 L5,5 M15,5 L20,0 M0,20 L5,15 M15,15 L20,20" stroke="#aa3a6a" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect x="4" y="4" width="292" height="52" rx="2" fill="url(#rp)"/>
  <rect x="4" y="4" width="292" height="52" rx="2" fill="none" stroke="#aa3a6a" stroke-width="3"/>
  <rect x="8" y="8" width="284" height="44" rx="1" fill="none" stroke="#d4a060" stroke-width="1"/>
  <ellipse cx="150" cy="30" rx="40" ry="16" fill="#6a1a3f" opacity="0.4"/>
  <ellipse cx="150" cy="30" rx="25" ry="10" fill="#aa3a6a" opacity="0.3"/>
</svg>`;

// --- Convert to data URLs and update JSON ---
function toDataUrl(svg) {
  const clean = svg.replace(/\n\s*/g, '');
  return 'data:image/svg+xml;base64,' + Buffer.from(clean).toString('base64');
}

const roomPath = path.join(__dirname, '..', 'js', 'data', 'sample-room.json');
const room = JSON.parse(fs.readFileSync(roomPath, 'utf8'));

// Set background image
room.background = { type: 'image', value: toDataUrl(svgs.background) };

// Map hotspot IDs to SVG names
const hotspotImageMap = {
  'hs_painting': 'painting',
  'hs_bookshelf': 'bookshelf',
  'hs_desk': 'desk',
  'hs_drawer': 'drawer',
  'hs_safe': 'safe',
  'hs_clock': 'clock',
  'hs_door': 'door',
  'hs_rug': 'rug'
};

for (const hs of room.hotspots) {
  const svgName = hotspotImageMap[hs.id];
  if (svgName && svgs[svgName]) {
    hs.appearance.image = toDataUrl(svgs[svgName]);
  }
}

fs.writeFileSync(roomPath, JSON.stringify(room, null, 2) + '\n');
console.log('Done! Updated sample-room.json with SVG images.');
console.log('Background: image set');
console.log('Hotspots with images:', Object.keys(hotspotImageMap).join(', '));
