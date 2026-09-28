const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const pages = fs.readdirSync(root).filter(f => f.endsWith('.html'));

// Missing navigation in any report template must fail, not just in the newest reports.
test('every published page has working home and full-directory links without JavaScript', () => {
  for (const file of pages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const navs = [...html.matchAll(/<nav\b[^>]*aria-label="全站快捷导航"[^>]*>([\s\S]*?)<\/nav>/g)];
    assert.equal(navs.length, 1, `${file}: expected exactly one independent navigation`);
    for (const target of ['index.html', 'index.html#report-directory']) {
      assert(navs[0][1].includes(`href="${target}"`), `${file}: missing ${target}`);
      const [dest, id] = target.split('#');
      const destination = fs.readFileSync(path.join(root, dest), 'utf8');
      if (id) assert(destination.includes(`id="${id}"`), `missing directory anchor ${id}`);
    }
    assert(html.includes('href="site-navigation.css"'), `${file}: navigation has no stylesheet`);
  }
});

// The directory must reach both newly added reports and the original country/topic collections.
test('full directory reaches all report families rather than only the latest projects', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const directory = html.match(/<section\b[^>]*id="report-directory"[^>]*>([\s\S]*?)<\/section>/);
  assert(directory, 'missing full report directory');
  for (const file of ['family-projects.html', 'canada-projects.html', 'nz-child-overview.html', 'countries.html', 'family-report.html', 'five-country-focus.html', 'family20-overview.html', 'south-child-overview.html', 'youth-vet-overview.html', 'references.html']) {
    assert(directory[1].includes(`href="${file}"`), `directory cannot reach ${file}`);
    assert(fs.existsSync(path.join(root, file)), `broken directory destination ${file}`);
  }
});
