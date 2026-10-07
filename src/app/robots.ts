import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/data';

// Search and AI answer-engine crawlers are explicitly welcome: being cited by
// Google AI Overviews, ChatGPT, Perplexity, Claude and Gemini is a goal.
const AI_AND_SEARCH_BOTS = [
  'Googlebot',
  'Google-Extended',
  'Bingbot',
  'DuckDuckBot',
  'Applebot',
  'Applebot-Extended',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'CCBot',
  'meta-externalagent',
  'MistralAI-User',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_AND_SEARCH_BOTS, allow: '/' },
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
