// Build: copy src/ to dist/ and refuse broken pages (a title, balanced section/div tags, no empty links).
import fs from 'node:fs'; import path from 'node:path';
fs.rmSync('dist', { recursive: true, force: true }); fs.mkdirSync('dist');
let errors = 0;
for (const f of fs.readdirSync('src')) {
  const s = fs.readFileSync(path.join('src', f), 'utf8');
  if (f.endsWith('.html')) {
    if (!/<title>[^<]+<\/title>/.test(s)) { console.error(`${f}: missing <title>`); errors++; }
    for (const tag of ['section', 'div', 'main', 'header', 'footer']) {
      const open = (s.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length, close = (s.match(new RegExp(`</${tag}>`, 'g')) || []).length;
      if (open !== close) { console.error(`${f}: <${tag}> opened ${open} times, closed ${close} times`); errors++; }
    }
    if (/href=""/.test(s)) { console.error(`${f}: empty link`); errors++; }
  }
  fs.copyFileSync(path.join('src', f), path.join('dist', f));
}
if (errors) { console.error(`build failed: ${errors} problem(s)`); process.exit(1); }
console.log(`built ${fs.readdirSync('dist').length} files`);
