/* Mbledh në dist/ vetëm skedarët që shkojnë në web.
   Pa këtë, `wrangler pages deploy .` do të ngarkonte edhe src-images/
   (dhjetëra MB foto origjinale), tools/ dhe .git/.

   Përdorimi:  node tools/build.js                                    */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist');

const SHIP = ['index.html', '_headers', 'css', 'js', 'assets'];

/* Zbraz dist/ pa e fshirë vetë dosjen: në Windows, nëse një server lokal
   ose shfletues e mban dosjen hapur, rmSync mbi të dështon me EPERM —
   ndërsa fshirja e përmbajtjes brenda saj kalon pa problem. */
if (fs.existsSync(OUT)) {
  for (const e of fs.readdirSync(OUT)) {
    fs.rmSync(path.join(OUT, e), { recursive: true, force: true });
  }
} else {
  fs.mkdirSync(OUT, { recursive: true });
}

let files = 0, bytes = 0;
for (const entry of SHIP) {
  const from = path.join(ROOT, entry);
  if (!fs.existsSync(from)) throw new Error('mungon: ' + entry);
  fs.cpSync(from, path.join(OUT, entry), { recursive: true });
}

(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else { files++; bytes += fs.statSync(p).size; }
  }
})(OUT);

console.log(`dist/  ${files} skedarë  ${(bytes / 1024 / 1024).toFixed(2)} MB`);
