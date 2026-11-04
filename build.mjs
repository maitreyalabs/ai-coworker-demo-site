import { readFileSync, copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'src';
const OUT = 'dist';
let errors = 0;

const files = readdirSync(SRC);

for (const f of files) {
  if (!f.endsWith('.html')) continue;

  const s = readFileSync(join(SRC, f), 'utf8');

  if (!/<title>[^<]*<\/title>/.test(s)) {
    console.error(`${f}: missing <title>`);
    errors++;
  }

  if (/href=""/.test(s)) {
    console.error(`${f}: empty link`);
    errors++;
  }

  for (const tag of ['main', 'header', 'footer', 'section', 'div']) {
    const open = (s.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
    const close = (s.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    if (open !== close) {
      console.error(`${f}: unbalanced <${tag}> (${open} open, ${close} close)`);
      errors++;
    }
  }
}

if (errors) {
  console.error(`build failed: ${errors} problem(s)`);
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
for (const f of files) {
  copyFileSync(join(SRC, f), join(OUT, f));
}

console.log('build ok');
