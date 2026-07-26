/* Gjeometria e kateve — të gjitha përmasat në centimetra.
   Origjina: këndi i sipërm i majtë i gabaritit të jashtëm (600 × 1180 cm).
   Ana e poshtme e planit = fasada ballore (rruga).

   Përmasat janë marrë nga zinxhirët e kuotave të projektit zbatues, jo nga
   matje mbi foto. Kontrollet që mbyllen saktësisht:
     gjerësia : 25 (mur i përbashkët) + 555 (i lirë) + 20 = 600
     gjatësia : 20 + 728 + 12 + 400 + 20 = 1180        (përdhesa)
     kati 1   : 20 + 167 + 12 + 495 + 12 + 454 + 20 = 1180
*/

export const BUILDING = {
  w: 600, h: 1180,
  wallExt: 20,          // mur i jashtëm ballor / i pasmë
  wallParty: 25,        // mur i përbashkët me shtëpinë ngjitur (majtas)
  wallInt: 12,          // mure ndarëse
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
  entry:    { fill: '#EAE5DA', label: 'Hyrje' },
  balcony:  { fill: '#C7D1CB', label: 'E jashtme' },
  terrace:  { fill: '#C7D1CB', label: 'E jashtme' },
  stair:    { fill: '#E4DDD0', label: 'Shkallë' }
};

export const FLOORS = [
  {
    id: 'perdhesa',
    name: 'Përdhesa',
    level: '+0.00',
    area: 68.47,
    perimeter: 3604.74,
    blurb: 'Hapësira ditore e hapur 555 cm e gjerë dhe 728 cm e thellë, me dritare 460 cm nga oborri. Poshtë saj: dhoma e gjumit 285 × 400, banjo dhe erëmbrojtësi i hyrjes.',
    rooms: [
      { id: 'p-living', name: 'Qëndrimi Ditor', area: 24.35, perimeter: 1987.48, finish: 'Laminat', kind: 'living',   x: 25,  y: 20,   w: 555, h: 391,
        note: 'Pjesë e hapësirës së vetme ditore 555 × 728 cm — pa mur ndarës me tryezarinë.' },
      { id: 'p-dining', name: 'Tryezaria',      area: 15.06, perimeter: 1699.26, finish: 'Laminat', kind: 'dining',   x: 25,  y: 411,  w: 445, h: 337 },
      { id: 'p-hall',   name: 'Korridor',       area: null,  perimeter: null,    finish: 'Keramik', kind: 'corridor', x: 322, y: 760,  w: 111, h: 220 },
      { id: 'p-bed',    name: 'Dhomë Gjumi',    area: 11.24, perimeter: 1359.09, finish: 'Laminat', kind: 'bedroom',  x: 25,  y: 760,  w: 285, h: 400 },
      { id: 'p-bath',   name: 'Banjo',          area: 3.02,  perimeter: 704.83,  finish: 'Keramik', kind: 'bath',     x: 433, y: 760,  w: 147, h: 205 },
      { id: 'p-entry',  name: 'Erëmbrojtësi',   area: 4.66,  perimeter: 1037.00, finish: 'Keramik', kind: 'entry',    x: 322, y: 980,  w: 258, h: 180 }
    ],
    stair: { x: 470, y: 411, w: 110, h: 337, dir: 'up', steps: 16 },
    walls: [
      { x: 25,  y: 748, w: 555, h: 12 },
      { x: 310, y: 760, w: 12,  h: 400 },
      { x: 421, y: 760, w: 12,  h: 220 },
      { x: 433, y: 965, w: 147, h: 15 }
    ],
    windows: [
      { x: 70,  y: 0,    w: 460, h: 20 },   // 70 | 460 | 70
      { x: 45,  y: 1160, w: 240, h: 20 }    // 45 | 240 | 45 | 273
    ],
    doors: [
      { x: 400, y: 1160, w: 100, h: 20, type: 'entrance' },
      { hinge: [310, 845], r: 88, a0: 0,   a1: 90  },
      { hinge: [433, 800], r: 82, a0: 90,  a1: 180 },
      { hinge: [421, 980], r: 82, a0: 180, a1: 270 }
    ],
    rails: [],
    outside: [
      { x: 0, y: -120, w: 600, h: 120, label: 'Oborr / tarracë' },
      { x: 330, y: 1180, w: 270, h: 100, label: 'Hyrja' }
    ],
    dims: [
      { a: [70, -60],  b: [530, -60],  t: '460', axis: 'x' },
      { a: [25, 20],   b: [25, 748],   t: '728', axis: 'y' },
      { a: [25, 760],  b: [25, 1160],  t: '400', axis: 'y' }
    ]
  },

  {
    id: 'kati1',
    name: 'Kati 1',
    level: '+3.00',
    area: 71.95,
    perimeter: 3605.48,
    blurb: 'Dy dhoma gjumi 330 cm të gjera — 495 dhe 454 cm të thella — banjo me vaskë, dhomë ndihmëse dhe dy ballkone, njëri nga oborri e tjetri nga rruga.',
    rooms: [
      { id: 'k1-balc-a', name: 'Ballkoni',    area: 5.12,  perimeter: 977.75,  finish: 'Keramik', kind: 'balcony',  x: 25,  y: 20,   w: 306, h: 167 },
      { id: 'k1-util',   name: 'Utiliti',     area: 4.33,  perimeter: 835.21,  finish: 'Keramik', kind: 'utility',  x: 352, y: 20,   w: 228, h: 192 },
      { id: 'k1-bed1',   name: 'Dhomë Gjumi', area: 16.28, perimeter: 1650.48, finish: 'Laminat', kind: 'bedroom',  x: 25,  y: 199,  w: 330, h: 495 },
      { id: 'k1-corr',   name: 'Korridori',   area: 6.94,  perimeter: 1455.52, finish: 'Laminat', kind: 'corridor', x: 367, y: 212,  w: 213, h: 482 },
      { id: 'k1-bath',   name: 'Banjo',       area: 5.37,  perimeter: 1107.00, finish: 'Keramik', kind: 'bath',     x: 352, y: 706,  w: 228, h: 236 },
      { id: 'k1-bed2',   name: 'Dhomë Gjumi', area: 15.30, perimeter: 1625.75, finish: 'Laminat', kind: 'bedroom',  x: 25,  y: 706,  w: 330, h: 454 },
      { id: 'k1-hall2',  name: 'Qarkullim',   area: null,  perimeter: null,    finish: 'Keramik', kind: 'corridor', x: 367, y: 954,  w: 213, h: 58  },
      { id: 'k1-balc-b', name: 'Ballkoni',    area: 3.39,  perimeter: 780.00,  finish: 'Keramik', kind: 'balcony',  x: 352, y: 1012, w: 228, h: 148 }
    ],
    stair: { x: 470, y: 224, w: 110, h: 337, dir: 'both', steps: 16 },
    walls: [
      { x: 25,  y: 187,  w: 306, h: 12 },
      { x: 331, y: 20,   w: 21,  h: 192 },
      { x: 355, y: 199,  w: 12,  h: 961 },
      { x: 25,  y: 694,  w: 330, h: 12 },
      { x: 367, y: 694,  w: 213, h: 12 },
      { x: 367, y: 942,  w: 213, h: 12 },
      { x: 367, y: 1000, w: 213, h: 12 }
    ],
    windows: [
      { x: 390, y: 0,    w: 150, h: 20 },
      { x: 60,  y: 1160, w: 240, h: 20 },
      { x: 60,  y: 187,  w: 200, h: 12 },
      { x: 400, y: 1000, w: 130, h: 12 }
    ],
    rails: [
      { x: 25,  y: 0,    w: 306, h: 20 },
      { x: 352, y: 1160, w: 228, h: 20 }
    ],
    doors: [
      { hinge: [355, 320],  r: 88, a0: 90,  a1: 180 },
      { hinge: [355, 820],  r: 88, a0: 90,  a1: 180 },
      { hinge: [367, 766],  r: 82, a0: 270, a1: 360 },
      { hinge: [470, 212],  r: 82, a0: 0,   a1: 90  }
    ],
    outside: [],
    dims: [
      { a: [25, 199], b: [25, 694],  t: '495', axis: 'y' },
      { a: [25, 706], b: [25, 1160], t: '454', axis: 'y' },
      { a: [25, 20],  b: [355, 20],  t: '330', axis: 'x' }
    ]
  },

  {
    id: 'kati2',
    name: 'Kati 2',
    level: '+6.00',
    area: 63.29,
    netArea: 56.67,
    perimeter: 3210.68,
    blurb: 'Kati tërhiqet nga fasada: pjesa e mbyllur zë rreth 9,4 m nga 11,8 m e thellësisë, dhe pjesa e mbetur bëhet tarracë 13,24 m² mbi çatinë e katit të parë.',
    rooms: [
      { id: 'k2-balc',  name: 'Ballkoni',    area: 4.84,  perimeter: 944.99,  finish: 'Keramik', kind: 'balcony',  x: 25,  y: 20,  w: 306, h: 158 },
      { id: 'k2-util',  name: 'Utiliti',     area: 4.44,  perimeter: 845.22,  finish: 'Keramik', kind: 'utility',  x: 354, y: 20,  w: 226, h: 197 },
      { id: 'k2-bed1',  name: 'Dhomë Gjumi', area: 12.43, perimeter: 1417.93, finish: 'Laminat', kind: 'bedroom',  x: 25,  y: 190, w: 318, h: 391 },
      { id: 'k2-corr',  name: 'Korridori',   area: 4.33,  perimeter: 935.71,  finish: 'Laminat', kind: 'corridor', x: 355, y: 217, w: 225, h: 337 },
      { id: 'k2-bath',  name: 'Banjo',       area: 5.33,  perimeter: null,    finish: 'Keramik', kind: 'bath',     x: 354, y: 593, w: 226, h: 236, inferred: true },
      { id: 'k2-hall2', name: 'Qarkullim',   area: null,  perimeter: null,    finish: 'Keramik', kind: 'corridor', x: 354, y: 841, w: 226, h: 87  },
      { id: 'k2-bed2',  name: 'Dhomë Gjumi', area: 17.86, perimeter: 1889.81, finish: 'Laminat', kind: 'bedroom',  x: 25,  y: 593, w: 318, h: 335 },
      { id: 'k2-terr',  name: 'Tarraca',     area: 13.24, perimeter: 1960.34, finish: 'Keramik', kind: 'terrace',  x: 25,  y: 940, w: 555, h: 240 }
    ],
    stair: { x: 481, y: 217, w: 99, h: 337, dir: 'down', steps: 16 },
    walls: [
      { x: 25,  y: 178, w: 306, h: 12 },
      { x: 343, y: 190, w: 12,  h: 391 },
      { x: 355, y: 554, w: 225, h: 12 },
      { x: 25,  y: 581, w: 318, h: 12 },
      { x: 343, y: 593, w: 11,  h: 335 },
      { x: 354, y: 829, w: 226, h: 12 },
      { x: 25,  y: 928, w: 555, h: 12 }
    ],
    windows: [
      { x: 390, y: 0,   w: 150, h: 20 },
      { x: 60,  y: 178, w: 200, h: 12 },
      { x: 60,  y: 928, w: 200, h: 12 },
      { x: 400, y: 928, w: 140, h: 12 }
    ],
    rails: [
      { x: 25,  y: 0,    w: 306, h: 20 },
      { x: 25,  y: 1160, w: 555, h: 20 },
      { x: 580, y: 940,  w: 20,  h: 240 },
      { x: 0,   y: 940,  w: 25,  h: 240 }
    ],
    doors: [
      { hinge: [343, 320], r: 88, a0: 90,  a1: 180 },
      { hinge: [343, 700], r: 88, a0: 90,  a1: 180 },
      { hinge: [366, 640], r: 82, a0: 270, a1: 360 },
      { hinge: [481, 205], r: 82, a0: 0,   a1: 90  }
    ],
    outside: [],
    dims: [
      { a: [25, 190], b: [25, 581],  t: '391', axis: 'y' },
      { a: [25, 940], b: [25, 1180], t: '240', axis: 'y' },
      { a: [25, 20],  b: [343, 20],  t: '318', axis: 'x' }
    ]
  }
];
