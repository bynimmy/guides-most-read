import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { writeFileSync } from 'node:fs';
import { parse } from 'node-html-parser';

const PROPERTY_ID = process.env.GA4_PROPERTY_ID;
if (!PROPERTY_ID) throw new Error('Missing GA4_PROPERTY_ID');

const GUIDES_PAGE = 'https://www.bynimmy.com/guides';

const html = await (await fetch(GUIDES_PAGE, { headers: { 'user-agent': 'featured-bot' } })).text();
const root = parse(html);
const paths = [...new Set(
  root.querySelectorAll('[data-cat]')
    .map(card => { const a = card.querySelector('a[href]'); return a ? a.getAttribute('href') : null; })
    .filter(h => h && h.startsWith('/') && h !== '#suggest')
)];

if (paths.length === 0) {
  console.log('No guide cards found — leaving featured.json unchanged.');
  process.exit(0);
}
console.log('Guide URLs found:', paths);

const client = new BetaAnalyticsDataClient();
const [report] = await client.runReport({
  property: `properties/${PROPERTY_ID}`,
  dateRanges: [{ startDate: '2015-08-14', endDate: 'today' }],
  dimensions: [{ name: 'pagePath' }],
  metrics: [{ name: 'screenPageViews' }],
  dimensionFilter: { filter: { fieldName: 'pagePath', inListFilter: { values: paths } } },
  limit: 200,
});

const counts = {};
for (const p of paths) counts[p] = 0;
for (const row of report.rows ?? []) {
  const path = row.dimensionValues[0].value;
  const views = Number(row.metricValues[0].value || 0);
  if (path in counts) counts[path] += views;
}

let featured = paths[0], max = -1;
for (const p of paths) if (counts[p] > max) { max = counts[p]; featured = p; }

const out = { featured, counts, updated: new Date().toISOString() };
writeFileSync('featured.json', JSON.stringify(out, null, 2) + '\n');
console.log('Wrote featured.json:', out);
