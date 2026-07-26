/* Gjeometria e kateve — centimetra, origjina në këndin e sipërm të majtë të
   gabaritit 600 × 1180. Ana e poshtme = fasada ballore.

   Përmasat janë MATUR mbi fletët origjinale me një rrjetë centimetrash të
   kalibruar sipas gabaritit, dhe janë verifikuar duke mbivendosur vizatimin
   vektorial mbi skanim (shih tools/overlay.html).                          */

export const BUILDING = {
  w: 600, h: 1180,
  wallExt: 20,      // mur ballor / i pasmë
  wallR: 25,        // mur i djathtë (i përbashkët)
  wallInt: 12,
  floorHeight: 300,
  clearHeight: 280
};

export const KIND = {
  living:   { fill: '#EEE2CF', label: 'Hapësirë ditore' },
  dining:   { fill: '#EEE2CF', label: 'Hapësirë ditore' },
  bedroom:  { fill: '#E5DED0', label: 'Dhomë gjumi' },
  bath:     { fill: '#D6E0DF', label: 'Nyje sanitare' },
  utility:  { fill: '#DEDACF', label: 'Ndihmëse' },
  corridor: { fill: '#EAE5DA', label: 'Qarkullim' },
  stair:    { fill: '#E4DDD0', label: 'Shkallë' },
  balcony:  { fill: '#C7D1CB', label: 'E jashtme' },
  terrace:  { fill: '#C7D1CB', label: 'E jashtme' }
};

export const FLOORS = [
  {
    id: 'perdhesa',
    name: 'Përdhesa',
    level: '+0.00',
    area: 68.47,
    perimeter: 3604.74,
    scan: 'assets/img/plan-perdhesa.png',
    blurb: 'Hapësirë ditore e hapur 555 × 728 cm me dritare 460 cm nga oborri. Poshtë saj dhoma e gjumit 285 × 400, banjoja 140 × 205 dhe korridori i hyrjes.',
    rooms: [
      { id: 'p-living', name: 'Qëndrimi Ditor', area: 24.35, perimeter: 1987.48, finish: 'Laminat', kind: 'living',
        x: 20, y: 20, w: 555, h: 390 },
      { id: 'p-dining', name: 'Tryezaria', area: 15.06, perimeter: 1699.26, finish: 'Laminat', kind: 'dining',
        x: 20, y: 410, w: 455, h: 338 },
      { id: 'p-corr', name: 'Korridori', area: null, perimeter: null, finish: 'Keramik', kind: 'corridor',
        x: 317, y: 760, w: 107, h: 228, extra: [{ x: 424, y: 917, w: 151, h: 71 }] },
      { id: 'p-bed', name: 'Dhomë Gjumi', area: 11.24, perimeter: 1359.09, finish: 'Laminat', kind: 'bedroom',
        x: 20, y: 760, w: 285, h: 400 },
      { id: 'p-bath', name: 'Banjo', area: 3.02, perimeter: 704.83, finish: 'Keramik', kind: 'bath',
        x: 436, y: 700, w: 139, h: 205 }
    ],
    stair: { x: 475, y: 330, w: 100, h: 360, dir: 'up', steps: 17 },
    walls: [
      { x: 20,  y: 748, w: 297, h: 12 },   // mur nën hapësirën ditore
      { x: 305, y: 760, w: 12,  h: 400 },  // dhomë gjumi / korridor
      { x: 424, y: 688, w: 12,  h: 300 },  // korridor / banjo
      { x: 436, y: 688, w: 139, h: 12 },   // banjo sipër
      { x: 436, y: 905, w: 139, h: 12 },   // banjo poshtë
      { x: 317, y: 988, w: 258, h: 12 }    // muri ballor i pjesës së tërhequr
    ],
    windows: [
      { x: 70,  y: 0,    w: 460, h: 20 },  // 70 | 460 | 70
      { x: 45,  y: 1160, w: 240, h: 20 }   // 45 | 240 | 45
    ],
    doors: [
      { x: 330, y: 988, w: 90, h: 12, type: 'entrance' },
      { hinge: [305, 850], r: 88, a0: 0,   a1: 90  },
      { hinge: [436, 745], r: 80, a0: 90,  a1: 180 }
    ],
    rails: [],
    recess: { x: 317, y: 1000, w: 283, h: 180 },
    outside: [
      { x: 0, y: -120, w: 600, h: 120, label: 'Oborr' },
      { x: 317, y: 1000, w: 283, h: 180, label: 'Hyrja' }
    ],
    dims: [
      { a: 70,  b: 530,  t: '460', axis: 'x' },
      { a: 20,  b: 748,  t: '728', axis: 'y' },
      { a: 760, b: 1160, t: '400', axis: 'y' }
    ]
  },

  {
    id: 'kati1',
    name: 'Kati 1',
    level: '+3.00',
    area: 71.95,
    perimeter: 3605.48,
    scan: 'assets/img/plan-kati1.png',
    blurb: 'Dy dhoma gjumi 330 cm të gjera — 495 dhe 452 cm të thella — banjo me vaskë 228 cm, dhomë ndihmëse dhe dy ballkone: njëri nga oborri, tjetri nga rruga.',
    rooms: [
      { id: 'k1-balc-a', name: 'Ballkoni', area: 5.12, perimeter: 977.75, finish: 'Keramik', kind: 'balcony',
        x: 20, y: 20, w: 302, h: 161 },
      { id: 'k1-util', name: 'Utiliti', area: 4.33, perimeter: 835.21, finish: 'Keramik', kind: 'utility',
        x: 352, y: 20, w: 226, h: 192 },
      { id: 'k1-bed1', name: 'Dhomë Gjumi', area: 16.28, perimeter: 1650.48, finish: 'Laminat', kind: 'bedroom',
        x: 20, y: 201, w: 330, h: 495 },
      { id: 'k1-corr', name: 'Korridori', area: 6.94, perimeter: 1455.52, finish: 'Laminat', kind: 'corridor',
        x: 362, y: 212, w: 122, h: 444 },
      { id: 'k1-bed2', name: 'Dhomë Gjumi', area: 15.30, perimeter: 1625.75, finish: 'Laminat', kind: 'bedroom',
        x: 20, y: 708, w: 330, h: 452 },
      { id: 'k1-bath', name: 'Banjo', area: 5.37, perimeter: 1107.00, finish: 'Keramik', kind: 'bath',
        x: 352, y: 845, w: 226, h: 235 },
      { id: 'k1-balc-b', name: 'Ballkoni', area: 3.39, perimeter: 780.00, finish: 'Keramik', kind: 'balcony',
        x: 352, y: 1092, w: 226, h: 88 }
    ],
    stair: { x: 484, y: 212, w: 94, h: 444, dir: 'both', steps: 17 },
    walls: [
      { x: 20,  y: 181, w: 302, h: 20 },
      { x: 322, y: 20,  w: 30,  h: 192 },
      { x: 350, y: 201, w: 12,  h: 959 },
      { x: 20,  y: 696, w: 330, h: 12 },
      { x: 362, y: 656, w: 216, h: 12 },
      { x: 362, y: 833, w: 216, h: 12 },
      { x: 362, y: 1080, w: 216, h: 12 }
    ],
    windows: [
      { x: 390, y: 0,    w: 150, h: 20 },
      { x: 60,  y: 1160, w: 240, h: 20 },
      { x: 60,  y: 181,  w: 200, h: 20 }
    ],
    rails: [
      { x: 20,  y: 0,    w: 302, h: 20 },
      { x: 352, y: 1160, w: 226, h: 20 }
    ],
    doors: [
      { hinge: [350, 330],  r: 88, a0: 90,  a1: 180 },
      { hinge: [350, 830],  r: 88, a0: 90,  a1: 180 },
      { hinge: [362, 900],  r: 80, a0: 270, a1: 360 },
      { hinge: [484, 200],  r: 80, a0: 0,   a1: 90  }
    ],
    outside: [],
    dims: [
      { a: 201, b: 696,  t: '495', axis: 'y' },
      { a: 708, b: 1160, t: '452', axis: 'y' },
      { a: 20,  b: 350,  t: '330', axis: 'x' }
    ]
  },

  {
    id: 'kati2',
    name: 'Kati 2',
    level: '+6.00',
    area: 63.29,
    netArea: 56.67,
    perimeter: 3210.68,
    scan: 'assets/img/plan-kati2.png',
    blurb: 'Kati tërhiqet nga fasada: pjesa e mbyllur mbaron rreth kuotës 940 cm, kurse pjesa e liruar bëhet tarracë 13,24 m² në formë L rreth qoshes ballore.',
    rooms: [
      { id: 'k2-balc', name: 'Ballkoni', area: 4.84, perimeter: 944.99, finish: 'Keramik', kind: 'balcony',
        x: 20, y: 20, w: 306, h: 150 },
      { id: 'k2-util', name: 'Utiliti', area: 4.44, perimeter: 845.22, finish: 'Keramik', kind: 'utility',
        x: 352, y: 20, w: 226, h: 197 },
      { id: 'k2-bed1', name: 'Dhomë Gjumi', area: 12.43, perimeter: 1417.93, finish: 'Laminat', kind: 'bedroom',
        x: 20, y: 190, w: 318, h: 391 },
      { id: 'k2-corr', name: 'Korridori', area: 4.33, perimeter: 935.71, finish: 'Laminat', kind: 'corridor',
        x: 350, y: 217, w: 126, h: 337 },
      { id: 'k2-bath', name: 'Banjo', area: 5.33, perimeter: null, finish: 'Keramik', kind: 'bath', inferred: true,
        x: 350, y: 566, w: 228, h: 236 },
      { id: 'k2-hall2', name: 'Qarkullim', area: null, perimeter: null, finish: 'Keramik', kind: 'corridor',
        x: 350, y: 814, w: 228, h: 114 },
      { id: 'k2-bed2', name: 'Dhomë Gjumi', area: 17.86, perimeter: 1889.81, finish: 'Laminat', kind: 'bedroom',
        x: 20, y: 593, w: 318, h: 335 },
      { id: 'k2-terr', name: 'Tarraca', area: 13.24, perimeter: 1968.94, finish: 'Keramik', kind: 'terrace',
        x: 20, y: 940, w: 558, h: 220 }
    ],
    stair: { x: 476, y: 217, w: 102, h: 337, dir: 'down', steps: 17 },
    walls: [
      { x: 20,  y: 170, w: 306, h: 20 },
      { x: 338, y: 190, w: 12,  h: 391 },
      { x: 350, y: 554, w: 228, h: 12 },
      { x: 20,  y: 581, w: 318, h: 12 },
      { x: 338, y: 593, w: 12,  h: 335 },
      { x: 350, y: 802, w: 228, h: 12 },
      { x: 20,  y: 928, w: 558, h: 12 }
    ],
    windows: [
      { x: 390, y: 0,   w: 150, h: 20 },
      { x: 60,  y: 170, w: 200, h: 20 },
      { x: 60,  y: 940, w: 200, h: 12 }
    ],
    rails: [
      { x: 20,  y: 0,    w: 306, h: 20 },
      { x: 0,   y: 1160, w: 600, h: 20 },
      { x: 0,   y: 940,  w: 20,  h: 240 },
      { x: 578, y: 940,  w: 22,  h: 240 }
    ],
    doors: [
      { hinge: [338, 320], r: 88, a0: 90,  a1: 180 },
      { hinge: [338, 700], r: 88, a0: 90,  a1: 180 },
      { hinge: [362, 620], r: 80, a0: 270, a1: 360 },
      { hinge: [476, 205], r: 80, a0: 0,   a1: 90  }
    ],
    outside: [],
    dims: [
      { a: 190, b: 581,  t: '391', axis: 'y' },
      { a: 952, b: 1160, t: '208', axis: 'y' },
      { a: 20,  b: 338,  t: '318', axis: 'x' }
    ]
  }
];
