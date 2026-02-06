import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const baseUrl = 'https://semincode.com';

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guestbook`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // 프로젝트 동적 페이지
  const { data: projects } = await supabase
    .from('projects')
    .select('id, updated_at')
    .order('display_order', { ascending: true });

  const projectPages: MetadataRoute.Sitemap = (projects || []).map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified: new Date(project.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // 블로그 동적 페이지
  const { data: posts } = await supabase
    .from('posts')
    .select('id, updated_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const blogPages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...projectPages, ...blogPages];
}
