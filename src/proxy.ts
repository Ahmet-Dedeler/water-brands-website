import { NextResponse, type NextRequest } from 'next/server';

const DETAIL_ROUTE_PATTERN = /^\/(?:water|filter|ingredient|tap-water)\/[^/]+\/?$/;
const BRAND_ROUTE_PATTERN = /^\/brand\/[^/]+\/?$/;
const PROTECTED_CATALOG_PATTERN = /^\/(?:water|filter|ingredient|tap-water|brand)(?:\/|$)/;

const FIVE_MINUTES = 5 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;
const MAX_BUCKETS = 6000;

type Bucket = {
  count: number;
  resetAt: number;
};

const rateLimitBuckets = new Map<string, Bucket>();

// Obvious script clients used by indie scrapers — not search/AI crawlers.
const SCRIPT_OR_SCRAPER_UA_PATTERNS = [
  /^\s*$/,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /python-urllib/i,
  /aiohttp/i,
  /httpx/i,
  /scrapy/i,
  /node-fetch/i,
  /undici/i,
  /axios/i,
  /\bgot\//i,
  /go-http-client/i,
  /okhttp/i,
  /java\//i,
  /libwww-perl/i,
  /mechanize/i,
  /phantomjs/i,
  /headlesschrome/i,
  /postmanruntime/i,
  /insomnia/i,
  /ruby/i,
  /php/i,
  /powershell/i,
  /masscan/i,
  /zgrab/i,
  /nmap/i,
];

const SEARCH_CRAWLER_UA_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /duckduckbot/i,
  /slurp/i,
  /yandexbot/i,
  /baiduspider/i,
];

function clientIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown';

  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-vercel-forwarded-for') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

function hashString(value: string) {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

function matchesAny(userAgent: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(userAgent));
}

function isHtmlNavigation(request: NextRequest) {
  const accept = request.headers.get('accept') || '';
  const secFetchDest = request.headers.get('sec-fetch-dest') || '';

  return accept.includes('text/html') || secFetchDest === 'document';
}

function cleanBuckets(now: number) {
  if (rateLimitBuckets.size <= MAX_BUCKETS) return;

  for (const [key, bucket] of rateLimitBuckets) {
    if (bucket.resetAt <= now || rateLimitBuckets.size > MAX_BUCKETS) {
      rateLimitBuckets.delete(key);
    }

    if (rateLimitBuckets.size <= MAX_BUCKETS) break;
  }
}

function checkRateLimit(key: string, limit: number, windowMs: number, now: number) {
  cleanBuckets(now);

  const existing = rateLimitBuckets.get(key);
  if (!existing || existing.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, retryAfter: Math.ceil(windowMs / 1000) };
  }

  existing.count += 1;
  return {
    limited: existing.count > limit,
    retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

function guardedResponse(message: string, status: 403 | 429, retryAfter?: number) {
  const response = new NextResponse(message, {
    status,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
    },
  });

  if (retryAfter) response.headers.set('retry-after', retryAfter.toString());
  setSecurityHeaders(response);
  return response;
}

function setSecurityHeaders(response: NextResponse) {
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('x-frame-options', 'DENY');
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  response.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();
  const userAgent = request.headers.get('user-agent') || '';
  const isCatalogRoute = PROTECTED_CATALOG_PATTERN.test(pathname);
  const isDetailRoute = DETAIL_ROUTE_PATTERN.test(pathname) || BRAND_ROUTE_PATTERN.test(pathname);
  const isSitemap = pathname === '/sitemap.xml' || /^\/sitemap(?:-|\d).*\.xml$/.test(pathname);

  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    const response = NextResponse.next();
    setSecurityHeaders(response);
    return response;
  }

  const looksLikeScript = matchesAny(userAgent, SCRIPT_OR_SCRAPER_UA_PATTERNS);
  if ((isCatalogRoute || isSitemap) && looksLikeScript) {
    return guardedResponse('Scripted catalog scraping is not allowed.', 403);
  }

  const now = Date.now();
  const ip = clientIp(request);
  const uaKey = hashString(userAgent.toLowerCase());

  if (isSitemap) {
    const { limited, retryAfter } = checkRateLimit(`sitemap:${ip}:${uaKey}`, 4, ONE_HOUR, now);
    if (limited) {
      return guardedResponse('Too many sitemap requests. Please retry later.', 429, retryAfter);
    }
  }

  if (isDetailRoute) {
    const isSearchCrawler = matchesAny(userAgent, SEARCH_CRAWLER_UA_PATTERNS);
    const limit = isSearchCrawler ? 300 : isHtmlNavigation(request) ? 60 : 20;
    const { limited, retryAfter } = checkRateLimit(`detail:${ip}:${uaKey}`, limit, FIVE_MINUTES, now);

    if (limited) {
      return guardedResponse('Too many catalog detail requests. Please slow down and retry later.', 429, retryAfter);
    }
  }

  const response = NextResponse.next();
  setSecurityHeaders(response);
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|woff|woff2|ttf)$).*)',
  ],
};
