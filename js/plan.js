import { BUILDING, KIND } from './floors.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (n, a = {}) => {
  const e = document.createElementNS(NS, n);
  for (const k in a) if (a[k] !== null && a[k] !== undefined) e.setAttribute(k, a[k]);
  return e;
};
const fmt = n => n.toFixed(2).replace('.', ',');

/* ---------- mobilje: forma të thjeshta vijëzore ---------- */

function furniture(room) {
  const g = el('g', { class: 'furn' });
  const { x, y, w, h } = room;
  const R = (a, b, c, d, cls) => g.appendChild(el('rect', { x: a, y: b, width: c, height: d, rx: 6, class: cls || 'f-line' }));
  const C = (a, b, r) => g.appendChild(el('circle', { cx: a, cy: b, r, class: 'f-line' }));

  switch (room.kind) {
    case 'bedroom': {
      const bw = Math.min(160, w - 60), bh = Math.min(200, h - 80);
      const bx = x + 26, by = y + (h - bh) / 2;
      R(bx, by, bw, bh);                      // shtrat
      R(bx + 10, by + 8, bw - 20, 46);        // jastëk
      R(bx + bw + 10, by, 44, 44);            // komodinë
      if (w > 300) {                          // dollap me dyer
        const dw = 50, dh = Math.min(210, h - 90), dx = x + w - dw - 14, dy = y + 26;
        R(dx, dy, dw, dh);
        for (let i = 1; i < 3; i++)
          g.appendChild(el('line', { x1: dx, y1: dy + (dh / 3) * i, x2: dx + dw, y2: dy + (dh / 3) * i, class: 'f-line' }));
      }
      break;
    }
    case 'living': {
      R(x + 30, y + 26, w - 200, 62);                    // divan
      R(x + 30, y + 120, 70, 150);                       // kolltuk
      R(x + 150, y + 130, 130, 74);                      // tavolinë kafeje
      R(x + w - 130, y + 26, 100, 200);                  // element TV
      break;
    }
    case 'dining': {
      const cx = x + w / 2, cy = y + h / 2;
      R(cx - 80, cy - 55, 160, 110);                     // tryezë
      for (let i = 0; i < 3; i++) { C(cx - 55 + i * 55, cy - 78, 18); C(cx - 55 + i * 55, cy + 78, 18); }
      R(x + 14, y + 20, 56, h - 40);                     // kuzhinë linjë
      break;
    }
    case 'bath': {
      if (w * h > 40000) R(x + 14, y + 14, 70, 150);     // vaskë
      C(x + w - 50, y + 46, 24);                         // lavaman
      R(x + w - 68, y + h - 92, 40, 58);                 // WC
      break;
    }
    case 'utility': {
      R(x + 14, y + 14, 56, 56); R(x + 78, y + 14, 56, 56);
      break;
    }
    case 'balcony': case 'terrace': {
      R(x + 20, y + 20, 60, 60); C(x + w - 50, y + h - 50, 26);
      break;
    }
  }
  return g;
}

/* ---------- shkallët ---------- */

function stairs(s) {
  const g = el('g', { class: 'stair' });
  g.appendChild(el('rect', { x: s.x, y: s.y, width: s.w, height: s.h, class: 'stair-bg' }));
  const n = s.steps, step = s.h / n;
  for (let i = 1; i < n; i++) {
    g.appendChild(el('line', { x1: s.x, y1: s.y + i * step, x2: s.x + s.w, y2: s.y + i * step, class: 'stair-tread' }));
  }
  const mx = s.x + s.w / 2;
  g.appendChild(el('line', { x1: mx, y1: s.y + s.h - 20, x2: mx, y2: s.y + 20, class: 'stair-arrow' }));
  g.appendChild(el('path', { d: `M ${mx - 14} ${s.y + 46} L ${mx} ${s.y + 16} L ${mx + 14} ${s.y + 46}`, class: 'stair-arrow' }));
  return g;
}

/* ---------- dyer ---------- */

function door(d) {
  const g = el('g', { class: 'door' });
  if (d.type === 'entrance') {
    g.appendChild(el('rect', { x: d.x, y: d.y, width: d.w, height: d.h, class: 'door-leaf' }));
    g.appendChild(el('path', {
      d: `M ${d.x} ${d.y} L ${d.x} ${d.y - d.w} A ${d.w} ${d.w} 0 0 0 ${d.x + d.w} ${d.y}`, class: 'door-arc'
    }));
    return g;
  }
  const [hx, hy] = d.hinge, r = d.r;
  const rad = a => (a * Math.PI) / 180;
  const p0 = [hx + r * Math.cos(rad(d.a0)), hy + r * Math.sin(rad(d.a0))];
  const p1 = [hx + r * Math.cos(rad(d.a1)), hy + r * Math.sin(rad(d.a1))];
  g.appendChild(el('path', { d: `M ${p0[0]} ${p0[1]} A ${r} ${r} 0 0 1 ${p1[0]} ${p1[1]}`, class: 'door-arc' }));
  g.appendChild(el('line', { x1: hx, y1: hy, x2: p0[0], y2: p0[1], class: 'door-leaf-line' }));
  return g;
}

/* ---------- ndërtimi i planit ---------- */

export function buildPlan(floor) {
  const { w: BW, h: BH, wallExt: wall, wallParty } = BUILDING;
  const pad = 175;
  const svg = el('svg', {
    viewBox: `${-pad} ${-pad - 110} ${BW + pad * 2} ${BH + pad * 2 + 360}`,
    class: 'plan-svg', role: 'img',
    'aria-label': `Plani i katit — ${floor.name}`
  });

  const defs = el('defs');
  defs.innerHTML = `
    <pattern id="party" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="14" stroke="currentColor" stroke-width="5" opacity=".28"/>
    </pattern>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#2b211a" flood-opacity=".16"/>
    </filter>`;
  svg.appendChild(defs);

  /* hapësirat e jashtme */
  (floor.outside || []).forEach(o => {
    const g = el('g', { class: 'outside' });
    g.appendChild(el('rect', { x: o.x, y: o.y, width: o.w, height: o.h, class: 'outside-rect' }));
    g.appendChild(el('text', { x: o.x + o.w / 2, y: o.y + o.h / 2 + 9, class: 'outside-label' })).textContent = o.label;
    svg.appendChild(g);
  });

  /* gabariti i mbyllur — drejtkëndësh, ose L kur kati ka pjesë të tërhequr */
  const rc = floor.recess;
  const outline = (inset = 0) => {
    const i = inset;
    if (!rc) return `M ${i} ${i} H ${BW - i} V ${BH - i} H ${i} Z`;
    return `M ${i} ${i} H ${BW - i} V ${rc.y + i} H ${rc.x + i} V ${BH - i} H ${i} Z`;
  };

  /* pllaka */
  const slab = el('g', { filter: 'url(#soft)' });
  slab.appendChild(el('path', { d: outline(0), class: 'slab' }));
  svg.appendChild(slab);

  /* dhomat */
  const roomsG = el('g', { class: 'rooms' });
  floor.rooms.forEach(r => {
    const g = el('g', {
      class: 'room', 'data-room': r.id, tabindex: '0', role: 'button',
      'aria-label': `${r.name}${r.area ? `, ${fmt(r.area)} metra katrorë` : ''}`
    });
    g.appendChild(el('rect', {
      x: r.x, y: r.y, width: r.w, height: r.h,
      fill: KIND[r.kind].fill, class: 'room-fill'
    }));
    g.appendChild(furniture(r));
    g.appendChild(el('rect', { x: r.x, y: r.y, width: r.w, height: r.h, class: 'room-hit' }));
    roomsG.appendChild(g);
  });
  svg.appendChild(roomsG);

  if (floor.stair) svg.appendChild(stairs(floor.stair));

  /* muret */
  const wallsG = el('g', { class: 'walls' });
  wallsG.appendChild(el('path', {
    d: outline(wall / 2), class: 'wall-ext', 'stroke-width': wall
  }));
  // muret anësore = mure të përbashkëta me shtëpitë ngjitur (shtëpi në varg)
  wallsG.appendChild(el('rect', { x: 0, y: 0, width: wallParty, height: BH, class: 'wall-party' }));
  wallsG.appendChild(el('rect', {
    x: BW - wall, y: 0, width: wall, height: rc ? rc.y : BH, class: 'wall-party'
  }));
  (floor.walls || []).forEach(w =>
    wallsG.appendChild(el('rect', { x: w.x, y: w.y, width: w.w, height: w.h, class: 'wall-int' })));
  svg.appendChild(wallsG);

  /* dritaret — presin murin dhe vizatojnë xhamin */
  const winG = el('g', { class: 'windows' });
  (floor.windows || []).forEach(w => {
    winG.appendChild(el('rect', { x: w.x, y: w.y, width: w.w, height: w.h, class: 'win-cut' }));
    const horiz = w.w > w.h;
    const c = horiz ? w.y + w.h / 2 : w.x + w.w / 2;
    winG.appendChild(el('line', {
      x1: horiz ? w.x : c, y1: horiz ? c : w.y,
      x2: horiz ? w.x + w.w : c, y2: horiz ? c : w.y + w.h, class: 'win-glass'
    }));
  });
  svg.appendChild(winG);

  /* parmakët — aty ku ballkoni/tarraca hapet nga jashtë muri bëhet parmak */
  const railG = el('g', { class: 'rails' });
  (floor.rails || []).forEach(r => {
    railG.appendChild(el('rect', { x: r.x, y: r.y, width: r.w, height: r.h, class: 'rail-cut' }));
    const horiz = r.w > r.h;
    const a = horiz ? r.y + 5 : r.x + 5;
    const b = horiz ? r.y + r.h - 5 : r.x + r.w - 5;
    [a, b].forEach(c => railG.appendChild(el('line', {
      x1: horiz ? r.x : c, y1: horiz ? c : r.y,
      x2: horiz ? r.x + r.w : c, y2: horiz ? c : r.y + r.h, class: 'rail-line'
    })));
  });
  svg.appendChild(railG);

  (floor.doors || []).forEach(d => svg.appendChild(door(d)));

  /* etiketat */
  const labels = el('g', { class: 'labels' });
  floor.rooms.forEach(r => {
    if (!r.area) return;
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    // etiketa zvogëlohet në dhoma të vogla që të mos dalë jashtë mureve
    const tight = Math.min(r.w, r.h);
    const fs = tight < 170 ? 19 : tight < 250 ? 23 : 27;
    const gap = fs * 1.15;
    const t = el('text', {
      x: cx, y: cy - gap * 0.18, class: 'room-name',
      'font-size': fs, 'data-label-for': r.id
    });
    t.textContent = r.name;
    const a = el('text', {
      x: cx, y: cy + gap, class: 'room-area',
      'font-size': fs - 2, 'data-label-for': r.id
    });
    a.textContent = `${fmt(r.area)} m²`;
    labels.appendChild(t); labels.appendChild(a);
  });
  svg.appendChild(labels);

  /* kuotat kryesore */
  const dim = el('g', { class: 'dims' });
  const dimLine = (x1, y1, x2, y2, text, flip) => {
    dim.appendChild(el('line', { x1, y1, x2, y2, class: 'dim-line' }));
    [[x1, y1], [x2, y2]].forEach(([px, py]) =>
      dim.appendChild(el('line', {
        x1: px - (flip ? 0 : 8), y1: py - (flip ? 8 : 0),
        x2: px + (flip ? 0 : 8), y2: py + (flip ? 8 : 0), class: 'dim-tick'
      })));
    const t = el('text', {
      x: (x1 + x2) / 2, y: (y1 + y2) / 2 - (flip ? 0 : 12), class: 'dim-text',
      transform: flip ? `rotate(-90 ${(x1 + x2) / 2} ${(y1 + y2) / 2})` : null
    });
    t.textContent = text; dim.appendChild(t);
  };
  dimLine(0, -196, BW, -196, '6.00 m', false);
  dimLine(-124, 0, -124, BH, '11.80 m', true);

  /* kuotat e brendshme — vlerat e sakta nga projekti, në brezin anësor */
  const IN_X = -58;   // zinxhiri vertikal majtas gabaritit
  const IN_Y = -118;  // zinxhiri horizontal mbi gabaritin
  (floor.dims || []).forEach(d => {
    const vert = d.axis === 'y';
    const x1 = vert ? IN_X : d.a[0], x2 = vert ? IN_X : d.b[0];
    const y1 = vert ? d.a[1] : IN_Y, y2 = vert ? d.b[1] : IN_Y;

    const inner = el('g', { class: 'dim-inner' });
    inner.appendChild(el('line', { x1, y1, x2, y2, class: 'dim-line-in' }));
    [[x1, y1], [x2, y2]].forEach(([px, py]) =>
      inner.appendChild(el('line', {
        x1: px - (vert ? 9 : 0), y1: py - (vert ? 0 : 9),
        x2: px + (vert ? 9 : 0), y2: py + (vert ? 0 : 9), class: 'dim-tick'
      })));
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const t = el('text', {
      x: mx, y: my + (vert ? 0 : -10), class: 'dim-text-in',
      transform: vert ? `rotate(-90 ${mx} ${my})` : null
    });
    t.textContent = d.t;
    inner.appendChild(t);
    dim.appendChild(inner);
  });
  svg.appendChild(dim);

  /* titulli poshtë planit */
  const capY = BH + (floor.outside?.length ? 232 : 130);
  const cap = el('g', { class: 'plan-cap' });
  cap.appendChild(el('line', { x1: 0, y1: capY - 52, x2: BW, y2: capY - 52, class: 'cap-rule' }));
  const t1 = el('text', { x: 0, y: capY, class: 'cap-name' });
  t1.textContent = floor.name.toUpperCase();
  const t2 = el('text', { x: BW, y: capY, class: 'cap-area' });
  t2.textContent = `${fmt(floor.area)} m²  ·  ${floor.level}`;
  cap.appendChild(t1); cap.appendChild(t2);
  svg.appendChild(cap);

  return svg;
}
