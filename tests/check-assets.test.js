const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SCRIPT = path.join(__dirname, '..', 'scripts', 'check-assets.js');
const ROOT = path.join(__dirname, '..');

function run(cwd) {
  try {
    const stdout = execFileSync('node', [SCRIPT], { cwd, encoding: 'utf8' });
    return { status: 0, stdout };
  } catch (err) {
    return { status: err.status, stdout: err.stdout, stderr: err.stderr };
  }
}

describe('scripts/check-assets.js (static site link/asset integrity)', () => {
  test('passes against the real site as committed', () => {
    const result = run(ROOT);
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/all references resolve/);
  });

  test('fails when an HTML file links to a clean route with no nginx.conf rewrite', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cm-site-check-'));
    fs.cpSync(ROOT, tmpDir, {
      recursive: true,
      filter: (src) => !src.includes(`${path.sep}node_modules${path.sep}`) && !src.endsWith(`${path.sep}node_modules`),
    });

    const target = path.join(tmpDir, 'data-center.html');
    const original = fs.readFileSync(target, 'utf8');
    fs.writeFileSync(target, original.replace('href="/industries"', 'href="/industries-typo"'));

    const result = run(tmpDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('/industries-typo');

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('fails when an HTML file references a missing local file', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cm-site-check-'));
    fs.cpSync(ROOT, tmpDir, {
      recursive: true,
      filter: (src) => !src.includes(`${path.sep}node_modules${path.sep}`) && !src.endsWith(`${path.sep}node_modules`),
    });

    const target = path.join(tmpDir, 'data-center.html');
    const original = fs.readFileSync(target, 'utf8');
    fs.writeFileSync(target, original.replace('src="script.js"', 'src="scirpt.js"'));

    const result = run(tmpDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('scirpt.js');

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
