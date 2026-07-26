import { BUILDING, KIND } from './floors.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (n, a = {}) => {
  const e = document.createElementNS(NS, n);
  for (const k in a) if (a[k] !== null && a[k] !== undefined) e.setAttribute(k, a[k]);
  return e;
};
const fmt = n => n.toFixed(2).replace('.', ',');
const rad = d => (d * Math.PI) / 180;

/* ---------- mobilje ---------- */
function furniture(room) {
  const g = el('g', { class: 'furn' });
  const { x, y, w, h } = room;
  const R = (a, b, c, d) => g.appendChild(el('rect', { x: a, y: b, width: c, height: d, rx: 5, class: 'f-line' }));
  const C = (a, b, r) => g.appendChild(el('circle', { cx: a, cy: b, r, class: 'f-line' }));

  switch (room.kind) {
    case 'bedroom': {
      const bw = Math.min(165, w - 70), bh = Math.min(205, h - 90);
      const bx = x + 22, by = y + (h - bh) / 2;
      R(bx, by, bw, bh); R(bx + 12, by + 8, bw - 24, 44);
      R(bx + bw + 8, by, 42, 42);
      if (w > 300) { const dw = 48, dx = x + w - dw - 12; R(dx, y + 24, dw, Math.min(200, h - 80)); }
      break;
    }
    case 'living':
      R(x + 26, y + 22, w - 210, 58); R(x + 26, y + 105, 66, 140); R(x + 145, y + 118, 125, 70);
      R(x + w - 120, y + 22, 92, 190); break;
    case 'dining': {
      const cx = x + w / 2 - 30, cy = y + h / 2 + 20;
      R(cx - 78, cy - 52, 156, 104);
      for (let i = 0; i < 3; i++) { C(cx - 52 + i * 52, cy - 74, 17); C(cx - 52 + i * 52, cy + 74, 17); }
      R(x + 12, y + 16, 52, h - 32); break;
    }
    case 'bath':
      if (w * h > 40000) R(x + 12, y + 12, 66, 145);
      C(x + w - 46, y + 42, 22); R(x + w - 64, y + h - 86, 38, 54); break;
    case 'utility':
      R(x + 12, y + 12, 52, 52); R(x + 72, y + 12, 52, 52); break;
    case 'balcony': case 'terrace':
      R(x + 18, y + 18, 54, 54); C(x + w - 46, y + h - 46, 24); break;
  }
  return g;
}

/* ---------- shkallët ---------- */
function stairs(s) {
  const g = el('g', { class: 'stair' });
  g.appendChild(el('rect', { x: s.x, y: s.y, width: s.w, height: s.h, class: 'stair-bg' }));
  const step = s.h / s.steps;
  for (let i = 1; i < s.steps; i++)
    g.appendChild(el('line', { x1: s.x, y1: s.y + i * step, x2: s.x + s.w, y2: s.y + i * step, class: 'stair-tread' }));
  const mx = s.x + s.w / 2;
  g.appendChild(el('line', { x1: mx, y1: s.y + s.h - 18, x2: mx, y2: s.y + 18, class: 'stair-arrow' }));
  g.appendChild(el('path', { d: `M ${mx - 13} ${s.y + 44} L ${mx} ${s.y + 15} L ${mx + 13} ${s.y + 44}`, class: 'stair-arrow' }));
  return g;
}

/* ---------- dyer ---------- */
function door(d) {
  const g = el('g', { class: 'door' });
  if (d.type === 'entrance') {
    g.appendChild(el('rect', { x: d.x, y: d.y, width: d.w, height: d.h, class: 'door-leaf' }));
    g.appendChild(el('path', {
      d: `M ${d.x} ${d.y + d.h} L ${d.x} ${d.y + d.h + d.w} A ${d.w} ${d.w} 0 0 0 ${d.x + d.w} ${d.y + d.h}`,
      class: 'door-arc'
    }));
    return g;
  }
  const [hx, hy] = d.hinge, r = d.r;
  const p0 = [hx + r * Math.cos(rad(d.a0)), hy + r * Math.sin(rad(d.a0))];
  const p1 = [hx + r * Math.cos(rad(d.a1)), hy + r * Math.sin(rad(d.a1))];
  g.appendChild(el('path', { d: `M ${p0[0]} ${p0[1]} A ${r} ${r} 0 0 1 ${p1[0]} ${p1[1]}`, class: 'door-arc' }));
  g.appendChild(el('line', { x1: hx, y1: hy, x2: p0[0], y2: p0[1], class: 'door-leaf-line' }));
  return g;
}

/* ---------- plani ---------- */
export function buildPlan(floor, opts = {}) {
  const { w: BW, h: BH, wallExt: wall, wallR } = BUILDING;
  const bare = !!opts.bare;              // vetëm gjeometria, për mbivendosje
  const pad = bare ? 0 : 175;
  const topPad = bare ? 0 : 110;
  const botPad = bare ? 0 : 360;

  const svg = el('svg', {
    viewBox: bare ? `0 0 ${BW} ${BH}` : `${-pad} ${-pad - topPad} ${BW + pad * 2} ${BH + pad * 2 + botPad}`,
    class: 'plan-svg', role: 'img', 'aria-label': `Plani i katit — ${floor.name}`
  });

  const rc = floor.recess;
  const outline = (i = 0) => rc
    ? `M ${i} ${i} H ${BW - i} V ${rc.y + i} H ${rc.x + i} V ${BH - i} H ${i} Z`
    : `M ${i} ${i} H ${BW - i} V ${BH - i} H ${i} Z`;

  if (!bare) {
    const defs = el('defs');
    defs.innerHTML = `<filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#2b211a" flood-opacity=".16"/></filter>`;
    svg.appendChild(defs);

    (floor.outside || []).forEach(o => {
      const g = el('g', { class: 'outside' });
      g.appendChild(el('rect', { x: o.x, y: o.y, width: o.w, height: o.h, class: 'outside-rect' }));
      const t = el('text', { x: o.x + o.w / 2, y: o.y + o.h / 2 + 9, class: 'outside-label' });
      t.textContent = o.label; g.appendChild(t);
      svg.appendChild(g);
    });

    const slab = el('g', { filter: 'url(#soft)' });
    slab.appendChild(el('path', { d: outline(0), class: 'slab' }));
    svg.appendChild(slab);
  }

  /* dhomat */
  const roomsG = el('g', { class: 'rooms' });
  floor.rooms.forEach(r => {
    const g = el('g', { class: 'room', 'data-room': r.id, tabindex: '0', role: 'button',
      'aria-label': `${r.name}${r.area ? `, ${fmt(r.area)} metra katrorë` : ''}` });
    const rects = [{ x: r.x, y: r.y, w: r.w, h: r.h }, ...(r.extra || [])];
    rects.forEach(q => g.appendChild(el('rect', {
      x: q.x, y: q.y, width: q.w, height: q.h, fill: KIND[r.kind].fill, class: 'room-fill' })));
    if (!bare) g.appendChild(furniture(r));
    rects.forEach(q => g.appendChild(el('rect', {
      x: q.x, y: q.y, width: q.w, height: q.h, class: 'room-hit' })));
    roomsG.appendChild(g);
  });
  svg.appendChild(roomsG);

  if (floor.stair) svg.appendChild(stairs(floor.stair));

  /* muret */
  const wallsG = el('g', { class: 'walls' });
  wallsG.appendChild(el('path', { d: outline(wall / 2), class: 'wall-ext', 'stroke-width': wall }));
  wallsG.appendChild(el('rect', { x: BW - wallR, y: 0, width: wallR, height: rc ? rc.y : BH, class: 'wall-party' }));
  (floor.walls || []).forEach(w =>
    wallsG.appendChild(el('rect', { x: w.x, y: w.y, width: w.w, height: w.h, class: 'wall-int' })));
  svg.appendChild(wallsG);

  /* dritaret dhe parmakët */
  const openG = el('g', { class: 'openings' });
  (floor.windows || []).forEach(w => {
    openG.appendChild(el('rect', { x: w.x, y: w.y, width: w.w, height: w.h, class: 'win-cut' }));
    const horiz = w.w > w.h, c = horiz ? w.y + w.h / 2 : w.x + w.w / 2;
    openG.appendChild(el('line', {
      x1: horiz ? w.x : c, y1: horiz ? c : w.y,
      x2: horiz ? w.x + w.w : c, y2: horiz ? c : w.y + w.h, class: 'win-glass' }));
  });
  (floor.rails || []).forEach(r => {
    openG.appendChild(el('rect', { x: r.x, y: r.y, width: r.w, height: r.h, class: 'rail-cut' }));
    const horiz = r.w > r.h;
    [horiz ? r.y + 5 : r.x + 5, horiz ? r.y + r.h - 5 : r.x + r.w - 5].forEach(c =>
      openG.appendChild(el('line', {
        x1: horiz ? r.x : c, y1: horiz ? c : r.y,
        x2: horiz ? r.x + r.w : c, y2: horiz ? c : r.y + r.h, class: 'rail-line' })));
  });
  svg.appendChild(openG);

  (floor.doors || []).forEach(d => svg.appendChild(door(d)));

  if (bare) return svg;

  /* etiketat */
  const labels = el('g', { class: 'labels' });
  floor.rooms.forEach(r => {
    if (!r.area) return;
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    const tight = Math.min(r.w, r.h);
    const fs = tight < 170 ? 19 : tight < 250 ? 23 : 27;
    const t = el('text', { x: cx, y: cy - fs * 0.2, class: 'room-name', 'font-size': fs });
    t.textContent = r.name;
    const a = el('text', { x: cx, y: cy + fs * 1.15, class: 'room-area', 'font-size': fs - 2 });
    a.textContent = `${fmt(r.area)} m²`;
    labels.appendChild(t); labels.appendChild(a);
  });
  svg.appendChild(labels);

  /* kuotat */
  const dim = el('g', { class: 'dims' });
  const chain = (x1, y1, x2, y2, text, vert, cls) => {
    dim.appendChild(el('line', { x1, y1, x2, y2, class: cls ? 'dim-line-in' : 'dim-line' }));
    [[x1, y1], [x2, y2]].forEach(([px, py]) => dim.appendChild(el('line', {
      x1: px - (vert ? 8 : 0), y1: py - (vert ? 0 : 8),
      x2: px + (vert ? 8 : 0), y2: py + (vert ? 0 : 8), class: 'dim-tick' })));
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const t = el('text', { x: mx, y: my + (vert ? 0 : -11), class: cls ? 'dim-text-in' : 'dim-text',
      transform: vert ? `rotate(-90 ${mx} ${my})` : null });
    t.textContent = text; dim.appendChild(t);
  };
  chain(0, -196, BW, -196, '6.00 m', false);
  chain(-124, 0, -124, BH, '11.80 m', true);
  (floor.dims || []).forEach(d => d.axis === 'y'
    ? chain(-58, d.a, -58, d.b, d.t, true, 1)
    : chain(d.a, -118, d.b, -118, d.t, false, 1));
  svg.appendChild(dim);

  const capY = BH + (floor.outside?.length ? 250 : 130);
  const cap = el('g', { class: 'plan-cap' });
  cap.appendChild(el('line', { x1: 0, y1: capY - 52, x2: BW, y2: capY - 52, class: 'cap-rule' }));
  const t1 = el('text', { x: 0, y: capY, class: 'cap-name' }); t1.textContent = floor.name.toUpperCase();
  const t2 = el('text', { x: BW, y: capY, class: 'cap-area' });
  t2.textContent = `${fmt(floor.area)} m²  ·  ${floor.level}`;
  cap.appendChild(t1); cap.appendChild(t2);
  svg.appendChild(cap);

  return svg;
}
