import { ImageResponse } from 'next/og';
import { waterCards } from '@/lib/data';
import { getRanking, rankingItems, type WaterRanking } from '@/lib/rankings';
import { CONTENT_YEAR, SITE_NAME } from '@/lib/site';

export const alt = `${SITE_NAME}: the healthiest bottled water brands, ranked by lab tests`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Default social card for every page without its own image.
export default function OpengraphImage() {
  const top = rankingItems(getRanking('healthiest-bottled-water') as WaterRanking).items.slice(0, 3);
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 64, background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 512 512">
            <defs>
              <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#38bdf8" />
                <stop offset="1" stopColor="#0369a1" />
              </linearGradient>
            </defs>
            <rect width="512" height="512" rx="112" fill="url(#bg)" />
            <path d="M256 70 C256 70 118 228 118 318 C118 394 180 452 256 452 C332 452 394 394 394 318 C394 228 256 70 256 70 Z" fill="#ffffff" />
            <path d="M192 322 L238 366 L326 270" fill="none" stroke="#0284c7" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#0c4a6e' }}>{SITE_NAME}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 68, fontWeight: 800, color: '#0f172a', lineHeight: 1.05 }}>{`The healthiest bottled water brands of ${CONTENT_YEAR}`}</div>
          <div style={{ fontSize: 30, color: '#334155', marginTop: 20 }}>{`${waterCards.length.toLocaleString()} waters ranked by lab-tested contaminants, microplastics, PFAS & packaging`}</div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {top.map((w, i) => (
            <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', borderRadius: 16, padding: '14px 20px', fontSize: 24, color: '#0f172a' }}>
              <span style={{ fontWeight: 800, color: '#0284c7' }}>{`#${i + 1}`}</span>
              <span>{(w.brandName ?? w.name).slice(0, 22)}</span>
              <span style={{ fontWeight: 800, color: '#059669' }}>{w.score}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
