/* Planimetria — vizatimet origjinale të projektit zbatues (NITI Construction),
   të pastruara për shfaqje në web. Asnjë gjeometri nuk rindërtohet: ajo që
   shihet është fleta e arkitektit.

   `hot` = zona e klikueshme mbi vizatim, në PËRQINDJE të përmasave të imazhit
   ({x, y, w, h}). Përdoret vetëm si objektiv klikimi mbi dhomën përkatëse.  */

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
    img: { src: 'assets/img/plan-perdhesa.png', w: 870, h: 1117 },
    blurb: 'Hapësirë ditore e hapur 555 cm e gjerë, me dritare 460 cm nga oborri. Poshtë saj dhoma e gjumit 285 × 400 dhe banjoja; shkallët ngjiten pranë murit të djathtë.',
    rooms: [
      { id: 'p-living', name: 'Qëndrimi Ditor', area: 24.35, perimeter: 1987.48, finish: 'Laminat', kind: 'living',
        hot: [{ x: 28.2, y: 7.7,  w: 44.0, h: 21.8 }] },
      { id: 'p-dining', name: 'Tryezaria',      area: 15.06, perimeter: 1699.26, finish: 'Laminat', kind: 'dining',
        hot: [{ x: 28.2, y: 29.5, w: 32.7, h: 23.9 }] },
      { id: 'p-stair',  name: 'Shkallët',       area: null,  perimeter: null,    finish: '—',       kind: 'stair',
        hot: [{ x: 61.0, y: 29.5, w: 11.2, h: 19.5 }] },
      { id: 'p-bath',   name: 'Banjo',          area: 3.02,  perimeter: 704.83,  finish: 'Keramik', kind: 'bath',
        hot: [{ x: 61.0, y: 49.0, w: 11.2, h: 12.8 }] },
      { id: 'p-bed',    name: 'Dhomë Gjumi',    area: 11.24, perimeter: 1359.09, finish: 'Laminat', kind: 'bedroom',
        hot: [{ x: 28.2, y: 54.1, w: 22.9, h: 25.2 }] }
    ]
  },

  {
    id: 'kati1',
    name: 'Kati 1',
    level: '+3.00',
    area: 71.95,
    perimeter: 3605.48,
    img: { src: 'assets/img/plan-kati1.png', w: 647, h: 1128 },
    blurb: 'Dy dhoma gjumi 330 cm të gjera — 495 dhe 483 cm të thella — banjo me vaskë, dhomë ndihmëse dhe dy ballkone: njëri nga oborri, tjetri nga rruga.',
    rooms: [
      { id: 'k1-balc-a', name: 'Ballkoni',    area: 5.12,  perimeter: 977.75,  finish: 'Keramik', kind: 'balcony',
        hot: [{ x: 21.2, y: 10.8, w: 25.9, h: 8.0  }] },
      { id: 'k1-util',   name: 'Utiliti',     area: 4.33,  perimeter: 835.21,  finish: 'Keramik', kind: 'utility',
        hot: [{ x: 51.0, y: 10.8, w: 21.6, h: 8.9  }] },
      { id: 'k1-bed1',   name: 'Dhomë Gjumi', area: 16.28, perimeter: 1650.48, finish: 'Laminat', kind: 'bedroom',
        hot: [{ x: 21.2, y: 20.2, w: 29.0, h: 21.5 }] },
      { id: 'k1-corr',   name: 'Korridori',   area: 6.94,  perimeter: 1455.52, finish: 'Laminat', kind: 'corridor',
        hot: [{ x: 51.8, y: 20.6, w: 11.6, h: 21.1 }] },
      { id: 'k1-stair',  name: 'Shkallët',    area: null,  perimeter: null,    finish: '—',       kind: 'stair',
        hot: [{ x: 63.4, y: 21.3, w: 9.2,  h: 20.4 }] },
      { id: 'k1-bed2',   name: 'Dhomë Gjumi', area: 15.30, perimeter: 1625.75, finish: 'Laminat', kind: 'bedroom',
        hot: [{ x: 21.2, y: 48.3, w: 29.0, h: 22.6 }] },
      { id: 'k1-bath',   name: 'Banjo',       area: 5.37,  perimeter: 1107.00, finish: 'Keramik', kind: 'bath',
        hot: [{ x: 51.8, y: 53.2, w: 20.8, h: 11.1 }] },
      { id: 'k1-balc-b', name: 'Ballkoni',    area: 3.39,  perimeter: 780.00,  finish: 'Keramik', kind: 'balcony',
        hot: [{ x: 51.8, y: 66.0, w: 20.8, h: 6.3  }] }
    ]
  },

  {
    id: 'kati2',
    name: 'Kati 2',
    level: '+6.00',
    area: 63.29,
    netArea: 56.67,
    perimeter: 3210.68,
    img: { src: 'assets/img/plan-kati2.png', w: 852, h: 1170 },
    blurb: 'Kati tërhiqet nga fasada: pjesa e mbyllur është 56,67 m², kurse pjesa e liruar bëhet tarracë 13,24 m² që mbështillet rreth qoshes ballore.',
    rooms: [
      { id: 'k2-balc',  name: 'Ballkoni',    area: 4.84,  perimeter: 944.99,  finish: 'Keramik', kind: 'balcony',
        hot: [{ x: 27.2, y: 2.1,  w: 26.2, h: 8.2  }] },
      { id: 'k2-util',  name: 'Utiliti',     area: 4.44,  perimeter: 845.22,  finish: 'Keramik', kind: 'utility',
        hot: [{ x: 56.3, y: 2.1,  w: 20.0, h: 8.6  }] },
      { id: 'k2-bed1',  name: 'Dhomë Gjumi', area: 12.43, perimeter: 1417.93, finish: 'Laminat', kind: 'bedroom',
        hot: [{ x: 27.2, y: 11.5, w: 26.8, h: 21.8 }] },
      { id: 'k2-corr',  name: 'Korridori',   area: 4.33,  perimeter: 935.71,  finish: 'Laminat', kind: 'corridor',
        hot: [{ x: 58.1, y: 20.1, w: 10.0, h: 17.5 }] },
      { id: 'k2-stair', name: 'Shkallët',    area: null,  perimeter: null,    finish: '—',       kind: 'stair',
        hot: [{ x: 68.1, y: 20.1, w: 8.8,  h: 17.5 }] },
      { id: 'k2-bath',  name: 'Banjo',       area: 5.33,  perimeter: null,    finish: 'Keramik', kind: 'bath', inferred: true,
        hot: [{ x: 58.1, y: 38.0, w: 18.2, h: 13.3 }] },
      { id: 'k2-bed2',  name: 'Dhomë Gjumi', area: 17.86, perimeter: 1889.81, finish: 'Laminat', kind: 'bedroom',
        hot: [{ x: 27.2, y: 39.3, w: 26.8, h: 21.4 }] },
      { id: 'k2-terr',  name: 'Tarraca',     area: 13.24, perimeter: 1968.94, finish: 'Keramik', kind: 'terrace',
        hot: [{ x: 54.6, y: 52.6, w: 22.3, h: 14.9 },
               { x: 27.2, y: 64.1, w: 27.4, h: 10.9 }] }
    ]
  }
];
