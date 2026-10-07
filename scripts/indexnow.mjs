// Ping IndexNow (Bing, Yandex, Seznam, Naver; DuckDuckGo uses Bing's index)
// with every URL in the live sitemap. Run after a deploy:
//   node scripts/indexnow.mjs            # all sitemap URLs
//   node scripts/indexnow.mjs /best /guides/pfas-in-bottled-water
//
// The key file lives at public/<key>.txt so search engines can verify ownership.

const SITE = 'https://waterqualityrank.org';
const KEY = '3abff1a26cabeb828c111d413f26d24c';

async function sitemapUrls() {
  // A browser-like UA: the proxy blocks scripted clients from the sitemap.
  const res = await fetch(`${SITE}/sitemap.xml`, { headers: { 'user-agent': 'Mozilla/5.0 (IndexNow submitter) Chrome/120' } });
  if (!res.ok) throw new Error(`sitemap ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const args = process.argv.slice(2);
const urls = args.length ? args.map((p) => (p.startsWith('http') ? p : `${SITE}${p}`)) : await sitemapUrls();

// IndexNow accepts up to 10,000 URLs per request.
for (let i = 0; i < urls.length; i += 10000) {
  const batch = urls.slice(i, i + 10000);
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: batch }),
  });
  console.log(`IndexNow: ${batch.length} URLs -> ${res.status} ${res.statusText}`);
}
