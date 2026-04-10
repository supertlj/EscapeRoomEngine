/**
 * Generate "The Library" room with SVG artwork.
 * Run: node tools/gen-library.js
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
      <stop offset="0%" stop-color="#3a2818"/>
      <stop offset="100%" stop-color="#2a1e12"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a120a"/>
      <stop offset="100%" stop-color="#120c06"/>
    </linearGradient>
  </defs>
  <rect width="800" height="430" fill="url(#wall)"/>
  <rect y="430" width="800" height="170" fill="url(#floor)"/>
  <line x1="0" y1="430" x2="800" y2="430" stroke="#4a3a20" stroke-width="2"/>
  <rect y="350" width="800" height="80" fill="#2a1e10" opacity="0.3"/>
  <line x1="0" y1="350" x2="800" y2="350" stroke="#4a3a20" stroke-width="1"/>
  <line x1="0" y1="480" x2="800" y2="480" stroke="#1a120a" stroke-width="0.5" opacity="0.4"/>
  <line x1="0" y1="530" x2="800" y2="530" stroke="#1a120a" stroke-width="0.5" opacity="0.4"/>
  <line x1="160" y1="430" x2="160" y2="600" stroke="#1a120a" stroke-width="0.3" opacity="0.3"/>
  <line x1="320" y1="430" x2="320" y2="600" stroke="#1a120a" stroke-width="0.3" opacity="0.3"/>
  <line x1="480" y1="430" x2="480" y2="600" stroke="#1a120a" stroke-width="0.3" opacity="0.3"/>
  <line x1="640" y1="430" x2="640" y2="600" stroke="#1a120a" stroke-width="0.3" opacity="0.3"/>
  <ellipse cx="400" cy="200" rx="200" ry="150" fill="#5a4a2a" opacity="0.06"/>
</svg>`;

svgs.globe = `
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="100">
  <rect x="30" y="85" width="20" height="10" rx="2" fill="#5a3a1a"/>
  <rect x="25" y="92" width="30" height="5" rx="1" fill="#6a4a28"/>
  <circle cx="40" cy="45" r="30" fill="#2a5a8a" stroke="#8a7a50" stroke-width="2"/>
  <ellipse cx="40" cy="45" rx="30" ry="30" fill="none" stroke="#3a6a9a" stroke-width="0.5"/>
  <path d="M20,30 Q30,25 40,28 Q50,20 55,30" fill="#3a8a3a" opacity="0.6"/>
  <path d="M15,45 Q25,40 35,50 Q40,55 50,45 Q55,40 60,48" fill="#3a8a3a" opacity="0.5"/>
  <path d="M25,60 Q35,55 45,62 Q50,65 55,58" fill="#3a8a3a" opacity="0.5"/>
  <ellipse cx="40" cy="45" rx="10" ry="30" fill="none" stroke="#4a7aaa" stroke-width="0.3"/>
  <line x1="10" y1="45" x2="70" y2="45" stroke="#4a7aaa" stroke-width="0.3"/>
  <path d="M40,15 Q42,20 40,25" fill="none" stroke="#8a7a50" stroke-width="1.5"/>
  <circle cx="40" cy="13" r="2" fill="#8a7a50"/>
</svg>`;

svgs.readingDesk = `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="100">
  <defs>
    <linearGradient id="dk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5a3a1e"/>
      <stop offset="100%" stop-color="#4a2e16"/>
    </linearGradient>
  </defs>
  <rect x="5" y="15" width="170" height="10" rx="1" fill="url(#dk)"/>
  <rect x="5" y="15" width="170" height="3" fill="#6a4a28" opacity="0.5"/>
  <rect x="10" y="25" width="160" height="65" fill="#3a2210"/>
  <rect x="15" y="90" width="8" height="10" fill="#2a1a08"/>
  <rect x="157" y="90" width="8" height="10" fill="#2a1a08"/>
  <rect x="30" y="3" width="50" height="14" rx="1" fill="#d4c4a0" opacity="0.6"/>
  <rect x="32" y="5" width="46" height="10" fill="#e8d8b8" opacity="0.4"/>
  <circle cx="130" cy="10" r="8" fill="#aa8820" opacity="0.5"/>
  <line x1="130" y1="2" x2="130" y2="10" stroke="#8a6810" stroke-width="1"/>
  <circle cx="130" cy="2" r="2" fill="#ccaa30" opacity="0.7"/>
</svg>`;

svgs.tallShelf = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="240">
  <rect width="100" height="240" fill="#3a2210"/>
  <rect x="0" y="0" width="4" height="240" fill="#2a1808"/>
  <rect x="96" y="0" width="4" height="240" fill="#2a1808"/>
  <rect x="4" y="0" width="92" height="4" fill="#4a3018"/>
  <rect x="4" y="58" width="92" height="4" fill="#4a3018"/>
  <rect x="4" y="118" width="92" height="4" fill="#4a3018"/>
  <rect x="4" y="178" width="92" height="4" fill="#4a3018"/>
  <rect x="4" y="236" width="92" height="4" fill="#4a3018"/>
  <rect x="10" y="8" width="10" height="46" fill="#8b2020" rx="1"/>
  <rect x="22" y="12" width="12" height="42" fill="#1a3a6a" rx="1"/>
  <rect x="36" y="6" width="14" height="48" fill="#2a4a2a" rx="1"/>
  <rect x="52" y="10" width="8" height="44" fill="#6a2a4a" rx="1"/>
  <rect x="62" y="8" width="16" height="46" fill="#4a4a1a" rx="1"/>
  <rect x="80" y="14" width="10" height="40" fill="#3a1a1a" rx="1"/>
  <rect x="10" y="66" width="14" height="48" fill="#5a1a3a" rx="1"/>
  <rect x="26" y="70" width="10" height="44" fill="#3a5a2a" rx="1"/>
  <rect x="38" y="64" width="12" height="50" fill="#1a2a5a" rx="1"/>
  <rect x="52" y="68" width="16" height="46" fill="#6a4a1a" rx="1"/>
  <rect x="70" y="66" width="10" height="48" fill="#2a2a4a" rx="1"/>
  <rect x="82" y="72" width="10" height="42" fill="#4a2a2a" rx="1"/>
  <rect x="10" y="126" width="12" height="48" fill="#2a5a3a" rx="1"/>
  <rect x="24" y="130" width="14" height="44" fill="#5a2a20" rx="1"/>
  <rect x="40" y="124" width="10" height="50" fill="#1a4a4a" rx="1"/>
  <rect x="52" y="128" width="16" height="46" fill="#4a3a2a" rx="1"/>
  <rect x="70" y="126" width="12" height="48" fill="#2a1a4a" rx="1"/>
  <rect x="84" y="132" width="8" height="42" fill="#5a5a1a" rx="1"/>
  <rect x="10" y="186" width="16" height="46" fill="#3a2a5a" rx="1"/>
  <rect x="28" y="190" width="10" height="42" fill="#5a3a1a" rx="1"/>
  <rect x="40" y="184" width="14" height="48" fill="#1a5a5a" rx="1"/>
  <rect x="56" y="188" width="12" height="44" fill="#6a2a2a" rx="1"/>
  <rect x="70" y="186" width="10" height="46" fill="#3a4a2a" rx="1"/>
  <rect x="82" y="192" width="10" height="40" fill="#4a1a3a" rx="1"/>
</svg>`;

svgs.chest = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="70">
  <rect x="5" y="20" width="90" height="45" rx="3" fill="#5a3a1a" stroke="#3a2210" stroke-width="2"/>
  <path d="M5,20 Q50,5 95,20" fill="#6a4a28" stroke="#3a2210" stroke-width="2"/>
  <rect x="20" y="22" width="60" height="3" fill="#8a7a50" opacity="0.6"/>
  <rect x="42" y="35" width="16" height="12" rx="2" fill="#aa8820" stroke="#886610" stroke-width="1"/>
  <circle cx="50" cy="43" r="3" fill="#2a1a08"/>
  <rect x="10" y="55" width="80" height="3" fill="#8a7a50" opacity="0.4"/>
  <rect x="8" y="62" width="10" height="5" rx="1" fill="#3a2210"/>
  <rect x="82" y="62" width="10" height="5" rx="1" fill="#3a2210"/>
</svg>`;

svgs.fireplace = `
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140">
  <rect x="0" y="0" width="140" height="15" fill="#6a5a3a" stroke="#4a3a20" stroke-width="1"/>
  <rect x="5" y="15" width="130" height="125" fill="#4a3a20"/>
  <rect x="15" y="15" width="110" height="5" fill="#5a4a30"/>
  <rect x="20" y="25" width="100" height="90" rx="3" fill="#1a1008"/>
  <path d="M45,110 Q50,70 55,90 Q60,60 70,85 Q75,55 80,80 Q85,65 95,110" fill="#cc4411" opacity="0.7"/>
  <path d="M50,110 Q55,80 60,95 Q65,70 75,90 Q78,75 85,110" fill="#ff8822" opacity="0.6"/>
  <path d="M58,110 Q62,85 68,95 Q72,80 78,110" fill="#ffcc44" opacity="0.5"/>
  <rect x="25" y="108" width="90" height="7" rx="1" fill="#3a2a18"/>
  <rect x="30" y="105" width="15" height="10" fill="#4a3018" rx="1"/>
  <rect x="55" y="106" width="20" height="9" fill="#3a2210" rx="1"/>
  <rect x="80" y="105" width="12" height="10" fill="#4a3018" rx="1"/>
  <rect x="10" y="120" width="120" height="20" fill="#5a4a30"/>
  <rect x="0" y="118" width="140" height="5" fill="#6a5a3a"/>
</svg>`;

svgs.portrait = `
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="100">
  <rect width="80" height="100" rx="2" fill="#8a7a50"/>
  <rect x="3" y="3" width="74" height="94" fill="#aa9a60"/>
  <rect x="7" y="7" width="66" height="86" fill="#2a2018"/>
  <circle cx="40" cy="35" r="14" fill="#d4a878"/>
  <ellipse cx="40" cy="65" rx="20" ry="22" fill="#3a2a1a"/>
  <circle cx="35" cy="32" r="2" fill="#2a1a0a"/>
  <circle cx="45" cy="32" r="2" fill="#2a1a0a"/>
  <path d="M36,40 Q40,44 44,40" fill="none" stroke="#2a1a0a" stroke-width="1"/>
  <path d="M26,20 Q40,12 54,20" fill="#4a3a2a"/>
  <rect x="32" y="55" width="16" height="3" fill="#aa8820" opacity="0.6"/>
</svg>`;

svgs.archway = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="180">
  <rect x="0" y="0" width="15" height="180" fill="#4a3a20"/>
  <rect x="85" y="0" width="15" height="180" fill="#4a3a20"/>
  <path d="M15,60 Q50,0 85,60" fill="#4a3a20"/>
  <rect x="15" y="60" width="70" height="120" fill="#1a120a"/>
  <path d="M15,60 Q50,10 85,60" fill="#1a120a"/>
  <rect x="0" y="0" width="100" height="8" fill="#5a4a30"/>
  <rect x="20" y="170" width="60" height="10" fill="#2a1e12" opacity="0.5"/>
  <line x1="50" y1="100" x2="50" y2="170" stroke="#3a2a18" stroke-width="0.5" opacity="0.3"/>
</svg>`;

const room = {
  id: "room_library",
  name: "The Library",
  width: 800,
  height: 600,
  background: { type: "image", value: toDataUrl(svgs.background) },
  hotspots: [
    {
      id: "hs_portrait",
      label: "Portrait",
      shape: "rect",
      bounds: { x: 50, y: 20, w: 80, h: 100 },
      appearance: { fill: "#8a7a50", stroke: "#6a5a30", image: toDataUrl(svgs.portrait) },
      zIndex: 2,
      visible: true,
      triggers: [
        {
          type: "tap", requiredFlags: ["found_cipher"], requiredItem: null,
          actions: [
            { type: "showMessage", params: { message: "The old scholar gazes down knowingly. You've already found his secret." } }
          ]
        },
        {
          type: "tap", requiredFlags: [], requiredItem: null, once: true,
          actions: [
            { type: "setFlag", params: { flag: "examined_portrait", value: true } },
            { type: "showMessage", params: { message: "A portrait of the library's founder. A brass plaque reads: 'Knowledge is the key. Seek the red volume on the third shelf.'" } }
          ]
        }
      ]
    },
    {
      id: "hs_globe",
      label: "Globe",
      shape: "circle",
      bounds: { x: 200, y: 40, w: 80, h: 100 },
      appearance: { fill: "#2a5a8a", stroke: "#8a7a50", image: toDataUrl(svgs.globe) },
      zIndex: 2,
      visible: true,
      triggers: [
        {
          type: "tap", requiredFlags: [], requiredItem: null,
          actions: [
            { type: "showMessage", params: { message: "An antique globe. Spinning it, you notice a small inscription near Antarctica: 'YEAR OF THE LIBRARY: 1897'." } },
            { type: "setFlag", params: { flag: "read_globe", value: true } }
          ]
        }
      ]
    },
    {
      id: "hs_tallshelf",
      label: "Tall Bookshelf",
      shape: "rect",
      bounds: { x: 360, y: 10, w: 100, h: 240 },
      appearance: { fill: "#3a2210", stroke: "#2a1808", image: toDataUrl(svgs.tallShelf) },
      zIndex: 1,
      visible: true,
      triggers: [
        {
          type: "tap", requiredFlags: ["examined_portrait"], requiredItem: null, once: true,
          actions: [
            { type: "setFlag", params: { flag: "pulled_book", value: true } },
            { type: "giveItem", params: { itemId: "item_old_key" } },
            { type: "showMessage", params: { message: "You find the red volume on the third shelf and pull it. Click! A hidden compartment opens behind it, revealing a tarnished brass key." } }
          ]
        },
        {
          type: "tap", requiredFlags: [], requiredItem: null,
          actions: [
            { type: "showMessage", params: { message: "Floor-to-ceiling bookshelves packed with leather-bound volumes. Hundreds of books... but which one matters?" } }
          ]
        }
      ]
    },
    {
      id: "hs_fireplace",
      label: "Fireplace",
      shape: "rect",
      bounds: { x: 530, y: 30, w: 140, h: 140 },
      appearance: { fill: "#4a3a20", stroke: "#3a2a10", image: toDataUrl(svgs.fireplace) },
      zIndex: 1,
      visible: true,
      triggers: [
        {
          type: "tap", requiredFlags: [], requiredItem: null,
          actions: [
            { type: "showMessage", params: { message: "A roaring fireplace. The warmth is comforting, but the flames prevent you from reaching inside. The mantelpiece has carved ivy patterns." } }
          ]
        }
      ]
    },
    {
      id: "hs_desk",
      label: "Reading Desk",
      shape: "rect",
      bounds: { x: 50, y: 300, w: 180, h: 100 },
      appearance: { fill: "#5a3a1e", stroke: "#3a2210", image: toDataUrl(svgs.readingDesk) },
      zIndex: 1,
      visible: true,
      triggers: [
        {
          type: "tap", requiredFlags: ["found_cipher"], requiredItem: null,
          actions: [
            { type: "showMessage", params: { message: "The cipher page is spread on the desk. It reads: 'To leave, speak the year the library was born.' The answer must go in the archway lock." } },
            { type: "setFlag", params: { flag: "read_cipher", value: true } }
          ]
        },
        {
          type: "tap", requiredFlags: [], requiredItem: null,
          actions: [
            { type: "showMessage", params: { message: "An oak reading desk with a green lamp. Some old papers are scattered about, but nothing useful yet." } }
          ]
        }
      ]
    },
    {
      id: "hs_chest",
      label: "Locked Chest",
      shape: "rect",
      bounds: { x: 300, y: 340, w: 100, h: 70 },
      appearance: { fill: "#5a3a1a", stroke: "#3a2210", image: toDataUrl(svgs.chest) },
      zIndex: 2,
      visible: true,
      triggers: [
        {
          type: "useItem", requiredFlags: [], requiredItem: "item_old_key", once: true,
          actions: [
            { type: "removeItem", params: { itemId: "item_old_key" } },
            { type: "setFlag", params: { flag: "found_cipher", value: true } },
            { type: "giveItem", params: { itemId: "item_cipher_page" } },
            { type: "showMessage", params: { message: "The brass key fits the chest lock perfectly. Inside, you find an ancient cipher page with strange symbols." } }
          ]
        },
        {
          type: "tap", requiredFlags: ["found_cipher"], requiredItem: null,
          actions: [
            { type: "showMessage", params: { message: "The chest is open and empty." } }
          ]
        },
        {
          type: "tap", requiredFlags: [], requiredItem: null,
          actions: [
            { type: "showMessage", params: { message: "A heavy wooden chest with ornate carvings and a brass lock. It won't budge." } }
          ]
        }
      ]
    },
    {
      id: "hs_archway",
      label: "Archway",
      shape: "rect",
      bounds: { x: 500, y: 260, w: 100, h: 180 },
      appearance: { fill: "#4a3a20", stroke: "#3a2a10", image: toDataUrl(svgs.archway) },
      zIndex: 1,
      visible: true,
      triggers: [
        {
          type: "tap", requiredFlags: ["read_cipher"], requiredItem: null,
          actions: [
            { type: "triggerPuzzle", params: { puzzleId: "puzzle_archway" } }
          ]
        },
        {
          type: "tap", requiredFlags: [], requiredItem: null,
          actions: [
            { type: "showMessage", params: { message: "A stone archway leading into darkness. Ancient runes are carved around the frame, and there's a number dial embedded in the stone." } }
          ]
        }
      ]
    }
  ],
  items: [
    { id: "item_old_key", name: "Brass Key", description: "A tarnished brass key found behind a book.", icon: { shape: "key", color: "#aa8820" }, combinesWith: null, combineResult: null },
    { id: "item_cipher_page", name: "Cipher Page", description: "An ancient page with cryptic symbols.", icon: { shape: "rect", color: "#d4c4a0" }, combinesWith: null, combineResult: null }
  ],
  puzzles: [
    {
      id: "puzzle_archway",
      type: "combination",
      hotspotId: "hs_archway",
      prompt: "Enter the year the library was born:",
      solution: "1897",
      onSolve: [
        { type: "showMessage", params: { message: "The stone dial clicks into place. The runes glow blue, and the archway fills with light. You step through and escape!" } },
        { type: "gameWin", params: {} }
      ],
      onFail: [
        { type: "showMessage", params: { message: "The runes flash red. Wrong year. The answer is somewhere in this room..." } }
      ]
    }
  ],
  hints: [
    "Read the portrait plaque for a clue about the bookshelf.",
    "Pull the red book on the third shelf after reading the portrait.",
    "Use the brass key on the locked chest.",
    "Take the cipher page to the reading desk to decode it.",
    "The globe tells you the year: 1897. Enter it at the archway."
  ],
  onEnter: [
    { type: "showMessage", params: { message: "The heavy library doors swing shut. Dust motes dance in the firelight. Ancient secrets fill these shelves... and one of them is your way out." } }
  ]
};

const outPath = path.join(__dirname, '..', 'js', 'data', 'library.json');
fs.writeFileSync(outPath, JSON.stringify(room, null, 2) + '\n');
console.log('Generated library.json');
