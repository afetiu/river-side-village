/* Shkruan në assets/plans/ WebP-të që prodhon tools/encode.html.
   Përdorimi:  node tools/write-plans.js <dosja-me-dom.txt>            */
const fs = require('fs');

const dom = fs.readFileSync(process.argv[2], 'utf8');
const m = dom.match(/<pre id="out">([\s\S]*?)<\/pre>/);
if (!m) throw new Error('nuk u gjet dalja e veglës');
if (m[1].startsWith('ERROR')) throw new Error(m[1]);

for (const line of m[1].trim().split('\n')) {
  if (line.startsWith('#')) { console.log(line); continue; }
  const [name, url] = line.split('\t');
  const buf = Buffer.from(url.split(',')[1], 'base64');
  fs.writeFileSync(`assets/plans/${name}.webp`, buf);
  console.log(`${name}.webp  ${(buf.length / 1024).toFixed(0)} KB`);
}
