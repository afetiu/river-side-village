# River Side — Village · Modeli i Shtëpisë 2

Faqe prezantimi për shitjen e një shtëpie në varg (P+2, 203,71 m² bruto) në
kompleksin *River Side — Village*. Statike, pa build-step, e strehuar në
Cloudflare Pages — **https://river-side-villa-7.pages.dev**

Një pamje e vetme: majtas identiteti, faktet dhe fotot; djathtas planet e
arkitektit. Paleta është marrë nga vetë planet — letër krem, bojë e ngrohtë,
theks tulle.

## Struktura

```
index.html          faqja e vetme
css/style.css       stilet dhe paleta (te :root)
js/main.js          ndërrimi i kateve, pamjet, harta, lightbox
assets/plans/*.webp planet e kateve — përdhesa, kati1, kati2
assets/img/         renderet dhe fasadat
data.json           të dhënat e nxjerra nga projekti i arkitektit (referencë)
src-images/         origjinalet me rezolucion të plotë — jashtë git-it
```

## Si të ndryshoj përmbajtjen

**Planet** — janë figura, jo vizatime të gjeneruara. Skedarët `.webp` te
`assets/plans/`. Për t'i zëvendësuar shih *Planet* më poshtë.

**Sipërfaqet e kateve** — te skedat në `index.html`, seksioni `.floor-tabs`
(`tab-lvl`, `tab-name`, `tab-area`). Sipërfaqet brenda dhomave janë pjesë e
vetë figurave.

**Kontakti** — në `index.html`, te `.contact` dhe te `.callbar` (shiriti i
celularit). Numrat janë te `href="tel:..."` (pa hapësira) dhe teksti veçmas.

**Ngjyrat** — të gjitha te `:root` në `css/style.css`.

## Planet

Origjinalet PNG rrinë te `src-images/plans/` (jashtë git-it, si fotot e tjera
me rezolucion të plotë). Ato kanë hapësirë të bardhë rreth vizatimit, prandaj
priten dhe rikodohen përpara se të shkojnë në web:

```bash
npx http-server . -p 8899 -c-1
msedge --headless --dump-dom http://127.0.0.1:8899/tools/encode.html > dom.txt
node tools/write-plans.js dom.txt
```

`tools/encode.html` gjen kutinë e vizatimit në të tri planet, merr bashkimin e
tyre dhe i pret të treja me të njëjtën kornizë — kështu katet mbeten të
përpikta mbi njëri-tjetrin kur ndërrohet skeda. Rezultati: ≈85 KB për kat në
vend të ≈1,3 MB.

Nëse ndryshon korniza, përditëso `width`/`height` te `<img class="plan-img">`
në `index.html` dhe `aspect-ratio` te `.plan-sheet` në celular.

## Google Analytics

Në `<head>` të `index.html` ka një bllok me `window.GA_ID = ''`. Vendos aty
ID-në e matjes GA4 dhe analytics-i aktivizohet vetë:

```js
window.GA_ID = 'G-XXXXXXXXXX';
```

ID-ja merret te [analytics.google.com](https://analytics.google.com) →
**Admin → Data streams → Web** → krijo një stream për domenin → kopjo
*Measurement ID* (fillon me `G-`).

Nëse fusha lihet bosh, skripti i Google-it nuk ngarkohet fare — asnjë kërkesë
e jashtme, asnjë cookie.

## Zhvillim lokal

```bash
npx http-server . -p 8899 -c-1
```

Duhet server (jo `file://`) sepse skripti është modul ES.

## Deploy — Cloudflare Pages

Projekti në Cloudflare: `river-side-villa-7` → https://river-side-villa-7.pages.dev
Account ID: `c31ddd9157887b4dee99ebfcc3221f8b`
Domeni: **riversidevilla7.com** (i regjistruar te GoDaddy, ende jo i lidhur).

Faqja nuk ngarkohet ashtu siç është — `tools/build.js` mbledh në `dist/`
vetëm atë që shkon në web, që `src-images/` dhe `tools/` të mos përfundojnë
në server:

```bash
node tools/build.js
npx wrangler pages deploy dist --project-name=river-side-villa-7
```

Çdo push në `main` e bën këtë vetë përmes `.github/workflows/deploy.yml`.
Kërkon dy secrets te repo-ja (Settings → Secrets → Actions):

| Secret | Nga ku merret |
|---|---|
| `CLOUDFLARE_API_TOKEN` | dash.cloudflare.com → My Profile → API Tokens → *Edit Cloudflare Workers* |
| `CLOUDFLARE_ACCOUNT_ID` | dash.cloudflare.com → Workers & Pages → shiriti djathtas |

`_headers` mban kokat e cache-it dhe të sigurisë. CSS-i dhe JS-i mbahen
vetëm një orë sepse s'kanë hash në emër.

### DNS

Domeni duhet të jetë zonë në Cloudflare që apex-i të funksionojë (GoDaddy
nuk lejon CNAME te apex-i; Cloudflare e zgjidh me *CNAME flattening*).

Gjendja (2026-08-01) — gjithçka në anën e Cloudflare është bërë:

- zona `riversidevilla7.com` është krijuar, statusi **pending**
- te projekti janë lidhur `riversidevilla7.com` dhe `www.riversidevilla7.com`
- rekordet ekzistojnë te zona, të dyja të proxy-uara:

  | Tipi | Emri | Vlera |
  |---|---|---|
  | CNAME | `riversidevilla7.com` | `river-side-villa-7.pages.dev` |
  | CNAME | `www` | `river-side-villa-7.pages.dev` |

Mbetet **një hap i vetëm**, te GoDaddy — *My Products* → domeni → *DNS* →
*Nameservers* → *Change* → *I'll use my own nameservers*:

```
boyd.ns.cloudflare.com
cora.ns.cloudflare.com
```

Pas kësaj zona aktivizohet vetë (zakonisht 1–24 orë) dhe certifikata vjen
menjëherë pas saj. Asgjë tjetër nuk duhet prekur — domeni s'ka MX as TXT,
vetëm faqen e parkimit të GoDaddy-t, prandaj asnjë email nuk prishet.

## Burimi

Projekti arkitektonik dhe planet: **NITI Construction**.
