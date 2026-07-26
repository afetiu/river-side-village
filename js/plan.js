import { KIND } from './floors.js';

/* Ndërton pamjen e katit: vizatimi origjinal + zonat e klikueshme mbi të. */
export function buildPlan(floor) {
  const fig = document.createElement('figure');
  fig.className = 'plan-figure';

  const img = document.createElement('img');
  img.className = 'plan-img';
  img.src = floor.img.src;
  img.width = floor.img.w;
  img.height = floor.img.h;
  img.alt = `Plani origjinal i katit — ${floor.name}, ${floor.area} m²`;
  img.decoding = 'async';
  fig.appendChild(img);

  const layer = document.createElement('div');
  layer.className = 'hotspots';

  floor.rooms.forEach(r => {
    // një dhomë mund të ketë disa drejtkëndësha (p.sh. tarraca në formë L)
    r.hot.forEach((rect, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hot';
      b.dataset.room = r.id;
      b.style.left = `${rect.x}%`;
      b.style.top = `${rect.y}%`;
      b.style.width = `${rect.w}%`;
      b.style.height = `${rect.h}%`;
      b.style.setProperty('--tint', KIND[r.kind].fill);
      b.setAttribute('aria-label',
        r.area ? `${r.name}, ${r.area.toFixed(2).replace('.', ',')} metra katrorë` : r.name);
      if (i > 0) b.setAttribute('tabindex', '-1');   // vetëm zona e parë merr fokus

      if (i === 0) {
        const tag = document.createElement('span');
        tag.className = 'hot-tag';
        tag.textContent = r.area
          ? `${r.name} · ${r.area.toFixed(2).replace('.', ',')} m²`
          : r.name;
        b.appendChild(tag);
      }
      layer.appendChild(b);
    });
  });

  fig.appendChild(layer);
  return fig;
}
