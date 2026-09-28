// Run after any report generator; only navigation markup is rewritten.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = path.join(__dirname, '..');
const nav = '<!-- SITE RETURN NAV START --><nav class="site-return-nav" aria-label="全站快捷导航"><a href="index.html"><span>返回首页</span><small>Home</small></a><a href="index.html#report-directory"><span>报告目录</span><small>Reports</small></a></nav><!-- SITE RETURN NAV END -->';
const links = [
  ['family-projects.html', '最新家庭专项 · 葡萄牙／加拿大／西班牙／新加坡'],
  ['canada-projects.html', '加拿大两项目比较'],
  ['nz-child-overview.html', '新西兰 · 孩子先行与陪读'],
  ['countries.html', '全球37个国家与地区'],
  ['family-report.html', '家庭需求与回国衔接'],
  ['five-country-focus.html', '五国学费与降费路径'],
  ['family20-overview.html', '亲子年度20万元预算'],
  ['south-child-overview.html', '南欧教育与居留研究'],
  ['youth-vet-overview.html', '未成年职业教育路径'],
  ['index.html#topics', '按研究问题查找章节'],
  ['index.html#downloads', '完整报告与下载'],
  ['references.html', '全部参考来源']
];
const directory = '<!-- SITE REPORT DIRECTORY START --><section class="hub-section" id="report-directory" aria-labelledby="site-directory-title"><h2 id="site-directory-title">报告目录 <small class="hub-small">All reports</small></h2><p class="hub-small">先选报告系列，再进入国家、章节及原始来源；新旧研究均保留。</p><div class="site-report-directory-links">' + links.map(([href, label]) => `<a href="${href}">${label} →</a>`).join('') + '</div></section><!-- SITE REPORT DIRECTORY END -->';
let count = 0;
for (const file of fs.readdirSync(root).filter(f => f.endsWith('.html'))) {
  const dest = path.join(root, file);
  let html = fs.readFileSync(dest, 'utf8');
  html = html.replace(/<!-- SITE RETURN NAV START -->[\s\S]*?<!-- SITE RETURN NAV END -->/g, '')
    .replace(/<!-- SITE REPORT DIRECTORY START -->[\s\S]*?<!-- SITE REPORT DIRECTORY END -->/g, '')
    .replace(/<link rel="stylesheet" href="site-navigation.css">/g, '')
    .replace(/ data-site-navigation(?:="")?/g, '');
  if (!/<body\b/.test(html) || !html.includes('</head>')) throw Error(`Not an HTML document: ${file}`);
  html = html.replace('</head>', '<link rel="stylesheet" href="site-navigation.css"></head>')
    .replace(/<body\b([^>]*)>/, `<body$1 data-site-navigation>${nav}`);
  if (file === 'index.html') {
    const marker = '<!-- FAMILY PROJECTS RELEASE START -->';
    if (!html.includes(marker)) throw Error('Home report insertion point is missing');
    html = html.replace(marker, directory + marker);
  }
  fs.writeFileSync(dest, html);
  count++;
}
console.log(`Installed independent navigation on ${count} HTML pages.`);
const manifestPath = path.join(root, 'publication-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
for (const report of [...manifest.reports, ...manifest.familyDeepReports.reports]) {
  const bytes = fs.readFileSync(path.join(root, report.file));
  report.bytes = bytes.length;
  report.sha256 = createHash('sha256').update(bytes).digest('hex');
}
manifest.navigation = { version: 1, pages: count, directory: 'index.html#report-directory' };
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
