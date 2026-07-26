/* Gjeometria e kateve — të gjitha përmasat në centimetra.
   Origjina: këndi i sipërm i majtë i gabaritit të jashtëm (600 × 1180 cm).
   Ana e poshtme e planit = fasada ballore (rruga). */

export const BUILDING = { w: 600, h: 1180, wall: 20, floorHeight: 300 };

export const KIND = {
  living:   { fill: '#EDE2D2', label: 'Hapësirë ditore' },
  dining:   { fill: '#EDE2D2', label: 'Hapësirë ditore' },
  bedroom:  { fill: '#E4DED2', label: 'Dhomë gjumi' },
  bath:     { fill: '#D9E1E0', label: 'Nyje sanitare' },
  utility:  { fill: '#DFDCD4', label: 'Ndihmëse' },
  corridor: { fill: '#E9E5DC', label: 'Qarkullim' },
  entry:    { fill: '#E9E5DC', label: 'Hyrje' },
  balcony:  { fill: '#CBD3CC', label: 'E jashtme' },
  terrace:  { fill: '#CBD3CC', label: 'E jashtme' },
  stair:    { fill: '#E3DDD1', label: 'Shkallë' }
};

export const FLOORS = [
  {
    id: 'perdhesa',
    name: 'Përdhesa',
    level: '+0.00',
    area: 68.47,
    blurb: 'Hapësira ditore e hapur me dalje në oborr, një dhomë gjumi, banjo dhe erëmbrojtësi në hyrje.',
    rooms: [
      { id: 'p-living',  name: 'Qëndrimi Ditor', area: 24.35, perimeter: 1987.48, finish: 'Laminat', kind: 'living',   x: 20,  y: 20,   w: 555, h: 439 },
      { id: 'p-dining',  name: 'Tryezaria',      area: 15.06, perimeter: 1699.26, finish: 'Laminat', kind: 'dining',   x: 20,  y: 459,  w: 440, h: 291 },
      { id: 'p-hall',    name: 'Korridor',       area: null,  perimeter: null,    finish: 'Keramik', kind: 'corridor', x: 317, y: 762,  w: 116, h: 217 },
      { id: 'p-bed',     name: 'Dhomë Gjumi',    area: 11.24, perimeter: 1359.09, finish: 'Laminat', kind: 'bedroom',  x: 20,  y: 762,  w: 285, h: 398 },
      { id: 'p-bath',    name: 'Banjo',          area: 3.02,  perimeter: 704.83,  finish: 'Keramik', kind: 'bath',     x: 433, y: 762,  w: 147, h: 205 },
      { id: 'p-entry',   name: 'Erëmbrojtësi',   area: 4.66,  perimeter: 1037.00, finish: 'Keramik', kind: 'entry',    x: 317, y: 979,  w: 263, h: 181 }
    ],
    stair: { x: 460, y: 470, w: 120, h: 280, dir: 'up', steps: 14 },
    walls: [
      { x: 20,  y: 750, w: 440, h: 12 },
      { x: 305, y: 762, w: 12,  h: 398 },
      { x: 421, y: 762, w: 12,  h: 217 },
      { x: 433, y: 967, w: 147, h: 12 },
      { x: 460, y: 750, w: 120, h: 12 }
    ],
    windows: [
      { x: 60,  y: 0,    w: 190, h: 20 },
      { x: 320, y: 0,    w: 200, h: 20 },
      { x: 40,  y: 1160, w: 240, h: 20 }
    ],
    rails: [],
    doors: [
      { x: 430, y: 1160, w: 100, h: 20, type: 'entrance', swing: 'in-up' },
      { hinge: [305, 840], r: 85, a0: 0,   a1: 90  },
      { hinge: [433, 800], r: 80, a0: 90,  a1: 180 },
      { hinge: [421, 979], r: 80, a0: 180, a1: 270 }
    ],
    outside: [
      { x: 0, y: -110, w: 600, h: 110, label: 'Oborr / tarracë' },
      { x: 0, y: 1180, w: 600, h: 90,  label: 'Hyrje / parkim' }
    ]
  },

  {
    id: 'kati1',
    name: 'Kati 1',
    level: '+3.00',
    area: 71.95,
    blurb: 'Dy dhoma gjumi, banjo e plotë me vaskë, dhomë ndihmëse dhe dy ballkone — një nga pas, një nga fasada.',
    rooms: [
      { id: 'k1-balc-a', name: 'Ballkoni',    area: 5.12,  perimeter: 977.75,  finish: 'Keramik', kind: 'balcony',  x: 20,  y: 20,   w: 306, h: 150 },
      { id: 'k1-util',   name: 'Utiliti',     area: 4.33,  perimeter: 835.21,  finish: 'Keramik', kind: 'utility',  x: 352, y: 20,   w: 228, h: 192 },
      { id: 'k1-bed1',   name: 'Dhomë Gjumi', area: 16.28, perimeter: 1650.48, finish: 'Laminat', kind: 'bedroom',  x: 20,  y: 182,  w: 330, h: 495 },
      { id: 'k1-corr',   name: 'Korridori',   area: 6.94,  perimeter: 1455.52, finish: 'Laminat', kind: 'corridor', x: 362, y: 224,  w: 218, h: 464 },
      { id: 'k1-hall2',  name: 'Qarkullim',   area: null,  perimeter: null,    finish: 'Keramik', kind: 'corridor', x: 352, y: 948,  w: 228, h: 69 },
      { id: 'k1-bath',   name: 'Banjo',       area: 5.37,  perimeter: 1107.00, finish: 'Keramik', kind: 'bath',     x: 362, y: 700,  w: 218, h: 236 },
      { id: 'k1-bed2',   name: 'Dhomë Gjumi', area: 15.30, perimeter: 1625.75, finish: 'Laminat', kind: 'bedroom',  x: 20,  y: 689,  w: 330, h: 471 },
      { id: 'k1-balc-b', name: 'Ballkoni',    area: 3.39,  perimeter: 780.00,  finish: 'Keramik', kind: 'balcony',  x: 352, y: 1029, w: 228, h: 131 }
    ],
    stair: { x: 470, y: 224, w: 110, h: 337, dir: 'both', steps: 16 },
    walls: [
      { x: 20,  y: 170, w: 306, h: 12 },
      { x: 350, y: 182, w: 12,  h: 506 },
      { x: 20,  y: 677, w: 330, h: 12 },
      { x: 352, y: 688, w: 228, h: 12 },
      { x: 350, y: 700, w: 12,  h: 236 },
      { x: 362, y: 936, w: 218, h: 12 },
      { x: 352, y: 1017, w: 228, h: 12 }
    ],
    windows: [
      { x: 390, y: 0,    w: 150, h: 20 },
      { x: 60,  y: 1160, w: 240, h: 20 },
      { x: 40,  y: 170,  w: 240, h: 12 },
      { x: 380, y: 1017, w: 170, h: 12 }
    ],
    rails: [
      { x: 20,  y: 0,    w: 306, h: 20 },
      { x: 352, y: 1160, w: 228, h: 20 }
    ],
    doors: [
      { hinge: [350, 300],  r: 85, a0: 90,  a1: 180 },
      { hinge: [350, 800],  r: 85, a0: 90,  a1: 180 },
      { hinge: [362, 760],  r: 80, a0: 270, a1: 360 },
      { hinge: [470, 212],  r: 80, a0: 0,   a1: 90  }
    ],
    outside: []
  },

  {
    id: 'kati2',
    name: 'Kati 2',
    level: '+6.00',
    area: 63.29,
    blurb: 'Dy dhoma gjumi — njëra kryesore me 17.86 m² — plus tarraca e madhe e tërhequr nga fasada.',
    rooms: [
      { id: 'k2-balc',  name: 'Ballkoni',    area: 4.84,  perimeter: 944.99,  finish: 'Keramik', kind: 'balcony',  x: 20,  y: 20,  w: 306, h: 150 },
      { id: 'k2-util',  name: 'Utiliti',     area: 4.44,  perimeter: 845.22,  finish: 'Keramik', kind: 'utility',  x: 352, y: 20,  w: 227, h: 196 },
      { id: 'k2-bed1',  name: 'Dhomë Gjumi', area: 12.43, perimeter: 1417.93, finish: 'Laminat', kind: 'bedroom',  x: 20,  y: 228, w: 318, h: 391 },
      { id: 'k2-corr',  name: 'Korridori',   area: 4.33,  perimeter: 935.71,  finish: 'Laminat', kind: 'corridor', x: 350, y: 228, w: 230, h: 337 },
      { id: 'k2-bath',  name: 'Banjo',       area: 5.33,  perimeter: null,    finish: 'Keramik', kind: 'bath',     x: 352, y: 577, w: 226, h: 236, inferred: true },
      { id: 'k2-bed2',  name: 'Dhomë Gjumi', area: 17.86, perimeter: 1889.81, finish: 'Laminat', kind: 'bedroom',  x: 20,  y: 631, w: 330, h: 529 },
      { id: 'k2-terr',  name: 'Tarraca',     area: 13.24, perimeter: 1960.34, finish: 'Keramik', kind: 'terrace',  x: 352, y: 825, w: 228, h: 335 }
    ],
    stair: { x: 476, y: 228, w: 104, h: 337, dir: 'down', steps: 16 },
    walls: [
      { x: 20,  y: 170, w: 306, h: 12 },
      { x: 338, y: 228, w: 12,  h: 391 },
      { x: 350, y: 565, w: 230, h: 12 },
      { x: 20,  y: 619, w: 330, h: 12 },
      { x: 350, y: 577, w: 12,  h: 236 },
      { x: 352, y: 813, w: 228, h: 12 }
    ],
    windows: [
      { x: 390, y: 0,    w: 150, h: 20 },
      { x: 60,  y: 1160, w: 240, h: 20 },
      { x: 40,  y: 170,  w: 240, h: 12 },
      { x: 380, y: 813,  w: 170, h: 12 }
    ],
    rails: [
      { x: 20,  y: 0,    w: 306, h: 20 },
      { x: 352, y: 1160, w: 228, h: 20 },
      { x: 580, y: 825,  w: 20,  h: 335 }
    ],
    doors: [
      { hinge: [338, 320], r: 85, a0: 90,  a1: 180 },
      { hinge: [350, 700], r: 85, a0: 90,  a1: 180 },
      { hinge: [362, 620], r: 80, a0: 270, a1: 360 },
      { hinge: [476, 216], r: 80, a0: 0,   a1: 90  }
    ],
    outside: []
  }
];
