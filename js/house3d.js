/* Shikuesi 3D — ndërton shtëpinë nga js/house3d-model.js me three.js.
   ═══════════════════════════════════════════════════════════════════

   Moduli ngarkohet vetëm kur shtypet butoni «Shiko në 3D», që faqja të
   mos e tërheqë three.js-in pa nevojë. Eksporton një funksion të vetëm:

       const viewer = await mount(hostElement);
       viewer.show('kati1');   viewer.dispose();

   Nuk ka asete të jashtme — teksturat (tulla, bari, dyshemetë) vizatohen
   në canvas gjatë nisjes.                                                */

/* Specifikuesit «three» dhe «three/addons/» zgjidhen nga harta e importeve
   te <head> i index.html — versioni ndërrohet vetëm atje. */
let THREE, OrbitControls, RoundedBoxGeometry;

async function loadThree() {
  if (THREE) return;
  THREE = await import('three');
  ({ OrbitControls } = await import('three/addons/controls/OrbitControls.js'));
  ({ RoundedBoxGeometry } = await import('three/addons/geometries/RoundedBoxGeometry.js'));
}

/* ── teksturat procedurale ───────────────────────────────────────────── */

let MAX_ANISO = 8;

function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  /* Dyshemeja shihet nën një kënd shumë të sheshtë; pa mipmap-a dhe pa
     filtrim anizotropik dërrasat e largëta shndërrohen në vija që dridhen. */
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.anisotropy = MAX_ANISO;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  return t;
}

/* ndihmës i vogël: ngjyrë me luhatje të lehtë rreth një baze */
const jitter = (r, g, b, v) =>
  `rgb(${Math.min(255, r * v) | 0},${Math.min(255, g * v) | 0},${Math.min(255, b * v) | 0})`;

function brickTexture() {
  // një metër katror tulle: 8 rreshta × ~0.12 m, në tonin e fasadës reale
  return canvasTex(256, 256, (g) => {
    g.fillStyle = '#5d4038'; g.fillRect(0, 0, 256, 256);
    const rows = 8, rh = 256 / rows, bw = 64;
    for (let r = 0; r < rows; r++) {
      const off = (r % 2) * (bw / 2);
      for (let i = -1; i < 256 / bw + 1; i++) {
        const x = i * bw + off, y = r * rh;
        const v = 0.88 + Math.random() * 0.24;
        g.fillStyle = `rgb(${Math.min(255, 124 * v) | 0},${Math.min(255, 74 * v) | 0},${Math.min(255, 58 * v) | 0})`;
        g.fillRect(x + 1.2, y + 1.2, bw - 2.4, rh - 2.4);
      }
    }
  });
}

function grassTexture() {
  return canvasTex(128, 128, (g) => {
    g.fillStyle = '#7f8f63'; g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 2600; i++) {
      const v = 0.75 + Math.random() * 0.5;
      g.fillStyle = `rgba(${(120 * v) | 0},${(142 * v) | 0},${(88 * v) | 0},0.7)`;
      g.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
    }
  });
}

/* Laminat: një pllakë 1,90 × 1,90 m me 10 dërrasa ~19 cm, fugat e kokës
   të shkallëzuara rresht pas rreshti dhe damarë të lehtë përgjatë fibrës. */
function woodTexture() {
  const N = 512, rows = 10, rh = N / rows;
  return canvasTex(N, N, (g) => {
    g.fillStyle = '#b08d63'; g.fillRect(0, 0, N, N);

    for (let r = 0; r < rows; r++) {
      const y = r * rh;
      // dërrasa të gjata ~1,0-1,3 m, me fillim të zhvendosur në çdo rresht
      let x = -((r * 137) % 260) - 40;
      while (x < N) {
        const w = 150 + ((r * 61 + x * 7) % 130);
        const v = 0.94 + (((r * 31 + x) % 17) / 17) * 0.12;   // luhatje e butë, jo me arna
        g.fillStyle = jitter(196, 158, 112, v);
        g.fillRect(x, y, w - 2, rh - 1.5);

        // damarë përgjatë dërrasës
        g.save();
        g.beginPath(); g.rect(x, y, w - 2, rh - 1.5); g.clip();
        for (let k = 0; k < 7; k++) {
          const gy = y + 2 + ((k * 53 + x) % (rh - 4));
          g.strokeStyle = `rgba(120,88,55,${0.05 + ((k * 13 + x) % 9) / 90})`;
          g.lineWidth = 0.8 + ((k + x) % 3) * 0.4;
          g.beginPath();
          g.moveTo(x, gy);
          g.bezierCurveTo(x + w * 0.3, gy - 2.5, x + w * 0.7, gy + 2.5, x + w, gy);
          g.stroke();
        }
        g.restore();

        // fuga e kokës
        g.fillStyle = 'rgba(96,70,44,0.42)';
        g.fillRect(x + w - 2, y, 2, rh - 1.5);
        x += w;
      }
      // fuga gjatësore mes rreshtave
      g.fillStyle = 'rgba(96,70,44,0.34)';
      g.fillRect(0, y + rh - 1.5, N, 1.5);
    }
  });
}

/* Keramikë: pllaka 30 cm me fugë të hollë dhe njolla të buta guri. */
function tileTexture(base, line, grout) {
  const N = 512, cells = 4, cs = N / cells;
  return canvasTex(N, N, (g) => {
    g.fillStyle = grout; g.fillRect(0, 0, N, N);
    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        const v = 0.96 + (((r * 7 + c * 13) % 9) / 9) * 0.09;
        g.fillStyle = jitter(...base, v);
        g.fillRect(c * cs + 1.5, r * cs + 1.5, cs - 3, cs - 3);
        g.save();
        g.beginPath(); g.rect(c * cs + 1.5, r * cs + 1.5, cs - 3, cs - 3); g.clip();
        for (let k = 0; k < 5; k++) {
          const cx = c * cs + ((k * 47 + r * 29) % cs);
          const cy = r * cs + ((k * 83 + c * 37) % cs);
          const rad = 12 + ((k * 19) % 26);
          const grd = g.createRadialGradient(cx, cy, 0, cx, cy, rad);
          grd.addColorStop(0, `rgba(${line},0.07)`);
          grd.addColorStop(1, `rgba(${line},0)`);
          g.fillStyle = grd;
          g.beginPath(); g.arc(cx, cy, rad, 0, Math.PI * 2); g.fill();
        }
        g.restore();
      }
    }
  });
}

/* ── materialet ──────────────────────────────────────────────────────── */

function makeMaterials() {
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const brick = brickTexture();
  const wood = woodTexture();
  const grass = grassTexture();
  const cer = tileTexture([226, 221, 213], '150,140,126', '#c2bbb0');
  const bath = tileTexture([214, 226, 232], '120,146,160', '#b6c4cc');

  return {
    ext: std({ color: 0xece7de, roughness: 0.94 }),
    int: std({ color: 0xf6f2ea, roughness: 0.96 }),
    para: std({ color: 0xe6e1d7, roughness: 0.94 }),
    brick: std({ map: brick, roughness: 0.95 }),
    brickTex: brick,
    plate: std({ color: 0xd6d0c5, roughness: 0.92 }),
    ceil: std({ color: 0xfaf7f1, roughness: 0.97 }),
    laminat: std({ map: wood, roughness: 0.72 }),
    laminatTex: wood,
    keramik: std({ map: cer, roughness: 0.55 }),
    keramikTex: cer,
    banjo: std({ map: bath, roughness: 0.42 }),
    banjoTex: bath,
    jashte: std({ color: 0xcdc7bc, roughness: 0.9 }),
    grass: std({ map: grass, roughness: 1 }),
    grassTex: grass,
    road: std({ color: 0x4a4a4c, roughness: 0.98 }),
    frame: std({ color: 0x2b2b2d, roughness: 0.5, metalness: 0.35 }),
    glass: std({
      color: 0xb9d4dd, roughness: 0.06, metalness: 0.1,
      transparent: true, opacity: 0.32, side: THREE.DoubleSide,
    }),
    doorLeaf: std({ color: 0x6f6b64, roughness: 0.7 }),
    entryLeaf: std({ color: 0x3b3b3d, roughness: 0.6, metalness: 0.2 }),
    rail: std({ color: 0x2b2b2d, roughness: 0.45, metalness: 0.4 }),
    /* xhami i fqinjëve — i errët por jo i zi, që të lexohet si dritare */
    darkGlass: std({ color: 0x46545c, roughness: 0.16, metalness: 0.45 }),
    step: std({ color: 0xe6e1d7, roughness: 0.9 }),
    tread: std({ color: 0xa88861, roughness: 0.6 }),

    /* ── mobiliet ──
       Duhet të dallohen nga muret, përndryshe prerja e katit del si një
       pllakë e bardhë pa asgjë brenda. Pëlhura mat, dru i ngrohtë, metal
       i errët — e njëjta paletë si vetë faqja.                          */
    fabric: std({ color: 0xb9b0a1, roughness: 1.0 }),        // jastëkët
    fabricDark: std({ color: 0x9a9284, roughness: 1.0 }),    // trupi e krahët
    chairSeat: std({ color: 0xa89b88, roughness: 0.95 }),
    blanket: std({ color: 0x8d8677, roughness: 1.0 }),
    linen: std({ color: 0xfaf8f3, roughness: 0.98 }),
    headboard: std({ color: 0x8e8578, roughness: 1.0 }),
    timber: std({ color: 0xb08f6b, roughness: 0.72 }),
    timberDark: std({ color: 0x6f5740, roughness: 0.68 }),
    timberDoor: std({ color: 0xa4855f, roughness: 0.66 }),
    cabinet: std({ color: 0xe8e3da, roughness: 0.62 }),
    cabinetDoor: std({ color: 0xdfd8cd, roughness: 0.55 }),
    stone: std({ color: 0x55595e, roughness: 0.32, metalness: 0.05 }),
    steel: std({ color: 0xc2c6ca, roughness: 0.24, metalness: 0.85 }),
    hob: std({ color: 0x24262a, roughness: 0.18, metalness: 0.3 }),
    screen: std({ color: 0x16181c, roughness: 0.10, metalness: 0.4 }),
    rug: std({ color: 0x9c9484, roughness: 1.0 }),
    pot: std({ color: 0xb07a56, roughness: 0.85 }),
    stem: std({ color: 0x6d7a52, roughness: 0.9 }),
    leaf: std({ color: 0x5f7a4a, roughness: 0.88 }),
    shade: std({ color: 0x2f3134, roughness: 0.5, metalness: 0.25 }),
    bulb: std({ color: 0xfff1d4, emissive: 0xffe9c0, emissiveIntensity: 0.9, roughness: 0.4 }),
    mirror: std({ color: 0xdfe8ec, roughness: 0.05, metalness: 0.95 }),
    water: std({ color: 0xbcd7e2, roughness: 0.08, transparent: true, opacity: 0.55 }),
    glassDark: std({ color: 0x3b4248, roughness: 0.1, metalness: 0.5 }),
    porcelain: std({ color: 0xfbfbfa, roughness: 0.22 }),
    neighbour: std({ color: 0xdcd6cc, roughness: 0.95 }),
  };
}

/* ── ndërtimi i gjeometrisë ──────────────────────────────────────────── */

const box = (w, h, d, mat, x, y, z, group) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  group.add(m);
  return m;
};

/* Sa metra bota mbulon një përsëritje e teksturës së dyshemesë.
   Pa këtë çdo dhomë do të shtrinte të njëjtat dërrasa sa e gjatë është ajo. */
const FLOOR_TILE = { laminat: 1.90, keramik: 1.20, banjo: 1.00, jashte: 0.90, plate: 2.40 };

/** Dyshemeja e një zone.
    Pllaka strukturore (`plate`) shkon POSHTË nivelit, veshja sipër tij —
    po t'i lije në të njëjtën lartësi, të dyja luftojnë për të njëjtin piksel
    dhe dyshemeja del me vija që dridhen. */
function slabMesh(s, mats, y, group) {
  const struct = s.mat === 'plate';
  const t = struct ? 0.14 : 0.02;
  const top = struct ? y : y + t;                 // sipërfaqja e sipërme
  const m = new THREE.Mesh(new THREE.BoxGeometry(s.w, t, s.d), mats[s.mat] || mats.plate);
  m.position.set(s.x + s.w / 2, top - t / 2, s.z + s.d / 2);
  m.receiveShadow = true;
  group.add(m);

  const map = m.material.map;
  if (map) {
    const step = FLOOR_TILE[s.mat] || 1.2;
    m.material = m.material.clone();
    m.material.map = map.clone();
    m.material.map.needsUpdate = true;
    m.material.map.wrapS = m.material.map.wrapT = THREE.RepeatWrapping;
    m.material.map.repeat.set(s.w / step, s.d / step);
  }
  return m;
}

/** Ndërton një mur me vrima: segmentet e plota, prag, arkitra dhe xhami. */
function buildWall(w, mats, baseY, group) {
  const dx = w.x2 - w.x1, dz = w.z2 - w.z1;
  const len = Math.hypot(dx, dz);
  if (len < 1e-6) return;
  const ang = Math.atan2(dx, dz);              // rrotullim rreth Y
  const mat = mats[w.mat] || mats.ext;

  const holes = [...(w.holes || [])].sort((a, b) => a.at - b.at);

  /* Faqja e murit është një drejtkëndësh (gjatësi × lartësi) nga i cili
     hiqen vrimat. E presim në breza vertikalë te skajet e vrimave, pastaj
     në çdo brez mbushim hapësirat mes vrimave që e prekin atë brez. Kështu
     dy dritare mbi njëra-tjetrën — si te veshja me tullë — dalin të dyja.  */
  const cuts = new Set([0, len]);
  for (const h of holes) {
    cuts.add(Math.max(0, Math.min(len, h.at)));
    cuts.add(Math.max(0, Math.min(len, h.at + h.w)));
  }
  const xs = [...cuts].sort((a, b) => a - b);

  const pieces = [];                            // [nga, deri, ngaY, deriY]
  for (let i = 0; i < xs.length - 1; i++) {
    const a = xs[i], b = xs[i + 1];
    if (b - a < 1e-4) continue;
    const inBand = holes
      .filter((h) => h.at <= a + 1e-6 && h.at + h.w >= b - 1e-6)
      .map((h) => [Math.max(0, h.sill), Math.min(w.h, h.head)])
      .filter(([s, e]) => e > s)
      .sort((p, q) => p[0] - q[0]);

    let y = 0;
    for (const [s, e] of inBand) {
      if (s > y) pieces.push([a, b, y, s]);
      y = Math.max(y, e);
    }
    if (y < w.h) pieces.push([a, b, y, w.h]);
  }

  const local = new THREE.Group();
  local.position.set(w.x1, baseY + (w.y || 0), w.z1);
  local.rotation.y = ang;
  group.add(local);

  for (const [a, b, y0, y1] of pieces) {
    if (b - a < 1e-4 || y1 - y0 < 1e-4) continue;
    let pm = mat;
    /* Muret e veshura me tullë: çdo copë merr teksturën e vet, e shkallëzuar
       sipas madhësisë — përndryshe tullat shtrihen sa e gjatë është copa. */
    if (w.tile && mat.map) {
      pm = mat.clone();
      pm.map = mat.map.clone();
      pm.map.needsUpdate = true;
      pm.map.wrapS = pm.map.wrapT = THREE.RepeatWrapping;
      pm.map.repeat.set((b - a) / w.tile, (y1 - y0) / w.tile);
    }
    const m = new THREE.Mesh(new THREE.BoxGeometry(w.t, y1 - y0, b - a), pm);
    m.position.set(0, (y0 + y1) / 2, (a + b) / 2);
    m.castShadow = m.receiveShadow = true;
    local.add(m);
  }

  /* mbushja e vrimave */
  for (const h of holes) {
    const hw = Math.min(h.w, len - h.at);
    if (hw <= 0.01) continue;
    const cz = h.at + hw / 2, hh = h.head - h.sill, cy = (h.sill + h.head) / 2;

    if (h.type === 'open') continue;             // kalim i lirë

    if (h.type === 'louvre') {
      // grilë horizontale — profile të holla me hapësirë mes tyre
      const n = Math.max(4, Math.round(hh / 0.11));
      for (let i = 0; i < n; i++) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w.t * 0.5, 0.06, hw - 0.06), mats.frame);
        m.position.set(0, h.sill + (i + 0.5) * (hh / n), cz);
        m.rotation.x = 0.35;
        m.castShadow = true;
        local.add(m);
      }
      const f = new THREE.Mesh(new THREE.BoxGeometry(w.t * 0.6, hh, 0.06), mats.frame);
      f.position.set(0, cy, cz - hw / 2 + 0.03); local.add(f);
      const f2 = f.clone(); f2.position.z = cz + hw / 2 - 0.03; local.add(f2);
      continue;
    }

    if (h.type === 'door') {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.045, hh - 0.02, hw - 0.06), mats.doorLeaf);
      m.position.set(0, cy, cz); m.castShadow = true; local.add(m);
      continue;
    }

    if (h.type === 'entry') {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.07, hh - 0.02, hw - 0.05), mats.entryLeaf);
      m.position.set(0, cy, cz); m.castShadow = true; local.add(m);
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, hh * 0.55, 10), mats.rail);
      bar.position.set(0.06, cy, cz + hw / 2 - 0.16); local.add(bar);
      continue;
    }

    /* dritare ose derë rrëshqitëse — xham me kornizë */
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.02, hh - 0.09, hw - 0.09), mats.glass);
    glass.position.set(0, cy, cz);
    local.add(glass);

    const fr = 0.05, t = w.t * 0.55;
    const addBar = (bw, bh, bz, by) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(t, bh, bw), mats.frame);
      m.position.set(0, by, bz); m.castShadow = true; local.add(m);
    };
    addBar(hw, fr, cz, h.sill + fr / 2);
    addBar(hw, fr, cz, h.head - fr / 2);
    addBar(fr, hh, cz - hw / 2 + fr / 2, cy);
    addBar(fr, hh, cz + hw / 2 - fr / 2, cy);
    // ndarës vertikal çdo ~1,2 m
    const n = Math.max(1, Math.round(hw / 1.2));
    for (let i = 1; i < n; i++) addBar(0.045, hh, cz - hw / 2 + (hw / n) * i, cy);
    if (h.type === 'slider' && hh > 1.9) addBar(hw, 0.04, cz, h.sill + hh * 0.42);
  }
}

/** Shkallë të drejta që ngjiten nga `z` drejt `z + run`.
    Çdo shkallare: trupi i bardhë poshtë dhe një pllakë druri sipër që del
    pak përpara — pa këtë të dytën shkallët duken si një dhëmbëzim i thatë. */
function buildStair(st, mats, baseY, group, rise) {
  const n = st.steps, r = rise / n, g = st.run / n;
  const TREAD = 0.045, NOSE = 0.025;
  for (let i = 0; i < n; i++) {
    const h = r * (i + 1);
    const cz = st.z + st.run - (i + 0.5) * g;

    const body = new THREE.Mesh(new THREE.BoxGeometry(st.w, h - TREAD, g), mats.step);
    body.position.set(st.x + st.w / 2, baseY + (h - TREAD) / 2, cz);
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    const tread = new THREE.Mesh(new THREE.BoxGeometry(st.w, TREAD, g + NOSE), mats.tread);
    tread.position.set(st.x + st.w / 2, baseY + h - TREAD / 2, cz - NOSE / 2);
    tread.castShadow = tread.receiveShadow = true;
    group.add(tread);
  }
}

function railing(x1, z1, x2, z2, y, mats, group, h = 1.02) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  if (len < 0.05) return;
  const g = new THREE.Group();
  g.position.set(x1, y, z1);
  g.rotation.y = Math.atan2(x2 - x1, z2 - z1);
  group.add(g);
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, len), mats.rail);
  top.position.set(0, h, len / 2); g.add(top);
  const n = Math.max(2, Math.round(len / 0.12));
  for (let i = 0; i <= n; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.018, h, 0.018), mats.rail);
    p.position.set(0, h / 2, (len / n) * i); g.add(p);
  }
}

/* ── mobiliet ────────────────────────────────────────────────────────── */

function buildFurniture(f, mats, baseY, group) {
  const g = new THREE.Group();
  g.position.set(f.x, baseY, f.z);
  group.add(g);
  const rot = ((f.rot || 0) * Math.PI) / 180;
  const c = Math.cos(rot), s = Math.sin(rot);

  const place = (m, x, y, z) => {
    m.position.set(x * c + z * s, y, -x * s + z * c);
    m.rotation.y = rot;
    m.castShadow = m.receiveShadow = true;
    g.add(m);
    return m;
  };

  /** kuti e thjeshtë */
  const put = (w, h, d, mat, x, y, z) =>
    place(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat), x, y, z);

  /** kuti me qoshe të rrumbullakosura — mobiliet e vërteta s'kanë brinjë të thara */
  const soft = (w, h, d, mat, x, y, z, r = 0.035) => {
    const rad = Math.min(r, w / 2.2, h / 2.2, d / 2.2);
    return place(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, rad), mat), x, y, z);
  };

  /** cilindër — këmbë, tuba, tenxhere lulesh */
  const rod = (rTop, rBot, h, mat, x, y, z, tilt = 0) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 12), mat);
    place(m, x, y, z);
    if (tilt) m.rotation.z = tilt;
    return m;
  };

  /** katër këmbë të holla druri, si te mobiliet skandinave */
  const legs = (w, d, h, mat, inset = 0.09, rTop = 0.022, rBot = 0.016) => {
    for (const [ox, oz] of [[inset, inset], [w - inset, inset], [inset, d - inset], [w - inset, d - inset]]) {
      const m = rod(rTop, rBot, h, mat, ox, h / 2, oz);
      m.rotation.x = 0.05 * (oz < d / 2 ? 1 : -1);
      m.rotation.z = 0.05 * (ox < w / 2 ? 1 : -1);
    }
  };

  switch (f.t) {
    /* Krevat: kornizë e ulët druri mbi këmbë, dyshek i rrumbullakosur,
       jorgan i palosur në fund dhe dy jastëkë të mbështetur te koka. */
    case 'bed': {
      const w = f.w, d = f.d;
      soft(w, 0.16, d, mats.timber, w / 2, 0.26, d / 2, 0.03);          // korniza
      legs(w, d, 0.18, mats.timberDark, 0.10, 0.024, 0.018);
      soft(w - 0.06, 0.24, d - 0.10, mats.linen, w / 2, 0.46, d / 2, 0.05);  // dysheku
      soft(w - 0.10, 0.10, d * 0.40, mats.blanket, w / 2, 0.62, d - d * 0.22, 0.04); // jorgani
      for (const side of [-1, 1]) {
        const p = soft(w * 0.42, 0.14, 0.34, mats.linen, w / 2 + side * w * 0.23, 0.65, 0.30, 0.06);
        p.rotation.x = -0.30;
      }
      soft(w + 0.04, 0.75, 0.10, mats.headboard, w / 2, 0.50, -0.01, 0.04);  // koka
      break;
    }

    /* Dollap: trupi, dy dyer me fugë mes tyre dhe doreza vertikale. */
    case 'wardrobe': {
      const w = f.w, h = 2.05, d = f.d;
      put(w, h, d, mats.timber, w / 2, h / 2, d / 2);
      const doors = Math.max(2, Math.round(w / 0.62));
      const dw = w / doors;
      for (let i = 0; i < doors; i++) {
        soft(dw - 0.02, h - 0.08, 0.03, mats.timberDoor, i * dw + dw / 2, h / 2, -0.005, 0.008);
        rod(0.010, 0.010, 0.34, mats.rail, i * dw + dw - 0.06, h * 0.52, -0.035);
      }
      break;
    }

    /* Divan: bazë e ulët, dy jastëkë uljeje, dy shpine, krahë të butë
       dhe këmbë druri — jo një kub i vetëm. */
    case 'sofa': {
      const w = f.w, d = f.d, arm = 0.17;
      soft(w, 0.20, d, mats.fabricDark, w / 2, 0.24, d / 2, 0.04);      // baza
      legs(w, d, 0.14, mats.timberDark, 0.12, 0.020, 0.015);
      const seatW = w - arm * 2, n = Math.max(1, Math.round(seatW / 0.62));
      for (let i = 0; i < n; i++)                                        // jastëkët e uljes
        soft(seatW / n - 0.03, 0.15, d - 0.26, mats.fabric,
          arm + (i + 0.5) * (seatW / n), 0.41, d / 2 - 0.05, 0.05);
      for (let i = 0; i < n; i++) {                                      // jastëkët e shpinës
        const b = soft(seatW / n - 0.03, 0.38, 0.16, mats.fabric,
          arm + (i + 0.5) * (seatW / n), 0.66, d - 0.14, 0.05);
        b.rotation.x = 0.13;
      }
      soft(arm, 0.44, d, mats.fabricDark, arm / 2, 0.52, d / 2, 0.06);   // krahët
      soft(arm, 0.44, d, mats.fabricDark, w - arm / 2, 0.52, d / 2, 0.06);
      break;
    }

    /* Kolltuk — një divan i vogël me shpinë të pjerrët. */
    case 'armchair': {
      const w = f.w || 0.80, d = f.d || 0.78;
      soft(w, 0.18, d, mats.fabricDark, w / 2, 0.26, d / 2, 0.05);
      legs(w, d, 0.17, mats.timberDark, 0.12, 0.019, 0.014);
      soft(w - 0.24, 0.14, d - 0.22, mats.fabric, w / 2, 0.42, d / 2 - 0.04, 0.05);
      const back = soft(w - 0.06, 0.44, 0.16, mats.fabric, w / 2, 0.62, d - 0.10, 0.06);
      back.rotation.x = 0.20;
      soft(0.13, 0.30, d - 0.10, mats.fabricDark, 0.07, 0.44, d / 2, 0.05);
      soft(0.13, 0.30, d - 0.10, mats.fabricDark, w - 0.07, 0.44, d / 2, 0.05);
      break;
    }

    /* Tavolinë: fletë me buzë të lehtë dhe këmbë të holla të pjerrëta. */
    case 'table': {
      const h = f.h || 0.75, w = f.w, d = f.d;
      soft(w, 0.045, d, mats.timber, w / 2, h - 0.022, d / 2, 0.012);
      legs(w, d, h - 0.045, mats.timberDark, 0.10, 0.026, 0.017);
      if (h > 0.6) soft(w - 0.30, 0.03, d - 0.24, mats.timberDark, w / 2, h - 0.16, d / 2, 0.01);
      break;
    }

    /* Karrige: ulëse e rrumbullakosur, shpinë e pjerrët, katër këmbë. */
    case 'chair': {
      soft(0.44, 0.055, 0.44, mats.chairSeat, 0.22, 0.45, 0.22, 0.02);
      const back = soft(0.42, 0.44, 0.05, mats.chairSeat, 0.22, 0.70, 0.045, 0.02);
      back.rotation.x = -0.10;
      legs(0.44, 0.44, 0.45, mats.timberDark, 0.055, 0.018, 0.012);
      break;
    }

    /* Kuzhinë: trup, dyer me doreza, plani i gurit dhe një cokull i tërhequr. */
    case 'counter': {
      const w = f.w, d = f.d, h = 0.86;
      put(w - 0.06, 0.10, d - 0.06, mats.timberDark, w / 2, 0.05, d / 2);   // cokulli
      put(w, h - 0.10, d, mats.cabinet, w / 2, 0.10 + (h - 0.10) / 2, d / 2);
      const along = w >= d;                                                  // ana e dukshme
      const n = Math.max(2, Math.round((along ? w : d) / 0.60));
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        if (along) {
          soft(w / n - 0.02, h - 0.20, 0.025, mats.cabinetDoor, t * w, 0.10 + (h - 0.10) / 2, -0.008, 0.008);
          rod(0.009, 0.009, 0.26, mats.rail, t * w + w / n / 2 - 0.05, h * 0.62, -0.032);
        } else {
          const p = soft(0.025, h - 0.20, d / n - 0.02, mats.cabinetDoor, -0.008, 0.10 + (h - 0.10) / 2, t * d, 0.008);
          p.rotation.y = rot;
          const hd = rod(0.009, 0.009, 0.26, mats.rail, -0.032, h * 0.62, t * d + d / n / 2 - 0.05);
          hd.rotation.y = rot;
        }
      }
      soft(w + 0.04, 0.045, d + 0.04, mats.stone, w / 2, h + 0.02, d / 2, 0.010); // plani
      break;
    }

    /* Sinku dhe zjarri, të vendosur mbi një plan kuzhine. */
    case 'sink':
      put(0.50, 0.02, 0.40, mats.steel, 0.25, 0.885, 0.20);
      put(0.44, 0.10, 0.34, mats.steel, 0.22, 0.835, 0.20);
      rod(0.016, 0.016, 0.26, mats.steel, 0.25, 1.02, 0.06);
      put(0.16, 0.022, 0.022, mats.steel, 0.31, 1.14, 0.06);
      break;
    case 'hob':
      put(0.58, 0.015, 0.50, mats.hob, 0.29, 0.895, 0.25);
      for (const [ox, oz] of [[0.16, 0.16], [0.42, 0.16], [0.16, 0.36], [0.42, 0.36]])
        rod(0.075, 0.075, 0.010, mats.steel, ox, 0.905, oz);
      break;

    /* Mobilie televizori me një ekran të hollë sipër. */
    case 'tvunit': {
      const w = f.w || 1.60;
      soft(w, 0.36, 0.40, mats.cabinet, w / 2, 0.30, 0.20, 0.02);
      legs(w, 0.40, 0.12, mats.timberDark, 0.14, 0.018, 0.013);
      soft(w - 0.06, 0.03, 0.34, mats.cabinetDoor, w / 2, 0.30, -0.015, 0.008);
      put(0.10, 0.16, 0.10, mats.frame, w / 2, 0.56, 0.20);                 // këmba
      soft(w * 0.78, 0.60, 0.035, mats.screen, w / 2, 0.94, 0.20, 0.010);   // ekrani
      break;
    }

    /* Qilim — vetëm një fletë shumë e hollë, pak mbi dysheme. */
    case 'rug':
      put(f.w, 0.012, f.d, mats.rug, f.w / 2, 0.026, f.d / 2);
      break;

    /* Bimë në vazo. */
    case 'plant': {
      rod(0.17, 0.13, 0.34, mats.pot, 0.17, 0.17, 0.17);
      rod(0.025, 0.030, 0.42, mats.stem, 0.17, 0.52, 0.17);
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), mats.leaf);
        leaf.scale.set(1, 0.42, 0.72);
        place(leaf, 0.17 + Math.cos(a) * 0.16, 0.76 + (i % 3) * 0.10, 0.17 + Math.sin(a) * 0.16);
        leaf.rotation.y = -a;
      }
      break;
    }

    /* Llambë varëse mbi tryezë. */
    case 'pendant': {
      const drop = f.h || 1.55;
      rod(0.006, 0.006, 2.80 - drop, mats.frame, 0, drop + (2.80 - drop) / 2, 0);
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.20, 0.22, 18, 1, true), mats.shade);
      shade.material.side = THREE.DoubleSide;
      place(shade, 0, drop - 0.11, 0);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), mats.bulb);
      place(bulb, 0, drop - 0.20, 0);
      break;
    }

    /* Komodinë e vogël pranë krevatit. */
    case 'nightstand':
      soft(0.44, 0.36, 0.38, mats.timber, 0.22, 0.36, 0.19, 0.02);
      legs(0.44, 0.38, 0.18, mats.timberDark, 0.08, 0.016, 0.012);
      soft(0.40, 0.03, 0.02, mats.timberDoor, 0.22, 0.36, -0.005, 0.006);
      break;

    /* Pajisjet sanitare. */
    case 'wc':
      soft(0.36, 0.36, 0.54, mats.porcelain, 0.19, 0.18, 0.30, 0.06);
      soft(0.37, 0.06, 0.50, mats.porcelain, 0.19, 0.39, 0.30, 0.03);      // kapaku
      soft(0.36, 0.46, 0.16, mats.porcelain, 0.18, 0.53, 0.08, 0.03);      // rezervuari
      break;
    case 'basin':
      put(0.62, 0.62, 0.44, mats.cabinet, 0.31, 0.31, 0.22);               // mobilja
      soft(0.62, 0.04, 0.44, mats.stone, 0.31, 0.64, 0.22, 0.008);
      soft(0.44, 0.13, 0.32, mats.porcelain, 0.31, 0.72, 0.22, 0.05);      // lavamani
      rod(0.014, 0.014, 0.22, mats.steel, 0.31, 0.83, 0.06);
      put(0.13, 0.02, 0.02, mats.steel, 0.36, 0.93, 0.06);
      soft(0.50, 0.70, 0.03, mats.mirror, 0.31, 1.45, 0.02, 0.01);         // pasqyra
      break;
    case 'tub':
      soft(f.w, 0.52, f.d, mats.porcelain, f.w / 2, 0.26, f.d / 2, 0.06);
      put(f.w - 0.12, 0.06, f.d - 0.12, mats.water, f.w / 2, 0.49, f.d / 2);
      rod(0.014, 0.014, 0.24, mats.steel, 0.10, 0.64, f.d / 2);
      break;
    case 'shower': {
      const w = f.w, d = f.d;
      soft(w, 0.05, d, mats.porcelain, w / 2, 0.025, d / 2, 0.012);
      const gl = new THREE.Mesh(new THREE.BoxGeometry(0.015, 1.95, d), mats.glass);
      place(gl, w, 0.98, d / 2);
      rod(0.016, 0.016, 1.90, mats.steel, w - 0.01, 0.95, 0.02);
      put(0.22, 0.02, 0.22, mats.steel, w / 2, 1.98, d / 2);               // koka e dushit
      break;
    }
    case 'washer':
      put(0.60, 0.85, 0.60, mats.cabinet, 0.30, 0.425, 0.30);
      soft(0.56, 0.80, 0.02, mats.cabinetDoor, 0.30, 0.425, -0.005, 0.01);
      place(new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.04, 20), mats.glassDark),
        0.30, 0.46, -0.02).rotation.x = Math.PI / 2;
      break;
  }
}

/* ── kati ────────────────────────────────────────────────────────────── */

function buildLevel(L, mats, M) {
  const g = new THREE.Group();
  g.name = L.id;
  const y = L.base;

  for (const s of L.slabs) slabMesh(s, mats, y, g);
  for (const w of L.walls) buildWall(w, mats, y, g);
  if (L.stair) buildStair(L.stair, mats, y, g, M.FH);
  for (const r of L.rails || []) railing(r.x1, r.z1, r.x2, r.z2, y, mats, g);
  for (const f of L.furniture || []) buildFurniture(f, mats, y, g);

  /* tavani — pllaka mbi këtë kat, fshihet kur shihet vetëm ky kat */
  const ceil = new THREE.Group();
  ceil.name = 'ceil';
  /* Tavani mbaron pak para se të nisë pllaka e katit të sipërm — po t'i
     lije të dyja të mbaronin te +3.00, faqet e tyre do të përputheshin. */
  for (const s of L.slabs.filter((s) => s.mat === 'plate')) {
    const t = M.SLAB * 0.5;
    const m = new THREE.Mesh(new THREE.BoxGeometry(s.w, t, s.d), mats.ceil);
    m.position.set(s.x + s.w / 2, y + M.CH + t / 2, s.z + s.d / 2);
    m.receiveShadow = true;
    ceil.add(m);
  }
  g.add(ceil);

  return g;
}

/* ── skena e plotë ───────────────────────────────────────────────────── */

function buildHouse(M, mats) {
  const root = new THREE.Group();
  const levels = M.LEVELS.map((L) => {
    const g = buildLevel(L, mats, M);
    root.add(g);
    return g;
  });

  /* Brezi i tullës dekorative në fasadën ballore — një veshje e hollë para
     murit, e shpuar te po ato dritare, që të mos i mbulojë ato.          */
  const B = M.BRICK;
  const brick = new THREE.Group();
  brick.name = 'brick';
  buildWall({
    x1: B.x, z1: -0.025, x2: B.x + B.w, z2: -0.025,
    t: 0.05, h: B.y1 - B.y0, y: B.y0, mat: 'brick', tile: 1.0,
    holes: B.holes.map((o) => ({ ...o, type: 'open' })),
  }, mats, 0, brick);
  root.add(brick);

  /* atika dhe kulmi i sheshtë */
  const roof = new THREE.Group();
  roof.name = 'roof';
  const R = M.ROOF;
  const plate = (x, z, w, d) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, M.SLAB, d), mats.plate);
    m.position.set(x + w / 2, R.base + M.SLAB / 2, z + d / 2);
    m.receiveShadow = true; roof.add(m);
  };
  plate(0, 0, 3.54, M.D);
  plate(3.54, 1.40, M.W - 3.54, M.D - 1.40);

  const pw = 0.20, ph = R.parapet;
  const par = (x, z, w, d) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, ph, d), mats.ext);
    m.position.set(x + w / 2, R.base + M.SLAB + ph / 2, z + d / 2);
    m.castShadow = m.receiveShadow = true; roof.add(m);
  };
  par(0, 0, 3.54, pw);                        // ballore majtas
  par(3.54, 1.40, M.W - 3.54, pw);            // ballore e tërhequr
  par(3.54 - pw, 0, pw, 1.40 + pw);           // faqja e tërheqjes
  par(0, M.D - pw, M.W, pw);                  // prapa
  par(0, 0, pw, M.D);                         // majtas
  par(M.W - pw, 1.40, pw, M.D - 1.40);        // djathtas
  root.add(roof);

  return { root, levels, roof, brick };
}

function buildSite(M, mats) {
  const g = new THREE.Group();
  const S = M.SITE;
  // aq i gjerë sa buza e tij të mos hyjë kurrë në kuadër; mjegulla e mbyll
  const gw = 120, gd = 120;

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(gw, gd), mats.grass);
  ground.material = mats.grass.clone();
  ground.material.map = mats.grassTex.clone();
  ground.material.map.needsUpdate = true;
  ground.material.map.wrapS = ground.material.map.wrapT = THREE.RepeatWrapping;
  ground.material.map.repeat.set(gw / 2, gd / 2);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(M.W / 2, -0.03, M.D / 2 + S.rearDepth / 2 - S.frontDepth / 2);
  ground.receiveShadow = true;
  g.add(ground);

  const road = new THREE.Mesh(new THREE.PlaneGeometry(gw, 8), mats.road);
  road.rotation.x = -Math.PI / 2;
  road.position.set(M.W / 2, -0.02, -S.frontDepth - 1.5);
  road.receiveShadow = true;
  g.add(road);

  /* Fqinjët — i njëjti model, përsëritur majtas e djathtas. Nuk ndërtohen
     me të gjitha detajet (do të ishte gjeometri e kotë): mjafton vëllimi,
     brezi i tullës dhe xhamat e fasadës, sa vargu të lexohet si varg.
     Mbahen në një grup veç, sepse në pamjen e një kati të vetëm fshihen —
     ndryshe e mbyllin prerjen si dy mure dhjetëmetërshe.                  */
  const hood = new THREE.Group();
  hood.name = 'hood';
  g.add(hood);

  if (S.neighbours) {
    const H = 3 * M.FH + 1;
    const B = M.BRICK;
    const facade = [
      ...B.holes.map((o) => ({ x: o.at, w: o.w, y: o.sill, h: o.head - o.sill })),
      { x: 0.60, w: 2.30, y: 2 * M.FH + 0.10, h: 2.30 },     // dritarja e katit II
      { x: 4.00, w: 1.60, y: 0.10, h: 2.10 },                // hyrja e mbuluar
      { x: 3.62, w: 2.00, y: M.FH + 0.10, h: 2.50 },         // grilat e ballkonit
    ];

    for (const side of [-1, 1]) {
      for (let i = 1; i <= 2; i++) {
        const ox = M.W / 2 + side * i * M.W;
        const n = new THREE.Group();
        n.position.set(ox - M.W / 2, 0, 0);
        hood.add(n);

        const body = new THREE.Mesh(new THREE.BoxGeometry(M.W - 0.04, H, M.D), mats.neighbour);
        body.position.set(M.W / 2, H / 2, M.D / 2);
        body.castShadow = body.receiveShadow = true;
        n.add(body);

        const bb = new THREE.Mesh(new THREE.BoxGeometry(B.w, B.y1 - B.y0, 0.05), mats.brick.clone());
        bb.material.map = mats.brickTex.clone();
        bb.material.map.needsUpdate = true;
        bb.material.map.wrapS = bb.material.map.wrapT = THREE.RepeatWrapping;
        bb.material.map.repeat.set(B.w, B.y1 - B.y0);
        bb.position.set(B.x + B.w / 2, (B.y0 + B.y1) / 2, -0.03);
        bb.castShadow = bb.receiveShadow = true;
        n.add(bb);

        for (const o of facade) {
          const p = new THREE.Mesh(new THREE.BoxGeometry(o.w, o.h, 0.03), mats.darkGlass);
          p.position.set(o.x + o.w / 2, o.y + o.h / 2, -0.06);
          n.add(p);
        }
      }
    }
  }
  return { group: g, hood };
}

/* ── montimi ─────────────────────────────────────────────────────────── */

export async function mount(host, opts = {}) {
  await loadThree();
  const M = await import('./house3d-model.js');

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  MAX_ANISO = Math.min(16, renderer.capabilities.getMaxAnisotropy());
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd9e3ea);
  scene.fog = new THREE.Fog(0xd9e3ea, 45, 130);

  const mats = makeMaterials();
  const { root, levels, roof, brick } = buildHouse(M, mats);
  const { group: site, hood } = buildSite(M, mats);
  scene.add(site, root);

  /* qendërzimi: origjina në mes të shtëpisë */
  for (const o of [root, site]) o.position.set(-M.W / 2, 0, -M.D / 2);

  /* drita */
  const hemi = new THREE.HemisphereLight(0xdfeaf2, 0x8a8778, 1.15);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.0);
  sun.position.set(-14, 20, -12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -18; sc.right = 18; sc.top = 20; sc.bottom = -18; sc.near = 1; sc.far = 70;
  sun.shadow.bias = -0.0007;
  scene.add(sun);
  scene.add(new THREE.DirectionalLight(0xdce8f0, 0.35).translateX(12).translateY(8).translateZ(14));
  /* Mbushje e brendshme: jashtë nuk duhet, por brenda — me tavan mbi kokë —
     dielli nuk hyn dot dhe dhomat dalin të zeza. Rregullohet te ndriçimi(). */
  const fill = new THREE.AmbientLight(0xf3ece0, 0);
  scene.add(fill);

  /* kamerat dhe kontrollat */
  const cam = new THREE.PerspectiveCamera(50, 1, 0.08, 400);

  const orbit = new OrbitControls(cam, renderer.domElement);
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.07;
  orbit.maxPolarAngle = Math.PI / 2 - 0.03;
  orbit.minDistance = 4;
  orbit.maxDistance = 70;

  /* Drejtimi i pamjes së nisjes: nga rruga (Z negative), pak nga e majta e
     nga lart — aq sa të lexohen njëherësh fasada, brezi i tullës dhe
     tërheqja e katit të dytë. Largësia nuk jepet me dorë: llogaritet nga
     sfera që mbyll vëllimin, prandaj kuadri qëndron i njëjtë në çdo ekran,
     edhe në celular me format vertikal.
     Objektivi nuk është qendra e vëllimit por pika para saj: shtëpia është
     11,80 m e thellë dhe, po të matej nga qendra, kamera do të përfundonte
     tepër afër fasadës.                                                   */
  const VIEW = new THREE.Vector3(-0.34, 0.52, -0.78).normalize();
  /* Për një kat të vetëm shikohet shumë më nga lart — si maketë e prerë;
     nga një kënd i ulët muret ballore do ta mbulonin brendinë. */
  const VIEW_FLOOR = new THREE.Vector3(-0.30, 1.05, -0.62).normalize();

  /* Kuadrimi bëhet mbi një drejtkëndësh (gjysmë-gjerësi × gjysmë-lartësi),
     jo mbi një sferë. Me sferë, një ekran i ngushtë celulari e shtynte
     kamerën dyfish më larg se ç'duhej — shtëpia dilte një pikë në mes.   */
  const FIT_ALL = { hw: 3.4, hh: 5.6, at: new THREE.Vector3(0, 4.4, -3.0), dir: VIEW };
  let framed = FIT_ALL;

  function frame(next) {
    if (next) framed = next;
    const t = Math.tan((cam.fov * Math.PI) / 360);
    const distV = framed.hh / t;
    const distH = framed.hw / (t * Math.max(cam.aspect, 0.25));
    const dist = Math.min(Math.max(distV, distH) * 1.12 + 4.0, orbit.maxDistance);
    orbit.target.copy(framed.at);
    cam.position.copy(framed.at).addScaledVector(framed.dir, dist);
  }

  /* ── gjendja ─────────────────────────────────────────────────────── */
  const state = { mode: 'orbit', floor: 'all', walkLevel: 0, yaw: Math.PI, pitch: 0 };
  const keys = new Set();
  const EYE = 1.62, SPEED = 3.1;

  /* Ecja brenda nuk përdor Pointer Lock: ai nuk ekziston fare në celular
     dhe dështon në disa kontekste edhe në kompjuter. Në vend të tij —
     tërhiq për të parë rrotull, prek dyshemenë për të shkuar atje, dhe
     W A S D për ata që janë para tastierës.                             */
  const walk = {
    dragging: false, moved: 0, id: null, px: 0, py: 0, t0: 0,
    goal: null,
  };
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();

  const onDown = (e) => {
    if (state.mode !== 'walk') return;
    walk.dragging = true; walk.moved = 0; walk.id = e.pointerId;
    walk.px = e.clientX; walk.py = e.clientY; walk.t0 = performance.now();
    walk.goal = null;
    // kapja e treguesit mban tërheqjen edhe kur del jashtë canvas-it
    try { el.setPointerCapture(e.pointerId); } catch { /* s'ka rëndësi */ }
  };

  const onMove = (e) => {
    if (state.mode !== 'walk' || !walk.dragging || e.pointerId !== walk.id) return;
    const dx = e.clientX - walk.px, dy = e.clientY - walk.py;
    walk.px = e.clientX; walk.py = e.clientY;
    walk.moved += Math.abs(dx) + Math.abs(dy);
    state.yaw -= dx * 0.0040;
    state.pitch = Math.max(-1.25, Math.min(1.25, state.pitch - dy * 0.0040));
  };

  const onUp = (e) => {
    if (state.mode !== 'walk' || !walk.dragging) return;
    walk.dragging = false;
    try { el.releasePointerCapture(e.pointerId); } catch { /* s'ka rëndësi */ }
    // prekje e shkurtër, pa tërheqje → shko atje ku u prek dyshemeja
    if (walk.moved > 8 || performance.now() - walk.t0 > 500) return;
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    floorPlane.constant = -M.LEVELS[state.walkLevel].base;
    if (!ray.ray.intersectPlane(floorPlane, hit)) return;
    const bx = M.W / 2 - 0.45, bz = M.D / 2 - 0.45;
    walk.goal = new THREE.Vector2(
      Math.min(bx, Math.max(-bx, hit.x)),
      Math.min(bz, Math.max(-bz, hit.z))
    );
  };

  const el = renderer.domElement;
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', () => { walk.dragging = false; });

  /* Sa dritë duhet varet nga ajo që shihet:
       jashtë        — diell i fortë, hije të qarta
       prerje kati   — çatia hiqet, por muret rrethuese e errësojnë brendinë
       brenda (ecje) — mbi kokë ka tavan, prandaj mbushja bëhet kryesore   */
  function lighting() {
    const inside = state.mode === 'walk';
    const single = state.floor !== 'all';
    hemi.intensity = inside ? 2.9 : single ? 2.35 : 1.15;
    sun.intensity = inside ? 1.4 : single ? 1.15 : 2.0;
    fill.intensity = inside ? 0.55 : single ? 0.22 : 0;
  }

  function applyFloor(id) {
    state.floor = id;
    const single = id !== 'all';
    levels.forEach((g, i) => {
      const on = !single || M.LEVELS[i].id === id;
      g.visible = on;
      const c = g.getObjectByName('ceil');
      if (c) c.visible = on && !single;
    });
    roof.visible = !single;
    brick.visible = !single;
    hood.visible = !single;
    lighting();

    if (single) {
      const i = M.LEVELS.findIndex((L) => L.id === id);
      state.walkLevel = Math.max(0, i);
      frame({
        hw: 3.4, hh: 5.2, dir: VIEW_FLOOR,
        at: new THREE.Vector3(0, M.LEVELS[state.walkLevel].base + 0.4, 0),
      });
    } else {
      state.walkLevel = 0;
      frame(FIT_ALL);
    }
  }

  function setMode(mode) {
    if (mode === state.mode) return;
    state.mode = mode;
    if (mode === 'walk') {
      orbit.enabled = false;
      const L = M.LEVELS[state.walkLevel];
      const s = L.spawn || { x: M.W / 2, z: M.D / 2, yaw: 180 };
      // koordinatat e modelit → bota (shtëpia është e qendërzuar te origjina)
      cam.position.set(s.x - M.W / 2, L.base + EYE, s.z - M.D / 2);
      state.yaw = (s.yaw * Math.PI) / 180;
      state.pitch = 0;
      walk.goal = null;
      walk.dragging = false;
    } else {
      orbit.enabled = true;
      frame();
    }
    lighting();
    host.dataset.mode = mode;
    if (opts.onMode) opts.onMode(mode);
  }

  const onKey = (e) => {
    if (e.type === 'keydown') keys.add(e.code); else keys.delete(e.code);
    if (e.type === 'keydown' && state.mode === 'walk' && ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  };
  addEventListener('keydown', onKey);
  addEventListener('keyup', onKey);

  /* ── madhësia ────────────────────────────────────────────────────── */
  let lastW = 0, lastH = 0;
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h || (w === lastW && h === lastH)) return;
    const first = lastW === 0;
    lastW = w; lastH = h;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    // kuadri rregullohet vetëm në matjen e parë — përndryshe një ridimensionim
    // do t'i prishte përdoruesit pamjen që sapo e zgjodhi vetë
    if (first && state.mode !== 'walk') frame();
  }
  const ro = new ResizeObserver(() => resize());
  ro.observe(host);
  resize();

  /* ── cikli ───────────────────────────────────────────────────────── */
  const clock = new THREE.Clock();
  let raf = 0, running = true;

  function tick() {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);

    if (state.mode === 'walk') {
      const sy = Math.sin(state.yaw), cy = Math.cos(state.yaw);
      const f = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
      const s = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
      if (f || s) {
        walk.goal = null;                         // tastiera e anulon destinacionin
        const boost = keys.has('ShiftLeft') || keys.has('ShiftRight') ? 1.9 : 1;
        const step = SPEED * boost * dt;
        cam.position.x += (-sy * f + cy * s) * step;
        cam.position.z += (-cy * f - sy * s) * step;
      } else if (walk.goal) {
        // rrëshqitje e butë drejt pikës së prekur
        const dx = walk.goal.x - cam.position.x, dz = walk.goal.y - cam.position.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.08) walk.goal = null;
        else {
          const step = Math.min(d, SPEED * dt);
          cam.position.x += (dx / d) * step;
          cam.position.z += (dz / d) * step;
        }
      }
      /* Pa përplasje me muret — kalohet lirshëm nga dhoma në dhomë — por
         brenda gabaritit, që të mos dilet duke fluturuar mbi kopsht.      */
      const bx = M.W / 2 - 0.30, bz = M.D / 2 - 0.30;
      cam.position.x = Math.min(bx, Math.max(-bx, cam.position.x));
      cam.position.z = Math.min(bz, Math.max(-bz, cam.position.z));
      // mbahet në lartësinë e syrit të katit aktual
      cam.position.y += (M.LEVELS[state.walkLevel].base + EYE - cam.position.y) * Math.min(1, dt * 8);
      cam.rotation.set(state.pitch, state.yaw, 0, 'YXZ');
    } else {
      orbit.update();
    }
    renderer.render(scene, cam);
  }
  tick();

  return {
    show: applyFloor,
    setMode,
    get mode() { return state.mode; },
    /** Thirret kur shikuesi shfaqet: rimat përmasat dhe rikthen kuadrin. */
    refresh() { resize(); if (state.mode !== 'walk') frame(); },
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      removeEventListener('keydown', onKey);
      removeEventListener('keyup', onKey);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      orbit.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
