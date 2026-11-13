// Builds the NextApps legal pages (GitHub Pages) from each app's store/*.md files.
// Usage: node build.js   (run from this folder; needs `marked`, resolved from C:\dev\legal-tools)
const fs = require('fs');
const path = require('path');
const { marked } = require(process.env.MARKED_PATH || 'C:/dev/legal-tools/node_modules/marked');

const ROOT = path.resolve(__dirname, '..');
const SUPPORT_EMAIL = 'game.enesileri@gmail.com';
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
];

// store file -> sub path under /<slug>/
const PAGES = [
  { file: 'privacy_policy.md', sub: '', title: 'Gizlilik Politikası' },
  { file: 'account_deletion.md', sub: 'hesap-silme', title: 'Hesap ve Veri Silme' },
  { file: 'terms.md', sub: 'kullanim-kosullari', title: 'Kullanım Koşulları' },
  { file: 'child_safety.md', sub: 'cocuk-guvenligi', title: 'Çocuk Güvenliği Standartları' },
];

const CSS = `
:root{--bg:#fafaf9;--fg:#1c1917;--muted:#57534e;--link:#1d4ed8;--line:#e7e5e4}
@media (prefers-color-scheme:dark){:root{--bg:#1c1917;--fg:#f5f5f4;--muted:#a8a29e;--link:#93c5fd;--line:#44403c}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.65 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:760px;margin:0 auto;padding:32px 16px 64px}a{color:var(--link)}
h1{font-size:1.8rem;line-height:1.25}h2{margin-top:2rem;border-top:1px solid var(--line);padding-top:1rem}
table{border-collapse:collapse;width:100%;display:block;overflow-x:auto}td,th{border:1px solid var(--line);padding:6px 8px;text-align:left}
nav{font-size:.9rem;color:var(--muted);margin-bottom:24px}footer{margin-top:48px;color:var(--muted);font-size:.85rem}`;

const page = (title, body, crumb) => `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><style>${CSS}</style></head>
<body><main><nav>${crumb}</nav>${body}<footer>NextApps</footer></main></body></html>`;

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
    const md = fs.readFileSync(src, 'utf8').replaceAll('{{DESTEK_EPOSTA}}', SUPPORT_EMAIL);
    const body = marked.parse(md);
    const crumb = `<a href="../${p.sub ? '../' : ''}">NextApps</a> › <a href="${p.sub ? '../' : './'}">${app.name}</a>`;
    fs.writeFileSync(path.join(dest, 'index.html'), page(`${app.name} — ${p.title}`, body, crumb));
    links.push(`<a href="${app.slug}/${p.sub ? p.sub + '/' : ''}">${p.title}</a>`);
  }
  if (links.length) index.push(`<h2>${app.name}</h2><p>${links.join(' · ')}</p>`);
}
fs.writeFileSync(path.join(OUT, 'index.html'),
  page('NextApps — Yasal Sayfalar', `<h1>NextApps yasal sayfaları</h1>${index.join('')}`, ''));
console.log('built', index.length, 'apps;', missing.length ? 'missing privacy: ' + missing.join(', ') : 'all privacy pages present');
