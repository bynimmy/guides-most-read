// Queries GA4 for all-time pageviews of the three guide URLs and writes
// featured.json with the current "most read" guide. Run daily by GitHub Actions.
//
// Auth: uses a Google service-account key via the GOOGLE_APPLICATION_CREDENTIALS
// env var (the workflow writes it to sa-key.json). GA4 Property ID via GA4_PROPERTY_ID.

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { writeFileSync } from 'node:fs';

const PROPERTY_ID = process.env.GA4_PROPERTY_ID; // e.g. "123456789" (just the number)
if (!PROPERTY_ID) throw new Error('Missing GA4_PROPERTY_ID');

// guide key -> live URL path (must match how GA4 records pagePath: no domain, no query)
const GUIDES = {
  families:  '/lifestyle-family-portraits-guide-what-to-wear',
  headshots: '/the-corporate-headshot-field-guide-what-to-wear-how-to-prepare',
  weddings:  '/the-ultimate-wedding-guide',
};

const client = new BetaAnalyticsDataClient();

const [report] = await client.runReport({
  property: `properties/${PROPERTY_ID}`,
  dateRanges: [{ startDate: '2015-01-01', endDate: 'today' }], // all-time
  dimensions: [{ name: 'pagePath' }],
  metrics: [{ name: 'screenPageViews' }],
  dimensionFilter: {
    filter: {
      fieldName: 'pagePath',
      inListFilter: { values: Object.values(GUIDES) },
    },
  },
  limit: 50,
});

const counts = { families: 0, headshots: 0, weddings: 0 };
for (const row of report.rows ?? []) {
  const path = row.dimensionValues[0].value;
  const views = Number(row.metricValues[0].value || 0);
  for (const [key, p] of Object.entries(GUIDES)) {
    if (path === p) counts[key] += views;
  }
}

// Pick the winner. If GA returns nothing (all zero), keep families as a safe default.
let featured = 'families';
let max = -1;
for (const [key, v] of Object.entries(counts)) {
  if (v > max) { max = v; featured = key; }
}

const out = { featured, counts, updated: new Date().toISOString() };
writeFileSync('featured.json', JSON.stringify(out, null, 2) + '\n');
console.log('Wrote featured.json:', out);
