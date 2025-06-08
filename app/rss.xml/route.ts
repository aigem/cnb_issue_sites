import { getAllPosts } from '@/lib/api'; // Assuming getAllPosts can be limited or a new getLatestPosts(limit) is created
import { getSiteConfig, getContentConfig } from '@/lib/config';
import { BlogPost, Author } from '@/types/blog'; // Import BlogPost and Author
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

export const dynamic = 'force-static';

// Helper to escape HTML characters for XML content
function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

export async function GET() {
    const siteConfig = await getSiteConfig();
    const contentConfig = await getContentConfig();
    // Assuming postsPerPage can be used as a limit for RSS, or a dedicated RSS limit is in config
    const postsLimit = contentConfig.postsPerPage || 10;

    const siteUrl = siteConfig.url.endsWith('/') ? siteConfig.url : `${siteConfig.url}/`;
    const allPosts: BlogPost[] = await getAllPosts(); // Fetch all and then slice, or modify getAllPosts to accept a limit
    const posts = allPosts.slice(0, postsLimit);

    const rssItems = posts.map((post: BlogPost) => {
        const postUrl = `${siteUrl}posts/${post.slug}/`;
        // Ensure excerpt is plain text or properly escaped if it contains HTML
        const description = post.excerpt ? escapeXml(post.excerpt) : '';
        const pubDate = post.publishedAt
            ? format(new Date(post.publishedAt), 'EEE, dd MMM yyyy HH:mm:ss \'GMT\'', { locale: enUS })
            : format(new Date(), 'EEE, dd MMM yyyy HH:mm:ss \'GMT\'', { locale: enUS }); // Fallback to current date

        // Assuming post.author is of type Author from types/blog.ts
        const authorName = post.author ? escapeXml(post.author.name) : '';

        return `
        <item>
            <title>${escapeXml(post.title)}</title>
            <link>${postUrl}</link>
            <guid isPermaLink="true">${postUrl}</guid>
            <pubDate>${pubDate}</pubDate>
            <description>${description}</description>
            ${authorName ? `<dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">${authorName}</dc:creator>` : ''}
        </item>`;
    }).join('');

    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>${escapeXml(siteConfig.title)}</title>
        <link>${siteUrl}</link>
        <description>${escapeXml(siteConfig.description)}</description>
        <language>zh-CN</language>
        <lastBuildDate>${format(new Date(), 'EEE, dd MMM yyyy HH:mm:ss \'GMT\'', { locale: enUS })}</lastBuildDate>
        <atom:link href="${siteUrl}rss.xml" rel="self" type="application/rss+xml" />
        ${rssItems}
    </channel>
</rss>`;

    return new Response(rssFeed, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
