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
  <!-- Upper glass doors -->
  <rect x="8" y="8" width="55" height="78" rx="2" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <rect x="67" y="8" width="55" height="78" rx="2" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <!-- Glass panes with reflection -->
  <rect x="12" y="12" width="47" height="70" fill="rgba(180,200,210,0.12)" rx="1"/>
  <rect x="71" y="12" width="47" height="70" fill="rgba(180,200,210,0.12)" rx="1"/>
  <line x1="16" y1="16" x2="16" y2="76" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
  <line x1="75" y1="16" x2="75" y2="76" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
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

// --- Plant pot close-up: soil visible, key partially buried ---
zoom.plantBg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
  <defs>
    <radialGradient id="zpbg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#2a2a20"/>
      <stop offset="100%" stop-color="#1a1a15"/>
    </radialGradient>
    <radialGradient id="soil" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#4a3820"/>
      <stop offset="100%" stop-color="#3a2818"/>
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="url(#zpbg)"/>
  <!-- Pot body -->
  <path d="M100,380 L120,180 L280,180 L300,380 Z" fill="#2a2a2a" stroke="#3a3a3a" stroke-width="2"/>
  <path d="M115,200 L125,360 L275,360 L285,200 Z" fill="#333"/>
  <!-- Pot rim -->
  <ellipse cx="200" cy="180" rx="95" ry="18" fill="#3a3a3a" stroke="#4a4a4a" stroke-width="1.5"/>
  <ellipse cx="200" cy="176" rx="88" ry="14" fill="#333"/>
  <!-- Soil surface -->
  <ellipse cx="200" cy="180" rx="82" ry="12" fill="url(#soil)"/>
  <!-- Soil texture -->
  <circle cx="175" cy="178" r="3" fill="#5a4828" opacity="0.5"/>
  <circle cx="210" cy="182" r="4" fill="#4a3818" opacity="0.4"/>
  <circle cx="240" cy="179" r="2.5" fill="#5a4828" opacity="0.5"/>
  <circle cx="160" cy="181" r="2" fill="#4a3818" opacity="0.4"/>
  <!-- Fern fronds -->
  <path d="M200,170 Q195,110 155,50" fill="none" stroke="#2a7a2a" stroke-width="3.5"/>
  <path d="M200,170 Q205,100 245,40" fill="none" stroke="#2a7a2a" stroke-width="3.5"/>
  <path d="M200,170 Q185,120 140,70" fill="none" stroke="#3a8a3a" stroke-width="2.5"/>
  <path d="M200,170 Q215,110 260,55" fill="none" stroke="#3a8a3a" stroke-width="2.5"/>
  <path d="M200,170 Q180,130 125,90" fill="none" stroke="#4a9a4a" stroke-width="2"/>
  <path d="M200,170 Q220,120 275,75" fill="none" stroke="#4a9a4a" stroke-width="2"/>
  <!-- Leaf details -->
  <path d="M155,50 L148,44 M155,50 L162,46" stroke="#5aaa5a" stroke-width="1.2"/>
  <path d="M245,40 L238,34 M245,40 L252,36" stroke="#5aaa5a" stroke-width="1.2"/>
  <path d="M140,70 L132,66 M140,70 L145,63" stroke="#5aaa5a" stroke-width="1"/>
  <path d="M260,55 L267,49 M260,55 L255,48" stroke="#5aaa5a" stroke-width="1"/>
  <!-- Hint: disturbed soil area -->
  <ellipse cx="225" cy="180" rx="18" ry="6" fill="#5a4020" opacity="0.4"/>
</svg>`;

// Key item inside the pot (sub-hotspot image)
zoom.key = `
<svg xmlns="http://www.w3.org/2000/svg" width="60" height="30">
  <defs>
    <linearGradient id="kg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e8c040"/>
      <stop offset="100%" stop-color="#c8a030"/>
    </linearGradient>
  </defs>
  <!-- Key shaft -->
  <rect x="18" y="12" width="38" height="6" rx="2" fill="url(#kg)" stroke="#a88020" stroke-width="0.5"/>
  <!-- Key head (ring) -->
  <circle cx="14" cy="15" r="10" fill="none" stroke="url(#kg)" stroke-width="4"/>
  <circle cx="14" cy="15" r="5" fill="#5a4020" opacity="0.3"/>
  <!-- Key teeth -->
  <rect x="42" y="18" width="4" height="5" fill="url(#kg)"/>
  <rect x="48" y="18" width="3" height="7" fill="url(#kg)"/>
  <rect x="53" y="18" width="3" height="4" fill="url(#kg)"/>
  <!-- Highlight -->
  <line x1="20" y1="13" x2="40" y2="13" stroke="rgba(255,255,200,0.3)" stroke-width="1"/>
</svg>`;

// --- Cabinet close-up: lower drawer, upper glass with lockbox ---
zoom.cabinetBg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="450">
  <defs>
    <linearGradient id="zcab" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1510"/>
      <stop offset="100%" stop-color="#151010"/>
    </linearGradient>
    <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#b88a48"/>
      <stop offset="50%" stop-color="#c8a060"/>
      <stop offset="100%" stop-color="#a87a38"/>
    </linearGradient>
  </defs>
  <rect width="400" height="450" fill="url(#zcab)"/>
  <!-- Cabinet body -->
  <rect x="30" y="20" width="340" height="410" rx="4" fill="url(#wood)" stroke="#987038" stroke-width="2"/>
  <!-- Upper glass doors -->
  <rect x="40" y="30" width="155" height="170" rx="3" fill="#b89050" stroke="#987038" stroke-width="1.5"/>
  <rect x="205" y="30" width="155" height="170" rx="3" fill="#b89050" stroke="#987038" stroke-width="1.5"/>
  <rect x="48" y="38" width="139" height="154" fill="rgba(180,200,210,0.1)" rx="2"/>
  <rect x="213" y="38" width="139" height="154" fill="rgba(180,200,210,0.1)" rx="2"/>
  <!-- Glass reflection -->
  <line x1="55" y1="45" x2="55" y2="180" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
  <line x1="220" y1="45" x2="220" y2="180" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
  <!-- Glass door handles -->
  <rect x="180" y="100" width="6" height="20" rx="2" fill="#aaa"/>
  <rect x="214" y="100" width="6" height="20" rx="2" fill="#aaa"/>
  <!-- Divider shelf -->
  <rect x="35" y="210" width="330" height="10" rx="1" fill="#a07838"/>
  <rect x="35" y="208" width="330" height="2" fill="rgba(255,255,255,0.05)"/>
  <!-- Lower doors -->
  <rect x="40" y="230" width="155" height="190" rx="3" fill="#b89050" stroke="#987038" stroke-width="1.5"/>
  <rect x="205" y="230" width="155" height="190" rx="3" fill="#b89050" stroke="#987038" stroke-width="1.5"/>
  <!-- Lower panels (inset) -->
  <rect x="52" y="242" width="131" height="166" fill="rgba(0,0,0,0.08)" rx="2"/>
  <rect x="217" y="242" width="131" height="166" fill="rgba(0,0,0,0.08)" rx="2"/>
  <!-- Lower door knobs -->
  <circle cx="183" cy="325" r="6" fill="#aaa" stroke="#999" stroke-width="1"/>
  <circle cx="217" cy="325" r="6" fill="#aaa" stroke="#999" stroke-width="1"/>
  <!-- Keyhole on lower left door -->
  <ellipse cx="183" cy="345" rx="3" ry="5" fill="#555"/>
  <rect x="182" y="348" width="2" height="6" fill="#555"/>
</svg>`;

// Drawer open state - shows paper
zoom.drawerOpen = `
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="100">
  <defs>
    <linearGradient id="dw" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c8a060"/>
      <stop offset="100%" stop-color="#b89050"/>
    </linearGradient>
  </defs>
  <!-- Drawer box pulled out -->
  <rect x="0" y="0" width="320" height="90" rx="3" fill="url(#dw)" stroke="#987038" stroke-width="1.5"/>
  <rect x="5" y="5" width="310" height="80" fill="#a88848" opacity="0.3" rx="2"/>
  <!-- Interior shadow -->
  <rect x="8" y="8" width="304" height="74" fill="#8a6a30" rx="2"/>
  <!-- Paper inside -->
  <rect x="80" y="15" width="160" height="60" fill="#f0e8d0" rx="2" transform="rotate(-3 160 45)"/>
  <rect x="82" y="17" width="156" height="56" fill="none" stroke="#d0c0a0" stroke-width="0.5" rx="1" transform="rotate(-3 160 45)"/>
  <text x="160" y="42" text-anchor="middle" fill="#333" font-size="22" font-weight="bold" font-family="serif" transform="rotate(-3 160 45)">T A K I</text>
  <text x="160" y="60" text-anchor="middle" fill="#888" font-size="9" font-family="serif" transform="rotate(-3 160 45)">password?</text>
  <!-- Drawer handle -->
  <rect x="140" y="86" width="40" height="8" rx="3" fill="#aaa" stroke="#999" stroke-width="0.5"/>
</svg>`;

// Paper item (to pick up from drawer)
zoom.paper = `
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="50">
  <rect x="2" y="2" width="76" height="46" fill="#f0e8d0" rx="2" stroke="#d0c0a0" stroke-width="1"/>
  <text x="40" y="26" text-anchor="middle" fill="#333" font-size="16" font-weight="bold" font-family="serif">T A K I</text>
  <text x="40" y="40" text-anchor="middle" fill="#999" font-size="7" font-family="serif">password?</text>
</svg>`;

// --- Laptop close-up ---
zoom.laptopBg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="350">
  <defs>
    <linearGradient id="lbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1a20"/>
      <stop offset="100%" stop-color="#101018"/>
    </linearGradient>
    <linearGradient id="scr" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a2040"/>
      <stop offset="100%" stop-color="#061530"/>
    </linearGradient>
  </defs>
  <rect width="400" height="350" fill="url(#lbg)"/>
  <!-- Laptop base -->
  <rect x="40" y="230" width="320" height="20" rx="4" fill="#888" stroke="#666" stroke-width="1.5"/>
  <rect x="60" y="245" width="280" height="80" rx="2" fill="#999" stroke="#888" stroke-width="1"/>
  <!-- Keyboard area -->
  <rect x="75" y="255" width="250" height="55" rx="2" fill="#666"/>
  <!-- Keyboard keys (simplified grid) -->
  <g fill="#555" stroke="#444" stroke-width="0.3">
    <rect x="80" y="258" width="16" height="10" rx="1"/><rect x="98" y="258" width="16" height="10" rx="1"/>
    <rect x="116" y="258" width="16" height="10" rx="1"/><rect x="134" y="258" width="16" height="10" rx="1"/>
    <rect x="152" y="258" width="16" height="10" rx="1"/><rect x="170" y="258" width="16" height="10" rx="1"/>
    <rect x="188" y="258" width="16" height="10" rx="1"/><rect x="206" y="258" width="16" height="10" rx="1"/>
    <rect x="224" y="258" width="16" height="10" rx="1"/><rect x="242" y="258" width="16" height="10" rx="1"/>
    <rect x="260" y="258" width="16" height="10" rx="1"/><rect x="278" y="258" width="16" height="10" rx="1"/>
    <rect x="298" y="258" width="18" height="10" rx="1"/>
    <rect x="80" y="270" width="20" height="10" rx="1"/><rect x="102" y="270" width="16" height="10" rx="1"/>
    <rect x="120" y="270" width="16" height="10" rx="1"/><rect x="138" y="270" width="16" height="10" rx="1"/>
    <rect x="156" y="270" width="16" height="10" rx="1"/><rect x="174" y="270" width="16" height="10" rx="1"/>
    <rect x="192" y="270" width="16" height="10" rx="1"/><rect x="210" y="270" width="16" height="10" rx="1"/>
    <rect x="228" y="270" width="16" height="10" rx="1"/><rect x="246" y="270" width="16" height="10" rx="1"/>
    <rect x="264" y="270" width="16" height="10" rx="1"/><rect x="282" y="270" width="34" height="10" rx="1"/>
    <rect x="80" y="282" width="24" height="10" rx="1"/><rect x="106" y="282" width="16" height="10" rx="1"/>
    <rect x="124" y="282" width="16" height="10" rx="1"/><rect x="142" y="282" width="16" height="10" rx="1"/>
    <rect x="160" y="282" width="16" height="10" rx="1"/><rect x="178" y="282" width="16" height="10" rx="1"/>
    <rect x="196" y="282" width="16" height="10" rx="1"/><rect x="214" y="282" width="16" height="10" rx="1"/>
    <rect x="232" y="282" width="16" height="10" rx="1"/><rect x="250" y="282" width="66" height="10" rx="1"/>
    <rect x="130" y="295" width="140" height="10" rx="1"/>
  </g>
  <!-- Trackpad -->
  <rect x="150" y="310" width="100" height="12" rx="3" fill="#777" stroke="#666" stroke-width="0.5"/>
  <!-- Screen -->
  <rect x="50" y="30" width="300" height="195" rx="5" fill="#222" stroke="#333" stroke-width="2"/>
  <rect x="60" y="40" width="280" height="175" rx="2" fill="url(#scr)"/>
  <!-- Camera dot -->
  <circle cx="200" cy="25" r="2.5" fill="#444"/>
  <!-- Screen content: password prompt -->
  <rect x="110" y="80" width="180" height="90" rx="6" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  <text x="200" y="105" text-anchor="middle" fill="#8ab" font-size="11" font-family="monospace">Enter Password</text>
  <rect x="130" y="115" width="140" height="24" rx="4" fill="#0a1520" stroke="#335" stroke-width="1"/>
  <text x="200" y="132" text-anchor="middle" fill="#446" font-size="14" font-family="monospace">_ _ _ _</text>
  <rect x="155" y="148" width="90" height="18" rx="4" fill="#335" stroke="#447" stroke-width="0.5"/>
  <text x="200" y="160" text-anchor="middle" fill="#8ab" font-size="9" font-family="monospace">SUBMIT</text>
</svg>`;

// --- Lockbox close-up ---
zoom.lockboxBg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="350">
  <defs>
    <linearGradient id="lkbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1a18"/>
      <stop offset="100%" stop-color="#121210"/>
    </linearGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#666"/>
      <stop offset="50%" stop-color="#555"/>
      <stop offset="100%" stop-color="#444"/>
    </linearGradient>
  </defs>
  <rect width="400" height="350" fill="url(#lkbg)"/>
  <!-- Shelf surface -->
  <rect x="20" y="240" width="360" height="12" fill="#c8a060" stroke="#a07838" stroke-width="1"/>
  <rect x="20" y="238" width="360" height="3" fill="rgba(255,255,255,0.05)"/>
  <!-- Lockbox body -->
  <rect x="80" y="100" width="240" height="140" rx="6" fill="url(#metal)" stroke="#444" stroke-width="2"/>
  <rect x="85" y="105" width="230" height="130" rx="4" fill="#4a4a4a"/>
  <!-- Metal texture lines -->
  <line x1="90" y1="115" x2="310" y2="115" stroke="#555" stroke-width="0.5" opacity="0.3"/>
  <line x1="90" y1="125" x2="310" y2="125" stroke="#555" stroke-width="0.5" opacity="0.3"/>
  <line x1="90" y1="220" x2="310" y2="220" stroke="#555" stroke-width="0.5" opacity="0.3"/>
  <!-- Keypad area -->
  <rect x="130" y="140" width="140" height="80" rx="4" fill="#333" stroke="#555" stroke-width="1"/>
  <rect x="140" y="148" width="120" height="20" rx="3" fill="#222" stroke="#444" stroke-width="0.5"/>
  <text x="200" y="162" text-anchor="middle" fill="#4a4" font-size="14" font-family="monospace">- - - -</text>
  <!-- Number buttons -->
  <g fill="#3a3a3a" stroke="#555" stroke-width="0.5">
    <rect x="143" y="174" width="24" height="18" rx="3"/><text x="155" y="187" text-anchor="middle" fill="#aaa" font-size="11">1</text>
    <rect x="172" y="174" width="24" height="18" rx="3"/><text x="184" y="187" text-anchor="middle" fill="#aaa" font-size="11">2</text>
    <rect x="201" y="174" width="24" height="18" rx="3"/><text x="213" y="187" text-anchor="middle" fill="#aaa" font-size="11">3</text>
    <rect x="230" y="174" width="24" height="18" rx="3"/><text x="242" y="187" text-anchor="middle" fill="#aaa" font-size="11">4</text>
    <rect x="143" y="196" width="24" height="18" rx="3"/><text x="155" y="209" text-anchor="middle" fill="#aaa" font-size="11">5</text>
    <rect x="172" y="196" width="24" height="18" rx="3"/><text x="184" y="209" text-anchor="middle" fill="#aaa" font-size="11">6</text>
    <rect x="201" y="196" width="24" height="18" rx="3"/><text x="213" y="209" text-anchor="middle" fill="#aaa" font-size="11">7</text>
    <rect x="230" y="196" width="24" height="18" rx="3"/><text x="242" y="209" text-anchor="middle" fill="#aaa" font-size="11">8</text>
  </g>
  <!-- Lock hasp -->
  <rect x="185" y="94" width="30" height="12" rx="2" fill="#555"/>
  <path d="M192,94 L192,80 Q200,70 208,80 L208,94" fill="none" stroke="#777" stroke-width="3"/>
  <!-- Status LED -->
  <circle cx="200" cy="130" r="4" fill="#600" stroke="#444" stroke-width="1"/>
</svg>`;

// Keycard item
zoom.keycard = `
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="50">
  <defs>
    <linearGradient id="kc" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e0e8f0"/>
      <stop offset="100%" stop-color="#c0c8d8"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="76" height="46" rx="4" fill="url(#kc)" stroke="#a0a8b8" stroke-width="1"/>
  <rect x="8" y="14" width="30" height="22" rx="2" fill="#c4a35a" opacity="0.6"/>
  <rect x="10" y="16" width="26" height="18" rx="1" fill="#d4b36a" opacity="0.4"/>
  <line x1="12" y1="20" x2="34" y2="20" stroke="#c4a35a" stroke-width="0.5" opacity="0.5"/>
  <line x1="12" y1="24" x2="34" y2="24" stroke="#c4a35a" stroke-width="0.5" opacity="0.5"/>
  <line x1="12" y1="28" x2="34" y2="28" stroke="#c4a35a" stroke-width="0.5" opacity="0.5"/>
  <rect x="45" y="20" width="28" height="3" rx="1" fill="#888"/>
  <rect x="45" y="26" width="20" height="3" rx="1" fill="#aaa"/>
  <text x="55" y="42" text-anchor="middle" fill="#888" font-size="6" font-family="sans-serif">ACCESS</text>
</svg>`;

// Laptop screen unlocked — showing "1886"
zoom.screen1886 = `
<svg xmlns="http://www.w3.org/2000/svg" width="280" height="175">
  <rect width="280" height="175" rx="2" fill="#0a2040"/>
  <!-- Scanline effect -->
  <line x1="0" y1="40" x2="280" y2="40" stroke="rgba(0,255,100,0.02)" stroke-width="1"/>
  <line x1="0" y1="80" x2="280" y2="80" stroke="rgba(0,255,100,0.02)" stroke-width="1"/>
  <line x1="0" y1="120" x2="280" y2="120" stroke="rgba(0,255,100,0.02)" stroke-width="1"/>
  <!-- Access granted text -->
  <rect x="70" y="20" width="140" height="24" rx="3" fill="rgba(0,255,100,0.08)"/>
  <text x="140" y="37" text-anchor="middle" fill="#4a8" font-size="14" font-family="monospace">ACCESS GRANTED</text>
  <!-- Number display -->
  <rect x="40" y="60" width="200" height="80" rx="8" fill="rgba(0,255,100,0.04)" stroke="rgba(0,255,100,0.12)" stroke-width="1.5"/>
  <text x="140" y="115" text-anchor="middle" fill="#6c8" font-size="52" font-weight="bold" font-family="monospace">1886</text>
  <!-- Small status text -->
  <text x="140" y="160" text-anchor="middle" fill="#346" font-size="9" font-family="monospace">FILE #0042 — CLASSIFIED</text>
</svg>`;

// Cabinet lower doors open — showing interior with drawer
zoom.cabinetOpen = `
<svg xmlns="http://www.w3.org/2000/svg" width="340" height="200">
  <defs>
    <linearGradient id="coint" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6a4a22"/>
      <stop offset="100%" stop-color="#5a3a18"/>
    </linearGradient>
  </defs>
  <!-- Cabinet interior (dark) -->
  <rect x="10" y="0" width="320" height="190" rx="2" fill="url(#coint)"/>
  <!-- Interior shadows -->
  <rect x="15" y="5" width="310" height="180" fill="#4a3018" rx="2"/>
  <!-- Shelf inside -->
  <rect x="18" y="80" width="304" height="6" fill="#6a4a22"/>
  <!-- Left door (swung open, perspective) -->
  <polygon points="0,0 30,8 30,185 0,195" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <polygon points="3,4 28,10 28,182 3,192" fill="rgba(0,0,0,0.06)"/>
  <!-- Right door (swung open, perspective) -->
  <polygon points="340,0 310,8 310,185 340,195" fill="#b89050" stroke="#987038" stroke-width="1"/>
  <polygon points="337,4 312,10 312,182 337,192" fill="rgba(0,0,0,0.06)"/>
  <!-- Door knobs on opened doors -->
  <circle cx="28" cy="95" r="4" fill="#bbb"/>
  <circle cx="312" cy="95" r="4" fill="#bbb"/>
  <!-- Drawer inside (with handle) -->
  <rect x="60" y="100" width="220" height="70" rx="3" fill="#a07838" stroke="#8a6828" stroke-width="1"/>
  <rect x="65" y="105" width="210" height="60" fill="#906a30" rx="2"/>
  <rect x="140" y="168" width="60" height="6" rx="2" fill="#bbb"/>
</svg>`;

// Lockbox visible in upper cabinet (seen through glass)
zoom.lockboxInGlass = `
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="100">
  <defs>
    <linearGradient id="lbmetal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#777"/>
      <stop offset="100%" stop-color="#555"/>
    </linearGradient>
  </defs>
  <!-- Glass reflection overlay -->
  <rect width="160" height="100" fill="rgba(180,200,210,0.06)" rx="2"/>
  <!-- Lockbox -->
  <rect x="30" y="25" width="100" height="55" rx="4" fill="url(#lbmetal)" stroke="#444" stroke-width="1.5"/>
  <rect x="35" y="30" width="90" height="45" rx="2" fill="#4a4a4a"/>
  <!-- Keypad -->
  <rect x="55" y="38" width="50" height="28" rx="2" fill="#333" stroke="#555" stroke-width="0.5"/>
  <rect x="60" y="42" width="40" height="8" rx="1" fill="#222"/>
  <text x="80" y="49" text-anchor="middle" fill="#4a4" font-size="5" font-family="monospace">- - - -</text>
  <!-- Hasp -->
  <rect x="70" y="20" width="20" height="8" rx="1.5" fill="#555"/>
  <path d="M74,22 L74,16 Q80,10 86,16 L86,22" fill="none" stroke="#777" stroke-width="2"/>
  <!-- LED -->
  <circle cx="80" cy="62" r="2.5" fill="#600"/>
</svg>`;

// --- Door close-up with card reader ---
zoom.doorBg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="450">
  <defs>
    <linearGradient id="zdr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#7a4a28"/>
      <stop offset="30%" stop-color="#a06a38"/>
      <stop offset="70%" stop-color="#a06a38"/>
      <stop offset="100%" stop-color="#7a4a28"/>
    </linearGradient>
  </defs>
  <rect width="400" height="450" fill="#151210"/>
  <!-- Door frame -->
  <rect x="30" y="10" width="340" height="430" fill="#a89878"/>
  <!-- Door panel -->
  <rect x="40" y="15" width="320" height="420" rx="2" fill="url(#zdr)"/>
  <!-- Upper panel -->
  <rect x="65" y="35" width="270" height="130" rx="3" fill="#8a5a30" stroke="#6a4020" stroke-width="2"/>
  <rect x="72" y="42" width="256" height="116" fill="#956232" opacity="0.35" rx="2"/>
  <!-- Middle panel -->
  <rect x="65" y="180" width="270" height="120" rx="3" fill="#8a5a30" stroke="#6a4020" stroke-width="2"/>
  <rect x="72" y="187" width="256" height="106" fill="#956232" opacity="0.35" rx="2"/>
  <!-- Lower panel -->
  <rect x="65" y="315" width="270" height="105" rx="3" fill="#8a5a30" stroke="#6a4020" stroke-width="2"/>
  <!-- Card reader device -->
  <rect x="290" y="210" width="50" height="75" rx="5" fill="#333" stroke="#444" stroke-width="1.5"/>
  <rect x="296" y="216" width="38" height="8" rx="2" fill="#222"/>
  <text x="315" y="222" text-anchor="middle" fill="#444" font-size="5" font-family="monospace">CARD</text>
  <!-- Card slot -->
  <rect x="298" y="230" width="34" height="4" rx="1" fill="#1a1a1a" stroke="#555" stroke-width="0.5"/>
  <!-- LED indicator (red = locked) -->
  <circle cx="315" cy="252" r="6" fill="#600" stroke="#444" stroke-width="1"/>
  <circle cx="315" cy="252" r="3" fill="#900"/>
  <!-- Handle area -->
  <rect x="295" y="268" width="28" height="10" rx="3" fill="#555"/>
  <!-- Door handle -->
  <rect x="290" y="290" width="40" height="12" rx="5" fill="#c0c0c0" stroke="#aaa" stroke-width="1.5"/>
  <circle cx="295" cy="296" r="3" fill="#888"/>
</svg>`;


// ============================================================
//  ROOM DATA
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
      bounds: { x: 140, y: 100, w: 110, h: 90 },
      appearance: { fill: "#444", stroke: "#333", image: toDataUrl(svgs.paintingDark) },
      zIndex: 2, visible: true,
      triggers: [{
        type: "tap", requiredFlags: [], requiredItem: null,
        actions: [{ type: "showMessage", params: { message: "A minimalist painting of a bare tree in winter. The frame is solid — purely decorative." } }]
      }]
    },
    {
      id: "hs_painting_light",
      label: "Light Painting",
      shape: "rect",
      bounds: { x: 280, y: 105, w: 110, h: 90 },
      appearance: { fill: "#eee", stroke: "#ccc", image: toDataUrl(svgs.paintingLight) },
      zIndex: 2, visible: true,
      triggers: [{
        type: "tap", requiredFlags: [], requiredItem: null,
        actions: [{ type: "showMessage", params: { message: "A matching tree painting in light tones. Signed 'L.M. 2019'." } }]
      }]
    },
    {
      id: "hs_sofa",
      label: "Sofa",
      shape: "rect",
      bounds: { x: 540, y: 380, w: 200, h: 130 },
      appearance: { fill: "#d8ccb0", stroke: "#c0b498", image: toDataUrl(svgs.sofa) },
      zIndex: 1, visible: true,
      triggers: [{
        type: "tap", requiredFlags: [], requiredItem: null,
        actions: [{ type: "showMessage", params: { message: "A cream-colored sofa with patterned cushions. Nothing hidden here." } }]
      }]
    },
    {
      id: "hs_desk",
      label: "Desk",
      shape: "rect",
      bounds: { x: 20, y: 340, w: 200, h: 120 },
      appearance: { fill: "#a07a48", stroke: "#7a5a30", image: toDataUrl(svgs.desk) },
      zIndex: 1, visible: true,
      triggers: [{
        type: "tap", requiredFlags: [], requiredItem: null,
        actions: [{ type: "showMessage", params: { message: "A wooden desk with a single drawer. The drawer is empty." } }]
      }]
    },
    {
      id: "hs_chair",
      label: "Chair",
      shape: "rect",
      bounds: { x: 80, y: 410, w: 80, h: 100 },
      appearance: { fill: "#333", stroke: "#222", image: toDataUrl(svgs.chair) },
      zIndex: 3, visible: true,
      triggers: [{
        type: "tap", requiredFlags: [], requiredItem: null,
        actions: [{ type: "showMessage", params: { message: "A sleek black swivel chair. Nothing hidden on or under it." } }]
      }]
    },
    {
      id: "hs_rug",
      label: "Rug",
      shape: "rect",
      bounds: { x: 150, y: 460, w: 400, h: 110 },
      appearance: { fill: "#d8c8a0", stroke: "#8a5a30", image: toDataUrl(svgs.rug) },
      zIndex: 0, visible: true,
      triggers: [{
        type: "tap", requiredFlags: [], requiredItem: null,
        actions: [{ type: "showMessage", params: { message: "An ornate area rug with warm brown and gold patterns. Nothing underneath." } }]
      }]
    },
    {
      id: "hs_bookshelf",
      label: "Bookshelf",
      shape: "rect",
      bounds: { x: 110, y: 130, w: 190, h: 110 },
      appearance: { fill: "#c8a878", stroke: "#a88858", image: toDataUrl(svgs.bookshelf) },
      zIndex: 1, visible: true,
      triggers: [{
        type: "tap", requiredFlags: [], requiredItem: null,
        actions: [{ type: "showMessage", params: { message: "Floating shelves with books and decorative objects. Nothing immediately useful." } }]
      }]
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
            triggers: [{
              type: "tap", requiredFlags: [], requiredItem: null,
              actions: [{ type: "showMessage", params: { message: "The soil here is loose and crumbly. Something is partially buried..." } }]
            }]
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
                { type: "setFlag", params: { flag: "found_key", value: true } },
                { type: "showMessage", params: { message: "You pull a small brass key from the soil!" } }
              ]
            }]
          }
        ]
      },
      triggers: [] // zoom handles interaction
    },

    // Step 2: Cabinet → use key → door opens visually → drawer → paper
    {
      id: "hs_cabinet",
      label: "Cabinet",
      shape: "rect",
      bounds: { x: 540, y: 100, w: 145, h: 200 },
      appearance: { fill: "#c8a060", stroke: "#a88040", image: toDataUrl(svgs.cabinet) },
      zIndex: 1, visible: true,
      zoomView: {
        image: toDataUrl(zoom.cabinetBg),
        subHotspots: [
          // Lockbox visible through upper glass (always visible)
          {
            id: "sub_lockbox_vis",
            label: "Lockbox",
            bounds: { x: 10, y: 7, w: 40, h: 35 },
            image: toDataUrl(zoom.lockboxInGlass),
            triggers: [
              {
                type: "tap", requiredFlags: ["laptop_unlocked"], requiredItem: null,
                actions: [
                  { type: "openZoom", params: { hotspotId: "hs_lockbox" } }
                ]
              },
              {
                type: "tap", requiredFlags: [], requiredItem: null,
                actions: [
                  { type: "showMessage", params: { message: "A metal lockbox behind the glass. It has a digital keypad lock." } }
                ]
              }
            ]
          },
          // Lower doors open (swing animation)
          {
            id: "sub_door_open",
            label: "Open Doors",
            bounds: { x: 5, y: 50, w: 88, h: 46 },
            image: null,
            animation: { type: "swing", to: "-8deg" },
            visibleWhen: ["cabinet_open"],
            imageOpen: toDataUrl(zoom.cabinetOpen),
            triggers: [{
              type: "tap", requiredFlags: ["cabinet_open"], requiredItem: null,
              actions: [
                { type: "showMessage", params: { message: "The cabinet doors are open. You can see a drawer inside." } }
              ]
            }]
          },
          // Drawer inside (visible after doors open)
          {
            id: "sub_drawer",
            label: "Drawer",
            bounds: { x: 20, y: 60, w: 60, h: 26 },
            image: null,
            animation: { type: "slide-down", to: "68%" },
            visibleWhen: ["cabinet_open", "_zoomAnim_sub_door_open"],
            imageOpen: toDataUrl(zoom.drawerOpen),
            triggers: [{
              type: "tap", requiredFlags: ["cabinet_open"], requiredItem: null, once: true,
              actions: [
                { type: "showMessage", params: { message: "The drawer slides open revealing a folded paper inside." } }
              ]
            }]
          },
          // Paper in drawer (visible after drawer opens)
          {
            id: "sub_paper",
            label: "Paper",
            bounds: { x: 30, y: 68, w: 40, h: 14 },
            image: toDataUrl(zoom.paper),
            hideOnCollect: true,
            visibleWhen: ["cabinet_open", "_zoomAnim_sub_drawer"],
            triggers: [{
              type: "tap", requiredFlags: [], requiredItem: null, once: true,
              actions: [
                { type: "giveItem", params: { itemId: "item_paper" } },
                { type: "showMessage", params: { message: "You take the paper. It has four letters in bold: T A K I. 'password?' is written underneath." } }
              ]
            }]
          }
        ]
      },
      triggers: [
        {
          type: "useItem", requiredFlags: [], requiredItem: "item_small_key", once: true,
          actions: [
            { type: "removeItem", params: { itemId: "item_small_key" } },
            { type: "setFlag", params: { flag: "cabinet_open", value: true } },
            { type: "showMessage", params: { message: "Click! The key fits. The lower cabinet unlocks." } },
            { type: "openZoom", params: { hotspotId: "hs_cabinet" } }
          ]
        },
        {
          type: "tap", requiredFlags: [], requiredItem: null,
          actions: [
            { type: "showMessage", params: { message: "A wooden cabinet. The lower section is locked with a keyhole. Through the glass above you can see a metal lockbox." } }
          ]
        }
      ]
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
            triggers: [{
              type: "tap", requiredFlags: ["laptop_unlocked"], requiredItem: null,
              actions: [
                { type: "showMessage", params: { message: "The screen displays the number: 1886. Maybe it's a code for something?" } }
              ]
            }]
          },
          // Locked screen (hidden after solving)
          {
            id: "sub_screen",
            label: "Screen",
            bounds: { x: 15, y: 12, w: 70, h: 52 },
            image: null,
            triggers: [
              {
                type: "tap", requiredFlags: ["cabinet_open"], requiredItem: null,
                actions: [
                  { type: "triggerPuzzle", params: { puzzleId: "puzzle_laptop" } }
                ]
              },
              {
                type: "tap", requiredFlags: [], requiredItem: null,
                actions: [
                  { type: "showMessage", params: { message: "A password prompt on the screen. You don't know the password yet." } }
                ]
              }
            ]
          }
        ]
      },
      triggers: [] // zoom handles
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
                { type: "giveItem", params: { itemId: "item_keycard" } },
                { type: "showMessage", params: { message: "You take the keycard from the lockbox!" } }
              ]
            }]
          }
        ]
      },
      triggers: []
    },

    // Step 4: Door → use keycard → escape
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
            triggers: [{
              type: "tap", requiredFlags: [], requiredItem: null,
              actions: [
                { type: "showMessage", params: { message: "A card reader with a red LED. You need a keycard to open the door." } }
              ]
            }]
          },
          {
            id: "sub_handle",
            label: "Handle",
            bounds: { x: 68, y: 64, w: 16, h: 6 },
            image: null,
            triggers: [{
              type: "tap", requiredFlags: [], requiredItem: null,
              actions: [
                { type: "showMessage", params: { message: "The handle won't turn — the door is locked electronically." } }
              ]
            }]
          }
        ]
      },
      triggers: [
        {
          type: "useItem", requiredFlags: [], requiredItem: "item_keycard", once: true,
          actions: [
            { type: "removeItem", params: { itemId: "item_keycard" } },
            { type: "showMessage", params: { message: "You swipe the keycard. BEEP! The light turns green. The lock clicks open. Freedom!" } },
            { type: "gameWin", params: {} }
          ]
        },
        {
          type: "tap", requiredFlags: [], requiredItem: null,
          actions: [
            { type: "showMessage", params: { message: "The front door has a card reader. You need a keycard to open it." } }
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
      prompt: "Enter the 4-letter password:",
      solution: "TAKI",
      onSolve: [
        { type: "setFlag", params: { flag: "laptop_unlocked", value: true } },
        { type: "setFlag", params: { flag: "_zoomHidden_sub_screen", value: true } },
        { type: "showMessage", params: { message: "Password accepted! The screen unlocks..." } },
        { type: "openZoom", params: { hotspotId: "hs_laptop" } }
      ],
      onFail: [
        { type: "showMessage", params: { message: "Incorrect password. Look more carefully at the paper..." } }
      ]
    },
    {
      id: "puzzle_lockbox",
      type: "combination",
      hotspotId: "hs_lockbox",
      prompt: "Enter the 4-digit code:",
      solution: "1886",
      onSolve: [
        { type: "setFlag", params: { flag: "lockbox_open", value: true } },
        { type: "setFlag", params: { flag: "_zoomHidden_sub_keypad", value: true } },
        { type: "showMessage", params: { message: "Click! The lockbox springs open!" } },
        { type: "openZoom", params: { hotspotId: "hs_lockbox" } }
      ],
      onFail: [
        { type: "showMessage", params: { message: "Wrong code. Think about what the laptop showed." } }
      ]
    }
  ],
  hints: [
    "Look carefully at the plant pot — the soil seems disturbed.",
    "Dig in the soil to find a key. Use it on the lower cabinet.",
    "The paper from the cabinet has the laptop password: TAKI.",
    "The laptop shows 1886. Use that on the lockbox in the upper cabinet.",
    "Swipe the keycard from the lockbox on the door's card reader."
  ],
  onEnter: [
    { type: "showMessage", params: { message: "You wake up in a stranger's apartment. The front door has a card reader lock. Find a way to get a keycard and escape!" } }
  ]
};

const outPath = path.join(__dirname, '..', 'js', 'data', 'apartment.json');
fs.writeFileSync(outPath, JSON.stringify(room, null, 2) + '\n');
console.log('Generated apartment.json (' + Math.round(fs.statSync(outPath).size / 1024) + ' KB)');
