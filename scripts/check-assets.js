#!/usr/bin/env node
/*
 * Static build check for a site with no bundler: every local src/href
 * reference across the HTML files must actually resolve once deployed.
 *
 * Two failure modes this catches:
 *  1. A file reference (script.js, style.css, an image) that doesn't exist.
 *  2. A clean URL (e.g. "/data-center") that has no matching `location =`
 *     rewrite in nginx.conf, or whose rewrite target .html file is missing.
 *     This site has been bitten before by routes/sitemap drift when a new
 *     vertical page is added (see git history) — this check exists so that
 *     class of bug fails CI instead of shipping as a 404 in production.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
const nginxConf = fs.readFileSync(path.join(ROOT, 'nginx.conf'), 'utf8');

// Map clean routes declared in nginx.conf (e.g. "/data-center") to their
// try_files target (e.g. "/data-center.html").
const cleanRoutes = new Map();
const locationBlockPattern = /location\s*=\s*(\/[^\s{]+)\s*\{\s*try_files\s+(\/[^\s;]+)/g;
let locMatch;
while ((locMatch = locationBlockPattern.exec(nginxConf)) !== null) {
  cleanRoutes.set(locMatch[1], locMatch[2]);
}

const REF_PATTERN = /(?:src|href)="([^"]+)"/g;
const errors = [];

for (const file of htmlFiles) {
  const contents = fs.readFileSync(path.join(ROOT, file), 'utf8');
  let match;
  while ((match = REF_PATTERN.exec(contents)) !== null) {
    const ref = match[1];
    if (
      !ref ||
      ref === '/' ||
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
    const hasExtension = path.extname(cleanRef) !== '';

    if (hasExtension) {
      const resolved = path.join(ROOT, cleanRef);
      if (!fs.existsSync(resolved)) {
        errors.push(`${file} -> "${ref}" (file does not exist)`);
      }
      continue;
    }

    // Extensionless internal link: must be a declared clean route in
    // nginx.conf, and that route's target .html file must exist.
    const target = cleanRoutes.get(cleanRef);
    if (!target) {
      errors.push(`${file} -> "${ref}" (no nginx.conf "location = ${cleanRef}" rewrite)`);
      continue;
    }
    if (!fs.existsSync(path.join(ROOT, target))) {
      errors.push(`${file} -> "${ref}" (nginx.conf routes to missing file ${target})`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Found ${errors.length} broken reference(s):`);
  errors.forEach((e) => console.error('  ' + e));
  process.exit(1);
}

console.log(
  `Checked ${htmlFiles.length} HTML files against ${cleanRoutes.size} nginx clean routes — all references resolve.`
);
