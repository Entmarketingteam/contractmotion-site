#!/usr/bin/env node
/*
 * Static build check: every local (non-http, non-anchor) src/href reference
 * across the site's HTML files must resolve to a real file. A missing script,
 * stylesheet, or image on a static site fails silently in the browser — this
 * turns that into a CI failure.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));

const REF_PATTERN = /(?:src|href)="([^"]+)"/g;

let missing = [];

for (const file of htmlFiles) {
  const contents = fs.readFileSync(path.join(ROOT, file), 'utf8');
  let match;
  while ((match = REF_PATTERN.exec(contents)) !== null) {
    const ref = match[1];
    if (
      !ref ||
      ref.startsWith('http://') ||
      ref.startsWith('https://') ||
      ref.startsWith('//') ||
      ref.startsWith('#') ||
      ref.startsWith('mailto:') ||
      ref.startsWith('data:')
    ) {
      continue;
    }
    const cleanRef = ref.split('?')[0].split('#')[0];
    const resolved = path.join(ROOT, cleanRef);
    if (!fs.existsSync(resolved)) {
      missing.push(`${file} -> ${ref}`);
    }
  }
}

if (missing.length > 0) {
  console.error('Broken local asset references found:');
  missing.forEach((m) => console.error('  ' + m));
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML files — all local asset references resolve.`);
