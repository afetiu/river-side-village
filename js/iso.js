import { BUILDING, FLOORS, KIND } from './floors.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (n, a = {}) => {
  const e = document.createElementNS(NS, n);
  for (const k in a) if (a[k] !== null && a[k] !== undefined) e.setAttribute(k, a[k]);
  return e;
};

const COS = Math.cos(Math.PI / 6);   // 0.866
const SLAB = 26;                     // trashësia e pllakës në pamje

/* projeksion izometrik: bota (x, y, z) -> ekrani */
const proj = (x, y, z) => [(x - y) * COS, (x + y) * 0.5 - z];

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `rgb(${r},${g},${b})`;
}

/* një kuti e nxjerrë: faqja e sipërme + dy anët */
function box(x, y, w, h, z, thick, fill, cls) {
  const g = el('g', { class: cls });
  const top = [proj(x, y, z), proj(x + w, y, z), proj(x + w, y + h, z), proj(x, y + h, z)];
  const bot = [proj(x, y, z - thick), proj(x + w, y, z - thick), proj(x + w, y + h, z - thick), proj(x, y + h, z - thick)];

  // ana e majtë (x të vogla, y të mëdha) dhe ana e djathtë
  g.appendChild(el('polygon', {
    points: [top[3], top[2], bot[2], bot[3]].map(p => p.join(',')).join(' '),
    fill: shade(fill, -34)
  }));
  g.appendChild(el('polygon', {
    points: [top[1], top[2], bot[2], bot[1]].map(p => p.join(',')).join(' '),
    fill: shade(fill, -18)
  }));
  g.appendChild(el('polygon', {
    points: top.map(p => p.join(',')).join(' '), fill, class: 'iso-top'
  }));
  return g;
}

export function buildIso(mount, onSelect) {
  const { w: BW, h: BH } = BUILDING;
  const svg = el('svg', { class: 'iso-svg', role: 'img', 'aria-label': 'Pamje izometrike e tre kateve' });
  const scene = el('g', { class: 'iso-scene' });
  svg.appendChild(scene);

  const layers = [];

  // nga poshtë lart: përdhesa vizatohet e para
  FLOORS.forEach((floor, i) => {
    const z = i * 340;
    const g = el('g', {
      class: 'iso-floor', 'data-floor': floor.id, tabindex: '0', role: 'button',
      'aria-label': `${floor.name}, ${floor.area} metra katrorë`
    });
    g.style.setProperty('--i', i);

    // pllaka
    g.appendChild(box(0, 0, BW, BH, z, SLAB, '#CFC5B4', 'iso-slab'));

    // dhomat mbi pllakë
    const rg = el('g', { class: 'iso-rooms' });
    floor.rooms.forEach(r => {
      const isOpen = r.kind === 'balcony' || r.kind === 'terrace';
      const hgt = isOpen ? 8 : 46;
      rg.appendChild(box(r.x, r.y, r.w, r.h, z + hgt, hgt, KIND[r.kind].fill, 'iso-room'));
    });
    g.appendChild(rg);

    // etiketa e katit — jashtë gabaritit, në të djathtë
    const [lx, ly] = proj(BW + 340, BH * 0.34, z);
    const label = el('g', { class: 'iso-label' });
    const [tx, ty] = proj(BW, BH * 0.34, z);
    label.appendChild(el('line', { x1: tx, y1: ty, x2: lx - 18, y2: ly - 14, class: 'iso-leader' }));
    const t = el('text', { x: lx, y: ly, class: 'iso-label-name' });
    t.textContent = floor.name;
    const a = el('text', { x: lx, y: ly + 66, class: 'iso-label-area' });
    a.textContent = `${floor.area.toFixed(2).replace('.', ',')} m²`;
    label.appendChild(t); label.appendChild(a);
    g.appendChild(label);

    g.addEventListener('click', () => onSelect(floor.id));
    g.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(floor.id); }
    });

    scene.appendChild(g);
    layers.push(g);
  });

  // kufijtë e skenës
  const pts = [];
  FLOORS.forEach((f, i) => {
    const z = i * 340;
    [[0, 0], [BW, 0], [BW, BH], [0, BH]].forEach(([x, y]) => {
      pts.push(proj(x, y, z + 60)); pts.push(proj(x, y, z - SLAB));
    });
  });
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const EXPLODE = 430 * (FLOORS.length - 1);   // hapësirë kur katet shpërndahen
  const minX = Math.min(...xs) - 80, maxX = Math.max(...xs) + 780;
  const minY = Math.min(...ys) - 80 - EXPLODE, maxY = Math.max(...ys) + 120;
  svg.setAttribute('viewBox', `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);

  mount.appendChild(svg);

  return {
    setActive(id) {
      layers.forEach(l => l.classList.toggle('is-active', l.dataset.floor === id));
    },
    setExploded(on) { svg.classList.toggle('is-exploded', on); }
  };
}
