import { FLOORS, KIND } from './floors.js';
import { buildPlan } from './plan.js';
import { buildIso } from './iso.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const fmt = n => n.toFixed(2).replace('.', ',');

const stage = $('#plan-stage');
const panel = { empty: $('#rp-empty'), body: $('#rp-body') };

let current = FLOORS[0];
let iso;

/* ---------- paneli i dhomës ---------- */

function showRoom(room, floor) {
  panel.empty.hidden = true;
  panel.body.hidden = false;
  $('#rp-kind').textContent = KIND[room.kind].label;
  $('#rp-name').textContent = room.name;
  $('#rp-area').innerHTML = room.area
    ? `${fmt(room.area)} <span>m²</span>`
    : '<span class="rp-na">Pjesë e qarkullimit</span>';
  $('#rp-finish').textContent = room.finish || '—';
  $('#rp-floor').textContent = `${floor.name} (${floor.level})`;
  $('#rp-per').textContent = room.perimeter ? `${(room.perimeter / 100).toFixed(2).replace('.', ',')} m` : '—';

  const note = $('#rp-note');
  if (room.inferred) {
    note.hidden = false;
    note.textContent = 'Kjo hapësirë është nën shkallë dhe shfaqet me dush në projekt, por nuk është e etiketuar në tabelën e sipërfaqeve. Sipërfaqja është llogaritur nga kuotat.';
  } else note.hidden = true;

  $$('.plan-svg .room').forEach(r => r.classList.toggle('is-sel', r.dataset.room === room.id));
  $$('.rp-rooms li').forEach(li => li.classList.toggle('is-sel', li.dataset.room === room.id));
}

function clearRoom() {
  panel.empty.hidden = false;
  panel.body.hidden = true;
  $$('.plan-svg .room').forEach(r => r.classList.remove('is-sel'));
  $$('.rp-rooms li').forEach(li => li.classList.remove('is-sel'));
}

/* ---------- lista e dhomave ---------- */

function renderRoomList(floor) {
  const ul = $('#rp-rooms');
  ul.innerHTML = '';
  floor.rooms.filter(r => r.area).forEach(r => {
    const li = document.createElement('li');
    li.dataset.room = r.id;
    li.innerHTML = `<span class="rl-sw" style="background:${KIND[r.kind].fill}"></span>
      <span class="rl-name">${r.name}</span><span class="rl-area">${fmt(r.area)} m²</span>`;
    li.addEventListener('click', () => showRoom(r, floor));
    li.addEventListener('mouseenter', () => highlight(r.id, true));
    li.addEventListener('mouseleave', () => highlight(r.id, false));
    ul.appendChild(li);
  });
}

function highlight(id, on) {
  const g = stage.querySelector(`.room[data-room="${id}"]`);
  if (g) g.classList.toggle('is-hot', on);
}

/* ---------- legjenda ---------- */

function renderLegend(floor) {
  const seen = new Map();
  floor.rooms.forEach(r => { if (r.area) seen.set(r.kind, KIND[r.kind]); });
  $('#legend').innerHTML = [...seen].map(([k, v]) =>
    `<li><i style="background:${v.fill}"></i>${v.label}</li>`).join('');
}

/* ---------- ndërrimi i katit ---------- */

function setFloor(id, { scroll = false } = {}) {
  const floor = FLOORS.find(f => f.id === id);
  if (!floor || floor === current && stage.firstChild) return;
  current = floor;

  $$('.floor-tabs button').forEach(b =>
    b.setAttribute('aria-selected', String(b.dataset.tab === id)));

  const svg = buildPlan(floor);
  svg.classList.add('is-entering');
  stage.replaceChildren(svg);
  requestAnimationFrame(() => svg.classList.remove('is-entering'));

  svg.querySelectorAll('.room').forEach(g => {
    const room = floor.rooms.find(r => r.id === g.dataset.room);
    g.addEventListener('click', () => showRoom(room, floor));
    g.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showRoom(room, floor); }
    });
  });

  $('#floor-blurb').textContent = floor.blurb;
  $('#orig-link').href = `assets/img/orig-${floor.id}.jpg`;
  $('#orig-img').src = `assets/img/orig-${floor.id}.jpg`;
  renderRoomList(floor);
  renderLegend(floor);
  clearRoom();
  iso?.setActive(id);

  if (scroll) $('#planimetria').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- inicializimi ---------- */

iso = buildIso($('#iso'), id => setFloor(id));
setFloor('perdhesa');

$$('.floor-tabs button').forEach(b =>
  b.addEventListener('click', () => setFloor(b.dataset.tab)));

const ex = $('#explode');
ex.addEventListener('click', () => {
  const on = ex.getAttribute('aria-pressed') !== 'true';
  ex.setAttribute('aria-pressed', String(on));
  ex.querySelector('.toggle-txt').textContent = on ? 'Bashko katet' : 'Shpërndaj katet';
  iso.setExploded(on);
});

/* shigjetat majtas/djathtas mes kateve */
document.addEventListener('keydown', e => {
  if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  if (!$('#planimetria').contains(document.activeElement) && document.activeElement !== document.body) return;
  const i = FLOORS.indexOf(current);
  const n = e.key === 'ArrowRight' ? i + 1 : i - 1;
  if (FLOORS[n]) setFloor(FLOORS[n].id);
});

/* shfaq / fsheh vizatimin origjinal krahas planit të vizatuar */
const so = $('#show-orig');
so.addEventListener('click', () => {
  const on = so.getAttribute('aria-pressed') !== 'true';
  so.setAttribute('aria-pressed', String(on));
  $('#plan-orig').hidden = !on;
  $('.plan-stage').classList.toggle('is-split', on);
});

/* ---------- harta ---------- */

const SITE = [42.356054, 20.832722];

(function initMap() {
  const mount = document.getElementById('map-mount');
  if (!mount || typeof L === 'undefined') return;

  const map = L.map(mount, {
    center: SITE, zoom: 16, scrollWheelZoom: false, attributionControl: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  const icon = L.divIcon({
    className: 'site-pin',
    html: '<span class="pin-ring"></span><span class="pin-dot"></span>',
    iconSize: [28, 28], iconAnchor: [14, 14]
  });

  L.marker(SITE, { icon, title: 'River Side — Village' })
    .addTo(map)
    .bindPopup('<strong>River Side — Village</strong><br>Shtëpi në varg, Modeli 2');

  // rrota e mausit aktivizohet vetëm pas klikimit, që faqja të skrollohet lirshëm
  map.on('click', () => map.scrollWheelZoom.enable());
  map.on('mouseout', () => map.scrollWheelZoom.disable());
})();

const copyBtn = $('#copy-coords');
copyBtn?.addEventListener('click', async () => {
  const txt = SITE.join(', ');
  try {
    await navigator.clipboard.writeText(txt);
    copyBtn.textContent = 'U kopjua ✓';
  } catch {
    copyBtn.textContent = txt;
  }
  setTimeout(() => { copyBtn.textContent = 'Kopjo koordinatat'; }, 2200);
});

/* nav e ngjeshur pas skrollimit */
const nav = $('#nav');
const io = new IntersectionObserver(([e]) => nav.classList.toggle('is-solid', !e.isIntersecting),
  { rootMargin: '-90px 0px 0px 0px' });
io.observe($('.hero-inner'));

/* zbulim progresiv i seksioneve */
const reveal = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); reveal.unobserve(en.target); } });
}, { threshold: 0.12 });
$$('.story, .plans, .fac, .proj, .map, .contact, .specs').forEach(s => { s.classList.add('rv'); reveal.observe(s); });
