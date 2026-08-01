const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ---------------------------------------------------------------
   Dy shtresa <img> që shkëmbehen: fotoja e re ngarkohet e padukshme
   dhe shfaqet vetëm kur është gati, kështu nuk ka pulsim.
   --------------------------------------------------------------- */
function fader(a, b) {
  let front = a, back = b;
  return src => {
    if (!src || front.getAttribute('src') === src) return;
    const swap = () => {
      back.classList.add('is-on');
      front.classList.remove('is-on');
      [front, back] = [back, front];
    };
    back.src = src;
    if (back.complete) swap(); else back.addEventListener('load', swap, { once: true });
  };
}

/* ---------- planet e kateve ---------- */

const setPlan = fader($('#plan-a'), $('#plan-b'));
const tabs = $$('.floor-tabs button');
let floor = tabs[0];

function setFloor(btn) {
  if (!btn) return;
  floor = btn;
  tabs.forEach(b => b.setAttribute('aria-selected', String(b === btn)));
  setPlan(btn.dataset.plan);
  $('#plan-a').alt = $('#plan-b').alt = `Planimetria — ${btn.dataset.name}`;
}

tabs.forEach(b => b.addEventListener('click', () => setFloor(b)));

/* katet e tjerë ngarkohen në heshtje, që ndërrimi të jetë i menjëhershëm */
addEventListener('load', () => tabs.forEach(b => { new Image().src = b.dataset.plan; }));

/* shigjetat majtas/djathtas mes kateve */
document.addEventListener('keydown', e => {
  if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  if ($('#lb').hidden === false) return;
  const i = tabs.indexOf(floor);
  setFloor(tabs[e.key === 'ArrowRight' ? i + 1 : i - 1]);
});

/* ---------- pamjet ---------- */

const setShot = fader($('#gal-a'), $('#gal-b'));
const setBg = fader($('#bg-a'), $('#bg-b'));
const cap = $('#shot-cap');
let shot = $('#thumbs button.is-on');

function pick(btn) {
  if (!btn) return;
  shot = btn;
  $$('#thumbs button').forEach(b => b.classList.toggle('is-on', b === btn));
  setShot(btn.dataset.img);
  setBg(btn.dataset.sm);          // sfondi merr variantin e vogël — është i turbullt gjithsesi
  cap.textContent = btn.dataset.cap;
  $('#gal-a').alt = $('#gal-b').alt = btn.dataset.cap;
}

$$('#thumbs button').forEach(b => b.addEventListener('click', () => pick(b)));

/* ---------- harta — shenjë vendi, jo hartë për t'u shfletuar ---------- */

const SITE = [42.356054, 20.832722];

(function initMap() {
  const mount = $('#map-mount');
  if (!mount || typeof L === 'undefined') return;

  const map = L.map(mount, {
    center: SITE, zoom: 15,
    zoomControl: false, attributionControl: true,
    dragging: false, scrollWheelZoom: false, doubleClickZoom: false,
    boxZoom: false, keyboard: false, touchZoom: false, tap: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
  }).addTo(map);

  L.marker(SITE, {
    icon: L.divIcon({
      className: 'site-pin',
      html: '<span class="pin-ring"></span><span class="pin-dot"></span>',
      iconSize: [26, 26], iconAnchor: [13, 13]
    }),
    title: 'River Side — Village, Nr. 7'
  }).addTo(map);

  // harta rifreskon përmasat kur ndryshon dritarja
  new ResizeObserver(() => map.invalidateSize()).observe(mount);
})();

/* ---------- lightbox ---------- */

const lb = $('#lb'), lbImg = $('#lb-img'), lbCap = $('#lb-cap');

function openLb(src, caption) {
  lbImg.src = src; lbImg.alt = caption || '';
  lbCap.textContent = caption || '';
  lb.hidden = false;
  $('#lb-close').focus();
}
function closeLb() { lb.hidden = true; lbImg.src = ''; }

$('#gallery').addEventListener('click', () => openLb(shot.dataset.img, shot.dataset.cap));
$('#plan-sheet').addEventListener('click', () =>
  openLb(floor.dataset.plan, `Planimetria — ${floor.dataset.name}`));

$('#lb-close').addEventListener('click', closeLb);
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });
