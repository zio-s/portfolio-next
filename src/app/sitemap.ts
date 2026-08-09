import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const baseUrl = 'https://semincode.com';

  // 정적 페이지 — lastModified는 실제 변경 시점과 무관하게 빌드 시각으로 찍혀
  // 매 배포마다 "전부 수정됨"이라는 거짓 신호가 되므로 넣지 않는다
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guestbook`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // 블로그 동적 페이지 (post_number로 URL 생성)
  const { data: posts } = await supabase
    .from('posts')
    .select('post_number, updated_at')
    .eq('status', 'published')
    .order('post_number', { ascending: true });

  const blogPages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.post_number}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages];
}
