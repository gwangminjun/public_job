import fs from 'node:fs';

const files = [
  { name: 'mobile', path: '.lighthouse/mobile.json' },
  { name: 'desktop', path: '.lighthouse/desktop.json' },
];

function toPercent(value) {
  if (typeof value !== 'number') return 'N/A';
  return `${Math.round(value * 100)}`;
}

for (const file of files) {
  if (!fs.existsSync(file.path)) {
    console.log(`[${file.name}] report not found: ${file.path}`);
    continue;
  }

  const report = JSON.parse(fs.readFileSync(file.path, 'utf8'));
  const categories = report.categories || {};

  console.log(`\n[${file.name.toUpperCase()}]`);
  console.log(`Performance: ${toPercent(categories.performance?.score)}`);
  console.log(`Accessibility: ${toPercent(categories.accessibility?.score)}`);
  console.log(`Best Practices: ${toPercent(categories['best-practices']?.score)}`);
  console.log(`SEO: ${toPercent(categories.seo?.score)}`);
}
