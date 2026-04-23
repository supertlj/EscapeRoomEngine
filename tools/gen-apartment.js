/**
 * Generate "The Apartment" — premium escape room with zoom views,
 * animated interactions, and visual item discovery.
 *
 * Puzzle chain:
 *   1. Tap plant → zoom in → see key in soil → tap key → flies to inventory
 *   2. Use key on cabinet → zoom in → drawer slides open → find paper "TAKI"
 *   3. Tap laptop → zoom in → password puzzle "TAKI" → shows "1886"
 *   4. Tap lockbox → zoom in → code puzzle "1886" → keycard appears → pick up
 *   5. Use keycard on door → card reader beeps → escape!
 *
 * Run: node tools/gen-apartment.js
 */
const fs = require('fs');
const path = require('path');

const ASSET_DIR = path.join(__dirname, '..', 'assets', 'rooms', 'apartment');
const ASSET_URL = 'assets/rooms/apartment'; // relative to project root (served by web server)

// Save SVG to file and return the URL path for use in room JSON
function saveSvg(subdir, name, svg) {
  const dir = path.join(ASSET_DIR, subdir);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, name + '.svg');
  fs.writeFileSync(filePath, svg.trim() + '\n');
  return `${ASSET_URL}/${subdir}/${name}.svg`;
}

// Legacy: embed SVG as base64 data URL (for items that are too small to be separate files)
function toDataUrl(svg) {
  return 'data:image/svg+xml;base64,' + Buffer.from(svg.replace(/\n\s*/g, '')).toString('base64');
}

// ============================================================
//  MAIN ROOM SVGs — 3D perspective room view
//  Vanishing point at ~(400, 180). Back wall ~y:70-340, floor y:340-600
// ============================================================
const svgs = {};

// VP = vanishing point (400, 180)
// Back wall corners: TL(100,70) TR(700,70) BL(100,340) BR(700,340)
// Floor extends from back wall bottom to screen bottom
// Left wall: (0,0)→(100,70) top, (0,600)→(100,340) bottom
// Right wall: (800,0)→(700,70) top, (800,600)→(700,340) bottom
// Ceiling: (0,0)→(100,70)→(700,70)→(800,0)

svgs.background = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <defs>
    <linearGradient id="backwall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ddd0b8"/>
      <stop offset="100%" stop-color="#d0c4ac"/>
    </linearGradient>
    <linearGradient id="leftwall" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="#ccc0a8"/>
      <stop offset="100%" stop-color="#b8ac94"/>
    </linearGradient>
    <linearGradient id="rightwall" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ccc0a8"/>
      <stop offset="100%" stop-color="#b8ac94"/>
    </linearGradient>
    <linearGradient id="flr" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d8c8a0"/>
      <stop offset="100%" stop-color="#c0b090"/>
    </linearGradient>
    <linearGradient id="ceil" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#e8e0d0"/>
      <stop offset="100%" stop-color="#f8f0e0"/>
    </linearGradient>
    <radialGradient id="ceillight" cx="50%" cy="50%" r="40%">
      <stop offset="0%" stop-color="rgba(255,245,220,0.5)"/>
      <stop offset="60%" stop-color="rgba(255,240,200,0.15)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <radialGradient id="floorshine" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="rgba(255,248,230,0.12)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>
  <!-- Ceiling -->
  <polygon points="0,0 800,0 700,70 100,70" fill="url(#ceil)"/>
  <!-- Ceiling light strip -->
  <rect x="120" y="62" width="560" height="8" rx="3" fill="#f0e8d4" stroke="#e0d8c0" stroke-width="0.5"/>
  <rect x="120" y="62" width="560" height="8" rx="3" fill="url(#ceillight)"/>
  <!-- Warm glow from ceiling light -->
  <ellipse cx="400" cy="66" rx="200" ry="6" fill="rgba(255,230,180,0.3)"/>
  <!-- Back wall -->
  <rect x="100" y="70" width="600" height="270" fill="url(#backwall)"/>
  <!-- Left side wall -->
  <polygon points="0,0 100,70 100,340 0,600" fill="url(#leftwall)"/>
  <!-- Right side wall -->
  <polygon points="800,0 700,70 700,340 800,600" fill="url(#rightwall)"/>
  <!-- Floor -->
  <polygon points="100,340 700,340 800,600 0,600" fill="url(#flr)"/>
  <!-- Floor tile grid (perspective) — horizontal lines -->
  <line x1="130" y1="380" x2="670" y2="380" stroke="#c8b898" stroke-width="0.4" opacity="0.3"/>
  <line x1="80" y1="420" x2="720" y2="420" stroke="#c8b898" stroke-width="0.5" opacity="0.3"/>
  <line x1="40" y1="470" x2="760" y2="470" stroke="#c8b898" stroke-width="0.5" opacity="0.25"/>
  <line x1="0" y1="530" x2="800" y2="530" stroke="#c8b898" stroke-width="0.6" opacity="0.2"/>
  <!-- Floor tile grid — vertical lines converging to VP(400,180) -->
  <line x1="200" y1="340" x2="0" y2="600" stroke="#c8b898" stroke-width="0.4" opacity="0.2"/>
  <line x1="300" y1="340" x2="150" y2="600" stroke="#c8b898" stroke-width="0.4" opacity="0.2"/>
  <line x1="400" y1="340" x2="400" y2="600" stroke="#c8b898" stroke-width="0.4" opacity="0.15"/>
  <line x1="500" y1="340" x2="650" y2="600" stroke="#c8b898" stroke-width="0.4" opacity="0.2"/>
  <line x1="600" y1="340" x2="800" y2="600" stroke="#c8b898" stroke-width="0.4" opacity="0.2"/>
  <!-- Floor reflection/shine -->
  <polygon points="100,340 700,340 800,600 0,600" fill="url(#floorshine)"/>
  <!-- Baseboard along back wall -->
  <rect x="100" y="330" width="600" height="10" fill="#b8a888"/>
  <rect x="100" y="330" width="600" height="2" fill="rgba(255,255,255,0.06)"/>
  <!-- Crown molding at ceiling/back wall junction -->
  <rect x="100" y="70" width="600" height="5" fill="#e0d8c4"/>
  <rect x="100" y="70" width="600" height="1.5" fill="rgba(255,255,255,0.1)"/>
  <!-- Left wall edge shadow -->
  <line x1="100" y1="70" x2="100" y2="340" stroke="rgba(0,0,0,0.08)" stroke-width="3"/>
  <!-- Right wall edge shadow -->
  <line x1="700" y1="70" x2="700" y2="340" stroke="rgba(0,0,0,0.08)" stroke-width="3"/>
  <!-- Ambient warm light on back wall -->
  <ellipse cx="400" cy="200" rx="250" ry="120" fill="rgba(255,240,210,0.05)"/>
</svg>`;

// Paintings: on back wall, 3D frame with shadow
svgs.paintingDark = `
<svg xmlns="http://www.w3.org/2000/svg" width="110" height="90">
  <!-- Frame shadow on wall -->
  <rect x="8" y="8" width="102" height="82" rx="1" fill="rgba(0,0,0,0.15)"/>
  <!-- Outer frame -->
  <rect x="2" y="2" width="102" height="82" rx="1" fill="#4a4a4a"/>
  <!-- Inner frame bevel -->
  <rect x="5" y="5" width="96" height="76" fill="#3a3a3a"/>
  <!-- Canvas -->
  <rect x="8" y="8" width="90" height="70" fill="#1a1a2a"/>
  <!-- Tree -->
  <line x1="53" y1="68" x2="53" y2="28" stroke="#555" stroke-width="3.5"/>
  <line x1="53" y1="40" x2="33" y2="22" stroke="#555" stroke-width="2.5"/>
  <line x1="53" y1="34" x2="73" y2="18" stroke="#555" stroke-width="2.5"/>
  <line x1="53" y1="46" x2="30" y2="34" stroke="#555" stroke-width="1.8"/>
  <line x1="53" y1="44" x2="74" y2="32" stroke="#555" stroke-width="1.8"/>
  <circle cx="53" cy="28" r="20" fill="#444" opacity="0.4"/>
  <circle cx="44" cy="22" r="14" fill="#444" opacity="0.3"/>
  <circle cx="64" cy="24" r="12" fill="#444" opacity="0.3"/>
  <!-- Frame highlight -->
  <line x1="3" y1="3" x2="103" y2="3" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
</svg>`;

svgs.paintingLight = `
<svg xmlns="http://www.w3.org/2000/svg" width="110" height="90">
  <rect x="8" y="8" width="102" height="82" rx="1" fill="rgba(0,0,0,0.12)"/>
  <rect x="2" y="2" width="102" height="82" rx="1" fill="#e0d8c8"/>
  <rect x="5" y="5" width="96" height="76" fill="#eee8dc"/>
  <rect x="8" y="8" width="90" height="70" fill="#f8f4ee"/>
  <line x1="53" y1="68" x2="53" y2="28" stroke="#bbb" stroke-width="3.5"/>
  <line x1="53" y1="40" x2="33" y2="22" stroke="#bbb" stroke-width="2.5"/>
  <line x1="53" y1="34" x2="73" y2="18" stroke="#bbb" stroke-width="2.5"/>
  <line x1="53" y1="46" x2="30" y2="34" stroke="#bbb" stroke-width="1.8"/>
  <line x1="53" y1="44" x2="74" y2="32" stroke="#bbb" stroke-width="1.8"/>
  <circle cx="53" cy="28" r="20" fill="#ddd" opacity="0.3"/>
  <circle cx="44" cy="22" r="14" fill="#ddd" opacity="0.25"/>
  <circle cx="64" cy="24" r="12" fill="#ddd" opacity="0.25"/>
  <line x1="3" y1="3" x2="103" y2="3" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
</svg>`;

// Bookshelf: wall-mounted with 3D shelf depth and shadow
svgs.bookshelf = `
<svg xmlns="http://www.w3.org/2000/svg" width="190" height="110">
  <!-- Shadow behind unit -->
  <rect x="6" y="6" width="184" height="104" rx="1" fill="rgba(0,0,0,0.1)"/>
  <!-- Back panel -->
  <rect x="0" y="0" width="184" height="104" rx="1" fill="#c8b898"/>
  <!-- Shelf 1 top surface (3D) -->
  <polygon points="2,38 182,38 180,42 4,42" fill="#d0b888"/>
  <rect x="2" y="42" width="180" height="5" fill="#c0a878" stroke="#a88858" stroke-width="0.5"/>
  <!-- Shelf 2 top surface (3D) -->
  <polygon points="2,76 182,76 180,80 4,80" fill="#d0b888"/>
  <rect x="2" y="80" width="180" height="5" fill="#c0a878" stroke="#a88858" stroke-width="0.5"/>
  <!-- Books top shelf -->
  <rect x="8" y="6" width="14" height="32" fill="#8b2020" rx="1"/>
  <rect x="24" y="10" width="11" height="28" fill="#1a4a6a" rx="1"/>
  <rect x="37" y="4" width="15" height="34" fill="#2a6a2a" rx="1"/>
  <rect x="54" y="8" width="9" height="30" fill="#6a4a1a" rx="1"/>
  <rect x="65" y="6" width="13" height="32" fill="#4a2a5a" rx="1"/>
  <rect x="80" y="12" width="11" height="26" fill="#aa4422" rx="1"/>
  <rect x="93" y="7" width="15" height="31" fill="#2a3a5a" rx="1"/>
  <rect x="110" y="10" width="9" height="28" fill="#5a5a1a" rx="1"/>
  <!-- White vase -->
  <ellipse cx="135" cy="30" rx="9" ry="8" fill="#f0ece4" stroke="#ddd" stroke-width="0.5"/>
  <rect x="128" y="10" width="14" height="20" rx="4" fill="#f4f0e8" stroke="#ddd" stroke-width="0.5"/>
  <!-- Small decor -->
  <circle cx="158" cy="26" r="7" fill="#eee" stroke="#ccc" stroke-width="0.5"/>
  <rect x="170" y="8" width="8" height="30" fill="#884422" rx="1"/>
  <!-- Books bottom shelf -->
  <rect x="8" y="48" width="15" height="28" fill="#1a5a3a" rx="1"/>
  <rect x="25" y="52" width="11" height="24" fill="#5a2a1a" rx="1"/>
  <rect x="38" y="46" width="13" height="30" fill="#3a3a6a" rx="1"/>
  <rect x="53" y="50" width="17" height="26" fill="#6a1a3a" rx="1"/>
  <rect x="72" y="48" width="11" height="28" fill="#4a5a2a" rx="1"/>
  <rect x="85" y="52" width="15" height="24" fill="#1a3a5a" rx="1"/>
  <!-- Photo frame on lower shelf -->
  <rect x="114" y="48" width="22" height="28" fill="#c8b898" rx="1" stroke="#a08060" stroke-width="0.5"/>
  <rect x="116" y="50" width="18" height="24" fill="#e8e0d0" rx="1"/>
  <rect x="142" y="50" width="11" height="26" fill="#5a1a4a" rx="1"/>
  <rect x="156" y="46" width="15" height="30" fill="#2a5a5a" rx="1"/>
  <!-- Shelf front edge highlight -->
  <line x1="2" y1="42" x2="182" y2="42" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>
  <line x1="2" y1="80" x2="182" y2="80" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>
</svg>`;

// Plant: tall fern in glossy pot with floor shadow
svgs.plant = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="190">
  <!-- Floor shadow (ellipse) -->
  <ellipse cx="52" cy="182" rx="38" ry="8" fill="rgba(0,0,0,0.18)"/>
  <!-- Pot body with 3D gradient -->
  <defs>
    <linearGradient id="pot" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1a1a1a"/>
      <stop offset="30%" stop-color="#333"/>
      <stop offset="70%" stop-color="#2a2a2a"/>
      <stop offset="100%" stop-color="#1a1a1a"/>
    </linearGradient>
  </defs>
  <path d="M24,140 Q22,180 28,178 L76,178 Q82,180 78,140 Z" fill="url(#pot)"/>
  <!-- Pot horizontal ribs -->
  <ellipse cx="52" cy="150" rx="28" ry="3" fill="none" stroke="#444" stroke-width="0.8"/>
  <ellipse cx="52" cy="162" rx="27" ry="2.5" fill="none" stroke="#444" stroke-width="0.8"/>
  <!-- Pot rim -->
  <ellipse cx="52" cy="140" rx="30" ry="8" fill="#333" stroke="#444" stroke-width="1"/>
  <ellipse cx="52" cy="138" rx="27" ry="6" fill="#2a2a1a"/>
  <!-- Pot highlight -->
  <path d="M34,145 Q34,170 36,175" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
  <!-- Soil -->
  <ellipse cx="52" cy="138" rx="24" ry="5" fill="#3a3018"/>
  <!-- Fronds -->
  <path d="M52,132 Q48,80 25,30" fill="none" stroke="#2a7a2a" stroke-width="3"/>
  <path d="M52,132 Q56,70 80,20" fill="none" stroke="#2a7a2a" stroke-width="3"/>
  <path d="M52,132 Q42,90 18,55" fill="none" stroke="#3a8a3a" stroke-width="2.5"/>
  <path d="M52,132 Q62,80 85,45" fill="none" stroke="#3a8a3a" stroke-width="2.5"/>
  <path d="M52,132 Q38,95 10,70" fill="none" stroke="#4a9a4a" stroke-width="2"/>
  <path d="M52,132 Q66,85 92,60" fill="none" stroke="#4a9a4a" stroke-width="2"/>
  <path d="M52,132 Q46,100 22,75" fill="none" stroke="#3a8a3a" stroke-width="2"/>
  <path d="M52,132 Q58,90 78,65" fill="none" stroke="#3a8a3a" stroke-width="2"/>
  <!-- Leaf tips -->
  <path d="M25,30 L18,24 M25,30 L32,26" stroke="#5aaa5a" stroke-width="1.2"/>
  <path d="M80,20 L73,14 M80,20 L87,16" stroke="#5aaa5a" stroke-width="1.2"/>
  <path d="M18,55 L10,50 M18,55 L22,48" stroke="#5aaa5a" stroke-width="1"/>
  <path d="M85,45 L92,39 M85,45 L80,38" stroke="#5aaa5a" stroke-width="1"/>
</svg>`;

// Chair: 3D modern swivel with shadow
svgs.chair = `
<svg xmlns="http://www.w3.org/2000/svg" width="90" height="110">
  <!-- Floor shadow -->
  <ellipse cx="45" cy="102" rx="30" ry="6" fill="rgba(0,0,0,0.2)"/>
  <!-- Base pedestal -->
  <rect x="38" y="78" width="14" height="24" fill="#777" rx="2"/>
  <!-- Base star (simplified) -->
  <ellipse cx="45" cy="100" rx="22" ry="5" fill="#888"/>
  <ellipse cx="45" cy="99" rx="20" ry="4" fill="#999"/>
  <!-- Seat -->
  <path d="M12,48 Q12,70 35,72 L55,72 Q78,70 78,48" fill="#2a2a2a"/>
  <!-- Seat cushion -->
  <ellipse cx="45" cy="52" rx="34" ry="8" fill="#333"/>
  <ellipse cx="45" cy="50" rx="32" ry="6" fill="#2a2a2a"/>
  <!-- Backrest -->
  <path d="M14,48 Q10,25 22,15 L68,15 Q80,25 76,48" fill="#333"/>
  <path d="M16,46 Q13,27 24,18 L66,18 Q77,27 74,46" fill="#2a2a2a"/>
  <!-- Backrest highlight -->
  <path d="M24,20 Q44,14 66,20" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="2"/>
  <!-- Armrests -->
  <path d="M8,48 Q6,38 12,42 L12,58 Q8,62 8,55 Z" fill="#2a2a2a"/>
  <path d="M82,48 Q84,38 78,42 L78,58 Q82,62 82,55 Z" fill="#2a2a2a"/>
</svg>`;

// Cabinet: 3D with side panel visible, glass doors reflect, shadow
svgs.cabinet = `
<svg xmlns="http://www.w3.org/2000/svg" width="145" height="200">
  <defs>
    <linearGradient id="cabf" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#c8a060"/>
      <stop offset="50%" stop-color="#d4ac68"/>
      <stop offset="100%" stop-color="#b89050"/>
    </linearGradient>
    <linearGradient id="cabs" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a88040"/>
      <stop offset="100%" stop-color="#987038"/>
    </linearGradient>
  </defs>
  <!-- Floor shadow -->
  <ellipse cx="68" cy="196" rx="60" ry="5" fill="rgba(0,0,0,0.15)"/>
  <!-- Side panel (3D depth) -->
  <polygon points="125,2 140,8 140,192 125,198" fill="url(#cabs)"/>
  <!-- Front face -->
  <rect x="2" y="2" width="123" height="196" rx="2" fill="url(#cabf)" stroke="#a07838" stroke-width="1"/>
  <!-- Upper glass doors — wooden frames -->
  <rect x="8" y="8" width="55" height="78" rx="2" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <rect x="67" y="8" width="55" height="78" rx="2" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <!-- Glass panes — dark interior visible through glass -->
  <rect x="12" y="12" width="47" height="70" fill="#1a1818" rx="1"/>
  <rect x="71" y="12" width="47" height="70" fill="#1a1818" rx="1"/>
  <!-- Glass tint overlay -->
  <rect x="12" y="12" width="47" height="70" fill="rgba(180,200,210,0.08)" rx="1"/>
  <rect x="71" y="12" width="47" height="70" fill="rgba(180,200,210,0.08)" rx="1"/>
  <!-- Glass reflections -->
  <line x1="16" y1="76" x2="30" y2="16" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
  <line x1="75" y1="76" x2="89" y2="16" stroke="rgba(255,255,255,0.04)" stroke-width="1.5"/>
  <!-- Glass handles -->
  <rect x="56" y="40" width="4" height="12" rx="1.5" fill="#bbb"/>
  <rect x="68" y="40" width="4" height="12" rx="1.5" fill="#bbb"/>
  <!-- Middle shelf divider -->
  <rect x="4" y="90" width="119" height="8" fill="#a07838"/>
  <rect x="4" y="90" width="119" height="2" fill="rgba(255,255,255,0.05)"/>
  <!-- Decorative trim -->
  <rect x="20" y="94" width="6" height="3" rx="1" fill="#8a6a30"/>
  <rect x="50" y="94" width="28" height="3" rx="1" fill="#8a6a30"/>
  <rect x="100" y="94" width="6" height="3" rx="1" fill="#8a6a30"/>
  <!-- Lower doors -->
  <rect x="8" y="104" width="55" height="88" rx="2" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <rect x="67" y="104" width="55" height="88" rx="2" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <!-- Lower panels inset -->
  <rect x="14" y="110" width="43" height="76" fill="rgba(0,0,0,0.06)" rx="1"/>
  <rect x="73" y="110" width="43" height="76" fill="rgba(0,0,0,0.06)" rx="1"/>
  <!-- Knobs -->
  <circle cx="56" cy="148" r="4" fill="#bbb" stroke="#aaa" stroke-width="0.8"/>
  <circle cx="56" cy="148" r="1.5" fill="#999"/>
  <circle cx="72" cy="148" r="4" fill="#bbb" stroke="#aaa" stroke-width="0.8"/>
  <circle cx="72" cy="148" r="1.5" fill="#999"/>
  <!-- Keyhole -->
  <ellipse cx="56" cy="165" rx="2.5" ry="4" fill="#555"/>
  <rect x="55" y="167" width="2" height="5" fill="#555"/>
  <!-- Top edge highlight -->
  <line x1="3" y1="3" x2="124" y2="3" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"/>
</svg>`;

// Cabinet with upper right glass door open — main room view
svgs.cabinetGlassOpen = `
<svg xmlns="http://www.w3.org/2000/svg" width="145" height="200">
  <defs>
    <linearGradient id="cabfg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#c8a060"/>
      <stop offset="50%" stop-color="#d4ac68"/>
      <stop offset="100%" stop-color="#b89050"/>
    </linearGradient>
    <linearGradient id="cabsg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a88040"/>
      <stop offset="100%" stop-color="#987038"/>
    </linearGradient>
    <linearGradient id="cabintg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1210"/>
      <stop offset="100%" stop-color="#0e0a08"/>
    </linearGradient>
  </defs>
  <!-- Floor shadow -->
  <ellipse cx="68" cy="196" rx="60" ry="5" fill="rgba(0,0,0,0.15)"/>
  <!-- Side panel (3D depth) -->
  <polygon points="125,2 140,8 140,192 125,198" fill="url(#cabsg)"/>
  <!-- Front face -->
  <rect x="2" y="2" width="123" height="196" rx="2" fill="url(#cabfg)" stroke="#a07838" stroke-width="1"/>
  <!-- Upper left glass door (closed) -->
  <rect x="8" y="8" width="55" height="78" rx="2" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <rect x="12" y="12" width="47" height="70" fill="#1a1818" rx="1"/>
  <rect x="12" y="12" width="47" height="70" fill="rgba(180,200,210,0.08)" rx="1"/>
  <line x1="16" y1="76" x2="30" y2="16" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
  <rect x="56" y="40" width="4" height="12" rx="1.5" fill="#bbb"/>
  <!-- Upper right: dark interior revealed (door open) -->
  <rect x="67" y="8" width="55" height="78" rx="2" fill="url(#cabintg)" stroke="#5a3a18" stroke-width="0.5"/>
  <!-- Interior shelf -->
  <rect x="69" y="50" width="51" height="2" fill="#3a2818"/>
  <!-- Lockbox silhouette inside -->
  <rect x="78" y="22" width="30" height="22" rx="1" fill="#555" stroke="#444" stroke-width="0.5"/>
  <rect x="86" y="30" width="14" height="8" rx="1" fill="#444"/>
  <circle cx="93" cy="37" r="1.5" fill="#c44"/>
  <!-- Interior shadow -->
  <rect x="67" y="8" width="55" height="3" fill="rgba(0,0,0,0.25)"/>
  <!-- Right glass door swung open (perspective) -->
  <polygon points="122,8 130,11 130,84 122,87" fill="#c89858" stroke="#a07838" stroke-width="0.5"/>
  <polygon points="130,8 134,10 134,86 130,84" fill="#b89050"/>
  <!-- Glass on open door -->
  <polygon points="123,11 129,13 129,82 123,84" fill="rgba(180,200,210,0.06)"/>
  <!-- Glass handles -->
  <rect x="68" y="40" width="4" height="12" rx="1.5" fill="#bbb"/>
  <!-- Middle shelf divider -->
  <rect x="4" y="90" width="119" height="8" fill="#a07838"/>
  <rect x="4" y="90" width="119" height="2" fill="rgba(255,255,255,0.05)"/>
  <rect x="20" y="94" width="6" height="3" rx="1" fill="#8a6a30"/>
  <rect x="50" y="94" width="28" height="3" rx="1" fill="#8a6a30"/>
  <rect x="100" y="94" width="6" height="3" rx="1" fill="#8a6a30"/>
  <!-- Lower doors (both closed) -->
  <rect x="8" y="104" width="55" height="88" rx="2" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <rect x="67" y="104" width="55" height="88" rx="2" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <rect x="14" y="110" width="43" height="76" fill="rgba(0,0,0,0.06)" rx="1"/>
  <rect x="73" y="110" width="43" height="76" fill="rgba(0,0,0,0.06)" rx="1"/>
  <circle cx="56" cy="148" r="4" fill="#bbb" stroke="#aaa" stroke-width="0.8"/>
  <circle cx="56" cy="148" r="1.5" fill="#999"/>
  <circle cx="72" cy="148" r="4" fill="#bbb" stroke="#aaa" stroke-width="0.8"/>
  <circle cx="72" cy="148" r="1.5" fill="#999"/>
  <ellipse cx="56" cy="165" rx="2.5" ry="4" fill="#555"/>
  <rect x="55" y="167" width="2" height="5" fill="#555"/>
  <line x1="3" y1="3" x2="124" y2="3" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"/>
</svg>`;

// Cabinet with lower right + upper right doors open — main room view
svgs.cabinetOpen = `
<svg xmlns="http://www.w3.org/2000/svg" width="145" height="200">
  <defs>
    <linearGradient id="cabf2" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#c8a060"/>
      <stop offset="50%" stop-color="#d4ac68"/>
      <stop offset="100%" stop-color="#b89050"/>
    </linearGradient>
    <linearGradient id="cabs2" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a88040"/>
      <stop offset="100%" stop-color="#987038"/>
    </linearGradient>
    <linearGradient id="cabint" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3a2810"/>
      <stop offset="100%" stop-color="#2a1a08"/>
    </linearGradient>
    <linearGradient id="cabint2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1210"/>
      <stop offset="100%" stop-color="#0e0a08"/>
    </linearGradient>
  </defs>
  <!-- Floor shadow -->
  <ellipse cx="68" cy="196" rx="60" ry="5" fill="rgba(0,0,0,0.15)"/>
  <!-- Side panel (3D depth) -->
  <polygon points="125,2 140,8 140,192 125,198" fill="url(#cabs2)"/>
  <!-- Front face -->
  <rect x="2" y="2" width="123" height="196" rx="2" fill="url(#cabf2)" stroke="#a07838" stroke-width="1"/>
  <!-- Upper left glass door (closed) -->
  <rect x="8" y="8" width="55" height="78" rx="2" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <rect x="12" y="12" width="47" height="70" fill="#1a1818" rx="1"/>
  <rect x="12" y="12" width="47" height="70" fill="rgba(180,200,210,0.08)" rx="1"/>
  <line x1="16" y1="76" x2="30" y2="16" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
  <rect x="56" y="40" width="4" height="12" rx="1.5" fill="#bbb"/>
  <!-- Upper right: dark interior (door open) -->
  <rect x="67" y="8" width="55" height="78" rx="2" fill="url(#cabint2)" stroke="#5a3a18" stroke-width="0.5"/>
  <rect x="69" y="50" width="51" height="2" fill="#3a2818"/>
  <rect x="78" y="22" width="30" height="22" rx="1" fill="#555" stroke="#444" stroke-width="0.5"/>
  <rect x="86" y="30" width="14" height="8" rx="1" fill="#444"/>
  <circle cx="93" cy="37" r="1.5" fill="#c44"/>
  <rect x="67" y="8" width="55" height="3" fill="rgba(0,0,0,0.25)"/>
  <polygon points="122,8 130,11 130,84 122,87" fill="#c89858" stroke="#a07838" stroke-width="0.5"/>
  <polygon points="130,8 134,10 134,86 130,84" fill="#b89050"/>
  <polygon points="123,11 129,13 129,82 123,84" fill="rgba(180,200,210,0.06)"/>
  <!-- Middle shelf divider -->
  <rect x="4" y="90" width="119" height="8" fill="#a07838"/>
  <rect x="4" y="90" width="119" height="2" fill="rgba(255,255,255,0.05)"/>
  <rect x="20" y="94" width="6" height="3" rx="1" fill="#8a6a30"/>
  <rect x="50" y="94" width="28" height="3" rx="1" fill="#8a6a30"/>
  <rect x="100" y="94" width="6" height="3" rx="1" fill="#8a6a30"/>
  <!-- Left lower door stays closed -->
  <rect x="8" y="104" width="55" height="88" rx="2" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <rect x="14" y="110" width="43" height="76" fill="rgba(0,0,0,0.06)" rx="1"/>
  <circle cx="56" cy="148" r="4" fill="#bbb" stroke="#aaa" stroke-width="0.8"/>
  <!-- Key in keyhole -->
  <ellipse cx="56" cy="165" rx="2.5" ry="4" fill="#444"/>
  <circle cx="56" cy="160" r="4" fill="none" stroke="#d0a840" stroke-width="2"/>
  <rect x="55" y="163" width="2" height="6" fill="#d0a840"/>
  <!-- Lower right: dark interior visible -->
  <rect x="67" y="104" width="55" height="88" rx="2" fill="url(#cabint)" stroke="#5a3a18" stroke-width="0.5"/>
  <rect x="69" y="140" width="51" height="2" fill="#5a3a18"/>
  <rect x="67" y="104" width="55" height="4" fill="rgba(0,0,0,0.2)"/>
  <!-- Notes on shelf -->
  <rect x="78" y="130" width="20" height="7" rx="0.5" fill="#f4e8c8" stroke="#d4c498" stroke-width="0.3"/>
  <line x1="81" y1="132" x2="94" y2="132" stroke="#bba878" stroke-width="0.3"/>
  <line x1="81" y1="134" x2="91" y2="134" stroke="#bba878" stroke-width="0.3"/>
  <!-- Lower right door swung open (3D perspective) -->
  <polygon points="122,104 130,108 130,190 122,194" fill="#c89858" stroke="#a07838" stroke-width="0.5"/>
  <polygon points="130,104 136,106 136,198 130,194" fill="#b89050" stroke="#987038" stroke-width="0.5"/>
  <circle cx="128" cy="148" r="2" fill="#bbb"/>
  <line x1="3" y1="3" x2="124" y2="3" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"/>
</svg>`;

// Cabinet with both doors open, notes collected — main room view
svgs.cabinetOpenNoNotes = `
<svg xmlns="http://www.w3.org/2000/svg" width="145" height="200">
  <defs>
    <linearGradient id="cabf4" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#c8a060"/>
      <stop offset="50%" stop-color="#d4ac68"/>
      <stop offset="100%" stop-color="#b89050"/>
    </linearGradient>
    <linearGradient id="cabs4" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a88040"/>
      <stop offset="100%" stop-color="#987038"/>
    </linearGradient>
    <linearGradient id="cabint4a" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3a2810"/>
      <stop offset="100%" stop-color="#2a1a08"/>
    </linearGradient>
    <linearGradient id="cabint4b" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1210"/>
      <stop offset="100%" stop-color="#0e0a08"/>
    </linearGradient>
  </defs>
  <ellipse cx="68" cy="196" rx="60" ry="5" fill="rgba(0,0,0,0.15)"/>
  <polygon points="125,2 140,8 140,192 125,198" fill="url(#cabs4)"/>
  <rect x="2" y="2" width="123" height="196" rx="2" fill="url(#cabf4)" stroke="#a07838" stroke-width="1"/>
  <!-- Upper left glass door (closed) -->
  <rect x="8" y="8" width="55" height="78" rx="2" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <rect x="12" y="12" width="47" height="70" fill="#1a1818" rx="1"/>
  <rect x="12" y="12" width="47" height="70" fill="rgba(180,200,210,0.08)" rx="1"/>
  <line x1="16" y1="76" x2="30" y2="16" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
  <rect x="56" y="40" width="4" height="12" rx="1.5" fill="#bbb"/>
  <!-- Upper right: dark interior (door open) -->
  <rect x="67" y="8" width="55" height="78" rx="2" fill="url(#cabint4b)" stroke="#5a3a18" stroke-width="0.5"/>
  <rect x="69" y="50" width="51" height="2" fill="#3a2818"/>
  <rect x="78" y="22" width="30" height="22" rx="1" fill="#555" stroke="#444" stroke-width="0.5"/>
  <rect x="86" y="30" width="14" height="8" rx="1" fill="#444"/>
  <circle cx="93" cy="37" r="1.5" fill="#c44"/>
  <rect x="67" y="8" width="55" height="3" fill="rgba(0,0,0,0.25)"/>
  <polygon points="122,8 130,11 130,84 122,87" fill="#c89858" stroke="#a07838" stroke-width="0.5"/>
  <polygon points="130,8 134,10 134,86 130,84" fill="#b89050"/>
  <polygon points="123,11 129,13 129,82 123,84" fill="rgba(180,200,210,0.06)"/>
  <!-- Middle shelf divider -->
  <rect x="4" y="90" width="119" height="8" fill="#a07838"/>
  <rect x="4" y="90" width="119" height="2" fill="rgba(255,255,255,0.05)"/>
  <rect x="20" y="94" width="6" height="3" rx="1" fill="#8a6a30"/>
  <rect x="50" y="94" width="28" height="3" rx="1" fill="#8a6a30"/>
  <rect x="100" y="94" width="6" height="3" rx="1" fill="#8a6a30"/>
  <!-- Left lower door (closed) -->
  <rect x="8" y="104" width="55" height="88" rx="2" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <rect x="14" y="110" width="43" height="76" fill="rgba(0,0,0,0.06)" rx="1"/>
  <circle cx="56" cy="148" r="4" fill="#bbb" stroke="#aaa" stroke-width="0.8"/>
  <ellipse cx="56" cy="165" rx="2.5" ry="4" fill="#444"/>
  <circle cx="56" cy="160" r="4" fill="none" stroke="#d0a840" stroke-width="2"/>
  <rect x="55" y="163" width="2" height="6" fill="#d0a840"/>
  <!-- Lower right: dark interior (no notes) -->
  <rect x="67" y="104" width="55" height="88" rx="2" fill="url(#cabint4a)" stroke="#5a3a18" stroke-width="0.5"/>
  <rect x="69" y="140" width="51" height="2" fill="#5a3a18"/>
  <rect x="67" y="104" width="55" height="4" fill="rgba(0,0,0,0.2)"/>
  <polygon points="122,104 130,108 130,190 122,194" fill="#c89858" stroke="#a07838" stroke-width="0.5"/>
  <polygon points="130,104 136,106 136,198 130,194" fill="#b89050" stroke="#987038" stroke-width="0.5"/>
  <circle cx="128" cy="148" r="2" fill="#bbb"/>
  <line x1="3" y1="3" x2="124" y2="3" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"/>
</svg>`;

// Cabinet with lower right door open, upper glass closed, notes present — main room view
svgs.cabinetLowerOpen = `
<svg xmlns="http://www.w3.org/2000/svg" width="145" height="200">
  <defs>
    <linearGradient id="cabf5" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#c8a060"/>
      <stop offset="50%" stop-color="#d4ac68"/>
      <stop offset="100%" stop-color="#b89050"/>
    </linearGradient>
    <linearGradient id="cabs5" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a88040"/>
      <stop offset="100%" stop-color="#987038"/>
    </linearGradient>
    <linearGradient id="cabint5" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3a2810"/>
      <stop offset="100%" stop-color="#2a1a08"/>
    </linearGradient>
  </defs>
  <ellipse cx="68" cy="196" rx="60" ry="5" fill="rgba(0,0,0,0.15)"/>
  <polygon points="125,2 140,8 140,192 125,198" fill="url(#cabs5)"/>
  <rect x="2" y="2" width="123" height="196" rx="2" fill="url(#cabf5)" stroke="#a07838" stroke-width="1"/>
  <!-- Upper glass doors (both closed) -->
  <rect x="8" y="8" width="55" height="78" rx="2" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <rect x="67" y="8" width="55" height="78" rx="2" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <rect x="12" y="12" width="47" height="70" fill="#1a1818" rx="1"/>
  <rect x="71" y="12" width="47" height="70" fill="#1a1818" rx="1"/>
  <rect x="12" y="12" width="47" height="70" fill="rgba(180,200,210,0.08)" rx="1"/>
  <rect x="71" y="12" width="47" height="70" fill="rgba(180,200,210,0.08)" rx="1"/>
  <line x1="16" y1="76" x2="30" y2="16" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
  <line x1="75" y1="76" x2="89" y2="16" stroke="rgba(255,255,255,0.04)" stroke-width="1.5"/>
  <rect x="56" y="40" width="4" height="12" rx="1.5" fill="#bbb"/>
  <rect x="68" y="40" width="4" height="12" rx="1.5" fill="#bbb"/>
  <!-- Middle shelf divider -->
  <rect x="4" y="90" width="119" height="8" fill="#a07838"/>
  <rect x="4" y="90" width="119" height="2" fill="rgba(255,255,255,0.05)"/>
  <rect x="20" y="94" width="6" height="3" rx="1" fill="#8a6a30"/>
  <rect x="50" y="94" width="28" height="3" rx="1" fill="#8a6a30"/>
  <rect x="100" y="94" width="6" height="3" rx="1" fill="#8a6a30"/>
  <!-- Left lower door (closed) -->
  <rect x="8" y="104" width="55" height="88" rx="2" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <rect x="14" y="110" width="43" height="76" fill="rgba(0,0,0,0.06)" rx="1"/>
  <circle cx="56" cy="148" r="4" fill="#bbb" stroke="#aaa" stroke-width="0.8"/>
  <!-- Key in keyhole -->
  <ellipse cx="56" cy="165" rx="2.5" ry="4" fill="#444"/>
  <circle cx="56" cy="160" r="4" fill="none" stroke="#d0a840" stroke-width="2"/>
  <rect x="55" y="163" width="2" height="6" fill="#d0a840"/>
  <!-- Lower right: open interior -->
  <rect x="67" y="104" width="55" height="88" rx="2" fill="url(#cabint5)" stroke="#5a3a18" stroke-width="0.5"/>
  <rect x="69" y="140" width="51" height="2" fill="#5a3a18"/>
  <rect x="67" y="104" width="55" height="4" fill="rgba(0,0,0,0.2)"/>
  <!-- Notes on shelf -->
  <rect x="78" y="130" width="20" height="7" rx="0.5" fill="#f4e8c8" stroke="#d4c498" stroke-width="0.3"/>
  <line x1="81" y1="132" x2="94" y2="132" stroke="#bba878" stroke-width="0.3"/>
  <line x1="81" y1="134" x2="91" y2="134" stroke="#bba878" stroke-width="0.3"/>
  <!-- Lower right door swung open (3D perspective) -->
  <polygon points="122,104 130,108 130,190 122,194" fill="#c89858" stroke="#a07838" stroke-width="0.5"/>
  <polygon points="130,104 136,106 136,198 130,194" fill="#b89050" stroke="#987038" stroke-width="0.5"/>
  <circle cx="128" cy="148" r="2" fill="#bbb"/>
  <line x1="3" y1="3" x2="124" y2="3" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"/>
</svg>`;

// Cabinet with lower right door open, upper glass closed, notes collected — main room view
svgs.cabinetLowerOpenNoNotes = `
<svg xmlns="http://www.w3.org/2000/svg" width="145" height="200">
  <defs>
    <linearGradient id="cabf6" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#c8a060"/>
      <stop offset="50%" stop-color="#d4ac68"/>
      <stop offset="100%" stop-color="#b89050"/>
    </linearGradient>
    <linearGradient id="cabs6" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a88040"/>
      <stop offset="100%" stop-color="#987038"/>
    </linearGradient>
    <linearGradient id="cabint6" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3a2810"/>
      <stop offset="100%" stop-color="#2a1a08"/>
    </linearGradient>
  </defs>
  <ellipse cx="68" cy="196" rx="60" ry="5" fill="rgba(0,0,0,0.15)"/>
  <polygon points="125,2 140,8 140,192 125,198" fill="url(#cabs6)"/>
  <rect x="2" y="2" width="123" height="196" rx="2" fill="url(#cabf6)" stroke="#a07838" stroke-width="1"/>
  <!-- Upper glass doors (both closed) -->
  <rect x="8" y="8" width="55" height="78" rx="2" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <rect x="67" y="8" width="55" height="78" rx="2" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <rect x="12" y="12" width="47" height="70" fill="#1a1818" rx="1"/>
  <rect x="71" y="12" width="47" height="70" fill="#1a1818" rx="1"/>
  <rect x="12" y="12" width="47" height="70" fill="rgba(180,200,210,0.08)" rx="1"/>
  <rect x="71" y="12" width="47" height="70" fill="rgba(180,200,210,0.08)" rx="1"/>
  <line x1="16" y1="76" x2="30" y2="16" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
  <line x1="75" y1="76" x2="89" y2="16" stroke="rgba(255,255,255,0.04)" stroke-width="1.5"/>
  <rect x="56" y="40" width="4" height="12" rx="1.5" fill="#bbb"/>
  <rect x="68" y="40" width="4" height="12" rx="1.5" fill="#bbb"/>
  <!-- Middle shelf divider -->
  <rect x="4" y="90" width="119" height="8" fill="#a07838"/>
  <rect x="4" y="90" width="119" height="2" fill="rgba(255,255,255,0.05)"/>
  <rect x="20" y="94" width="6" height="3" rx="1" fill="#8a6a30"/>
  <rect x="50" y="94" width="28" height="3" rx="1" fill="#8a6a30"/>
  <rect x="100" y="94" width="6" height="3" rx="1" fill="#8a6a30"/>
  <!-- Left lower door (closed) -->
  <rect x="8" y="104" width="55" height="88" rx="2" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <rect x="14" y="110" width="43" height="76" fill="rgba(0,0,0,0.06)" rx="1"/>
  <circle cx="56" cy="148" r="4" fill="#bbb" stroke="#aaa" stroke-width="0.8"/>
  <!-- Key in keyhole -->
  <ellipse cx="56" cy="165" rx="2.5" ry="4" fill="#444"/>
  <circle cx="56" cy="160" r="4" fill="none" stroke="#d0a840" stroke-width="2"/>
  <rect x="55" y="163" width="2" height="6" fill="#d0a840"/>
  <!-- Lower right: open interior (no notes) -->
  <rect x="67" y="104" width="55" height="88" rx="2" fill="url(#cabint6)" stroke="#5a3a18" stroke-width="0.5"/>
  <rect x="69" y="140" width="51" height="2" fill="#5a3a18"/>
  <rect x="67" y="104" width="55" height="4" fill="rgba(0,0,0,0.2)"/>
  <!-- Lower right door swung open (3D perspective) -->
  <polygon points="122,104 130,108 130,190 122,194" fill="#c89858" stroke="#a07838" stroke-width="0.5"/>
  <polygon points="130,104 136,106 136,198 130,194" fill="#b89050" stroke="#987038" stroke-width="0.5"/>
  <circle cx="128" cy="148" r="2" fill="#bbb"/>
  <line x1="3" y1="3" x2="124" y2="3" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"/>
</svg>`;

// Door: 3D with frame depth, panels, handle, card reader
svgs.door = `
<svg xmlns="http://www.w3.org/2000/svg" width="130" height="260">
  <defs>
    <linearGradient id="dr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#8a5a30"/>
      <stop offset="25%" stop-color="#a06a38"/>
      <stop offset="75%" stop-color="#9c6634"/>
      <stop offset="100%" stop-color="#7a4a28"/>
    </linearGradient>
  </defs>
  <!-- Door frame (recessed into wall) -->
  <rect x="0" y="0" width="130" height="260" fill="#a89878"/>
  <!-- Frame inner shadow -->
  <rect x="4" y="2" width="122" height="256" fill="#988868"/>
  <!-- Door surface -->
  <rect x="10" y="5" width="110" height="250" rx="1" fill="url(#dr)"/>
  <!-- Upper panel -->
  <rect x="22" y="16" width="86" height="75" rx="3" fill="#8a5a30" stroke="#6a4020" stroke-width="1.5"/>
  <rect x="27" y="21" width="76" height="65" fill="#956232" opacity="0.35" rx="2"/>
  <!-- Middle panel -->
  <rect x="22" y="100" width="86" height="70" rx="3" fill="#8a5a30" stroke="#6a4020" stroke-width="1.5"/>
  <rect x="27" y="105" width="76" height="60" fill="#956232" opacity="0.35" rx="2"/>
  <!-- Lower panel -->
  <rect x="22" y="180" width="86" height="60" rx="3" fill="#8a5a30" stroke="#6a4020" stroke-width="1.5"/>
  <rect x="27" y="185" width="76" height="50" fill="#956232" opacity="0.35" rx="2"/>
  <!-- Handle plate -->
  <rect x="92" y="140" width="20" height="14" rx="5" fill="#c8c0b0" stroke="#aaa" stroke-width="1"/>
  <ellipse cx="96" cy="147" rx="3" ry="3" fill="#999"/>
  <!-- Card reader -->
  <rect x="92" y="115" width="22" height="32" rx="3" fill="#444" stroke="#555" stroke-width="1"/>
  <rect x="95" y="119" width="16" height="4" rx="1" fill="#222"/>
  <!-- Card slot -->
  <rect x="97" y="128" width="12" height="2.5" rx="0.5" fill="#1a1a1a" stroke="#666" stroke-width="0.3"/>
  <!-- LED (red) -->
  <circle cx="103" cy="138" r="3" fill="#800" stroke="#555" stroke-width="0.5"/>
  <circle cx="103" cy="138" r="1.5" fill="#c00"/>
  <!-- Door edge highlight -->
  <line x1="11" y1="6" x2="11" y2="254" stroke="rgba(255,255,255,0.04)" stroke-width="1.5"/>
  <!-- Frame edge shadow -->
  <line x1="10" y1="5" x2="10" y2="255" stroke="rgba(0,0,0,0.15)" stroke-width="2"/>
  <line x1="120" y1="5" x2="120" y2="255" stroke="rgba(0,0,0,0.08)" stroke-width="1"/>
</svg>`;

// Door open: frame visible, door swung open revealing bright hallway
svgs.doorOpen = `
<svg xmlns="http://www.w3.org/2000/svg" width="130" height="260">
  <defs>
    <linearGradient id="drhall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8f0d8"/>
      <stop offset="60%" stop-color="#e8d8b8"/>
      <stop offset="100%" stop-color="#c8b898"/>
    </linearGradient>
    <linearGradient id="dropen" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#7a4a28"/>
      <stop offset="100%" stop-color="#6a3a18"/>
    </linearGradient>
  </defs>
  <!-- Door frame -->
  <rect x="0" y="0" width="130" height="260" fill="#a89878"/>
  <rect x="4" y="2" width="122" height="256" fill="#988868"/>
  <!-- Bright hallway visible through opening -->
  <rect x="10" y="5" width="110" height="250" fill="url(#drhall)"/>
  <!-- Hallway floor -->
  <rect x="10" y="200" width="110" height="55" fill="#c8b898"/>
  <line x1="10" y1="200" x2="120" y2="200" stroke="#b8a888" stroke-width="0.5"/>
  <!-- Hallway far wall detail -->
  <rect x="40" y="30" width="50" height="80" rx="2" fill="rgba(0,0,0,0.04)" stroke="rgba(0,0,0,0.06)" stroke-width="0.5"/>
  <!-- Light glow from hallway -->
  <rect x="10" y="5" width="110" height="250" fill="rgba(255,255,200,0.08)"/>
  <!-- Door swung open to the left — 3D perspective foreshortened -->
  <polygon points="10,5 30,20 30,240 10,255" fill="url(#dropen)"/>
  <!-- Door panel detail on foreshortened door -->
  <polygon points="13,16 28,28 28,78 13,68" fill="#8a5a30" stroke="#6a4020" stroke-width="0.5" opacity="0.7"/>
  <polygon points="13,80 28,90 28,140 13,130" fill="#8a5a30" stroke="#6a4020" stroke-width="0.5" opacity="0.7"/>
  <polygon points="13,142 28,152 28,200 13,190" fill="#8a5a30" stroke="#6a4020" stroke-width="0.5" opacity="0.7"/>
  <!-- Door edge thickness -->
  <polygon points="30,20 34,22 34,238 30,240" fill="#5a3a18"/>
  <!-- Card reader on open door (barely visible) -->
  <rect x="15" y="108" width="5" height="12" rx="1" fill="#333" opacity="0.6"/>
  <!-- Green LED on card reader -->
  <circle cx="17" cy="115" r="1.5" fill="#0a0"/>
  <circle cx="17" cy="115" r="2.5" fill="rgba(0,200,0,0.15)"/>
  <!-- Floor light spill from hallway -->
  <polygon points="34,255 60,260 120,260 120,255" fill="rgba(255,255,200,0.06)"/>
  <!-- Frame shadows -->
  <line x1="10" y1="5" x2="10" y2="255" stroke="rgba(0,0,0,0.15)" stroke-width="2"/>
  <line x1="120" y1="5" x2="120" y2="255" stroke="rgba(0,0,0,0.08)" stroke-width="1"/>
</svg>`;

// Laptop: 3D perspective - screen angled back, base flat on desk
svgs.laptop = `
<svg xmlns="http://www.w3.org/2000/svg" width="110" height="80">
  <!-- Shadow under base -->
  <ellipse cx="55" cy="74" rx="42" ry="4" fill="rgba(0,0,0,0.15)"/>
  <!-- Base/keyboard -->
  <polygon points="10,55 100,55 95,72 15,72" fill="#999" stroke="#888" stroke-width="0.8"/>
  <polygon points="14,57 96,57 92,70 18,70" fill="#777"/>
  <!-- Keyboard keys simplified -->
  <rect x="22" y="59" width="66" height="8" rx="1" fill="#666" opacity="0.6"/>
  <!-- Trackpad -->
  <rect x="38" y="68" width="34" height="3" rx="1" fill="#888"/>
  <!-- Screen (angled back) -->
  <polygon points="12,54 98,54 92,10 18,10" fill="#333" stroke="#222" stroke-width="1.5"/>
  <polygon points="18,50 92,50 87,15 23,15" fill="#0a2040"/>
  <!-- Screen content -->
  <rect x="38" y="26" width="34" height="16" rx="2" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
  <text x="55" y="37" text-anchor="middle" fill="#6a8ab0" font-size="7" font-family="monospace">LOCKED</text>
  <!-- Camera -->
  <circle cx="55" cy="8" r="1.5" fill="#444"/>
  <!-- Screen bezel highlight -->
  <line x1="19" y1="14" x2="87" y2="14" stroke="rgba(255,255,255,0.03)" stroke-width="0.8"/>
</svg>`;

// Laptop unlocked: screen showing 1886
svgs.laptopUnlocked = `
<svg xmlns="http://www.w3.org/2000/svg" width="110" height="80">
  <!-- Shadow under base -->
  <ellipse cx="55" cy="74" rx="42" ry="4" fill="rgba(0,0,0,0.15)"/>
  <!-- Base/keyboard -->
  <polygon points="10,55 100,55 95,72 15,72" fill="#999" stroke="#888" stroke-width="0.8"/>
  <polygon points="14,57 96,57 92,70 18,70" fill="#777"/>
  <rect x="22" y="59" width="66" height="8" rx="1" fill="#666" opacity="0.6"/>
  <rect x="38" y="68" width="34" height="3" rx="1" fill="#888"/>
  <!-- Screen (angled back) -->
  <polygon points="12,54 98,54 92,10 18,10" fill="#333" stroke="#222" stroke-width="1.5"/>
  <polygon points="18,50 92,50 87,15 23,15" fill="#0a2a10"/>
  <!-- Screen glow -->
  <polygon points="18,50 92,50 87,15 23,15" fill="rgba(0,180,80,0.06)"/>
  <!-- 1886 on screen -->
  <text x="55" y="38" text-anchor="middle" fill="#5c8" font-size="14" font-weight="bold" font-family="monospace">1886</text>
  <!-- Camera -->
  <circle cx="55" cy="8" r="1.5" fill="#444"/>
  <line x1="19" y1="14" x2="87" y2="14" stroke="rgba(255,255,255,0.03)" stroke-width="0.8"/>
</svg>`;

// Sofa: 3D perspective with depth, cushions, pillows, legs
svgs.sofa = `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="130">
  <defs>
    <linearGradient id="sf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e8dcc0"/>
      <stop offset="100%" stop-color="#d8ccb0"/>
    </linearGradient>
    <linearGradient id="sfs" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#d0c4a8"/>
      <stop offset="100%" stop-color="#c0b498"/>
    </linearGradient>
  </defs>
  <!-- Floor shadow -->
  <ellipse cx="100" cy="124" rx="85" ry="6" fill="rgba(0,0,0,0.15)"/>
  <!-- Legs -->
  <rect x="14" y="105" width="10" height="18" rx="2" fill="#b0a080"/>
  <rect x="176" y="105" width="10" height="18" rx="2" fill="#b0a080"/>
  <!-- Side panel (3D depth right) -->
  <polygon points="186,30 200,35 200,108 186,112" fill="url(#sfs)"/>
  <!-- Sofa body -->
  <rect x="6" y="38" width="180" height="70" rx="6" fill="url(#sf)" stroke="#c0b498" stroke-width="1"/>
  <!-- Backrest -->
  <rect x="6" y="22" width="180" height="24" rx="6" fill="#e0d4b8" stroke="#c8bc9c" stroke-width="0.5"/>
  <!-- Left arm -->
  <rect x="0" y="28" width="16" height="65" rx="5" fill="#d8ccb0" stroke="#c0b498" stroke-width="1"/>
  <!-- Right arm -->
  <rect x="178" y="28" width="16" height="65" rx="5" fill="#d8ccb0" stroke="#c0b498" stroke-width="1"/>
  <!-- Seat cushion dividers -->
  <rect x="22" y="44" width="52" height="52" fill="#d4c8ac" rx="3"/>
  <rect x="78" y="44" width="50" height="52" fill="#d4c8ac" rx="3"/>
  <rect x="132" y="44" width="48" height="52" fill="#d4c8ac" rx="3"/>
  <!-- Cushion seams -->
  <line x1="74" y1="48" x2="74" y2="92" stroke="#c4b898" stroke-width="0.8"/>
  <line x1="128" y1="48" x2="128" y2="92" stroke="#c4b898" stroke-width="0.8"/>
  <!-- Throw pillows -->
  <rect x="26" y="24" width="34" height="24" rx="10" fill="#c8bca0" transform="rotate(-6 43 36)"/>
  <rect x="70" y="24" width="30" height="22" rx="8" fill="#b8d0c0" transform="rotate(4 85 35)"/>
  <rect x="140" y="24" width="30" height="22" rx="8" fill="#c8bca0" transform="rotate(7 155 35)"/>
  <!-- Pillow pattern -->
  <circle cx="85" cy="34" r="5" fill="none" stroke="#a8c0b0" stroke-width="0.5" opacity="0.5"/>
</svg>`;

// Rug: 3D perspective trapezoid with ornate pattern
svgs.rug = `
<svg xmlns="http://www.w3.org/2000/svg" width="440" height="120">
  <defs>
    <linearGradient id="rugf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d8c898"/>
      <stop offset="100%" stop-color="#c8b888"/>
    </linearGradient>
  </defs>
  <!-- Rug in perspective (narrower at top, wider at bottom) -->
  <polygon points="80,4 360,4 420,116 20,116" fill="url(#rugf)"/>
  <!-- Border -->
  <polygon points="80,4 360,4 420,116 20,116" fill="none" stroke="#8a5a30" stroke-width="4"/>
  <!-- Inner border -->
  <polygon points="95,12 345,12 400,108 40,108" fill="none" stroke="#a08060" stroke-width="1.5"/>
  <!-- Inner inner border -->
  <polygon points="108,20 332,20 382,100 58,100" fill="none" stroke="#c8a878" stroke-width="0.8" opacity="0.5"/>
  <!-- Center medallion (ellipse in perspective) -->
  <ellipse cx="220" cy="60" rx="70" ry="22" fill="#c0a870" opacity="0.25"/>
  <ellipse cx="220" cy="60" rx="50" ry="15" fill="none" stroke="#a08060" stroke-width="0.8" opacity="0.4"/>
  <!-- Corner flourishes -->
  <path d="M95,16 Q120,16 115,30" fill="none" stroke="#a08060" stroke-width="0.8" opacity="0.4"/>
  <path d="M345,16 Q320,16 325,30" fill="none" stroke="#a08060" stroke-width="0.8" opacity="0.4"/>
  <path d="M45,104 Q70,104 60,90" fill="none" stroke="#a08060" stroke-width="0.8" opacity="0.4"/>
  <path d="M395,104 Q370,104 380,90" fill="none" stroke="#a08060" stroke-width="0.8" opacity="0.4"/>
  <!-- Pattern lines -->
  <line x1="140" y1="8" x2="100" y2="112" stroke="#b8a070" stroke-width="0.5" opacity="0.2"/>
  <line x1="220" y1="8" x2="220" y2="112" stroke="#b8a070" stroke-width="0.5" opacity="0.15"/>
  <line x1="300" y1="8" x2="340" y2="112" stroke="#b8a070" stroke-width="0.5" opacity="0.2"/>
</svg>`;


// Desk: 3D wooden desk against left wall, laptop sits on top
svgs.desk = `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120">
  <defs>
    <linearGradient id="dsk" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#8a6a3a"/>
      <stop offset="30%" stop-color="#a07a48"/>
      <stop offset="100%" stop-color="#7a5a30"/>
    </linearGradient>
    <linearGradient id="dsks" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#6a4a22"/>
      <stop offset="100%" stop-color="#5a3a1a"/>
    </linearGradient>
  </defs>
  <!-- Floor shadow -->
  <ellipse cx="100" cy="116" rx="80" ry="5" fill="rgba(0,0,0,0.15)"/>
  <!-- Left leg -->
  <rect x="8" y="40" width="8" height="75" fill="#7a5a30"/>
  <!-- Right leg -->
  <rect x="174" y="40" width="8" height="75" fill="#7a5a30"/>
  <!-- Side panel (3D depth) -->
  <polygon points="182" y="4" fill="url(#dsks)"/>
  <!-- Cross bar -->
  <rect x="12" y="80" width="166" height="5" fill="#6a4a28" rx="1"/>
  <!-- Desktop surface top (3D) -->
  <polygon points="0,32 190,32 194,38 4,38" fill="#b08a58"/>
  <!-- Desktop surface front -->
  <rect x="0" y="38" width="194" height="6" fill="url(#dsk)" stroke="#6a4a28" stroke-width="0.5"/>
  <!-- Desktop top plane -->
  <rect x="0" y="24" width="194" height="10" fill="#a07a48" rx="1"/>
  <!-- Top surface highlight -->
  <line x1="4" y1="26" x2="190" y2="26" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
  <!-- Drawer -->
  <rect x="120" y="44" width="60" height="28" rx="2" fill="#906a38" stroke="#7a5a30" stroke-width="0.8"/>
  <rect x="140" y="56" width="20" height="4" rx="1.5" fill="#bbb"/>
</svg>`;

// ============================================================
//  ZOOM VIEW SVGs — detailed close-ups for each interactive area
// ============================================================
const zoom = {};

// --- Plant pot close-up: 3D perspective looking down into pot ---
zoom.plantBg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
  <defs>
    <radialGradient id="zpbg" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#2a2a20"/>
      <stop offset="100%" stop-color="#0e0e0a"/>
    </radialGradient>
    <radialGradient id="soil" cx="45%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#5a4828"/>
      <stop offset="100%" stop-color="#3a2818"/>
    </radialGradient>
    <linearGradient id="potside" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1a1a1a"/>
      <stop offset="40%" stop-color="#3a3a38"/>
      <stop offset="60%" stop-color="#333330"/>
      <stop offset="100%" stop-color="#1a1a1a"/>
    </linearGradient>
    <linearGradient id="potrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#555"/>
      <stop offset="50%" stop-color="#3a3a3a"/>
      <stop offset="100%" stop-color="#2a2a2a"/>
    </linearGradient>
    <radialGradient id="potinner" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#2a2420"/>
      <stop offset="100%" stop-color="#1a1410"/>
    </radialGradient>
    <linearGradient id="highlight" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,240,0.08)"/>
      <stop offset="100%" stop-color="rgba(255,255,240,0)"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#zpbg)"/>
  <!-- Ambient light spot -->
  <ellipse cx="180" cy="120" rx="160" ry="100" fill="rgba(255,250,220,0.03)"/>
  <!-- Pot body — 3D tapered form -->
  <path d="M85,370 Q90,390 310,390 Q315,370 315,370 L290,175 L110,175 Z" fill="url(#potside)" stroke="#444" stroke-width="1"/>
  <!-- Pot left shadow edge -->
  <path d="M85,370 L110,175 L130,175 L100,370 Z" fill="rgba(0,0,0,0.15)"/>
  <!-- Pot right highlight edge -->
  <path d="M290,175 L315,370 L300,370 L278,175 Z" fill="rgba(255,255,255,0.03)"/>
  <!-- Pot bottom curve -->
  <ellipse cx="200" cy="380" rx="115" ry="16" fill="#1a1a18"/>
  <!-- Pot rim — thick 3D torus -->
  <ellipse cx="200" cy="172" rx="105" ry="32" fill="url(#potrim)" stroke="#555" stroke-width="1"/>
  <ellipse cx="200" cy="168" rx="100" ry="29" fill="#3a3a38"/>
  <ellipse cx="200" cy="165" rx="96" ry="27" fill="#333330" stroke="#444" stroke-width="0.5"/>
  <!-- Rim highlight -->
  <path d="M110,160 Q200,138 290,160" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
  <!-- Inner pot wall visible (dark cavity) -->
  <ellipse cx="200" cy="168" rx="88" ry="24" fill="url(#potinner)"/>
  <!-- Inner shadow ring -->
  <ellipse cx="200" cy="170" rx="86" ry="22" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="4"/>
  <!-- Soil surface — slightly sunken -->
  <ellipse cx="200" cy="172" rx="80" ry="18" fill="url(#soil)"/>
  <!-- Soil texture — pebbles and clumps -->
  <circle cx="170" cy="170" r="4" fill="#5a4828" opacity="0.5"/>
  <circle cx="215" cy="175" r="5" fill="#4a3818" opacity="0.4"/>
  <circle cx="245" cy="171" r="3" fill="#5a4828" opacity="0.5"/>
  <circle cx="155" cy="174" r="2.5" fill="#4a3818" opacity="0.4"/>
  <circle cx="190" cy="168" r="2" fill="#6a5838" opacity="0.3"/>
  <circle cx="230" cy="168" r="3" fill="#4a3818" opacity="0.3"/>
  <ellipse cx="180" cy="173" rx="6" ry="2" fill="#3a2818" opacity="0.3"/>
  <!-- Disturbed soil — clue area -->
  <ellipse cx="225" cy="173" rx="22" ry="7" fill="#5a4020" opacity="0.45"/>
  <ellipse cx="228" cy="174" rx="15" ry="4" fill="#6a5030" opacity="0.3"/>
  <!-- Fern fronds — lush 3D arching -->
  <path d="M200,160 Q190,90 140,20" fill="none" stroke="#1a6a1a" stroke-width="5"/>
  <path d="M200,160 Q210,80 260,15" fill="none" stroke="#1a6a1a" stroke-width="5"/>
  <path d="M200,160 Q195,100 145,40" fill="none" stroke="#2a7a2a" stroke-width="4"/>
  <path d="M200,160 Q205,90 255,30" fill="none" stroke="#2a7a2a" stroke-width="4"/>
  <path d="M200,160 Q180,110 120,55" fill="none" stroke="#3a8a3a" stroke-width="3"/>
  <path d="M200,160 Q220,100 280,45" fill="none" stroke="#3a8a3a" stroke-width="3"/>
  <path d="M200,160 Q175,125 110,80" fill="none" stroke="#4a9a4a" stroke-width="2.5"/>
  <path d="M200,160 Q225,115 290,70" fill="none" stroke="#4a9a4a" stroke-width="2.5"/>
  <!-- Leaf frills along fronds -->
  <g stroke="#5aaa5a" stroke-width="1.2" fill="none">
    <path d="M165,60 L155,52 M165,60 L173,54"/>
    <path d="M235,45 L227,37 M235,45 L243,39"/>
    <path d="M145,40 L137,33 M145,40 L152,34"/>
    <path d="M255,30 L248,22 M255,30 L263,24"/>
    <path d="M130,70 L120,64 M130,70 L136,62"/>
    <path d="M270,55 L278,48 M270,55 L264,47"/>
    <path d="M150,90 L140,85 M150,90 L155,82"/>
    <path d="M250,75 L258,68 M250,75 L244,67"/>
  </g>
  <!-- Smaller leaves on inner fronds -->
  <g stroke="#6aba6a" stroke-width="0.8" fill="none" opacity="0.6">
    <path d="M175,100 L168,95 M175,100 L180,93"/>
    <path d="M225,90 L232,84 M225,90 L219,83"/>
  </g>
  <!-- Leaf drop shadow on soil -->
  <ellipse cx="200" cy="172" rx="40" ry="8" fill="rgba(0,0,0,0.15)"/>
</svg>`;

// Key item inside the pot (sub-hotspot image) — 3D brass key
zoom.key = `
<svg xmlns="http://www.w3.org/2000/svg" width="60" height="30">
  <defs>
    <linearGradient id="kg" x1="0" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#f0d050"/>
      <stop offset="40%" stop-color="#e8c040"/>
      <stop offset="100%" stop-color="#b08020"/>
    </linearGradient>
    <linearGradient id="kgd" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c8a030"/>
      <stop offset="100%" stop-color="#a07020"/>
    </linearGradient>
  </defs>
  <!-- Drop shadow -->
  <ellipse cx="32" cy="22" rx="24" ry="5" fill="rgba(0,0,0,0.3)"/>
  <!-- Key shaft — 3D with thickness -->
  <rect x="18" y="14" width="38" height="5" rx="1" fill="url(#kgd)"/>
  <rect x="18" y="11" width="38" height="5" rx="1.5" fill="url(#kg)" stroke="#a88020" stroke-width="0.3"/>
  <!-- Key head (ring) — 3D torus -->
  <circle cx="14" cy="14" r="11" fill="url(#kgd)" opacity="0.6"/>
  <circle cx="14" cy="13" r="11" fill="none" stroke="url(#kg)" stroke-width="4.5"/>
  <circle cx="14" cy="13" r="5.5" fill="#4a3818" opacity="0.4"/>
  <path d="M6,7 Q14,4 22,7" fill="none" stroke="rgba(255,255,200,0.35)" stroke-width="1.2"/>
  <!-- Key teeth — 3D stepped -->
  <polygon points="42,16 46,16 46,22 42,20" fill="url(#kgd)"/>
  <polygon points="42,11 46,11 46,16 42,16" fill="url(#kg)"/>
  <polygon points="48,16 51,16 51,24 48,22" fill="url(#kgd)"/>
  <polygon points="48,11 51,11 51,16 48,16" fill="url(#kg)"/>
  <polygon points="53,16 56,16 56,20 53,19" fill="url(#kgd)"/>
  <polygon points="53,11 56,11 56,16 53,16" fill="url(#kg)"/>
  <!-- Top highlight streak -->
  <line x1="20" y1="11.5" x2="40" y2="11.5" stroke="rgba(255,255,200,0.4)" stroke-width="0.8"/>
</svg>`;

// --- Cabinet close-up: 3D perspective with depth and lighting ---
zoom.cabinetBg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="450">
  <defs>
    <radialGradient id="zcab" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#1e1810"/>
      <stop offset="100%" stop-color="#0a0805"/>
    </radialGradient>
    <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a07838"/>
      <stop offset="30%" stop-color="#c8a060"/>
      <stop offset="70%" stop-color="#c8a060"/>
      <stop offset="100%" stop-color="#a07838"/>
    </linearGradient>
    <linearGradient id="woodside" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#8a6828"/>
      <stop offset="100%" stop-color="#7a5a20"/>
    </linearGradient>
    <linearGradient id="woodtop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d0a868"/>
      <stop offset="100%" stop-color="#b89050"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="rgba(180,210,220,0.12)"/>
      <stop offset="50%" stop-color="rgba(160,190,200,0.06)"/>
      <stop offset="100%" stop-color="rgba(180,210,220,0.1)"/>
    </linearGradient>
  </defs>
  <rect width="400" height="450" fill="url(#zcab)"/>
  <!-- Ambient light from above-left -->
  <ellipse cx="160" cy="80" rx="200" ry="120" fill="rgba(255,250,230,0.02)"/>
  <!-- Cabinet — 3D: front face + right side + top -->
  <!-- Right side face (perspective) -->
  <polygon points="370,20 395,10 395,440 370,430" fill="url(#woodside)" stroke="#7a5a20" stroke-width="1"/>
  <!-- Top face (perspective) -->
  <polygon points="30,20 370,20 395,10 55,10" fill="url(#woodtop)" stroke="#a07838" stroke-width="0.5"/>
  <!-- Front face -->
  <rect x="30" y="20" width="340" height="410" rx="2" fill="url(#wood)" stroke="#987038" stroke-width="2"/>
  <!-- Wood grain lines -->
  <g stroke="#b89048" stroke-width="0.3" opacity="0.3">
    <line x1="35" y1="50" x2="365" y2="50"/>
    <line x1="35" y1="130" x2="365" y2="130"/>
    <line x1="35" y1="280" x2="365" y2="280"/>
    <line x1="35" y1="380" x2="365" y2="380"/>
  </g>
  <!-- Upper glass doors — 3D inset -->
  <rect x="40" y="30" width="155" height="170" rx="3" fill="#a88040" stroke="#987038" stroke-width="2"/>
  <rect x="205" y="30" width="155" height="170" rx="3" fill="#a88040" stroke="#987038" stroke-width="2"/>
  <!-- Glass panes (recessed 3D) -->
  <rect x="46" y="36" width="143" height="158" fill="#1a1818" rx="2"/>
  <rect x="211" y="36" width="143" height="158" fill="#1a1818" rx="2"/>
  <rect x="48" y="38" width="139" height="154" fill="url(#glass)" rx="2"/>
  <rect x="213" y="38" width="139" height="154" fill="url(#glass)" rx="2"/>
  <!-- Glass reflections — diagonal streak -->
  <line x1="60" y1="190" x2="120" y2="42" stroke="rgba(255,255,255,0.06)" stroke-width="8"/>
  <line x1="225" y1="190" x2="285" y2="42" stroke="rgba(255,255,255,0.04)" stroke-width="6"/>
  <!-- Glass inner shadow (depth) -->
  <rect x="48" y="38" width="139" height="4" fill="rgba(0,0,0,0.15)" rx="1"/>
  <rect x="213" y="38" width="139" height="4" fill="rgba(0,0,0,0.15)" rx="1"/>
  <!-- Glass door handles — 3D cylindrical -->
  <rect x="178" y="98" width="7" height="22" rx="2.5" fill="#bbb" stroke="#999" stroke-width="0.5"/>
  <rect x="179" y="100" width="2" height="18" fill="rgba(255,255,255,0.15)" rx="1"/>
  <rect x="215" y="98" width="7" height="22" rx="2.5" fill="#bbb" stroke="#999" stroke-width="0.5"/>
  <rect x="216" y="100" width="2" height="18" fill="rgba(255,255,255,0.15)" rx="1"/>
  <!-- Divider shelf — 3D with thickness -->
  <rect x="35" y="212" width="330" height="4" fill="rgba(0,0,0,0.2)"/>
  <rect x="35" y="206" width="330" height="10" rx="1" fill="#a07838" stroke="#8a6828" stroke-width="0.5"/>
  <rect x="35" y="206" width="330" height="2" fill="rgba(255,255,255,0.06)"/>
  <!-- Lower doors — 3D inset panels -->
  <rect x="40" y="225" width="155" height="195" rx="3" fill="#b89050" stroke="#987038" stroke-width="1.5"/>
  <rect x="205" y="225" width="155" height="195" rx="3" fill="#b89050" stroke="#987038" stroke-width="1.5"/>
  <!-- Inset panel 3D (shadow on top/left, highlight on bottom/right) -->
  <rect x="52" y="237" width="131" height="171" fill="rgba(0,0,0,0.06)" rx="2"/>
  <line x1="52" y1="237" x2="183" y2="237" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/>
  <line x1="52" y1="237" x2="52" y2="408" stroke="rgba(0,0,0,0.1)" stroke-width="1.5"/>
  <line x1="183" y1="237" x2="183" y2="408" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  <line x1="52" y1="408" x2="183" y2="408" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  <rect x="217" y="237" width="131" height="171" fill="rgba(0,0,0,0.06)" rx="2"/>
  <line x1="217" y1="237" x2="348" y2="237" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/>
  <line x1="217" y1="237" x2="217" y2="408" stroke="rgba(0,0,0,0.1)" stroke-width="1.5"/>
  <line x1="348" y1="237" x2="348" y2="408" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  <line x1="217" y1="408" x2="348" y2="408" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  <!-- Door knobs — 3D spheres -->
  <circle cx="183" cy="325" r="7" fill="#888" stroke="#666" stroke-width="1"/>
  <circle cx="183" cy="325" r="5" fill="#bbb"/>
  <circle cx="181" cy="323" r="2" fill="rgba(255,255,255,0.3)"/>
  <circle cx="217" cy="325" r="7" fill="#888" stroke="#666" stroke-width="1"/>
  <circle cx="217" cy="325" r="5" fill="#bbb"/>
  <circle cx="215" cy="323" r="2" fill="rgba(255,255,255,0.3)"/>
  <!-- Keyhole — 3D recessed -->
  <ellipse cx="183" cy="348" rx="4" ry="6" fill="#333" stroke="#555" stroke-width="0.5"/>
  <ellipse cx="183" cy="347" rx="2.5" ry="4" fill="#222"/>
  <rect x="182" y="351" width="2" height="7" fill="#222"/>
  <!-- Bottom shadow -->
  <rect x="30" y="425" width="340" height="8" fill="rgba(0,0,0,0.15)" rx="1"/>
</svg>`;

// Drawer open state — 3D pulled-out drawer with depth
zoom.drawerOpen = `
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="100">
  <defs>
    <linearGradient id="dw" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c8a060"/>
      <stop offset="100%" stop-color="#b89050"/>
    </linearGradient>
    <linearGradient id="dwinner" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6a4a22"/>
      <stop offset="100%" stop-color="#8a6a30"/>
    </linearGradient>
  </defs>
  <!-- Drawer front face -->
  <rect x="0" y="0" width="320" height="90" rx="3" fill="url(#dw)" stroke="#987038" stroke-width="1.5"/>
  <!-- 3D drawer walls (visible interior sides) -->
  <polygon points="8,6 20,0 300,0 312,6 312,78 8,78" fill="url(#dwinner)"/>
  <!-- Inner shadow at top edge -->
  <rect x="8" y="6" width="304" height="5" fill="rgba(0,0,0,0.2)"/>
  <!-- Left/right inner wall shadow -->
  <rect x="8" y="6" width="4" height="72" fill="rgba(0,0,0,0.12)"/>
  <rect x="308" y="6" width="4" height="72" fill="rgba(0,0,0,0.08)"/>
  <!-- Bottom of drawer -->
  <rect x="12" y="11" width="296" height="67" fill="#7a5a28" rx="1"/>
  <!-- Wood grain on bottom -->
  <line x1="15" y1="30" x2="305" y2="30" stroke="#6a4a22" stroke-width="0.5" opacity="0.3"/>
  <line x1="15" y1="55" x2="305" y2="55" stroke="#6a4a22" stroke-width="0.5" opacity="0.3"/>
  <!-- Paper inside — 3D with slight shadow -->
  <ellipse cx="162" cy="52" rx="82" ry="6" fill="rgba(0,0,0,0.08)"/>
  <rect x="80" y="15" width="160" height="60" fill="#f0e8d0" rx="2" transform="rotate(-3 160 45)"/>
  <rect x="82" y="17" width="156" height="56" fill="none" stroke="#d0c0a0" stroke-width="0.5" rx="1" transform="rotate(-3 160 45)"/>
  <!-- Paper fold crease -->
  <line x1="160" y1="18" x2="160" y2="73" stroke="#d8d0b8" stroke-width="0.5" transform="rotate(-3 160 45)"/>
  <text x="160" y="42" text-anchor="middle" fill="#333" font-size="22" font-weight="bold" font-family="serif" transform="rotate(-3 160 45)">T A K I</text>
  <text x="160" y="60" text-anchor="middle" fill="#888" font-size="9" font-family="serif" transform="rotate(-3 160 45)">password?</text>
  <!-- Drawer handle — 3D arc -->
  <rect x="138" y="87" width="44" height="9" rx="4" fill="#999" stroke="#777" stroke-width="0.5"/>
  <rect x="140" y="88" width="40" height="3" fill="rgba(255,255,255,0.12)" rx="2"/>
</svg>`;

// Paper item — 3D folded note with shadow
zoom.paper = `
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="50">
  <defs>
    <linearGradient id="paperg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8f0d8"/>
      <stop offset="60%" stop-color="#f0e8d0"/>
      <stop offset="100%" stop-color="#e8dcc0"/>
    </linearGradient>
  </defs>
  <!-- Paper shadow -->
  <rect x="4" y="5" width="74" height="44" rx="1" fill="rgba(0,0,0,0.2)"/>
  <!-- Paper body -->
  <polygon points="2,2 72,2 78,8 78,48 2,48" fill="url(#paperg)" stroke="#d0c0a0" stroke-width="0.8"/>
  <!-- Folded corner -->
  <polygon points="72,2 72,8 78,8" fill="#ddd0b8" stroke="#c0b098" stroke-width="0.5"/>
  <!-- Fold crease -->
  <line x1="40" y1="3" x2="40" y2="47" stroke="#e0d8c0" stroke-width="0.5"/>
  <!-- Text -->
  <text x="39" y="26" text-anchor="middle" fill="#333" font-size="16" font-weight="bold" font-family="serif">T A K I</text>
  <text x="39" y="40" text-anchor="middle" fill="#999" font-size="7" font-family="serif">password?</text>
</svg>`;

// --- Laptop close-up: 3D perspective from above ---
zoom.laptopBg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="350">
  <defs>
    <radialGradient id="lbg" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#1e1e28"/>
      <stop offset="100%" stop-color="#08080c"/>
    </radialGradient>
    <linearGradient id="scr" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0c2548"/>
      <stop offset="100%" stop-color="#061530"/>
    </linearGradient>
    <linearGradient id="lcase" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#888"/>
      <stop offset="100%" stop-color="#666"/>
    </linearGradient>
    <linearGradient id="lbezel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2a2a2a"/>
      <stop offset="100%" stop-color="#1a1a1a"/>
    </linearGradient>
    <linearGradient id="desksurf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5a4228"/>
      <stop offset="100%" stop-color="#4a3220"/>
    </linearGradient>
  </defs>
  <rect width="400" height="350" fill="url(#lbg)"/>
  <!-- Desk surface underneath — 3D perspective -->
  <polygon points="0,340 400,340 380,225 20,225" fill="url(#desksurf)" opacity="0.4"/>
  <line x1="20" y1="225" x2="380" y2="225" stroke="#6a5238" stroke-width="0.5" opacity="0.3"/>
  <!-- Screen glow on desk -->
  <ellipse cx="200" cy="300" rx="120" ry="30" fill="rgba(40,80,140,0.06)"/>
  <!-- Laptop base — 3D perspective trapezoid (foreshortened) -->
  <polygon points="45,232 355,232 340,330 60,330" fill="url(#lcase)" stroke="#555" stroke-width="1.5"/>
  <!-- Base thickness (front edge) -->
  <polygon points="60,330 340,330 343,335 57,335" fill="#555" stroke="#444" stroke-width="0.5"/>
  <!-- Hinge — 3D cylinder -->
  <rect x="50" y="228" width="300" height="8" rx="3" fill="#777" stroke="#666" stroke-width="0.5"/>
  <rect x="52" y="229" width="296" height="3" fill="rgba(255,255,255,0.08)" rx="1"/>
  <!-- Keyboard area — 3D recessed -->
  <polygon points="72,245 328,245 318,310 82,310" fill="#555" stroke="#4a4a4a" stroke-width="0.5"/>
  <!-- Keyboard keys — 3D perspective grid (foreshortened rows) -->
  <g fill="#4a4a4a" stroke="#3a3a3a" stroke-width="0.3">
    <!-- Row 1 (near hinge, wider) -->
    <rect x="78" y="247" width="16" height="9" rx="1"/><rect x="96" y="247" width="16" height="9" rx="1"/>
    <rect x="114" y="247" width="16" height="9" rx="1"/><rect x="132" y="247" width="16" height="9" rx="1"/>
    <rect x="150" y="247" width="16" height="9" rx="1"/><rect x="168" y="247" width="16" height="9" rx="1"/>
    <rect x="186" y="247" width="16" height="9" rx="1"/><rect x="204" y="247" width="16" height="9" rx="1"/>
    <rect x="222" y="247" width="16" height="9" rx="1"/><rect x="240" y="247" width="16" height="9" rx="1"/>
    <rect x="258" y="247" width="16" height="9" rx="1"/><rect x="276" y="247" width="16" height="9" rx="1"/>
    <rect x="294" y="247" width="18" height="9" rx="1"/>
    <!-- Row 2 -->
    <rect x="80" y="258" width="19" height="9" rx="1"/><rect x="101" y="258" width="15" height="9" rx="1"/>
    <rect x="118" y="258" width="15" height="9" rx="1"/><rect x="135" y="258" width="15" height="9" rx="1"/>
    <rect x="152" y="258" width="15" height="9" rx="1"/><rect x="169" y="258" width="15" height="9" rx="1"/>
    <rect x="186" y="258" width="15" height="9" rx="1"/><rect x="203" y="258" width="15" height="9" rx="1"/>
    <rect x="220" y="258" width="15" height="9" rx="1"/><rect x="237" y="258" width="15" height="9" rx="1"/>
    <rect x="254" y="258" width="15" height="9" rx="1"/><rect x="271" y="258" width="32" height="9" rx="1"/>
    <!-- Row 3 -->
    <rect x="82" y="269" width="22" height="9" rx="1"/><rect x="106" y="269" width="14" height="9" rx="1"/>
    <rect x="122" y="269" width="14" height="9" rx="1"/><rect x="138" y="269" width="14" height="9" rx="1"/>
    <rect x="154" y="269" width="14" height="9" rx="1"/><rect x="170" y="269" width="14" height="9" rx="1"/>
    <rect x="186" y="269" width="14" height="9" rx="1"/><rect x="202" y="269" width="14" height="9" rx="1"/>
    <rect x="218" y="269" width="14" height="9" rx="1"/><rect x="234" y="269" width="60" height="9" rx="1"/>
    <!-- Space bar -->
    <rect x="128" y="280" width="130" height="9" rx="1"/>
  </g>
  <!-- Key highlights -->
  <g fill="rgba(255,255,255,0.03)">
    <rect x="78" y="247" width="16" height="3" rx="1"/><rect x="96" y="247" width="16" height="3" rx="1"/>
    <rect x="150" y="247" width="16" height="3" rx="1"/><rect x="186" y="247" width="16" height="3" rx="1"/>
  </g>
  <!-- Trackpad — 3D recessed -->
  <rect x="148" y="296" width="96" height="12" rx="3" fill="#666" stroke="#555" stroke-width="0.5"/>
  <rect x="150" y="297" width="92" height="4" fill="rgba(255,255,255,0.04)" rx="2"/>
  <!-- Screen lid — 3D with bezel -->
  <polygon points="42,28 358,28 355,225 45,225" fill="url(#lbezel)" stroke="#333" stroke-width="2"/>
  <!-- Screen bezel top thickness -->
  <polygon points="42,28 358,28 362,24 38,24" fill="#333" stroke="#444" stroke-width="0.5"/>
  <!-- Screen panel -->
  <rect x="56" y="40" width="288" height="178" rx="2" fill="url(#scr)"/>
  <!-- Screen glow edge -->
  <rect x="56" y="40" width="288" height="178" rx="2" fill="none" stroke="rgba(40,100,180,0.1)" stroke-width="1"/>
  <!-- Camera dot -->
  <circle cx="200" cy="33" r="2.5" fill="#333" stroke="#444" stroke-width="0.5"/>
  <circle cx="200" cy="33" r="1" fill="#2a2a2a"/>
  <!-- Screen content: password prompt -->
  <rect x="110" y="80" width="180" height="90" rx="6" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  <text x="200" y="105" text-anchor="middle" fill="#8ab" font-size="11" font-family="monospace">Enter Password</text>
  <rect x="130" y="115" width="140" height="24" rx="4" fill="#0a1520" stroke="#335" stroke-width="1"/>
  <text x="200" y="132" text-anchor="middle" fill="#446" font-size="14" font-family="monospace">_ _ _ _</text>
  <rect x="155" y="148" width="90" height="18" rx="4" fill="#335" stroke="#447" stroke-width="0.5"/>
  <text x="200" y="160" text-anchor="middle" fill="#8ab" font-size="9" font-family="monospace">SUBMIT</text>
  <!-- Screen reflection -->
  <line x1="60" y1="210" x2="160" y2="45" stroke="rgba(255,255,255,0.02)" stroke-width="15"/>
</svg>`;

// --- Lockbox close-up: 3D metal box on shelf with perspective ---
zoom.lockboxBg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="350">
  <defs>
    <radialGradient id="lkbg" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#1e1e1a"/>
      <stop offset="100%" stop-color="#080806"/>
    </radialGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#777"/>
      <stop offset="40%" stop-color="#666"/>
      <stop offset="100%" stop-color="#4a4a4a"/>
    </linearGradient>
    <linearGradient id="metalside" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#555"/>
      <stop offset="100%" stop-color="#3a3a3a"/>
    </linearGradient>
    <linearGradient id="metaltop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#888"/>
      <stop offset="100%" stop-color="#666"/>
    </linearGradient>
    <linearGradient id="shelf3d" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d0a868"/>
      <stop offset="100%" stop-color="#b89050"/>
    </linearGradient>
  </defs>
  <rect width="400" height="350" fill="url(#lkbg)"/>
  <!-- Ambient light -->
  <ellipse cx="180" cy="100" rx="180" ry="100" fill="rgba(255,250,230,0.02)"/>
  <!-- Shelf surface — 3D perspective -->
  <polygon points="10,245 390,245 370,238 30,238" fill="url(#shelf3d)" stroke="#a07838" stroke-width="1"/>
  <!-- Shelf front edge -->
  <polygon points="10,245 390,245 390,252 10,252" fill="#a07838" stroke="#8a6828" stroke-width="0.5"/>
  <line x1="10" y1="246" x2="390" y2="246" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
  <!-- Lockbox shadow on shelf -->
  <ellipse cx="205" cy="240" rx="130" ry="8" fill="rgba(0,0,0,0.3)"/>
  <!-- Lockbox body — 3D: front + right side + top -->
  <!-- Right side face -->
  <polygon points="320,100 345,88 345,240 320,240" fill="url(#metalside)" stroke="#3a3a3a" stroke-width="1"/>
  <!-- Metal texture on side -->
  <line x1="325" y1="95" x2="340" y2="90" stroke="#4a4a4a" stroke-width="0.5" opacity="0.3"/>
  <line x1="325" y1="130" x2="340" y2="125" stroke="#4a4a4a" stroke-width="0.5" opacity="0.3"/>
  <!-- Top face -->
  <polygon points="80,100 320,100 345,88 105,88" fill="url(#metaltop)" stroke="#555" stroke-width="0.5"/>
  <!-- Top brushed metal texture -->
  <g stroke="#777" stroke-width="0.3" opacity="0.2">
    <line x1="110" y1="92" x2="340" y2="90"/>
    <line x1="110" y1="95" x2="340" y2="93"/>
    <line x1="110" y1="98" x2="340" y2="96"/>
  </g>
  <!-- Front face -->
  <rect x="80" y="100" width="240" height="140" rx="3" fill="url(#metal)" stroke="#444" stroke-width="2"/>
  <!-- Brushed metal texture on front -->
  <g stroke="#5a5a5a" stroke-width="0.4" opacity="0.2">
    <line x1="85" y1="110" x2="315" y2="110"/>
    <line x1="85" y1="120" x2="315" y2="120"/>
    <line x1="85" y1="225" x2="315" y2="225"/>
    <line x1="85" y1="235" x2="315" y2="235"/>
  </g>
  <!-- Front panel inset -->
  <rect x="88" y="108" width="224" height="124" rx="2" fill="#4a4a4a" stroke="#3a3a3a" stroke-width="0.5"/>
  <!-- Inner edge shadow (depth) -->
  <line x1="88" y1="108" x2="312" y2="108" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
  <line x1="88" y1="108" x2="88" y2="232" stroke="rgba(0,0,0,0.15)" stroke-width="2"/>
  <line x1="312" y1="108" x2="312" y2="232" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  <line x1="88" y1="232" x2="312" y2="232" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  <!-- Keypad area — 3D recessed -->
  <rect x="130" y="138" width="140" height="84" rx="4" fill="#2a2a2a" stroke="#444" stroke-width="1.5"/>
  <!-- Keypad inner shadow -->
  <rect x="132" y="140" width="136" height="4" fill="rgba(0,0,0,0.2)"/>
  <!-- Display -->
  <rect x="140" y="146" width="120" height="20" rx="3" fill="#1a1a1a" stroke="#333" stroke-width="0.5"/>
  <!-- Display screen glow -->
  <rect x="142" y="148" width="116" height="16" rx="2" fill="#111" stroke="rgba(0,200,100,0.1)" stroke-width="0.5"/>
  <text x="200" y="160" text-anchor="middle" fill="#4a4" font-size="14" font-family="monospace">- - - -</text>
  <!-- Number buttons — 3D raised -->
  <g>
    <rect x="143" y="172" width="24" height="18" rx="3" fill="#444" stroke="#555" stroke-width="0.5"/>
    <rect x="143" y="172" width="24" height="8" rx="3" fill="rgba(255,255,255,0.04)"/>
    <text x="155" y="185" text-anchor="middle" fill="#bbb" font-size="11">1</text>
    <rect x="172" y="172" width="24" height="18" rx="3" fill="#444" stroke="#555" stroke-width="0.5"/>
    <rect x="172" y="172" width="24" height="8" rx="3" fill="rgba(255,255,255,0.04)"/>
    <text x="184" y="185" text-anchor="middle" fill="#bbb" font-size="11">2</text>
    <rect x="201" y="172" width="24" height="18" rx="3" fill="#444" stroke="#555" stroke-width="0.5"/>
    <rect x="201" y="172" width="24" height="8" rx="3" fill="rgba(255,255,255,0.04)"/>
    <text x="213" y="185" text-anchor="middle" fill="#bbb" font-size="11">3</text>
    <rect x="230" y="172" width="24" height="18" rx="3" fill="#444" stroke="#555" stroke-width="0.5"/>
    <rect x="230" y="172" width="24" height="8" rx="3" fill="rgba(255,255,255,0.04)"/>
    <text x="242" y="185" text-anchor="middle" fill="#bbb" font-size="11">4</text>
    <rect x="143" y="194" width="24" height="18" rx="3" fill="#444" stroke="#555" stroke-width="0.5"/>
    <rect x="143" y="194" width="24" height="8" rx="3" fill="rgba(255,255,255,0.04)"/>
    <text x="155" y="207" text-anchor="middle" fill="#bbb" font-size="11">5</text>
    <rect x="172" y="194" width="24" height="18" rx="3" fill="#444" stroke="#555" stroke-width="0.5"/>
    <rect x="172" y="194" width="24" height="8" rx="3" fill="rgba(255,255,255,0.04)"/>
    <text x="184" y="207" text-anchor="middle" fill="#bbb" font-size="11">6</text>
    <rect x="201" y="194" width="24" height="18" rx="3" fill="#444" stroke="#555" stroke-width="0.5"/>
    <rect x="201" y="194" width="24" height="8" rx="3" fill="rgba(255,255,255,0.04)"/>
    <text x="213" y="207" text-anchor="middle" fill="#bbb" font-size="11">7</text>
    <rect x="230" y="194" width="24" height="18" rx="3" fill="#444" stroke="#555" stroke-width="0.5"/>
    <rect x="230" y="194" width="24" height="8" rx="3" fill="rgba(255,255,255,0.04)"/>
    <text x="242" y="207" text-anchor="middle" fill="#bbb" font-size="11">8</text>
  </g>
  <!-- Lock hasp — 3D -->
  <rect x="183" y="93" width="34" height="12" rx="2" fill="#555" stroke="#444" stroke-width="0.5"/>
  <path d="M190,95 L190,78 Q200,66 210,78 L210,95" fill="none" stroke="#888" stroke-width="4"/>
  <path d="M191,95 L191,79 Q200,68 209,79 L209,95" fill="none" stroke="#666" stroke-width="2"/>
  <!-- Hasp highlight -->
  <path d="M193,94 L193,80 Q200,70 207,80" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  <!-- Status LED — 3D glowing -->
  <circle cx="200" cy="128" r="5" fill="#300" stroke="#444" stroke-width="1"/>
  <circle cx="200" cy="128" r="3.5" fill="#600"/>
  <circle cx="199" cy="127" r="1.5" fill="#900" opacity="0.6"/>
  <!-- LED glow -->
  <circle cx="200" cy="128" r="8" fill="rgba(150,0,0,0.08)"/>
</svg>`;

// Keycard item — 3D with chip and embossing
zoom.keycard = `
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="50">
  <defs>
    <linearGradient id="kc" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#eef0f4"/>
      <stop offset="40%" stop-color="#dce0e8"/>
      <stop offset="100%" stop-color="#c0c8d8"/>
    </linearGradient>
    <linearGradient id="chip3d" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e0c060"/>
      <stop offset="50%" stop-color="#c4a35a"/>
      <stop offset="100%" stop-color="#a88838"/>
    </linearGradient>
  </defs>
  <!-- Card shadow -->
  <rect x="4" y="5" width="74" height="44" rx="4" fill="rgba(0,0,0,0.25)"/>
  <!-- Card body — 3D -->
  <rect x="2" y="2" width="76" height="46" rx="4" fill="url(#kc)" stroke="#a0a8b8" stroke-width="1"/>
  <!-- Top edge highlight -->
  <rect x="4" y="3" width="72" height="2" rx="1" fill="rgba(255,255,255,0.3)"/>
  <!-- EMV Chip — 3D gold -->
  <rect x="8" y="14" width="30" height="22" rx="2.5" fill="url(#chip3d)" stroke="#a88838" stroke-width="0.5"/>
  <!-- Chip circuit lines -->
  <rect x="10" y="16" width="26" height="18" rx="1" fill="rgba(255,255,255,0.08)"/>
  <line x1="23" y1="16" x2="23" y2="34" stroke="#b89848" stroke-width="0.5" opacity="0.6"/>
  <line x1="10" y1="25" x2="36" y2="25" stroke="#b89848" stroke-width="0.5" opacity="0.6"/>
  <rect x="14" y="19" width="8" height="5" rx="0.5" fill="rgba(255,255,255,0.06)"/>
  <rect x="25" y="19" width="8" height="5" rx="0.5" fill="rgba(255,255,255,0.06)"/>
  <rect x="14" y="27" width="8" height="4" rx="0.5" fill="rgba(255,255,255,0.06)"/>
  <rect x="25" y="27" width="8" height="4" rx="0.5" fill="rgba(255,255,255,0.06)"/>
  <!-- Chip highlight -->
  <line x1="10" y1="15" x2="36" y2="15" stroke="rgba(255,255,200,0.3)" stroke-width="0.5"/>
  <!-- Magnetic strip lines -->
  <rect x="45" y="20" width="28" height="3" rx="1" fill="#8a8a90"/>
  <rect x="45" y="20" width="28" height="1" rx="0.5" fill="rgba(255,255,255,0.1)"/>
  <rect x="45" y="26" width="20" height="3" rx="1" fill="#aaa"/>
  <text x="55" y="42" text-anchor="middle" fill="#8888aa" font-size="6" font-family="sans-serif">ACCESS</text>
  <!-- Bottom right corner notch -->
  <polygon points="72,44 76,40 76,44" fill="#b0b8c8"/>
</svg>`;

// Laptop screen unlocked — showing "1886" with CRT glow effect
zoom.screen1886 = `
<svg xmlns="http://www.w3.org/2000/svg" width="280" height="175">
  <defs>
    <radialGradient id="scrglow" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#0e2848"/>
      <stop offset="100%" stop-color="#060e20"/>
    </radialGradient>
    <radialGradient id="numglow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,255,100,0.08)"/>
      <stop offset="100%" stop-color="rgba(0,255,100,0)"/>
    </radialGradient>
  </defs>
  <rect width="280" height="175" rx="2" fill="url(#scrglow)"/>
  <!-- Scanline overlay -->
  <g opacity="0.04">
    <line x1="0" y1="10" x2="280" y2="10" stroke="#0f0" stroke-width="1"/>
    <line x1="0" y1="25" x2="280" y2="25" stroke="#0f0" stroke-width="1"/>
    <line x1="0" y1="40" x2="280" y2="40" stroke="#0f0" stroke-width="1"/>
    <line x1="0" y1="55" x2="280" y2="55" stroke="#0f0" stroke-width="1"/>
    <line x1="0" y1="70" x2="280" y2="70" stroke="#0f0" stroke-width="1"/>
    <line x1="0" y1="85" x2="280" y2="85" stroke="#0f0" stroke-width="1"/>
    <line x1="0" y1="100" x2="280" y2="100" stroke="#0f0" stroke-width="1"/>
    <line x1="0" y1="115" x2="280" y2="115" stroke="#0f0" stroke-width="1"/>
    <line x1="0" y1="130" x2="280" y2="130" stroke="#0f0" stroke-width="1"/>
    <line x1="0" y1="145" x2="280" y2="145" stroke="#0f0" stroke-width="1"/>
    <line x1="0" y1="160" x2="280" y2="160" stroke="#0f0" stroke-width="1"/>
  </g>
  <!-- Access granted badge -->
  <rect x="65" y="16" width="150" height="28" rx="4" fill="rgba(0,255,100,0.06)" stroke="rgba(0,255,100,0.15)" stroke-width="1"/>
  <text x="140" y="35" text-anchor="middle" fill="#5ba" font-size="14" font-family="monospace" font-weight="bold">ACCESS GRANTED</text>
  <!-- Number display — glowing box -->
  <ellipse cx="140" cy="100" rx="110" ry="45" fill="url(#numglow)"/>
  <rect x="35" y="58" width="210" height="84" rx="8" fill="rgba(0,255,100,0.03)" stroke="rgba(0,255,100,0.12)" stroke-width="1.5"/>
  <!-- Inner glow ring -->
  <rect x="40" y="63" width="200" height="74" rx="6" fill="none" stroke="rgba(0,255,100,0.05)" stroke-width="2"/>
  <!-- Big number with glow layers -->
  <text x="140" y="116" text-anchor="middle" fill="rgba(0,200,80,0.15)" font-size="56" font-weight="bold" font-family="monospace">1886</text>
  <text x="140" y="115" text-anchor="middle" fill="#5c8" font-size="54" font-weight="bold" font-family="monospace">1886</text>
  <text x="140" y="114" text-anchor="middle" fill="#8ea" font-size="52" font-weight="bold" font-family="monospace" opacity="0.4">1886</text>
  <!-- Small status text -->
  <text x="140" y="160" text-anchor="middle" fill="#2a4a5a" font-size="9" font-family="monospace">FILE #0042 — CLASSIFIED</text>
  <!-- Screen edge vignette -->
  <rect width="280" height="175" rx="2" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="6"/>
</svg>`;

// Key inserted in keyhole — small overlay for keyhole sub-hotspot
zoom.keyInHole = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="45">
  <defs>
    <linearGradient id="kih" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e8c040"/>
      <stop offset="100%" stop-color="#c8a030"/>
    </linearGradient>
  </defs>
  <!-- Keyhole escutcheon plate -->
  <ellipse cx="16" cy="18" rx="8" ry="11" fill="#444" stroke="#555" stroke-width="0.8"/>
  <ellipse cx="16" cy="17" rx="6" ry="8" fill="#333"/>
  <!-- Key bow (ring) sticking out -->
  <circle cx="16" cy="8" r="7" fill="none" stroke="url(#kih)" stroke-width="3"/>
  <circle cx="16" cy="8" r="3.5" fill="#3a2818" opacity="0.4"/>
  <path d="M10,4 Q16,1 22,4" fill="none" stroke="rgba(255,255,200,0.3)" stroke-width="0.8"/>
  <!-- Key shaft going into hole -->
  <rect x="14" y="14" width="4" height="14" rx="1" fill="url(#kih)" stroke="#a88020" stroke-width="0.3"/>
  <!-- Shaft highlight -->
  <line x1="15" y1="15" x2="15" y2="26" stroke="rgba(255,255,200,0.3)" stroke-width="0.6"/>
  <!-- Keyhole slot below shaft -->
  <rect x="15" y="28" width="2" height="8" fill="#222"/>
</svg>`;

// Upper right glass door opened — reveals dark interior with lockbox
zoom.upperDoorOpen = `
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="175">
  <defs>
    <linearGradient id="uint" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1210"/>
      <stop offset="100%" stop-color="#0e0a08"/>
    </linearGradient>
    <linearGradient id="udoor" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a88040"/>
      <stop offset="100%" stop-color="#c8a060"/>
    </linearGradient>
  </defs>
  <!-- Dark interior revealed -->
  <rect x="0" y="0" width="130" height="175" fill="url(#uint)" rx="2"/>
  <!-- Top shadow -->
  <rect x="0" y="0" width="130" height="5" fill="rgba(0,0,0,0.3)"/>
  <!-- Left edge shadow -->
  <rect x="0" y="0" width="3" height="175" fill="rgba(0,0,0,0.2)"/>
  <!-- Interior shelf -->
  <rect x="4" y="100" width="126" height="3" fill="#3a2818"/>
  <!-- Glass door swung open (perspective) -->
  <polygon points="130,0 160,4 160,171 130,175" fill="url(#udoor)" stroke="#987038" stroke-width="1"/>
  <polygon points="130,0 138,1 138,174 130,175" fill="#b89050"/>
  <!-- Glass on open door -->
  <polygon points="133,6 156,9 156,167 133,171" fill="rgba(180,210,220,0.08)"/>
  <!-- Glass reflection on open door -->
  <line x1="140" y1="165" x2="150" y2="12" stroke="rgba(255,255,255,0.04)" stroke-width="4"/>
  <!-- Door handle on open door -->
  <rect x="131" y="78" width="4" height="14" rx="1.5" fill="#bbb" stroke="#999" stroke-width="0.3"/>
</svg>`;

// Cabinet right door open — 3D interior with shelf and paper visible
zoom.cabinetRightOpen = `
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="195">
  <defs>
    <linearGradient id="coint" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3a2010"/>
      <stop offset="100%" stop-color="#2a1808"/>
    </linearGradient>
    <linearGradient id="doorface" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a87a38"/>
      <stop offset="100%" stop-color="#c89858"/>
    </linearGradient>
    <linearGradient id="doorinner" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#987038"/>
      <stop offset="100%" stop-color="#8a6228"/>
    </linearGradient>
  </defs>
  <!-- Dark interior revealed -->
  <rect x="0" y="0" width="130" height="195" fill="url(#coint)" rx="1"/>
  <!-- Top shadow -->
  <rect x="0" y="0" width="130" height="6" fill="rgba(0,0,0,0.25)"/>
  <!-- Interior side wall shadow (left edge) -->
  <rect x="0" y="0" width="4" height="195" fill="rgba(0,0,0,0.15)"/>
  <!-- Interior shelf — 3D -->
  <rect x="4" y="85" width="126" height="4" fill="#5a3a18"/>
  <line x1="4" y1="85" x2="130" y2="85" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>
  <!-- Bottom shelf area -->
  <rect x="4" y="89" width="126" height="106" fill="#2a1808"/>
  <!-- Right door swung open (perspective) -->
  <polygon points="130,0 160,5 160,190 130,195" fill="url(#doorface)" stroke="#987038" stroke-width="1"/>
  <polygon points="130,0 140,1 140,194 130,195" fill="url(#doorinner)"/>
  <!-- Door panel inset on open door -->
  <polygon points="134,12 156,16 156,180 134,184" fill="rgba(0,0,0,0.06)"/>
  <!-- Door knob on open door -->
  <circle cx="135" cy="95" r="4" fill="#999" stroke="#777" stroke-width="0.5"/>
  <circle cx="134" cy="94" r="2" fill="#bbb"/>
</svg>`;

// Lockbox visible in upper cabinet — 3D behind glass with reflections
zoom.lockboxInGlass = `
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="100">
  <defs>
    <linearGradient id="lbmetal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#777"/>
      <stop offset="40%" stop-color="#666"/>
      <stop offset="100%" stop-color="#4a4a4a"/>
    </linearGradient>
    <linearGradient id="lbside" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#555"/>
      <stop offset="100%" stop-color="#3a3a3a"/>
    </linearGradient>
  </defs>
  <!-- Dark cabinet interior behind glass -->
  <rect width="160" height="100" fill="#1a1410" rx="2"/>
  <!-- Shelf inside -->
  <rect x="0" y="78" width="160" height="4" fill="#5a3a18"/>
  <line x1="0" y1="78" x2="160" y2="78" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>
  <!-- Lockbox shadow on shelf -->
  <ellipse cx="82" cy="79" rx="52" ry="4" fill="rgba(0,0,0,0.3)"/>
  <!-- Lockbox — 3D: front + right side + top -->
  <!-- Right side -->
  <polygon points="130,25 140,20 140,78 130,80" fill="url(#lbside)" stroke="#3a3a3a" stroke-width="0.5"/>
  <!-- Top -->
  <polygon points="30,25 130,25 140,20 40,20" fill="#777" stroke="#555" stroke-width="0.3"/>
  <!-- Front face -->
  <rect x="30" y="25" width="100" height="55" rx="3" fill="url(#lbmetal)" stroke="#444" stroke-width="1"/>
  <rect x="34" y="29" width="92" height="47" rx="2" fill="#4a4a4a"/>
  <!-- Keypad recessed -->
  <rect x="53" y="36" width="54" height="30" rx="2" fill="#2a2a2a" stroke="#444" stroke-width="0.5"/>
  <rect x="58" y="40" width="44" height="9" rx="1" fill="#1a1a1a"/>
  <text x="80" y="48" text-anchor="middle" fill="#4a4" font-size="5" font-family="monospace">- - - -</text>
  <!-- Tiny buttons -->
  <g fill="#3a3a3a" stroke="#444" stroke-width="0.3">
    <rect x="58" y="52" width="10" height="5" rx="1"/><rect x="70" y="52" width="10" height="5" rx="1"/>
    <rect x="82" y="52" width="10" height="5" rx="1"/><rect x="94" y="52" width="10" height="5" rx="1"/>
  </g>
  <!-- Hasp — 3D -->
  <rect x="70" y="20" width="20" height="7" rx="1.5" fill="#555"/>
  <path d="M74,22 L74,14 Q80,8 86,14 L86,22" fill="none" stroke="#888" stroke-width="2.5"/>
  <path d="M75,21 L75,15 Q80,10 85,15 L85,21" fill="none" stroke="#666" stroke-width="1"/>
  <!-- LED -->
  <circle cx="80" cy="68" r="2" fill="#600"/>
  <circle cx="80" cy="68" r="4" fill="rgba(150,0,0,0.1)"/>
  <!-- Glass overlay — reflections and frost -->
  <rect width="160" height="100" fill="rgba(180,200,220,0.04)" rx="2"/>
  <!-- Glass reflection streak -->
  <line x1="10" y1="95" x2="60" y2="5" stroke="rgba(255,255,255,0.06)" stroke-width="6"/>
  <line x1="100" y1="95" x2="140" y2="15" stroke="rgba(255,255,255,0.03)" stroke-width="4"/>
</svg>`;

// --- Door close-up: 3D perspective with depth, molding, card reader ---
zoom.doorBg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="450">
  <defs>
    <linearGradient id="zdr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#6a3a18"/>
      <stop offset="20%" stop-color="#a06a38"/>
      <stop offset="50%" stop-color="#b07a42"/>
      <stop offset="80%" stop-color="#a06a38"/>
      <stop offset="100%" stop-color="#6a3a18"/>
    </linearGradient>
    <linearGradient id="frame3d" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#8a7858"/>
      <stop offset="50%" stop-color="#a89878"/>
      <stop offset="100%" stop-color="#8a7858"/>
    </linearGradient>
    <linearGradient id="panel3d" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8a5a30"/>
      <stop offset="100%" stop-color="#7a4a20"/>
    </linearGradient>
    <linearGradient id="handlegrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ddd"/>
      <stop offset="40%" stop-color="#c0c0c0"/>
      <stop offset="100%" stop-color="#999"/>
    </linearGradient>
    <radialGradient id="doorbg" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#1a1510"/>
      <stop offset="100%" stop-color="#080605"/>
    </radialGradient>
  </defs>
  <rect width="400" height="450" fill="url(#doorbg)"/>
  <!-- Wall visible around door -->
  <rect x="0" y="0" width="25" height="450" fill="#c0b498" opacity="0.3"/>
  <rect x="375" y="0" width="25" height="450" fill="#c0b498" opacity="0.3"/>
  <!-- Door frame — 3D with depth -->
  <!-- Frame front face -->
  <rect x="22" y="5" width="356" height="440" fill="url(#frame3d)"/>
  <!-- Frame inner edge (depth toward door) — creates 3D recess -->
  <polygon points="35,12 22,5 22,445 35,438" fill="#7a6848"/>
  <polygon points="365,12 378,5 378,445 365,438" fill="#988858"/>
  <polygon points="35,12 365,12 378,5 22,5" fill="#9a8868"/>
  <!-- Door panel — 3D raised -->
  <rect x="35" y="12" width="330" height="426" rx="2" fill="url(#zdr)" stroke="#5a3018" stroke-width="1.5"/>
  <!-- Wood grain texture -->
  <g stroke="#8a5a30" stroke-width="0.4" opacity="0.15">
    <line x1="40" y1="20" x2="40" y2="430"/>
    <line x1="90" y1="20" x2="90" y2="430"/>
    <line x1="150" y1="20" x2="150" y2="430"/>
    <line x1="200" y1="20" x2="200" y2="430"/>
    <line x1="260" y1="20" x2="260" y2="430"/>
    <line x1="310" y1="20" x2="310" y2="430"/>
    <line x1="350" y1="20" x2="350" y2="430"/>
  </g>
  <!-- Upper panel — 3D inset with beveled edge -->
  <rect x="60" y="30" width="280" height="135" rx="3" fill="url(#panel3d)" stroke="#6a4020" stroke-width="2"/>
  <!-- Panel bevel (light top-left, shadow bottom-right) -->
  <line x1="62" y1="32" x2="338" y2="32" stroke="rgba(0,0,0,0.15)" stroke-width="2"/>
  <line x1="62" y1="32" x2="62" y2="163" stroke="rgba(0,0,0,0.1)" stroke-width="2"/>
  <line x1="338" y1="32" x2="338" y2="163" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  <line x1="62" y1="163" x2="338" y2="163" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  <rect x="68" y="38" width="264" height="121" fill="#956232" opacity="0.25" rx="2"/>
  <!-- Middle panel — 3D inset -->
  <rect x="60" y="180" width="280" height="120" rx="3" fill="url(#panel3d)" stroke="#6a4020" stroke-width="2"/>
  <line x1="62" y1="182" x2="338" y2="182" stroke="rgba(0,0,0,0.15)" stroke-width="2"/>
  <line x1="62" y1="182" x2="62" y2="298" stroke="rgba(0,0,0,0.1)" stroke-width="2"/>
  <line x1="338" y1="182" x2="338" y2="298" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  <line x1="62" y1="298" x2="338" y2="298" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  <rect x="68" y="188" width="264" height="104" fill="#956232" opacity="0.25" rx="2"/>
  <!-- Lower panel — 3D inset -->
  <rect x="60" y="315" width="280" height="108" rx="3" fill="url(#panel3d)" stroke="#6a4020" stroke-width="2"/>
  <line x1="62" y1="317" x2="338" y2="317" stroke="rgba(0,0,0,0.15)" stroke-width="2"/>
  <line x1="62" y1="317" x2="62" y2="421" stroke="rgba(0,0,0,0.1)" stroke-width="2"/>
  <line x1="338" y1="317" x2="338" y2="421" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  <line x1="62" y1="421" x2="338" y2="421" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  <!-- Card reader device — 3D box -->
  <!-- Device shadow on door -->
  <rect x="293" y="213" width="50" height="75" rx="5" fill="rgba(0,0,0,0.2)"/>
  <!-- Device body -->
  <rect x="288" y="208" width="52" height="78" rx="5" fill="#2a2a2a" stroke="#444" stroke-width="1.5"/>
  <!-- Device top edge (3D) -->
  <rect x="290" y="208" width="48" height="4" fill="rgba(255,255,255,0.06)" rx="2"/>
  <!-- Display -->
  <rect x="294" y="214" width="40" height="10" rx="2" fill="#111"/>
  <text x="314" y="222" text-anchor="middle" fill="#444" font-size="5" font-family="monospace">CARD</text>
  <!-- Card slot — 3D recessed -->
  <rect x="296" y="230" width="36" height="6" rx="1.5" fill="#0a0a0a" stroke="#333" stroke-width="0.5"/>
  <rect x="298" y="231" width="32" height="1" fill="rgba(255,255,255,0.03)"/>
  <!-- LED indicator — 3D glowing -->
  <circle cx="314" cy="252" r="7" fill="#222" stroke="#444" stroke-width="1"/>
  <circle cx="314" cy="252" r="5" fill="#500"/>
  <circle cx="314" cy="252" r="3.5" fill="#800"/>
  <circle cx="313" cy="251" r="1.5" fill="#a00" opacity="0.6"/>
  <!-- LED glow -->
  <circle cx="314" cy="252" r="10" fill="rgba(200,0,0,0.06)"/>
  <!-- Handle base plate — 3D -->
  <rect x="292" y="268" width="32" height="12" rx="3" fill="#444" stroke="#333" stroke-width="0.5"/>
  <!-- Door handle — 3D cylindrical lever -->
  <rect x="286" y="288" width="46" height="14" rx="6" fill="url(#handlegrad)" stroke="#888" stroke-width="1"/>
  <!-- Handle highlight -->
  <rect x="288" y="289" width="42" height="4" fill="rgba(255,255,255,0.15)" rx="3"/>
  <!-- Handle mount point -->
  <circle cx="292" cy="295" r="4" fill="#888" stroke="#777" stroke-width="0.5"/>
  <circle cx="291" cy="294" r="1.5" fill="rgba(255,255,255,0.2)"/>
  <!-- Door bottom shadow -->
  <rect x="35" y="432" width="330" height="6" fill="rgba(0,0,0,0.2)"/>
</svg>`;

// --- Door open overlay (fades in over doorBg when unlocked) ---
// Covers the door panel area (35,12 to 365,438 in doorBg = 330x426)
// Positioned via sub-hotspot bounds so it aligns perfectly.
zoom.doorOpenOverlay = `
<svg xmlns="http://www.w3.org/2000/svg" width="330" height="426" viewBox="0 0 330 426">
  <defs>
    <linearGradient id="hallgrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff4d8"/>
      <stop offset="50%" stop-color="#f0e0b8"/>
      <stop offset="100%" stop-color="#c8b488"/>
    </linearGradient>
    <radialGradient id="hallglow" cx="55%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#fffbe8" stop-opacity="0.95"/>
      <stop offset="60%" stop-color="#f8e8c0" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#f8e8c0" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="openpanel" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#3a1e08"/>
      <stop offset="60%" stop-color="#6a3a18"/>
      <stop offset="100%" stop-color="#a06a38"/>
    </linearGradient>
    <linearGradient id="wallgrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#b8a888"/>
      <stop offset="100%" stop-color="#8a7858"/>
    </linearGradient>
    <linearGradient id="floorgrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#806848"/>
      <stop offset="100%" stop-color="#c0a878"/>
    </linearGradient>
  </defs>
  <!-- Hallway background (bright beyond the door) -->
  <rect x="0" y="0" width="330" height="426" fill="url(#hallgrad)"/>
  <!-- Warm hallway glow -->
  <rect x="0" y="0" width="330" height="426" fill="url(#hallglow)"/>
  <!-- Ceiling wedge (perspective) -->
  <polygon points="80,0 250,0 230,55 100,55" fill="#a89878" opacity="0.7"/>
  <!-- Left hallway wall (vanishing toward center) -->
  <polygon points="80,55 80,380 95,375 95,65" fill="url(#wallgrad)" opacity="0.85"/>
  <!-- Right hallway wall -->
  <polygon points="250,55 250,380 235,375 235,65" fill="url(#wallgrad)" opacity="0.85"/>
  <!-- Hallway floor perspective -->
  <polygon points="80,380 250,380 275,426 55,426" fill="url(#floorgrad)"/>
  <line x1="80" y1="380" x2="55" y2="426" stroke="#5a4828" stroke-width="0.8" opacity="0.5"/>
  <line x1="250" y1="380" x2="275" y2="426" stroke="#5a4828" stroke-width="0.8" opacity="0.5"/>
  <line x1="165" y1="380" x2="165" y2="426" stroke="#5a4828" stroke-width="0.5" opacity="0.3"/>
  <!-- Distant wall with a picture frame -->
  <rect x="80" y="55" width="170" height="325" fill="#c8b898" opacity="0.5"/>
  <rect x="135" y="130" width="60" height="85" fill="#5a4828" stroke="#8a7858" stroke-width="1.5" opacity="0.7"/>
  <rect x="140" y="135" width="50" height="75" fill="#a89878" opacity="0.8"/>
  <!-- Ambient light patch on floor -->
  <ellipse cx="165" cy="400" rx="90" ry="14" fill="rgba(255,240,200,0.35)"/>
  <!-- Door swung open — foreshortened on left side -->
  <polygon points="0,0 95,35 95,395 0,426" fill="url(#openpanel)" stroke="#2a1408" stroke-width="1.5"/>
  <!-- Open door wood grain -->
  <g stroke="#4a2810" stroke-width="0.5" opacity="0.4">
    <line x1="15" y1="5" x2="22" y2="420"/>
    <line x1="38" y1="12" x2="42" y2="415"/>
    <line x1="62" y1="22" x2="65" y2="410"/>
  </g>
  <!-- Door edge (right edge of open door — catches light) -->
  <polygon points="95,35 95,395 91,390 91,40" fill="#d8b888"/>
  <!-- Inner panel inset on open door -->
  <polygon points="15,40 80,60 80,200 15,205" fill="#5a3018" stroke="#3a1e08" stroke-width="0.8" opacity="0.7"/>
  <polygon points="15,220 80,215 80,370 15,385" fill="#5a3018" stroke="#3a1e08" stroke-width="0.8" opacity="0.7"/>
  <!-- Card reader on open door (moved with door) -->
  <rect x="30" y="155" width="22" height="34" rx="2" fill="#2a2a2a" stroke="#444" stroke-width="0.5"/>
  <rect x="32" y="159" width="18" height="5" rx="1" fill="#0a0a0a"/>
  <rect x="33" y="168" width="16" height="3" rx="0.8" fill="#0a0a0a"/>
  <!-- Green LED (unlocked) -->
  <circle cx="41" cy="180" r="3.5" fill="#050"/>
  <circle cx="41" cy="180" r="2.2" fill="#0c8"/>
  <circle cx="40.5" cy="179" r="0.8" fill="#afe"/>
  <circle cx="41" cy="180" r="5.5" fill="rgba(0,220,120,0.18)"/>
  <!-- Inner handle on open door -->
  <rect x="10" y="210" width="22" height="7" rx="3" fill="#ccc" stroke="#888" stroke-width="0.5"/>
  <rect x="12" y="211" width="18" height="2" fill="rgba(255,255,255,0.3)" rx="1"/>
  <!-- Door frame inner reveal (wood thickness visible where door swung open) -->
  <polygon points="95,35 100,30 100,400 95,395" fill="#8a6838"/>
  <!-- Soft shadow cast by door onto floor -->
  <polygon points="0,410 95,395 95,410 0,426" fill="rgba(0,0,0,0.35)"/>
</svg>`;


// ============================================================
//  ROOM DATA
// Helper: hide all cabinet variants (ensures only one is visible after a swap)
const hideAllCabinets = [
  { type: "hideHotspot", params: { hotspotId: "hs_cabinet" } },
  { type: "hideHotspot", params: { hotspotId: "hs_cabinet_glass_open" } },
  { type: "hideHotspot", params: { hotspotId: "hs_cabinet_lower_open" } },
  { type: "hideHotspot", params: { hotspotId: "hs_cabinet_lower_open_no_notes" } },
  { type: "hideHotspot", params: { hotspotId: "hs_cabinet_open" } },
  { type: "hideHotspot", params: { hotspotId: "hs_cabinet_open_no_notes" } },
];

// ============================================================

const room = {
  id: "room_apartment",
  name: "The Apartment",
  width: 800,
  height: 600,
  background: { type: "image", value: toDataUrl(svgs.background) },
  hotspots: [
    // --- Decorative ---
    {
      id: "hs_painting_dark",
      label: "Dark Painting",
      shape: "rect",
      bounds: { x: 120, y: 90, w: 100, h: 80 },
      appearance: { fill: "#444", stroke: "#333", image: toDataUrl(svgs.paintingDark) },
      zIndex: 2, visible: true,
      triggers: []
    },
    {
      id: "hs_painting_light",
      label: "Light Painting",
      shape: "rect",
      bounds: { x: 240, y: 90, w: 100, h: 80 },
      appearance: { fill: "#eee", stroke: "#ccc", image: toDataUrl(svgs.paintingLight) },
      zIndex: 2, visible: true,
      triggers: []
    },
    {
      id: "hs_sofa",
      label: "Sofa",
      shape: "rect",
      bounds: { x: 540, y: 380, w: 200, h: 130 },
      appearance: { fill: "#d8ccb0", stroke: "#c0b498", image: toDataUrl(svgs.sofa) },
      zIndex: 1, visible: true,
      triggers: []
    },
    {
      id: "hs_desk",
      label: "Desk",
      shape: "rect",
      bounds: { x: 20, y: 340, w: 200, h: 120 },
      appearance: { fill: "#a07a48", stroke: "#7a5a30", image: toDataUrl(svgs.desk) },
      zIndex: 1, visible: true,
      triggers: []
    },
    {
      id: "hs_chair",
      label: "Chair",
      shape: "rect",
      bounds: { x: 80, y: 410, w: 80, h: 100 },
      appearance: { fill: "#333", stroke: "#222", image: toDataUrl(svgs.chair) },
      zIndex: 3, visible: true,
      triggers: []
    },
    {
      id: "hs_rug",
      label: "Rug",
      shape: "rect",
      bounds: { x: 150, y: 460, w: 400, h: 110 },
      appearance: { fill: "#d8c8a0", stroke: "#8a5a30", image: toDataUrl(svgs.rug) },
      zIndex: 0, visible: true,
      triggers: []
    },
    {
      id: "hs_bookshelf",
      label: "Bookshelf",
      shape: "rect",
      bounds: { x: 110, y: 175, w: 190, h: 110 },
      appearance: { fill: "#c8a878", stroke: "#a88858", image: toDataUrl(svgs.bookshelf) },
      zIndex: 1, visible: true,
      triggers: []
    },

    // --- PUZZLE CHAIN HOTSPOTS ---

    // Step 1: Plant → zoom → find key
    {
      id: "hs_plant",
      label: "Potted Plant",
      shape: "rect",
      bounds: { x: 310, y: 200, w: 100, h: 190 },
      appearance: { fill: "#2a6a2a", stroke: "#1a4a1a", image: toDataUrl(svgs.plant) },
      zIndex: 3, visible: true,
      zoomView: {
        image: toDataUrl(zoom.plantBg),
        subHotspots: [
          {
            id: "sub_soil",
            label: "Disturbed Soil",
            bounds: { x: 42, y: 40, w: 25, h: 12 },
            image: null,
            triggers: []
          },
          {
            id: "sub_key",
            label: "Brass Key",
            bounds: { x: 44, y: 42, w: 16, h: 8 },
            image: toDataUrl(zoom.key),
            hideOnCollect: true,
            visibleWhen: [],
            triggers: [{
              type: "tap", requiredFlags: [], requiredItem: null, once: true,
              actions: [
                { type: "giveItem", params: { itemId: "item_small_key" } },
                { type: "setFlag", params: { flag: "found_key", value: true } }
              ]
            }]
          }
        ]
      },
      triggers: [] // zoom handles interaction
    },

    // Step 2: Cabinet → use key → door opens visually → drawer → paper
    // 6 cabinet states: (upper closed/open) × (lower closed/open) × (notes present/collected)
    // All transitions use hideAllCabinets + showHotspot for robustness
    {
      id: "hs_cabinet",
      label: "Cabinet",
      shape: "rect",
      bounds: { x: 540, y: 140, w: 145, h: 200 },
      appearance: { fill: "#c8a060", stroke: "#a88040", image: toDataUrl(svgs.cabinet) },
      zIndex: 1, visible: true,
      zoomView: {
        image: toDataUrl(zoom.cabinetBg),
        subHotspots: [
          // Keyhole on lower door — use key here to unlock
          {
            id: "sub_keyhole",
            label: "Keyhole",
            bounds: { x: 43, y: 74, w: 8, h: 10 },
            image: null,
            animation: { type: "rotate", to: "90deg" },
            imageOpen: toDataUrl(zoom.keyInHole),
            triggers: [
              // If upper door already opened in this zoom session → both open
              {
                type: "useItem", requiredFlags: ["upper_door_open"], requiredItem: "item_small_key", once: true,
                actions: [
                  { type: "removeItem", params: { itemId: "item_small_key" } },
                  { type: "setFlag", params: { flag: "cabinet_open", value: true } },
                  ...hideAllCabinets,
                  { type: "showHotspot", params: { hotspotId: "hs_cabinet_open" } }
                ]
              },
              // Upper door still closed → only lower opens
              {
                type: "useItem", requiredFlags: [], requiredItem: "item_small_key", once: true,
                actions: [
                  { type: "removeItem", params: { itemId: "item_small_key" } },
                  { type: "setFlag", params: { flag: "cabinet_open", value: true } },
                  ...hideAllCabinets,
                  { type: "showHotspot", params: { hotspotId: "hs_cabinet_lower_open" } }
                ]
              }
            ]
          },
          // Upper right glass door — tap to open and reveal lockbox
          {
            id: "sub_upper_door",
            label: "Upper Right Door",
            bounds: { x: 51, y: 7, w: 42, h: 40 },
            image: null,
            animation: { type: "fade-in" },
            imageOpen: toDataUrl(zoom.upperDoorOpen),
            triggers: [
              // If lower door already opened + paper collected
              {
                type: "tap", requiredFlags: ["cabinet_open", "_zoomHidden_sub_paper"], requiredItem: null, once: true,
                actions: [
                  { type: "setFlag", params: { flag: "upper_door_open", value: true } },
                  ...hideAllCabinets,
                  { type: "showHotspot", params: { hotspotId: "hs_cabinet_open_no_notes" } }
                ]
              },
              // If lower door already opened + paper still present
              {
                type: "tap", requiredFlags: ["cabinet_open"], requiredItem: null, once: true,
                actions: [
                  { type: "setFlag", params: { flag: "upper_door_open", value: true } },
                  ...hideAllCabinets,
                  { type: "showHotspot", params: { hotspotId: "hs_cabinet_open" } }
                ]
              },
              // Lower door still closed
              {
                type: "tap", requiredFlags: [], requiredItem: null, once: true,
                actions: [
                  { type: "setFlag", params: { flag: "upper_door_open", value: true } },
                  ...hideAllCabinets,
                  { type: "showHotspot", params: { hotspotId: "hs_cabinet_glass_open" } }
                ]
              }
            ]
          },
          // Lockbox visible after upper door opens
          {
            id: "sub_lockbox_vis",
            label: "Lockbox",
            bounds: { x: 53, y: 14, w: 30, h: 22 },
            image: toDataUrl(zoom.lockboxInGlass),
            visibleWhen: ["_zoomAnim_sub_upper_door"],
            triggers: [
              {
                type: "tap", requiredFlags: [], requiredItem: null,
                actions: [
                  { type: "openZoom", params: { hotspotId: "hs_lockbox" } }
                ]
              }
            ]
          },
          // Right door opens (animation, visible after key used)
          {
            id: "sub_right_door",
            label: "Right Door",
            bounds: { x: 51, y: 50, w: 42, h: 46 },
            image: null,
            animation: { type: "fade-in" },
            visibleWhen: ["cabinet_open"],
            imageOpen: toDataUrl(zoom.cabinetRightOpen),
            triggers: []
          },
          // Paper on shelf inside right door (visible after door swings open)
          {
            id: "sub_paper",
            label: "Paper",
            bounds: { x: 53, y: 72, w: 30, h: 14 },
            image: toDataUrl(zoom.paper),
            hideOnCollect: true,
            visibleWhen: ["cabinet_open", "_zoomAnim_sub_right_door"],
            triggers: [
              // If upper door also opened → both open, no notes
              {
                type: "tap", requiredFlags: ["upper_door_open"], requiredItem: null, once: true,
                actions: [
                  { type: "giveItem", params: { itemId: "item_paper" } },
                  ...hideAllCabinets,
                  { type: "showHotspot", params: { hotspotId: "hs_cabinet_open_no_notes" } }
                ]
              },
              // Upper door still closed → lower open, no notes
              {
                type: "tap", requiredFlags: [], requiredItem: null, once: true,
                actions: [
                  { type: "giveItem", params: { itemId: "item_paper" } },
                  ...hideAllCabinets,
                  { type: "showHotspot", params: { hotspotId: "hs_cabinet_lower_open_no_notes" } }
                ]
              }
            ]
          }
        ]
      },
      triggers: [] // zoom handles interaction
    },

    // Cabinet with doors open (shown after key used)
    {
      id: "hs_cabinet_open",
      label: "Cabinet (Open)",
      shape: "rect",
      bounds: { x: 540, y: 140, w: 145, h: 200 },
      appearance: { fill: "#c8a060", stroke: "#a88040", image: toDataUrl(svgs.cabinetOpen) },
      zIndex: 1, visible: false,
      zoomView: {
        image: toDataUrl(zoom.cabinetBg),
        subHotspots: [
          // Key already in keyhole (shows inserted key)
          {
            id: "sub_keyhole2",
            label: "Keyhole",
            bounds: { x: 43, y: 74, w: 8, h: 10 },
            image: toDataUrl(zoom.keyInHole),
            triggers: []
          },
          // Upper right glass door — tap to open (or already open)
          {
            id: "sub_upper_door",
            label: "Upper Right Door",
            bounds: { x: 51, y: 7, w: 42, h: 40 },
            image: null,
            animation: { type: "fade-in" },
            imageOpen: toDataUrl(zoom.upperDoorOpen),
            triggers: [{
              type: "tap", requiredFlags: [], requiredItem: null, once: true,
              actions: [
                { type: "setFlag", params: { flag: "upper_door_open", value: true } }
              ]
            }]
          },
          // Lockbox visible after upper door opens
          {
            id: "sub_lockbox_vis",
            label: "Lockbox",
            bounds: { x: 53, y: 14, w: 30, h: 22 },
            image: toDataUrl(zoom.lockboxInGlass),
            visibleWhen: ["_zoomAnim_sub_upper_door"],
            triggers: [
              {
                type: "tap", requiredFlags: [], requiredItem: null,
                actions: [
                  { type: "openZoom", params: { hotspotId: "hs_lockbox" } }
                ]
              }
            ]
          },
          // Right door already open (shows immediately since cabinet_open is set)
          {
            id: "sub_right_door2",
            label: "Right Door Open",
            bounds: { x: 51, y: 50, w: 42, h: 46 },
            image: toDataUrl(zoom.cabinetRightOpen),
            visibleWhen: ["cabinet_open"],
            triggers: []
          },
          // Paper on shelf (visible, collectible)
          {
            id: "sub_paper",
            label: "Paper",
            bounds: { x: 53, y: 72, w: 30, h: 14 },
            image: toDataUrl(zoom.paper),
            hideOnCollect: true,
            visibleWhen: ["cabinet_open"],
            triggers: [{
              type: "tap", requiredFlags: [], requiredItem: null, once: true,
              actions: [
                { type: "giveItem", params: { itemId: "item_paper" } },
                ...hideAllCabinets,
                { type: "showHotspot", params: { hotspotId: "hs_cabinet_open_no_notes" } }
              ]
            }]
          }
        ]
      },
      triggers: []
    },

    // Cabinet with both doors open, notes collected
    {
      id: "hs_cabinet_open_no_notes",
      label: "Cabinet (Open, No Notes)",
      shape: "rect",
      bounds: { x: 540, y: 140, w: 145, h: 200 },
      appearance: { fill: "#c8a060", stroke: "#a88040", image: toDataUrl(svgs.cabinetOpenNoNotes) },
      zIndex: 1, visible: false,
      zoomView: {
        image: toDataUrl(zoom.cabinetBg),
        subHotspots: [
          // Key already in keyhole
          {
            id: "sub_keyhole2",
            label: "Keyhole",
            bounds: { x: 43, y: 74, w: 8, h: 10 },
            image: toDataUrl(zoom.keyInHole),
            triggers: []
          },
          // Upper right glass door already open
          {
            id: "sub_upper_door",
            label: "Upper Right Door",
            bounds: { x: 51, y: 7, w: 42, h: 40 },
            image: toDataUrl(zoom.upperDoorOpen),
            triggers: []
          },
          // Lockbox always visible (both doors open)
          {
            id: "sub_lockbox_vis",
            label: "Lockbox",
            bounds: { x: 53, y: 14, w: 30, h: 22 },
            image: toDataUrl(zoom.lockboxInGlass),
            triggers: [
              {
                type: "tap", requiredFlags: [], requiredItem: null,
                actions: [
                  { type: "openZoom", params: { hotspotId: "hs_lockbox" } }
                ]
              }
            ]
          },
          // Right door already open
          {
            id: "sub_right_door2",
            label: "Right Door Open",
            bounds: { x: 51, y: 50, w: 42, h: 46 },
            image: toDataUrl(zoom.cabinetRightOpen),
            visibleWhen: ["cabinet_open"],
            triggers: []
          }
          // No paper — already collected
        ]
      },
      triggers: []
    },

    // Cabinet with upper right glass door open (lower still closed)
    {
      id: "hs_cabinet_glass_open",
      label: "Cabinet (Glass Open)",
      shape: "rect",
      bounds: { x: 540, y: 140, w: 145, h: 200 },
      appearance: { fill: "#c8a060", stroke: "#a88040", image: toDataUrl(svgs.cabinetGlassOpen) },
      zIndex: 1, visible: false,
      zoomView: {
        image: toDataUrl(zoom.cabinetBg),
        subHotspots: [
          // Keyhole on lower door — use key here to unlock (upper already open → both open)
          {
            id: "sub_keyhole",
            label: "Keyhole",
            bounds: { x: 43, y: 74, w: 8, h: 10 },
            image: null,
            animation: { type: "rotate", to: "90deg" },
            imageOpen: toDataUrl(zoom.keyInHole),
            triggers: [
              {
                type: "useItem", requiredFlags: [], requiredItem: "item_small_key", once: true,
                actions: [
                  { type: "removeItem", params: { itemId: "item_small_key" } },
                  { type: "setFlag", params: { flag: "cabinet_open", value: true } },
                  ...hideAllCabinets,
                  { type: "showHotspot", params: { hotspotId: "hs_cabinet_open" } }
                ]
              }
            ]
          },
          // Upper right glass door already open
          {
            id: "sub_upper_door",
            label: "Upper Right Door",
            bounds: { x: 51, y: 7, w: 42, h: 40 },
            image: toDataUrl(zoom.upperDoorOpen),
            triggers: []
          },
          // Lockbox always visible (door already open)
          {
            id: "sub_lockbox_vis",
            label: "Lockbox",
            bounds: { x: 53, y: 14, w: 30, h: 22 },
            image: toDataUrl(zoom.lockboxInGlass),
            triggers: [
              {
                type: "tap", requiredFlags: [], requiredItem: null,
                actions: [
                  { type: "openZoom", params: { hotspotId: "hs_lockbox" } }
                ]
              }
            ]
          },
          // Right lower door opens (visible after key used)
          {
            id: "sub_right_door",
            label: "Right Door",
            bounds: { x: 51, y: 50, w: 42, h: 46 },
            image: null,
            animation: { type: "fade-in" },
            visibleWhen: ["cabinet_open"],
            imageOpen: toDataUrl(zoom.cabinetRightOpen),
            triggers: []
          },
          // Paper on shelf inside right door (upper already open → swap to both-open-no-notes)
          {
            id: "sub_paper",
            label: "Paper",
            bounds: { x: 53, y: 72, w: 30, h: 14 },
            image: toDataUrl(zoom.paper),
            hideOnCollect: true,
            visibleWhen: ["cabinet_open", "_zoomAnim_sub_right_door"],
            triggers: [{
              type: "tap", requiredFlags: [], requiredItem: null, once: true,
              actions: [
                { type: "giveItem", params: { itemId: "item_paper" } },
                ...hideAllCabinets,
                { type: "showHotspot", params: { hotspotId: "hs_cabinet_open_no_notes" } }
              ]
            }]
          }
        ]
      },
      triggers: []
    },

    // Cabinet with lower right door open, upper glass closed, notes present
    {
      id: "hs_cabinet_lower_open",
      label: "Cabinet (Lower Open)",
      shape: "rect",
      bounds: { x: 540, y: 140, w: 145, h: 200 },
      appearance: { fill: "#c8a060", stroke: "#a88040", image: toDataUrl(svgs.cabinetLowerOpen) },
      zIndex: 1, visible: false,
      zoomView: {
        image: toDataUrl(zoom.cabinetBg),
        subHotspots: [
          // Key already in keyhole (visual only)
          {
            id: "sub_keyhole2",
            label: "Keyhole",
            bounds: { x: 43, y: 74, w: 8, h: 10 },
            image: toDataUrl(zoom.keyInHole),
            triggers: []
          },
          // Upper right glass door — tap to open
          {
            id: "sub_upper_door",
            label: "Upper Right Door",
            bounds: { x: 51, y: 7, w: 42, h: 40 },
            image: null,
            animation: { type: "fade-in" },
            imageOpen: toDataUrl(zoom.upperDoorOpen),
            triggers: [
              // Paper already collected → both open, no notes
              {
                type: "tap", requiredFlags: ["_zoomHidden_sub_paper"], requiredItem: null, once: true,
                actions: [
                  { type: "setFlag", params: { flag: "upper_door_open", value: true } },
                  ...hideAllCabinets,
                  { type: "showHotspot", params: { hotspotId: "hs_cabinet_open_no_notes" } }
                ]
              },
              // Paper still present → both open, with notes
              {
                type: "tap", requiredFlags: [], requiredItem: null, once: true,
                actions: [
                  { type: "setFlag", params: { flag: "upper_door_open", value: true } },
                  ...hideAllCabinets,
                  { type: "showHotspot", params: { hotspotId: "hs_cabinet_open" } }
                ]
              }
            ]
          },
          // Lockbox visible after upper door opens
          {
            id: "sub_lockbox_vis",
            label: "Lockbox",
            bounds: { x: 53, y: 14, w: 30, h: 22 },
            image: toDataUrl(zoom.lockboxInGlass),
            visibleWhen: ["_zoomAnim_sub_upper_door"],
            triggers: [
              {
                type: "tap", requiredFlags: [], requiredItem: null,
                actions: [
                  { type: "openZoom", params: { hotspotId: "hs_lockbox" } }
                ]
              }
            ]
          },
          // Right door already open (shows immediately)
          {
            id: "sub_right_door2",
            label: "Right Door Open",
            bounds: { x: 51, y: 50, w: 42, h: 46 },
            image: toDataUrl(zoom.cabinetRightOpen),
            visibleWhen: ["cabinet_open"],
            triggers: []
          },
          // Paper on shelf (visible, collectible)
          {
            id: "sub_paper",
            label: "Paper",
            bounds: { x: 53, y: 72, w: 30, h: 14 },
            image: toDataUrl(zoom.paper),
            hideOnCollect: true,
            visibleWhen: ["cabinet_open"],
            triggers: [
              // Upper door also opened → both open, no notes
              {
                type: "tap", requiredFlags: ["upper_door_open"], requiredItem: null, once: true,
                actions: [
                  { type: "giveItem", params: { itemId: "item_paper" } },
                  ...hideAllCabinets,
                  { type: "showHotspot", params: { hotspotId: "hs_cabinet_open_no_notes" } }
                ]
              },
              // Upper door still closed → lower open, no notes
              {
                type: "tap", requiredFlags: [], requiredItem: null, once: true,
                actions: [
                  { type: "giveItem", params: { itemId: "item_paper" } },
                  ...hideAllCabinets,
                  { type: "showHotspot", params: { hotspotId: "hs_cabinet_lower_open_no_notes" } }
                ]
              }
            ]
          }
        ]
      },
      triggers: []
    },

    // Cabinet with lower right door open, upper glass closed, notes collected
    {
      id: "hs_cabinet_lower_open_no_notes",
      label: "Cabinet (Lower Open, No Notes)",
      shape: "rect",
      bounds: { x: 540, y: 140, w: 145, h: 200 },
      appearance: { fill: "#c8a060", stroke: "#a88040", image: toDataUrl(svgs.cabinetLowerOpenNoNotes) },
      zIndex: 1, visible: false,
      zoomView: {
        image: toDataUrl(zoom.cabinetBg),
        subHotspots: [
          // Key already in keyhole (visual only)
          {
            id: "sub_keyhole2",
            label: "Keyhole",
            bounds: { x: 43, y: 74, w: 8, h: 10 },
            image: toDataUrl(zoom.keyInHole),
            triggers: []
          },
          // Upper right glass door — tap to open → both open, no notes
          {
            id: "sub_upper_door",
            label: "Upper Right Door",
            bounds: { x: 51, y: 7, w: 42, h: 40 },
            image: null,
            animation: { type: "fade-in" },
            imageOpen: toDataUrl(zoom.upperDoorOpen),
            triggers: [{
              type: "tap", requiredFlags: [], requiredItem: null, once: true,
              actions: [
                { type: "setFlag", params: { flag: "upper_door_open", value: true } },
                ...hideAllCabinets,
                { type: "showHotspot", params: { hotspotId: "hs_cabinet_open_no_notes" } }
              ]
            }]
          },
          // Lockbox visible after upper door opens
          {
            id: "sub_lockbox_vis",
            label: "Lockbox",
            bounds: { x: 53, y: 14, w: 30, h: 22 },
            image: toDataUrl(zoom.lockboxInGlass),
            visibleWhen: ["_zoomAnim_sub_upper_door"],
            triggers: [
              {
                type: "tap", requiredFlags: [], requiredItem: null,
                actions: [
                  { type: "openZoom", params: { hotspotId: "hs_lockbox" } }
                ]
              }
            ]
          },
          // Right door already open
          {
            id: "sub_right_door2",
            label: "Right Door Open",
            bounds: { x: 51, y: 50, w: 42, h: 46 },
            image: toDataUrl(zoom.cabinetRightOpen),
            visibleWhen: ["cabinet_open"],
            triggers: []
          }
          // No paper — already collected
        ]
      },
      triggers: []
    },

    // Step 3: Laptop → zoom → password puzzle → screen shows 1886
    {
      id: "hs_laptop",
      label: "Laptop",
      shape: "rect",
      bounds: { x: 40, y: 320, w: 110, h: 80 },
      appearance: { fill: "#333", stroke: "#222", image: toDataUrl(svgs.laptop) },
      zIndex: 4, visible: true,
      zoomView: {
        image: toDataUrl(zoom.laptopBg),
        subHotspots: [
          // Unlocked screen showing 1886 (visible after solving)
          {
            id: "sub_screen_1886",
            label: "Screen (Unlocked)",
            bounds: { x: 15, y: 12, w: 70, h: 52 },
            image: toDataUrl(zoom.screen1886),
            visibleWhen: ["laptop_unlocked"],
            triggers: []
          },
          // Locked screen (hidden after solving)
          {
            id: "sub_screen",
            label: "Screen",
            bounds: { x: 15, y: 12, w: 70, h: 52 },
            image: null,
            triggers: [
              {
                type: "tap", requiredFlags: [], requiredItem: null,
                actions: [
                  { type: "triggerPuzzle", params: { puzzleId: "puzzle_laptop" } }
                ]
              }
            ]
          }
        ]
      },
      triggers: [] // zoom handles
    },

    // Laptop unlocked (shown after solving password)
    {
      id: "hs_laptop_unlocked",
      label: "Laptop (Unlocked)",
      shape: "rect",
      bounds: { x: 40, y: 320, w: 110, h: 80 },
      appearance: { fill: "#333", stroke: "#222", image: toDataUrl(svgs.laptopUnlocked) },
      zIndex: 4, visible: false,
      zoomView: {
        image: toDataUrl(zoom.laptopBg),
        subHotspots: [
          {
            id: "sub_screen_1886",
            label: "Screen (Unlocked)",
            bounds: { x: 15, y: 12, w: 70, h: 52 },
            image: toDataUrl(zoom.screen1886),
            visibleWhen: ["laptop_unlocked"],
            triggers: []
          }
        ]
      },
      triggers: []
    },

    // Lockbox (hidden hotspot — accessed from cabinet zoom)
    {
      id: "hs_lockbox",
      label: "Lockbox",
      shape: "rect",
      bounds: { x: 560, y: 110, w: 100, h: 60 },
      appearance: { fill: "#666", stroke: "#444" },
      zIndex: 0, visible: false,
      zoomView: {
        image: toDataUrl(zoom.lockboxBg),
        subHotspots: [
          // Keypad area — triggers combination puzzle
          {
            id: "sub_keypad",
            label: "Keypad",
            bounds: { x: 30, y: 38, w: 40, h: 28 },
            image: null,
            triggers: [{
              type: "tap", requiredFlags: [], requiredItem: null,
              actions: [
                { type: "triggerPuzzle", params: { puzzleId: "puzzle_lockbox" } }
              ]
            }]
          },
          // Keycard inside (visible after solving — positioned on shelf in front of lockbox)
          {
            id: "sub_keycard",
            label: "Keycard",
            bounds: { x: 30, y: 72, w: 28, h: 16 },
            image: toDataUrl(zoom.keycard),
            hideOnCollect: true,
            visibleWhen: ["lockbox_open"],
            triggers: [{
              type: "tap", requiredFlags: ["lockbox_open"], requiredItem: null, once: true,
              actions: [
                { type: "giveItem", params: { itemId: "item_keycard" } }
              ]
            }]
          }
        ]
      },
      triggers: []
    },

    // Step 4: Door → use keycard → door opens → tap to escape
    {
      id: "hs_door",
      label: "Door",
      shape: "rect",
      bounds: { x: 420, y: 80, w: 130, h: 260 },
      appearance: { fill: "#a06a38", stroke: "#7a4a28", image: toDataUrl(svgs.door) },
      zIndex: 1, visible: true,
      zoomView: {
        image: toDataUrl(zoom.doorBg),
        subHotspots: [
          {
            id: "sub_card_reader",
            label: "Card Reader",
            bounds: { x: 68, y: 47, w: 18, h: 18 },
            image: null,
            triggers: [
              {
                type: "useItem", requiredFlags: [], requiredItem: "item_keycard", once: true,
                actions: [
                  { type: "removeItem", params: { itemId: "item_keycard" } },
                  { type: "setFlag", params: { flag: "door_unlocked", value: true } },
                  { type: "hideHotspot", params: { hotspotId: "hs_door" } },
                  { type: "showHotspot", params: { hotspotId: "hs_door_open" } }
                ]
              }
            ]
          },
          {
            id: "sub_handle",
            label: "Handle",
            bounds: { x: 68, y: 64, w: 16, h: 6 },
            image: null,
            triggers: []
          },
          {
            // Fades in over the closed-door art once door_unlocked is set.
            // Tapping it escapes the room.
            id: "sub_door_open",
            label: "Open Door",
            bounds: { x: 8.75, y: 2.67, w: 82.5, h: 94.67 },
            image: toDataUrl(zoom.doorOpenOverlay),
            animation: { type: "fade-in" },
            visibleWhen: ["door_unlocked"],
            triggers: [
              {
                type: "tap", requiredFlags: [], requiredItem: null, once: true,
                actions: [
                  { type: "gameWin", params: {} }
                ]
              }
            ]
          }
        ]
      },
      triggers: [] // zoom handles keycard interaction
    },

    // Door open — tap to walk through and escape
    {
      id: "hs_door_open",
      label: "Door (Open)",
      shape: "rect",
      bounds: { x: 420, y: 80, w: 130, h: 260 },
      appearance: { fill: "#e8d8b8", stroke: "#a89878", image: toDataUrl(svgs.doorOpen) },
      zIndex: 1, visible: false,
      triggers: [
        {
          type: "tap", requiredFlags: [], requiredItem: null, once: true,
          actions: [
            { type: "gameWin", params: {} }
          ]
        }
      ]
    }
  ],
  items: [
    {
      id: "item_small_key", name: "Small Key",
      description: "A small brass key found in the plant pot.",
      icon: { shape: "key", color: "#c8a040", image: toDataUrl(zoom.key) },
      combinesWith: null, combineResult: null
    },
    {
      id: "item_paper", name: "Paper (TAKI)",
      description: "A folded paper with four letters: T A K I. 'password?' written underneath.",
      icon: { shape: "rect", color: "#e8d8c0", image: toDataUrl(zoom.paper) },
      combinesWith: null, combineResult: null
    },
    {
      id: "item_keycard", name: "Keycard",
      description: "A white keycard with a magnetic strip. Should work on the door.",
      icon: { shape: "rect", color: "#e0e8f0", image: toDataUrl(zoom.keycard) },
      combinesWith: null, combineResult: null
    }
  ],
  puzzles: [
    {
      id: "puzzle_laptop",
      type: "combination",
      hotspotId: "hs_laptop",
      prompt: "_ _ _ _",
      solution: "TAKI",
      onSolve: [
        { type: "setFlag", params: { flag: "laptop_unlocked", value: true } },
        { type: "setFlag", params: { flag: "_zoomHidden_sub_screen", value: true } },
        { type: "hideHotspot", params: { hotspotId: "hs_laptop" } },
        { type: "showHotspot", params: { hotspotId: "hs_laptop_unlocked" } },
        { type: "openZoom", params: { hotspotId: "hs_laptop_unlocked" } }
      ],
      onFail: []
    },
    {
      id: "puzzle_lockbox",
      type: "combination",
      hotspotId: "hs_lockbox",
      prompt: "_ _ _ _",
      solution: "1886",
      onSolve: [
        { type: "setFlag", params: { flag: "lockbox_open", value: true } },
        { type: "setFlag", params: { flag: "_zoomHidden_sub_keypad", value: true } },
        { type: "openZoom", params: { hotspotId: "hs_lockbox" } }
      ],
      onFail: []
    }
  ],
  // Progressive hints — wordless. Each hint circles the next thing to
  // investigate on the canvas in red. Order matches puzzle progression:
  // plant → lower cabinet → laptop → upper cabinet (lockbox) → door.
  hints: [
    { hotspotId: "hs_plant" },
    { hotspotId: "hs_cabinet" },
    { hotspotId: "hs_laptop" },
    { hotspotId: "hs_cabinet" },
    { hotspotId: "hs_door" }
  ],
  onEnter: []
};

// --- Save all SVGs as separate files ---
// Main room SVGs
const mainImgs = {};
for (const [name, svg] of Object.entries(svgs)) {
  mainImgs[name] = saveSvg('main', name, svg);
}
// Zoom view SVGs
const zoomImgs = {};
for (const [name, svg] of Object.entries(zoom)) {
  zoomImgs[name] = saveSvg('zoom', name, svg);
}

// --- Replace embedded data URLs with file paths ---
function replaceImages(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(replaceImages);
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string' && v.startsWith('data:image/svg+xml;base64,')) {
      // Find which SVG this data URL corresponds to
      const match = Object.entries(svgs).find(([, svg]) => toDataUrl(svg) === v);
      if (match) { result[k] = mainImgs[match[0]]; continue; }
      const zmatch = Object.entries(zoom).find(([, svg]) => toDataUrl(svg) === v);
      if (zmatch) { result[k] = zoomImgs[zmatch[0]]; continue; }
    }
    result[k] = replaceImages(v);
  }
  return result;
}

const roomWithPaths = replaceImages(room);

const outPath = path.join(__dirname, '..', 'js', 'data', 'apartment.json');
fs.writeFileSync(outPath, JSON.stringify(roomWithPaths, null, 2) + '\n');
const jsonSize = Math.round(fs.statSync(outPath).size / 1024);
const svgCount = Object.keys(mainImgs).length + Object.keys(zoomImgs).length;
console.log(`Generated apartment.json (${jsonSize} KB) + ${svgCount} SVG files in assets/rooms/apartment/`);
