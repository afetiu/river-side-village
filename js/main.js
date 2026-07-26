import { FLOORS, KIND } from './floors.js';
import { buildPlan } from './plan.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const fmt = n => n.toFixed(2).replace('.', ',');

const stage = $('#plan-stage');
let current = null;

/* ---------- përzgjedhja e dhomës ---------- */

function select(id) {
  $$('.plan-svg .room').forEach(r => r.classList.toggle('is-sel', r.dataset.room === id));
  $$('.rooms-inline li').forEach(li => li.classList.toggle('is-sel', li.dataset.room === id));
}

function highlight(id, on) {
  const g = stage.querySelector(`.room[data-room="${id}"]`);
  if (g) g.classList.toggle('is-hot', on);
}

/* ---------- lista e dhomave nën plan ---------- */

function renderRoomList(floor) {
  const ul = $('#rp-rooms');
  ul.innerHTML = '';
  floor.rooms.filter(r => r.area).forEach(r => {
    const li = document.createElement('li');
    li.dataset.room = r.id;
    li.title = `${r.name} · ${r.finish} · perimetri ${r.perimeter ? (r.perimeter / 100).toFixed(2).replace('.', ',') + ' m' : '—'}`;
    li.innerHTML = `<span class="rl-sw" style="background:${KIND[r.kind].fill}"></span>` +
      `<span>${r.name}</span><span class="rl-area">${fmt(r.area)} m²</span>`;
    li.addEventListener('click', () => select(r.id));
    li.addEventListener('mouseenter', () => highlight(r.id, true));
    li.addEventListener('mouseleave', () => highlight(r.id, false));
    ul.appendChild(li);
  });
}

/* ---------- ndërrimi i katit ---------- */

function setFloor(id) {
  const floor = FLOORS.find(f => f.id === id);
  if (!floor || (floor === current && stage.firstChild)) return;
  current = floor;

  $$('.floor-tabs button').forEach(b =>
    b.setAttribute('aria-selected', String(b.dataset.tab === id)));

  const svg = buildPlan(floor);
  svg.classList.add('is-entering');
  stage.replaceChildren(svg);
  requestAnimationFrame(() => svg.classList.remove('is-entering'));

  svg.querySelectorAll('.room').forEach(g => {
    const room = floor.rooms.find(r => r.id === g.dataset.room);
    g.addEventListener('click', () => select(room.id));
    g.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(room.id); }
    });
  });

  renderRoomList(floor);
}

setFloor('perdhesa');
$$('.floor-tabs button').forEach(b =>
  b.addEventListener('click', () => setFloor(b.dataset.tab)));

/* shigjetat majtas/djathtas mes kateve */
document.addEventListener('keydown', e => {
  if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  if ($('#lb').hidden === false) return;
  const i = FLOORS.indexOf(current);
  const n = e.key === 'ArrowRight' ? i + 1 : i - 1;
  if (FLOORS[n]) setFloor(FLOORS[n].id);
});

/* ---------- harta ---------- */

const SITE = [42.356054, 20.832722];

(function initMap() {
  const mount = $('#map-mount');
  if (!mount || typeof L === 'undefined') return;

  const map = L.map(mount, {
    center: SITE, zoom: 16, scrollWheelZoom: false,
    zoomControl: true, attributionControl: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
  }).addTo(map);

  L.marker(SITE, {
    icon: L.divIcon({
      className: 'site-pin',
      html: '<span class="pin-ring"></span><span class="pin-dot"></span>',
      iconSize: [28, 28], iconAnchor: [14, 14]
    }),
    title: 'River Side — Village, Nr. 7'
  }).addTo(map).bindPopup('<strong>River Side — Village</strong><br>Modeli 2 · Nr. 7');

  map.on('click', () => map.scrollWheelZoom.enable());
  map.on('mouseout', () => map.scrollWheelZoom.disable());

  // harta rifreskon përmasat kur ndryshon dritarja
  new ResizeObserver(() => map.invalidateSize()).observe(mount);
})();

/* koordinatat me një klikim */
$('#coords')?.addEventListener('click', async e => {
  const t = e.currentTarget, txt = SITE.join(', ');
  try { await navigator.clipboard.writeText(txt); t.textContent = 'U kopjua ✓'; }
  catch { /* pa clipboard — lëri koordinatat siç janë */ }
  setTimeout(() => { t.textContent = txt; }, 1800);
});

/* ---------- lightbox i pamjeve ---------- */

const lb = $('#lb'), lbImg = $('#lb-img'), lbCap = $('#lb-cap');

function openLb(src, cap, alt) {
  lbImg.src = src; lbImg.alt = alt || cap || '';
  lbCap.textContent = cap || '';
  lb.hidden = false;
  $('#lb-close').focus();
}
function closeLb() { lb.hidden = true; lbImg.src = ''; }

$$('#shots button').forEach(b =>
  b.addEventListener('click', () =>
    openLb(b.dataset.img, b.dataset.cap, b.querySelector('img')?.alt)));

$('#lb-close').addEventListener('click', closeLb);
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });
