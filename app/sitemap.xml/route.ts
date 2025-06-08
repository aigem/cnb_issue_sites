import { getAllPosts } from '@/lib/api';
import { getSiteConfig } from '@/lib/config';
import { BlogPost } from '@/types/blog';

export const dynamic = 'force-static';

export async function GET() {
    const siteConfig = await getSiteConfig();
    const siteUrl = siteConfig.url.endsWith('/') ? siteConfig.url : `${siteConfig.url}/`;

    const posts: BlogPost[] = await getAllPosts();

    const sitemapEntries = posts.map((post: BlogPost) => {
        const postUrl = `${siteUrl}posts/${post.slug}/`;
        const lastMod = post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date().toISOString();
        return `
    <url>
        <loc>${postUrl}</loc>
        <lastmod>${lastMod}</lastmod>
    </url>`;
    });

    const staticPages = [
        { path: '', priority: '1.0' }, // Homepage
        { path: 'posts/', priority: '0.8' }, // Main posts page
        { path: 'about/', priority: '0.5' }, // About page
        // Add other static pages like categories, tags if they exist
    ];

    const staticPageEntries = staticPages.map(page => {
        return `
    <url>
        <loc>${siteUrl}${page.path}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <priority>${page.priority}</priority>
        <changefreq>daily</changefreq>
    </url>`;
    // Note: changefreq and priority are often ignored by modern search engines but can be included.
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticPageEntries.join('')}
    ${sitemapEntries.join('')}
</urlset>`;

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
