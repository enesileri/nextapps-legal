// Builds the NextApps legal pages (GitHub Pages) from each app's store/*.md files.
// Usage: node build.js   (run from this folder; needs `marked`, resolved from C:\dev\legal-tools)
const fs = require('fs');
const path = require('path');
const { marked } = require(process.env.MARKED_PATH || 'C:/dev/legal-tools/node_modules/marked');

const ROOT = path.resolve(__dirname, '../..');
const SUPPORT_EMAIL = 'support.nextapps@gmail.com';
const OUT = path.join(__dirname, 'docs');

const APPS = [
  { dir: 'altmis-alti-gunde', slug: 'altmisaltigunde', name: '66 Günde' },
  { dir: 'hudhud', slug: 'hudhud', name: 'Hüdhüd' },
  { dir: 'kasada-sok-olma', slug: 'kasadasokolma', name: 'Kasada Şok Olma' },
  { dir: 'kelime-avi', slug: 'kelimeavi', name: 'Kelime Avı' },
  { dir: 'kombinle', slug: 'kombinle', name: 'Kombinle' },
  { dir: 'koro', slug: 'koro', name: 'Koro' },
  { dir: 'lisan', slug: 'lisan', name: 'Lisan' },
  { dir: 'yaninda', slug: 'yaninda', name: 'Yanında' },
  { dir: 'kumbara', slug: 'kumbara', name: 'Kumbara' },
  { dir: 'piyasa', slug: 'piyasa', name: 'Piyasa' },
  { dir: 'pikap', slug: 'pikap', name: 'Pikap' },
  { dir: 'bilye-rayi', slug: 'bilyerayi', name: 'Bilye Rayı' },
  { dir: 'karekod', slug: 'karekod', name: 'Karekod' },
  { dir: 'netlik', slug: 'netlik', name: 'Netlik' },
  { dir: 'mutlu-gun', slug: 'mutlugun', name: 'Mutlu Gün' },
  { dir: 'yorunge', slug: 'yorunge', name: 'Yörünge' },
  { dir: 'dolu-dolu', slug: 'doludolu', name: 'Dolu Dolu' },
];

// store file -> sub path under /<slug>/
const PAGES = [
  { file: 'privacy_policy.md', sub: '', title: 'Gizlilik Politikası' },
  { file: 'account_deletion.md', sub: 'hesap-silme', title: 'Hesap ve Veri Silme' },
  { file: 'terms.md', sub: 'kullanim-kosullari', title: 'Kullanım Koşulları' },
  { file: 'child_safety.md', sub: 'cocuk-guvenligi', title: 'Çocuk Güvenliği Standartları' },
];

// NextApps Sahne: gece zemini + mor-pembe ışık, Unbounded başlık + Manrope gövde.
// Uzun metin okunurluğu için gövde düz zeminde, kontrast AA'nın üstünde.
const CSS = `
:root{--bg:#0B0816;--card:rgba(255,255,255,.04);--fg:#ECE8F7;--muted:#B4ABD0;--link:#C4B5FD;--line:rgba(255,255,255,.12);--acc1:#8B5CF6;--acc2:#EC4899}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.7 Manrope,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
body::before{content:"";position:fixed;inset:-20vh -20vw auto -20vw;height:70vh;pointer-events:none;z-index:-1;
 background:radial-gradient(40% 60% at 15% 10%,rgba(139,92,246,.35),transparent 70%),radial-gradient(35% 50% at 90% 15%,rgba(236,72,153,.22),transparent 70%)}
main{max-width:780px;margin:0 auto;padding:40px 16px 72px}
a{color:var(--link);text-underline-offset:3px}a:hover{color:#fff}
h1,h2,h3{font-family:Unbounded,Manrope,system-ui,sans-serif;letter-spacing:-.3px;color:#fff}
h1{font-size:clamp(1.6rem,4.5vw,2.2rem);line-height:1.2;margin:.2em 0 .8em}
h2{font-size:1.25rem;margin-top:2.2rem;border-top:1px solid var(--line);padding-top:1.2rem}
h3{font-size:1.02rem;margin-top:1.6rem}
strong{color:#fff}
blockquote{margin:1.2em 0;padding:12px 16px;border:1px solid var(--line);border-radius:14px;background:var(--card);color:var(--muted)}
table{border-collapse:collapse;width:100%;display:block;overflow-x:auto;border-radius:12px}td,th{border:1px solid var(--line);padding:8px 10px;text-align:left}th{background:var(--card)}
hr{border:0;border-top:1px solid var(--line);margin:2rem 0}
nav{font-size:.9rem;color:var(--muted);margin-bottom:28px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
nav .mk{display:inline-flex;align-items:center;gap:8px;font-family:Unbounded,sans-serif;font-weight:700;color:#fff;text-decoration:none}
nav .mk img{width:24px;height:24px;border-radius:7px;display:inline-block} nav .mk b{color:#8b85f7;font-weight:800}
footer{margin-top:56px;padding-top:20px;border-top:1px solid var(--line);color:var(--muted);font-size:.85rem}
.idx h2{border:0;margin-top:1.4rem;padding:0}.idx p{margin:.3rem 0 0}
.idx section{padding:16px 18px;border:1px solid var(--line);border-radius:18px;background:var(--card);margin-top:12px}`;

const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
  + '<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700&family=Manrope:wght@400;600;700;800&display=swap" rel="stylesheet">';

const page = (title, body, crumb) => `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0B0816"><title>${title}</title>${FONTS}<style>${CSS}</style></head>
<body><main><nav>${crumb}</nav>${body}<footer>NextApps · <a href="https://enesileri.github.io/">enesileri.github.io</a> · ${SUPPORT_EMAIL}</footer></main></body></html>`;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

const index = [];
const missing = [];
for (const app of APPS) {
  const links = [];
  for (const p of PAGES) {
    const src = path.join(ROOT, app.dir, 'store', p.file);
    if (!fs.existsSync(src)) { if (p.sub === '') missing.push(app.dir); continue; }
    const dest = path.join(OUT, app.slug, p.sub);
    fs.mkdirSync(dest, { recursive: true });
    const md = fs.readFileSync(src, 'utf8')
      .replaceAll('{{DESTEK_EPOSTA}}', SUPPORT_EMAIL)
      .replaceAll('game.enesileri@gmail.com', SUPPORT_EMAIL);
    const body = marked.parse(md);
    const crumb = `<a class="mk" href="../${p.sub ? '../' : ''}"><img src="https://enesileri.github.io/assets/mark.svg" alt="" width="24" height="24">Next<b>Apps</b></a> › <a href="${p.sub ? '../' : './'}">${app.name}</a>`;
    fs.writeFileSync(path.join(dest, 'index.html'), page(`${app.name} — ${p.title}`, body, crumb));
    links.push(`<a href="${app.slug}/${p.sub ? p.sub + '/' : ''}">${p.title}</a>`);
  }
  if (links.length) index.push(`<section><h2>${app.name}</h2><p>${links.join(' · ')}</p></section>`);
}
fs.writeFileSync(path.join(OUT, 'index.html'),
  page('NextApps — Yasal Sayfalar', `<div class="idx"><h1>NextApps yasal sayfaları</h1>${index.join('')}</div>`, '<a class="mk" href="https://enesileri.github.io/"><img src="https://enesileri.github.io/assets/mark.svg" alt="" width="24" height="24">Next<b>Apps</b></a>'));
console.log('built', index.length, 'apps;', missing.length ? 'missing privacy: ' + missing.join(', ') : 'all privacy pages present');
