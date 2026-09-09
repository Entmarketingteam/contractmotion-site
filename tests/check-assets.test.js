const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.join(__dirname, '..');

// check-assets.js resolves its target directory from its own __dirname (by
// design — it always audits "the repo it ships in"), so to point it at an
// isolated fixture dir instead of the real repo, the script itself has to
// live under <fixtureDir>/scripts/.
function run(fixtureDir) {
  const script = path.join(fixtureDir, 'scripts', 'check-assets.js');
  try {
    const stdout = execFileSync('node', [script], { encoding: 'utf8' });
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

// Only the files scripts/check-assets.js actually reads: the top-level HTML
// pages, nginx.conf (for the clean-route table), and the real static assets
// they reference, so a fast, isolated fixture dir can stand in for the repo.
function makeFixtureDir() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cm-site-check-'));
  const htmlFiles = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
  for (const file of htmlFiles) {
    fs.copyFileSync(path.join(ROOT, file), path.join(tmpDir, file));
  }
  fs.copyFileSync(path.join(ROOT, 'nginx.conf'), path.join(tmpDir, 'nginx.conf'));
  fs.copyFileSync(path.join(ROOT, 'script.js'), path.join(tmpDir, 'script.js'));
  fs.copyFileSync(path.join(ROOT, 'style.css'), path.join(tmpDir, 'style.css'));
  fs.copyFileSync(path.join(ROOT, 'favicon.ico'), path.join(tmpDir, 'favicon.ico'));
  fs.cpSync(path.join(ROOT, 'images'), path.join(tmpDir, 'images'), { recursive: true });
  return tmpDir;
}

  test('fails when an HTML file links to a clean route with no nginx.conf rewrite', () => {
    const tmpDir = makeFixtureDir();
    const target = path.join(tmpDir, 'data-center.html');
    const original = fs.readFileSync(target, 'utf8');
    fs.writeFileSync(target, original.replace('href="/industries"', 'href="/industries-typo"'));

    const result = run(tmpDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('/industries-typo');

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('fails when an HTML file references a missing local file', () => {
    const tmpDir = makeFixtureDir();
    const target = path.join(tmpDir, 'data-center.html');
    const original = fs.readFileSync(target, 'utf8');
    fs.writeFileSync(target, original.replace('src="script.js"', 'src="scirpt.js"'));

    const result = run(tmpDir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('scirpt.js');

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
