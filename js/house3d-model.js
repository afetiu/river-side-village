/* Modeli tredimensional i shtëpisë — Modeli 2, Nr. 7
   ══════════════════════════════════════════════════

   Të gjitha përmasat janë në METRA dhe janë nxjerrë nga projekti zbatues i
   NITI Construction (skanimet te src-images/scans/):

     gabariti          6,00 × 11,80 m
     kati me kat       3,00 m  (2,80 m i lirë + 0,20 m pllakë)
     muri i jashtëm    0,25 m      muri ndarës  0,12 m
     nivelet           +0.00 · +3.00 · +6.00 · atika +9.00 · kulmi +10.00

   Sistemi i koordinatave — i njëjtë me planet:

        X: 0 majtas ─────────────────► 6,00 djathtas   (parë nga rruga)
        Z: 0 PARA (rruga) ───────────► 11,80 PRAPA (kopshti)
        Y: 0 dyshemeja e përdhesës ──► lart

   Çdo kat jepet me bazën e vet (`base`), prandaj koordinatat brenda një kati
   fillojnë nga 0. Muret shkruhen si segmente me vrima (dritare/dyer) — shih
   `wall()` më poshtë; gjeometria ndërtohet te js/house3d.js.

   ⚠ Sipërfaqet e dhomave te data.json janë ato të arkitektit dhe mbeten
   burimi zyrtar. Në katin e dytë etiketat e renderit nuk përputhen me vetë
   vizatimin e tij; aty gjeometria ndjek gabaritin e matur, jo etiketat.     */

export const W = 6.00;          // gjerësia
export const D = 11.80;         // thellësia
export const FH = 3.00;         // kat me kat
export const CH = 2.80;         // lartësia e lirë
export const SLAB = 0.20;       // trashësia e pllakës
export const TE = 0.25;         // mur i jashtëm
export const TI = 0.12;         // mur ndarës

/* ── ndihmësa ────────────────────────────────────────────────────────── */

/** Mur nga (x1,z1) te (x2,z2). `h` lartësia, `holes` vrimat përgjatë tij. */
const wall = (x1, z1, x2, z2, t = TE, h = CH, mat = 'ext', holes = [], y = 0) =>
  ({ x1, z1, x2, z2, t, h, mat, holes, y });

const ext = (x1, z1, x2, z2, holes = [], h = CH) => wall(x1, z1, x2, z2, TE, h, 'ext', holes);
const int = (x1, z1, x2, z2, holes = [], h = CH) => wall(x1, z1, x2, z2, TI, h, 'int', holes);
/** Parapet ballkoni / tarrace — mur i ulët 1,10 m. */
const para = (x1, z1, x2, z2, t = 0.18) => wall(x1, z1, x2, z2, t, 1.10, 'para', []);

/** Vrima përgjatë murit: `at` = largësia nga (x1,z1). */
const win = (at, w, sill = 0.90, head = 2.35) => ({ at, w, sill, head, type: 'window' });
const door = (at, w = 0.85, head = 2.05) => ({ at, w, sill: 0, head, type: 'door' });
const entry = (at, w = 1.00, head = 2.20) => ({ at, w, sill: 0, head, type: 'entry' });
const slide = (at, w, head = 2.35) => ({ at, w, sill: 0, head, type: 'slider' });
const louvre = (at, w, head = 2.20) => ({ at, w, sill: 0, head, type: 'louvre' });
/** Kalim pa derë. */
const gap = (at, w, head = 2.20) => ({ at, w, sill: 0, head, type: 'open' });

/** Dyshemeja e një zone. `mat`: laminat | keramik | banjo | jashtë. */
const slab = (x, z, w, d, mat = 'laminat') => ({ x, z, w, d, mat });

/* pozicioni i shkallëve — i njëjtë në të tri katet, që të puqen vertikalisht */
export const STAIR = { x: 4.45, z: 4.60, w: 1.30, run: 3.40, steps: 17 };

/* Pika ku nis ecja në secilin kat — një vend i lirë nga mobiliet.
   `yaw` në gradë:  0 = nga rruga · 90 = majtas · 180 = nga kopshti · 270 = djathtas */
const spawn = (x, z, yaw) => ({ x, z, yaw });

/* ── PËRDHESA  +0.00 ─────────────────────────────────────────────────── */
/* Hyrja është e tërhequr 1,40 m — poshtë ballkonit të katit I.
   Dhoma e gjumit ballore 2,85 × 3,94 (11,24 m²), banjo 1,55 × 1,95 (3,02),
   erëmbrojtësi i mbuluar 2,35 × 1,40 (3,07), qëndrimi ditor + tryezaria
   në pjesën e prapme, e hapur nga muri në mur (39,41 m²).                 */

const L0 = {
  id: 'perdhesa', name: 'Përdhesa', level: '+0.00', base: 0, area: '68,47 m²',
  slabs: [
    slab(0, 0, W, D, 'plate'),                       // pllaka e katit
    slab(0.25, 4.36, 5.50, 7.19, 'laminat'),         // qëndrimi ditor + tryezaria
    slab(0.25, 0.25, 2.85, 3.99, 'laminat'),         // dhoma e gjumit
    slab(3.22, 0.25, 0.92, 4.05, 'keramik'),         // korridori
    slab(4.20, 1.65, 1.55, 1.95, 'banjo'),           // banjo
    slab(3.40, 0.00, 2.35, 1.40, 'keramik'),         // erëmbrojtësi (i mbuluar)
  ],
  walls: [
    /* muret e jashtme */
    ext(0.125, 0, 0.125, D),                                              // majtas (mur i përbashkët)
    ext(W - 0.125, 0, W - 0.125, D),                                      // djathtas (mur i përbashkët)
    ext(0, D - 0.125, W, D - 0.125, [slide(0.60, 3.00), win(4.30, 1.20)]), // prapa — dalje në kopsht
    ext(0, 0.125, 3.40, 0.125, [win(0.50, 2.40, 0.30, 2.40)]),            // para majtas — dritarja e dhomës
    ext(3.275, 0, 3.275, 1.40),                                           // faqja e erëmbrojtësit
    ext(3.40, 1.525, W, 1.525, [entry(0.55, 1.00), louvre(1.85, 0.70)]),  // hyrja e tërhequr

    /* ndarjet */
    int(3.16, 0.25, 3.16, 4.36, [door(2.55)]),                            // dhoma ↔ korridori
    int(0.125, 4.30, 3.22, 4.30),                                         // dhoma ↔ qëndrimi ditor
    int(4.14, 1.60, 4.14, 3.72, [door(1.20, 0.75)]),                      // banjo, faqja majtas
    int(4.14, 3.66, W, 3.66),                                             // banjo, faqja prapa
    int(3.22, 4.30, 4.20, 4.30, [gap(0.10, 0.90)]),                       // korridori ↔ qëndrimi ditor
  ],
  stair: { ...STAIR, up: true },
  spawn: spawn(3.60, 6.20, 180),    // mes qëndrimit ditor, nga kopshti
  rails: [],
  furniture: [
    /* dhoma e gjumit ballore */
    { t: 'bed', x: 0.62, z: 0.60, w: 1.60, d: 2.05, rot: 0 },
    { t: 'nightstand', x: 2.32, z: 0.62, rot: 0 },
    { t: 'wardrobe', x: 0.25, z: 3.58, w: 2.85, d: 0.60, rot: 0 },

    /* banjo */
    { t: 'wc', x: 5.34, z: 1.78, rot: 90 },
    { t: 'basin', x: 4.28, z: 1.72, rot: 0 },
    { t: 'shower', x: 4.26, z: 2.62, w: 0.92, d: 0.92 },

    /* qëndrimi ditor — divani nga kopshti, qilimi poshtë tij */
    { t: 'rug', x: 0.45, z: 6.30, w: 2.60, d: 3.10 },
    { t: 'sofa', x: 0.42, z: 8.55, w: 2.35, d: 0.95, rot: 0 },
    { t: 'armchair', x: 0.55, z: 6.35, w: 0.82, d: 0.80, rot: 270 },
    { t: 'armchair', x: 2.20, z: 6.35, w: 0.82, d: 0.80, rot: 270 },
    { t: 'table', x: 1.05, z: 7.40, w: 1.15, d: 0.62, h: 0.40 },
    { t: 'tvunit', x: 3.55, z: 6.55, w: 1.60, rot: 90 },
    { t: 'plant', x: 0.45, z: 10.55 },

    /* tryezaria */
    { t: 'table', x: 1.00, z: 4.70, w: 1.75, d: 0.95, h: 0.75 },
    { t: 'pendant', x: 1.88, z: 5.18, h: 1.55 },
    { t: 'chair', x: 1.10, z: 4.26, rot: 0 }, { t: 'chair', x: 1.85, z: 4.26, rot: 0 },
    { t: 'chair', x: 1.10, z: 5.72, rot: 180 }, { t: 'chair', x: 1.85, z: 5.72, rot: 180 },
    { t: 'chair', x: 0.50, z: 4.98, rot: 90 }, { t: 'chair', x: 2.53, z: 4.98, rot: 270 },

    /* kuzhina — përgjatë murit të djathtë prapa */
    { t: 'counter', x: 5.12, z: 8.10, w: 0.63, d: 3.30, rot: 0 },
    { t: 'sink', x: 5.18, z: 9.10, rot: 90 },
    { t: 'hob', x: 5.16, z: 10.30, rot: 90 },
    { t: 'counter', x: 3.30, z: 10.95, w: 1.80, d: 0.62, rot: 0 },
  ],
};

/* ── KATI I  +3.00 ───────────────────────────────────────────────────── */
/* Dy dhoma gjumi majtas (15,30 + 16,28 m²) me nishe rrobash mes tyre,
   banjo 5,37 m² dhe utiliti 4,33 m² djathtas, ballkon ballor 3,39 m² i
   mbyllur me grila mbi hyrje dhe ballkon i prapmë 5,12 m² nga kopshti.     */

const L1 = {
  id: 'kati1', name: 'Kati 1', level: '+3.00', base: FH, area: '71,95 m²',
  slabs: [
    slab(0, 0, W, D, 'plate'),
    slab(0.25, 0.25, 3.17, 4.83, 'laminat'),        // dhoma e gjumit ballore 15,30
    slab(0.25, 5.20, 3.17, 4.95, 'laminat'),        // dhoma e gjumit e prapme 16,28
    slab(0.00, 10.35, 3.60, 1.45, 'jashte'),        // ballkoni i prapmë 5,12
    slab(3.42, 0.00, 2.33, 1.45, 'jashte'),         // ballkoni ballor 3,39
    slab(3.54, 1.70, 2.21, 2.45, 'banjo'),          // banjo 5,37
    slab(3.54, 4.27, 2.21, 5.43, 'laminat'),        // korridori 6,94
    slab(3.42, 9.70, 2.33, 1.85, 'keramik'),        // utiliti 4,33
  ],
  walls: [
    ext(0.125, 0, 0.125, D),
    ext(W - 0.125, 0, W - 0.125, D),
    /* fasada ballore — dritarja franceze e dhomës, pastaj grilat e ballkonit */
    ext(0, 0.125, 3.42, 0.125, [win(0.55, 2.40, 0.10, 2.40)]),
    ext(3.42, 0.125, W, 0.125, [louvre(0.20, 2.00, 2.60)], 2.60),
    /* muri i prapmë — dalja në ballkon dhe dritarja e utilitit */
    ext(0, D - 0.125, W, D - 0.125, [slide(0.70, 1.40), win(4.10, 1.30)]),

    /* ballkoni ballor */
    ext(3.42, 1.575, W, 1.575, [slide(0.60, 1.10)]),
    /* ballkoni i prapmë */
    ext(0, 10.225, 3.60, 10.225, [slide(0.80, 1.30)]),
    para(0, 11.71, 3.60, 11.71),
    para(3.51, 10.22, 3.51, 11.80),

    /* ndarjet */
    int(3.48, 0.25, 3.48, 10.25, [door(2.30), door(6.30)]),               // korridori ↔ dhomat/banjo
    int(0.125, 5.08, 3.54, 5.08),                                         // dhomat mes vete
    int(0.125, 10.15, 3.54, 10.15),                                       // dhoma e prapme ↔ ballkoni
    int(3.54, 1.64, W, 1.64),                                             // banjo, faqja para
    int(3.54, 4.21, W, 4.21, [door(0.55, 0.75)]),                         // banjo, faqja prapa
    int(3.42, 9.64, W, 9.64, [door(1.30, 0.80)]),                         // utiliti
  ],
  stair: { ...STAIR, up: true, down: true },
  spawn: spawn(4.00, 5.20, 180),    // korridori, pranë shkallëve
  rails: [
    { x1: 4.45, z1: 4.60, x2: 4.45, z2: 8.00 },     // parmakët e boshtit të shkallëve
  ],
  furniture: [
    /* dhoma ballore */
    { t: 'bed', x: 0.62, z: 0.62, w: 1.60, d: 2.05, rot: 0 },
    { t: 'nightstand', x: 2.34, z: 0.64, rot: 0 },
    { t: 'rug', x: 0.40, z: 2.90, w: 2.00, d: 1.30 },
    { t: 'wardrobe', x: 0.25, z: 4.42, w: 3.17, d: 0.55, rot: 0 },

    /* dhoma e prapme */
    { t: 'bed', x: 0.62, z: 5.85, w: 1.60, d: 2.05, rot: 0 },
    { t: 'nightstand', x: 2.34, z: 5.87, rot: 0 },
    { t: 'plant', x: 2.80, z: 8.70 },
    { t: 'wardrobe', x: 0.25, z: 9.45, w: 3.17, d: 0.55, rot: 0 },

    /* banjo */
    { t: 'tub', x: 4.02, z: 1.78, w: 1.68, d: 0.76, rot: 0 },
    { t: 'basin', x: 3.62, z: 3.02, rot: 0 },
    { t: 'wc', x: 5.36, z: 3.30, rot: 90 },

    /* utiliti */
    { t: 'washer', x: 3.58, z: 10.85, rot: 0 },
    { t: 'counter', x: 4.42, z: 10.88, w: 1.28, d: 0.60, rot: 0 },
  ],
};

/* ── KATI II  +6.00 ──────────────────────────────────────────────────── */
/* Pjesa e majtë del deri te fasada; pjesa e djathtë tërhiqet 1,40 m dhe
   çlirohet si tarracë (13,24 m²) — pikërisht ashtu si e tregon fasada
   ballore me vijën e ndërprerë të tërheqjes. Dy dhoma gjumi majtas,
   banjo nën shkallë 2,26 × 2,36 (5,33 m²) dhe utiliti 4,44 m² djathtas.    */

const L2 = {
  id: 'kati2', name: 'Kati 2', level: '+6.00', base: 2 * FH, area: '63,29 m²',
  slabs: [
    slab(0, 0, 3.54, D, 'plate'),
    slab(3.54, 1.40, W - 3.54, D - 1.40, 'plate'),
    slab(0.25, 0.25, 3.17, 5.64, 'laminat'),        // dhoma e gjumit ballore 17,89
    slab(0.25, 6.01, 3.17, 3.92, 'laminat'),        // dhoma e gjumit e prapme 12,43
    slab(0.00, 10.13, 3.60, 1.67, 'jashte'),        // ballkoni i prapmë 4,84
    slab(3.54, 1.40, 2.21, 3.10, 'jashte'),         // tarraca 13,24 (pjesa ballore)
    slab(3.54, 8.10, 2.21, 2.30, 'banjo'),          // banjo nën shkallë 5,33
    slab(3.54, 10.40, 2.21, 1.15, 'keramik'),       // utiliti 4,44
  ],
  walls: [
    ext(0.125, 0, 0.125, D),
    ext(W - 0.125, 1.40, W - 0.125, D),
    /* fasada ballore — vetëm pjesa e majtë del përpara */
    ext(0, 0.125, 3.54, 0.125, [win(0.60, 2.30, 0.10, 2.40)]),
    /* faqja e tërheqjes dhe fasada e tërhequr e pjesës së djathtë */
    ext(3.415, 0, 3.415, 1.40),
    ext(0, D - 0.125, W, D - 0.125, [slide(0.70, 1.40), win(4.30, 1.10)]),

    /* tarraca — parapete */
    para(3.42, 1.49, W, 1.49),
    para(W - 0.09, 1.40, W - 0.09, 4.50),
    /* muri i tarracës nga dhomat */
    ext(3.415, 1.40, 3.415, 4.62, [slide(1.10, 1.10)]),

    /* ballkoni i prapmë */
    ext(0, 10.03, 3.60, 10.03, [slide(0.80, 1.30)]),
    para(0, 11.71, 3.60, 11.71),
    para(3.51, 10.03, 3.51, 11.80),

    /* ndarjet */
    int(3.48, 4.62, 3.48, 10.05, [door(3.05)]),
    int(0.125, 5.95, 3.54, 5.95),                                          // dhomat mes vete
    int(0.125, 9.99, 3.54, 9.99),                                          // dhoma e prapme ↔ ballkoni
    int(3.48, 8.04, W, 8.04, [door(0.45, 0.75)]),                          // banjo nën shkallë
    int(3.48, 10.34, W, 10.34, [door(1.20, 0.80)]),                        // utiliti
  ],
  stair: { ...STAIR, down: true },
  spawn: spawn(2.60, 4.00, 0),      // dhoma ballore, nga dritarja
  rails: [
    { x1: 4.45, z1: 4.60, x2: 4.45, z2: 8.00 },
    { x1: 4.45, z1: 4.60, x2: 5.75, z2: 4.60 },
  ],
  furniture: [
    /* dhoma ballore — më e madhja e shtëpisë */
    { t: 'bed', x: 0.66, z: 0.72, w: 1.60, d: 2.05, rot: 0 },
    { t: 'nightstand', x: 2.38, z: 0.74, rot: 0 },
    { t: 'rug', x: 0.45, z: 3.05, w: 2.10, d: 1.40 },
    { t: 'armchair', x: 2.30, z: 4.30, w: 0.80, d: 0.78, rot: 200 },
    { t: 'plant', x: 0.40, z: 4.55 },
    { t: 'wardrobe', x: 0.25, z: 5.26, w: 3.17, d: 0.55, rot: 0 },

    /* dhoma e prapme */
    { t: 'bed', x: 0.66, z: 6.62, w: 1.60, d: 2.05, rot: 0 },
    { t: 'nightstand', x: 2.38, z: 6.64, rot: 0 },
    { t: 'wardrobe', x: 0.25, z: 9.32, w: 3.17, d: 0.55, rot: 0 },

    /* banjo nën shkallë */
    { t: 'shower', x: 3.62, z: 8.22, w: 0.94, d: 0.94 },
    { t: 'basin', x: 4.86, z: 8.20, rot: 0 },
    { t: 'wc', x: 5.36, z: 9.52, rot: 90 },

    /* utiliti */
    { t: 'washer', x: 3.64, z: 10.72, rot: 0 },

    /* tarraca */
    { t: 'table', x: 4.02, z: 2.30, w: 1.05, d: 1.05, h: 0.72 },
    { t: 'chair', x: 4.10, z: 1.72, rot: 0 },
    { t: 'chair', x: 4.10, z: 3.30, rot: 180 },
    { t: 'plant', x: 5.30, z: 1.60 },
  ],
};

/* ── ATIKA +9.00 → KULMI +10.00 ──────────────────────────────────────── */
/* Kulmi i sheshtë i pashfrytëzuar; atika e mbyll fasadën deri te +10.00 m. */

export const ROOF = {
  base: 3 * FH,
  parapet: 1.00,
  /* atika ndjek gabaritin, me tërheqjen e njëjtë si kati II */
  outline: [
    [0, 0], [3.54, 0], [3.54, 1.40], [W, 1.40], [W, D], [0, D],
  ],
};

export const LEVELS = [L0, L1, L2];

/* Fasada — brezi i tullës dekorative sipas fasadës ballore: pjesa e majtë
   3,42 m e gjerë, nga ±0.00 deri te +6.60 m. Vrimat janë po ato dritare të
   mureve prapa tij, me kuota absolute nga dyshemeja e përdhesës.          */
export const BRICK = {
  x: 0, w: 3.42, y0: 0, y1: 6.60,
  holes: [
    { at: 0.50, w: 2.40, sill: 0.30, head: 2.40 },                    // përdhesa
    { at: 0.55, w: 2.40, sill: FH + 0.10, head: FH + 2.40 },          // kati 1
    { at: 0.60, w: 2.30, sill: 2 * FH + 0.10, head: 2 * FH + 2.40 },  // kati 2 — pragu bie brenda brezit
  ],
};

export const SITE = {
  /* trotuari para shtëpisë dhe kopshti prapa — vetëm për kontekst pamor */
  frontDepth: 5.0,
  rearDepth: 8.0,
  /* Shtëpi në varg — pa hapësirë anash.
     `neighbours` vizaton shtëpitë ngjitur si vëllime të thjeshta. E mbajmë
     të fikur: shikuesi është për KËTË shtëpi, dhe fqinjët vetëm e mbytnin
     pamjen. Kthehet në `true` po të duhet ndonjëherë konteksti i vargut. */
  sideGap: 0.0,
  neighbours: false,
};
