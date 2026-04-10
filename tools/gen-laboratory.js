/**
 * Generate "The Laboratory" room with SVG artwork.
 * Run: node tools/gen-laboratory.js
 */
const fs = require('fs');
const path = require('path');

function toDataUrl(svg) {
  return 'data:image/svg+xml;base64,' + Buffer.from(svg.replace(/\n\s*/g, '')).toString('base64');
}

const svgs = {};

svgs.background = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e8e8e0"/>
      <stop offset="100%" stop-color="#d0d0c8"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a0a098"/>
      <stop offset="100%" stop-color="#888880"/>
    </linearGradient>
  </defs>
  <rect width="800" height="420" fill="url(#wall)"/>
  <rect y="420" width="800" height="180" fill="url(#floor)"/>
  <line x1="0" y1="420" x2="800" y2="420" stroke="#b0b0a8" stroke-width="2"/>
  <rect x="0" y="380" width="800" height="40" fill="#c8c8c0" opacity="0.3"/>
  <line x1="0" y1="380" x2="800" y2="380" stroke="#b8b8b0" stroke-width="1"/>
  <rect x="0" y="420" width="100" height="180" fill="#909088" opacity="0.15"/>
  <rect x="200" y="420" width="100" height="180" fill="#909088" opacity="0.15"/>
  <rect x="400" y="420" width="100" height="180" fill="#909088" opacity="0.15"/>
  <rect x="600" y="420" width="100" height="180" fill="#909088" opacity="0.15"/>
  <ellipse cx="400" cy="100" rx="250" ry="150" fill="#ffffff" opacity="0.05"/>
</svg>`;

svgs.microscope = `
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="120">
  <rect x="15" y="100" width="50" height="8" rx="2" fill="#333"/>
  <rect x="25" y="95" width="30" height="8" rx="1" fill="#444"/>
  <rect x="35" y="30" width="10" height="65" fill="#555"/>
  <rect x="30" y="25" width="20" height="10" rx="2" fill="#666"/>
  <rect x="32" y="15" width="16" height="12" rx="1" fill="#444"/>
  <circle cx="40" cy="21" r="6" fill="#3a3a3a" stroke="#777" stroke-width="1"/>
  <circle cx="40" cy="21" r="3" fill="#88aacc"/>
  <rect x="28" y="60" width="24" height="4" rx="1" fill="#666"/>
  <rect x="45" y="40" width="20" height="6" rx="2" fill="#555"/>
  <circle cx="65" cy="43" r="4" fill="#777" stroke="#888" stroke-width="1"/>
  <rect x="20" y="90" width="8" height="12" fill="#444"/>
  <rect x="52" y="90" width="8" height="12" fill="#444"/>
</svg>`;

svgs.chemShelf = `
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="160">
  <rect width="140" height="160" fill="#888" stroke="#999" stroke-width="2"/>
  <rect x="5" y="0" width="130" height="4" fill="#999"/>
  <rect x="5" y="52" width="130" height="4" fill="#999"/>
  <rect x="5" y="104" width="130" height="4" fill="#999"/>
  <rect x="5" y="156" width="130" height="4" fill="#999"/>
  <rect x="15" y="10" width="16" height="38" rx="3" fill="#44aa44" opacity="0.7"/>
  <rect x="20" y="6" width="6" height="8" rx="1" fill="#338833"/>
  <rect x="38" y="15" width="14" height="33" rx="3" fill="#4488cc" opacity="0.7"/>
  <rect x="41" y="11" width="8" height="8" rx="1" fill="#3366aa"/>
  <rect x="60" y="8" width="18" height="40" rx="3" fill="#cc6644" opacity="0.6"/>
  <rect x="65" y="4" width="8" height="8" rx="1" fill="#aa4422"/>
  <circle cx="95" cy="35" r="12" fill="#eedd44" opacity="0.5" stroke="#ccbb22" stroke-width="1"/>
  <rect x="110" y="18" width="12" height="28" rx="2" fill="#aa44aa" opacity="0.6"/>
  <rect x="15" y="62" width="20" height="36" rx="4" fill="#33aaaa" opacity="0.6"/>
  <rect x="45" y="68" width="12" height="30" rx="2" fill="#dd6666" opacity="0.7"/>
  <rect x="65" y="60" width="16" height="40" rx="3" fill="#88cc44" opacity="0.6"/>
  <circle cx="100" cy="82" r="14" fill="#aaaadd" opacity="0.4" stroke="#8888bb" stroke-width="1"/>
  <rect x="15" y="114" width="14" height="36" rx="3" fill="#dd9944" opacity="0.6"/>
  <rect x="38" y="118" width="18" height="32" rx="3" fill="#6688dd" opacity="0.7"/>
  <rect x="65" y="112" width="12" height="40" rx="2" fill="#44ccaa" opacity="0.6"/>
  <rect x="88" y="116" width="20" height="34" rx="4" fill="#cc88cc" opacity="0.5"/>
</svg>`;

svgs.labBench = `
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="100">
  <defs>
    <linearGradient id="bench" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#555"/>
      <stop offset="100%" stop-color="#444"/>
    </linearGradient>
  </defs>
  <rect x="5" y="8" width="230" height="12" rx="1" fill="url(#bench)"/>
  <rect x="5" y="8" width="230" height="3" fill="#666" opacity="0.5"/>
  <rect x="10" y="20" width="220" height="70" fill="#3a3a3a"/>
  <rect x="20" y="28" width="80" height="50" rx="2" fill="#444" stroke="#555" stroke-width="1"/>
  <rect x="40" y="48" width="40" height="4" rx="2" fill="#888"/>
  <rect x="120" y="28" width="80" height="50" rx="2" fill="#444" stroke="#555" stroke-width="1"/>
  <rect x="140" y="48" width="40" height="4" rx="2" fill="#888"/>
  <rect x="15" y="90" width="8" height="10" fill="#333"/>
  <rect x="217" y="90" width="8" height="10" fill="#333"/>
  <rect x="30" y="0" width="20" height="10" rx="2" fill="#557799" opacity="0.6"/>
  <circle cx="140" cy="5" r="5" fill="#cc4444" opacity="0.4"/>
  <rect x="180" y="1" width="30" height="8" rx="1" fill="#999" opacity="0.4"/>
</svg>`;

svgs.cabinet = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="140">
  <rect width="100" height="140" rx="2" fill="#777" stroke="#888" stroke-width="2"/>
  <rect x="5" y="5" width="42" height="65" rx="1" fill="#666" stroke="#888" stroke-width="1"/>
  <rect x="53" y="5" width="42" height="65" rx="1" fill="#666" stroke="#888" stroke-width="1"/>
  <rect x="5" y="75" width="42" height="60" rx="1" fill="#666" stroke="#888" stroke-width="1"/>
  <rect x="53" y="75" width="42" height="60" rx="1" fill="#666" stroke="#888" stroke-width="1"/>
  <circle cx="42" cy="35" r="3" fill="#aaa"/>
  <circle cx="58" cy="35" r="3" fill="#aaa"/>
  <circle cx="42" cy="105" r="3" fill="#aaa"/>
  <circle cx="58" cy="105" r="3" fill="#aaa"/>
  <rect x="35" y="60" width="30" height="8" rx="2" fill="#cc3333" opacity="0.8"/>
  <text x="50" y="67" text-anchor="middle" font-size="6" fill="white" font-family="sans-serif">LOCKED</text>
</svg>`;

svgs.computer = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="90">
  <rect x="10" y="5" width="80" height="55" rx="3" fill="#333" stroke="#555" stroke-width="2"/>
  <rect x="15" y="10" width="70" height="45" fill="#1a3a2a"/>
  <text x="50" y="28" text-anchor="middle" font-size="8" fill="#44ff44" font-family="monospace">ACCESS</text>
  <text x="50" y="40" text-anchor="middle" font-size="8" fill="#44ff44" font-family="monospace">DENIED</text>
  <text x="50" y="52" text-anchor="middle" font-size="6" fill="#22aa22" font-family="monospace">CODE: ____</text>
  <rect x="35" y="60" width="30" height="5" fill="#444"/>
  <rect x="20" y="65" width="60" height="3" rx="1" fill="#555"/>
  <rect x="15" y="72" width="70" height="15" rx="2" fill="#444" stroke="#555" stroke-width="1"/>
  <rect x="18" y="75" width="5" height="3" fill="#666" rx="0.5"/>
  <rect x="25" y="75" width="5" height="3" fill="#666" rx="0.5"/>
  <rect x="32" y="75" width="5" height="3" fill="#666" rx="0.5"/>
  <rect x="39" y="75" width="5" height="3" fill="#666" rx="0.5"/>
  <rect x="46" y="75" width="5" height="3" fill="#666" rx="0.5"/>
  <rect x="53" y="75" width="5" height="3" fill="#666" rx="0.5"/>
  <rect x="60" y="75" width="5" height="3" fill="#666" rx="0.5"/>
  <rect x="67" y="75" width="5" height="3" fill="#666" rx="0.5"/>
  <rect x="74" y="75" width="5" height="3" fill="#666" rx="0.5"/>
  <rect x="25" y="80" width="30" height="3" fill="#666" rx="0.5"/>
</svg>`;

svgs.whiteboard = `
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="100">
  <rect width="160" height="100" rx="2" fill="#ccc" stroke="#999" stroke-width="2"/>
  <rect x="5" y="5" width="150" height="90" fill="#f5f5f0"/>
  <text x="20" y="25" font-size="9" fill="#333" font-family="sans-serif">H2O + NaCl = ?</text>
  <text x="20" y="45" font-size="9" fill="#cc3333" font-family="sans-serif">TEMP: 37.5°C</text>
  <text x="20" y="65" font-size="8" fill="#3366cc" font-family="sans-serif">Slide #4 → microscope</text>
  <line x1="20" y1="75" x2="140" y2="75" stroke="#999" stroke-width="0.5"/>
  <text x="20" y="88" font-size="7" fill="#888" font-family="sans-serif">Dr. Chen - DO NOT ERASE</text>
</svg>`;

svgs.exitDoor = `
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="160">
  <defs>
    <linearGradient id="dr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#888"/>
      <stop offset="50%" stop-color="#999"/>
      <stop offset="100%" stop-color="#777"/>
    </linearGradient>
  </defs>
  <rect width="80" height="160" fill="#666"/>
  <rect x="4" y="3" width="72" height="154" rx="1" fill="url(#dr)"/>
  <rect x="12" y="10" width="56" height="40" rx="1" fill="#aaa" opacity="0.3"/>
  <rect x="12" y="60" width="56" height="40" rx="1" fill="#aaa" opacity="0.3"/>
  <text x="40" y="32" text-anchor="middle" font-size="10" fill="#cc3333" font-family="sans-serif" font-weight="bold">EXIT</text>
  <circle cx="62" cy="85" r="5" fill="#bbb" stroke="#999" stroke-width="1"/>
  <circle cx="62" cy="100" r="3" fill="#333"/>
  <rect x="61" y="100" width="2" height="5" fill="#333"/>
  <rect x="4" y="110" width="72" height="44" rx="1" fill="#aaa" opacity="0.2"/>
</svg>`;

svgs.fumeHood = `
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="100">
  <rect width="120" height="100" fill="#777" stroke="#888" stroke-width="2"/>
  <rect x="5" y="5" width="110" height="60" fill="#aaddee" opacity="0.3" stroke="#99ccdd" stroke-width="1"/>
  <rect x="5" y="0" width="110" height="8" fill="#888"/>
  <rect x="10" y="70" width="100" height="25" fill="#666" stroke="#777" stroke-width="1"/>
  <circle cx="30" cy="40" r="8" fill="#44cc44" opacity="0.3"/>
  <circle cx="60" cy="35" r="10" fill="#cc8844" opacity="0.25"/>
  <circle cx="90" cy="40" r="7" fill="#4488cc" opacity="0.3"/>
  <rect x="40" y="75" width="40" height="4" rx="2" fill="#999"/>
  <line x1="15" y1="12" x2="15" y2="62" stroke="#99ccdd" stroke-width="0.5" opacity="0.5"/>
  <line x1="105" y1="12" x2="105" y2="62" stroke="#99ccdd" stroke-width="0.5" opacity="0.5"/>
</svg>`;

const room = {
  id: "room_laboratory",
  name: "The Laboratory",
  width: 800,
  height: 600,
  background: { type: "image", value: toDataUrl(svgs.background) },
  hotspots: [
    {
      id: "hs_whiteboard",
      label: "Whiteboard",
      shape: "rect",
      bounds: { x: 50, y: 30, w: 160, h: 100 },
      appearance: { fill: "#ccc", stroke: "#999", image: toDataUrl(svgs.whiteboard) },
      zIndex: 1,
      visible: true,
      triggers: [
        {
          type: "tap", requiredFlags: [], requiredItem: null,
          actions: [
            { type: "setFlag", params: { flag: "read_whiteboard", value: true } },
            { type: "showMessage", params: { message: "The whiteboard reads: 'Slide #4 → microscope' and 'TEMP: 37.5°C'. Someone scrawled '3750' in the corner." } }
          ]
        }
      ]
    },
    {
      id: "hs_microscope",
      label: "Microscope",
      shape: "rect",
      bounds: { x: 280, y: 50, w: 80, h: 120 },
      appearance: { fill: "#555", stroke: "#777", image: toDataUrl(svgs.microscope) },
      zIndex: 2,
      visible: true,
      triggers: [
        {
          type: "tap", requiredFlags: ["has_slide"], requiredItem: null, once: true,
          actions: [
            { type: "setFlag", params: { flag: "viewed_slide", value: true } },
            { type: "showMessage", params: { message: "Under the microscope, the slide reveals a pattern: cells arranged in the shape of '3750'. That must be the computer code!" } }
          ]
        },
        {
          type: "tap", requiredFlags: [], requiredItem: null,
          actions: [
            { type: "showMessage", params: { message: "A high-powered microscope. The slide tray is empty. Maybe there's a slide somewhere?" } }
          ]
        }
      ]
    },
    {
      id: "hs_chemshelf",
      label: "Chemical Shelf",
      shape: "rect",
      bounds: { x: 420, y: 20, w: 140, h: 160 },
      appearance: { fill: "#888", stroke: "#999", image: toDataUrl(svgs.chemShelf) },
      zIndex: 1,
      visible: true,
      triggers: [
        {
          type: "tap", requiredFlags: ["cabinet_open"], requiredItem: null,
          actions: [
            { type: "showMessage", params: { message: "Colorful bottles of reagents. You already found what you need in the cabinet." } }
          ]
        },
        {
          type: "tap", requiredFlags: [], requiredItem: null, once: true,
          actions: [
            { type: "setFlag", params: { flag: "searched_shelf", value: true } },
            { type: "giveItem", params: { itemId: "item_slide" } },
            { type: "setFlag", params: { flag: "has_slide", value: true } },
            { type: "showMessage", params: { message: "Behind a bottle of sulfuric acid, you find a glass microscope slide labeled '#4'." } }
          ]
        }
      ]
    },
    {
      id: "hs_computer",
      label: "Computer",
      shape: "rect",
      bounds: { x: 620, y: 60, w: 100, h: 90 },
      appearance: { fill: "#333", stroke: "#555", image: toDataUrl(svgs.computer) },
      zIndex: 2,
      visible: true,
      triggers: [
        {
          type: "tap", requiredFlags: ["computer_unlocked"], requiredItem: null,
          actions: [
            { type: "showMessage", params: { message: "The screen reads: 'CABINET UNLOCKED. Emergency exit protocol: use catalyst in fume hood.'" } }
          ]
        },
        {
          type: "tap", requiredFlags: ["viewed_slide"], requiredItem: null,
          actions: [
            { type: "triggerPuzzle", params: { puzzleId: "puzzle_computer" } }
          ]
        },
        {
          type: "tap", requiredFlags: [], requiredItem: null,
          actions: [
            { type: "showMessage", params: { message: "A terminal flashes 'ACCESS DENIED'. It wants a 4-digit code. Maybe there's a clue somewhere in the lab?" } }
          ]
        }
      ]
    },
    {
      id: "hs_bench",
      label: "Lab Bench",
      shape: "rect",
      bounds: { x: 50, y: 280, w: 240, h: 100 },
      appearance: { fill: "#555", stroke: "#666", image: toDataUrl(svgs.labBench) },
      zIndex: 1,
      visible: true,
      triggers: [
        {
          type: "tap", requiredFlags: [], requiredItem: null,
          actions: [
            { type: "showMessage", params: { message: "A stainless steel lab bench with drawers. Beakers and test tubes sit on top. The drawers are empty." } }
          ]
        }
      ]
    },
    {
      id: "hs_cabinet",
      label: "Cabinet",
      shape: "rect",
      bounds: { x: 360, y: 260, w: 100, h: 140 },
      appearance: { fill: "#777", stroke: "#888", image: toDataUrl(svgs.cabinet) },
      zIndex: 2,
      visible: true,
      triggers: [
        {
          type: "tap", requiredFlags: ["cabinet_open"], requiredItem: null,
          actions: [
            { type: "showMessage", params: { message: "The cabinet is open. It's empty now." } }
          ]
        },
        {
          type: "tap", requiredFlags: ["computer_unlocked"], requiredItem: null, once: true,
          actions: [
            { type: "setFlag", params: { flag: "cabinet_open", value: true } },
            { type: "giveItem", params: { itemId: "item_catalyst" } },
            { type: "showMessage", params: { message: "The electronic lock clicks open! Inside you find a vial labeled 'CATALYST - Emergency Use Only'." } }
          ]
        },
        {
          type: "tap", requiredFlags: [], requiredItem: null,
          actions: [
            { type: "showMessage", params: { message: "A locked metal cabinet with an electronic lock. The computer must control it." } }
          ]
        }
      ]
    },
    {
      id: "hs_fumehood",
      label: "Fume Hood",
      shape: "rect",
      bounds: { x: 530, y: 280, w: 120, h: 100 },
      appearance: { fill: "#777", stroke: "#888", image: toDataUrl(svgs.fumeHood) },
      zIndex: 1,
      visible: true,
      triggers: [
        {
          type: "useItem", requiredFlags: [], requiredItem: "item_catalyst", once: true,
          actions: [
            { type: "removeItem", params: { itemId: "item_catalyst" } },
            { type: "giveItem", params: { itemId: "item_exit_card" } },
            { type: "setFlag", params: { flag: "reaction_done", value: true } },
            { type: "showMessage", params: { message: "You pour the catalyst into the fume hood. A chemical reaction produces a bright flash! When the smoke clears, an exit keycard has materialized on the tray." } }
          ]
        },
        {
          type: "tap", requiredFlags: [], requiredItem: null,
          actions: [
            { type: "showMessage", params: { message: "A ventilated fume hood for safe chemical reactions. There are some residual chemicals inside." } }
          ]
        }
      ]
    },
    {
      id: "hs_exit",
      label: "Exit Door",
      shape: "rect",
      bounds: { x: 700, y: 260, w: 80, h: 160 },
      appearance: { fill: "#888", stroke: "#999", image: toDataUrl(svgs.exitDoor) },
      zIndex: 1,
      visible: true,
      triggers: [
        {
          type: "useItem", requiredFlags: ["reaction_done"], requiredItem: "item_exit_card", once: true,
          actions: [
            { type: "removeItem", params: { itemId: "item_exit_card" } },
            { type: "showMessage", params: { message: "You swipe the keycard. The door beeps green and slides open. You escape the laboratory!" } },
            { type: "gameWin", params: {} }
          ]
        },
        {
          type: "tap", requiredFlags: [], requiredItem: null,
          actions: [
            { type: "showMessage", params: { message: "A heavy security door marked EXIT. It has a keycard reader. The light is red." } }
          ]
        }
      ]
    }
  ],
  items: [
    { id: "item_slide", name: "Microscope Slide", description: "Glass slide labeled '#4'.", icon: { shape: "rect", color: "#88aacc" }, combinesWith: null, combineResult: null },
    { id: "item_catalyst", name: "Catalyst Vial", description: "A vial of emergency catalyst.", icon: { shape: "circle", color: "#44cc44" }, combinesWith: null, combineResult: null },
    { id: "item_exit_card", name: "Exit Keycard", description: "A keycard for the exit door.", icon: { shape: "rect", color: "#4488ff" }, combinesWith: null, combineResult: null }
  ],
  puzzles: [
    {
      id: "puzzle_computer",
      type: "combination",
      hotspotId: "hs_computer",
      prompt: "Enter the 4-digit access code:",
      solution: "3750",
      onSolve: [
        { type: "setFlag", params: { flag: "computer_unlocked", value: true } },
        { type: "showMessage", params: { message: "ACCESS GRANTED. The screen reads: 'Cabinet lock released. Emergency exit protocol activated.'" } }
      ],
      onFail: [
        { type: "showMessage", params: { message: "ACCESS DENIED. Incorrect code." } }
      ]
    }
  ],
  hints: [
    "Check the whiteboard for clues.",
    "Look behind the chemical bottles on the shelf.",
    "Put the slide in the microscope to read the code.",
    "The code is 3750. Enter it in the computer.",
    "Use the catalyst from the cabinet in the fume hood, then use the keycard on the exit."
  ],
  onEnter: [
    { type: "showMessage", params: { message: "The laboratory door locks behind you with a click. A red light blinks on the exit. Find a way out!" } }
  ]
};

const outPath = path.join(__dirname, '..', 'js', 'data', 'laboratory.json');
fs.writeFileSync(outPath, JSON.stringify(room, null, 2) + '\n');
console.log('Generated laboratory.json');
