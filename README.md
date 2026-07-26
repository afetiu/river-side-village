# River Side — Village · Modeli i Shtëpisë 2

Faqe prezantimi për shitjen e një shtëpie në varg (P+2, 203,71 m² bruto) në
kompleksin *River Side — Village*. Statike, pa build-step, e strehuar në GitHub Pages.

## Struktura

```
index.html          faqja e vetme
css/style.css       stilet
js/floors.js        gjeometria e kateve (cm) — burimi i vetëm i të dhënave
js/plan.js          gjeneruesi i planeve SVG
js/iso.js           pamja aksonometrike e shpërndarë
js/main.js          ndërveprimet
assets/img/         renderet, fasadat, skanimet e planeve origjinale
data.json           të dhënat e nxjerra nga projekti i arkitektit
```

## Si të ndryshoj përmbajtjen

**Sipërfaqet dhe dhomat** — `js/floors.js`. Çdo dhomë ka `area` (m², zyrtare
sipas projektit), `perimeter` (cm), `finish` dhe kutinë `x/y/w/h` në centimetra.
Origjina është këndi i sipërm i majtë i gabaritit 600 × 1180 cm; ana e poshtme
e planit është fasada ballore.

**Kontakti** — në `index.html`, seksioni `#kontakt`. Zëvendëso numrin te
`href="tel:..."` dhe adresën te `href="mailto:..."`.

## Zhvillim lokal

```bash
npx http-server . -p 8899 -c-1
```

Duhet server (jo `file://`) sepse skriptat janë module ES.

## Domeni

Pas blerjes së domenit:

1. Krijo skedarin `CNAME` në rrënjë me vetëm domenin brenda, p.sh. `shtepia.com`
2. Te regjistruesi i domenit shto katër A-records për apex-in:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   (dhe një CNAME `www` → `afetiu.github.io`)
3. Në Settings → Pages të repos, vendos domenin dhe aktivizo *Enforce HTTPS*

## Burimi

Projekti arkitektonik: **NITI Construction**. Planet në faqe janë vizatime
ilustruese të ndërtuara mbi kuotat dhe sipërfaqet e projektit zbatues.
