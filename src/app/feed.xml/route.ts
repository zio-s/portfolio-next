/**
 * RSS 2.0 피드
 *
 * DESIGN_RESPONSE_R4.md §5
 * - status='published' 만, publishedAt desc, 최근 30개
 * - Cache-Control 1h
 * - Content-Type: application/rss+xml; charset=utf-8
 */

import { createClient } from '@supabase/supabase-js';
import { PROFILE } from '@/config/profile';

const BASE_URL = 'https://semincode.com';
const FEED_URL = `${BASE_URL}/feed.xml`;
const SITE_TITLE = 'semincode';
const MAX_ITEMS = 30;

export const revalidate = 3600;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(date: string | Date | null | undefined): string {
  if (!date) return new Date().toUTCString();
  const d = typeof date === 'string' ? new Date(date) : date;
  return Number.isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

interface FeedPost {
  id: string;
  post_number: number;
  title: string;
  excerpt?: string;
  content?: string;
  category?: string;
  tags?: string[];
  published_at?: string | null;
  publishedAt?: string | null;
  created_at?: string;
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return new Response('feed unavailable', { status: 503 });
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from('post_stats')
    .select('id, post_number, title, excerpt, category, tags, published_at, created_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(MAX_ITEMS);

  if (error) {
    return new Response(`feed error: ${error.message}`, { status: 500 });
  }

  const posts = (data ?? []) as FeedPost[];
  const lastBuild = posts[0]?.published_at ?? new Date().toISOString();

  const items = posts.map((p) => {
    const link = `${BASE_URL}/blog/${p.post_number}`;
    const desc = p.excerpt ?? '';
    return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${toRfc822(p.published_at ?? p.created_at)}</pubDate>
      ${p.category ? `<category>${escapeXml(p.category)}</category>` : ''}
      <description><![CDATA[${desc}]]></description>
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${BASE_URL}</link>
    <description>${escapeXml(PROFILE.bio)}</description>
    <language>ko</language>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${toRfc822(lastBuild)}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
