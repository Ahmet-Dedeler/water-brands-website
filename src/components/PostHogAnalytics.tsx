import Script from "next/script";

/**
 * Anonymous web analytics via PostHog (project "loved.domains", shared by
 * several sites and split by $host). The browser talks to /_ph/* on our own
 * domain; next.config rewrites that to PostHog, so ad blockers rarely hit it.
 * Replaces Vercel Web Analytics, which bills per event.
 *
 * The key is a public, write-only project token (safe in client code).
 */
const POSTHOG_KEY = "phc_KvG5TP5Z0LHYMCtAaGPhVN2QgMTFmri3SiYagtcI9Y";

const SNIPPET = `(function(w){var p=w.posthog=w.posthog||[];if(p.__SV)return;p._i=[];p.__SV=1;
p.init=function(k,c,n){p._i.push([k,c,n])};
['capture','identify','reset','register'].forEach(function(m){p[m]=function(){p.push([m].concat([].slice.call(arguments)))}});
var s=document.createElement('script');s.async=true;s.crossOrigin='anonymous';s.src='/_ph/static/array.js';document.head.appendChild(s);
p.init('${POSTHOG_KEY}',{api_host:'/_ph',ui_host:'https://us.posthog.com',defaults:'2025-05-24',person_profiles:'identified_only'});
})(window)`;

export default function PostHogAnalytics() {
  return (
    <Script id="posthog" strategy="afterInteractive">
      {SNIPPET}
    </Script>
  );
}
