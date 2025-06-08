// scripts/generate-search-index.cjs
const fs = require('fs');
const path = require('path');
const FlexSearch = require('flexsearch');
// global.fetch is available in Node.js v18+

const simpleMarkdownToText = (md) => {
    if (!md) return '';
    // Remove HTML tags
    let text = md.replace(/<[^>]*>/g, '');
    // Remove markdown formatting characters (headings, bold, italic, strikethrough, code, blockquotes)
    text = text.replace(/^[#>\s]+/gm, '');
    text = text.replace(/[\*#_~`]/g, '');
    // Remove links, keeping the text
    text = text.replace(/\[(.*?)\]\(.*?\)/g, '$1');
    // Remove images, keeping alt text
    text = text.replace(/!\[(.*?)\]\(.*?\)/g, '$1');
    // Remove code blocks (simple version)
    text = text.replace(/```[\s\S]*?```/g, '');
    text = text.replace(/`{1,2}[^`]*?`{1,2}/g, ''); // Inline code
    // Remove horizontal rules
    text = text.replace(/---/g, '');
    text = text.replace(/\n{2,}/g, '\n'); // Multiple newlines to one
    return text.trim();
};

async function fetchAllPostsForIndexInternal() {
    console.log('[generate-search-index] Fetching posts for index...');
    if (process.env.MOCK_API_FOR_BUILD === 'true') {
        console.log('[generate-search-index] Using mock data from lib/api-mock-blogposts.json.');
        try {
            const mockDataPath = path.join(process.cwd(), 'lib', 'api-mock-blogposts.json');
            if (fs.existsSync(mockDataPath)) {
                const posts = JSON.parse(fs.readFileSync(mockDataPath, 'utf-8'));
                console.log(`[generate-search-index] Loaded ${posts.length} posts from mock file.`);
                return posts;
            } else {
                console.error('[generate-search-index] Mock data file lib/api-mock-blogposts.json not found!');
                process.exit(1);
            }
        } catch (e) {
            console.error('[generate-search-index] Error reading mock data:', e);
            process.exit(1);
        }
    }

    const baseUrl = process.env.BASE_URL || 'https://api.cnb.cool';
    const repo = process.env.REPO;
    const authToken = process.env.AUTH_TOKEN;

    if (!repo) { // authToken might be optional for public repos in some APIs
        console.error('[generate-search-index] REPO environment variable is missing for live API call.');
        process.exit(1);
    }
    // Fetch a large number of issues
    const url = `${baseUrl}/${repo}/-/issues?page=1&page_size=500&state=open&order_by=-updated_at`;
    console.log(`[generate-search-index] Fetching live data from: ${url}`);

    const headers = { 'Accept': 'application/json' };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText} - ${await response.text()}`);
        }
        const issues = await response.json();
        console.log(`[generate-search-index] Fetched ${issues.length} raw issues from API.`);

        return issues.map(issue => ({
            slug: issue.number.toString(), // Assuming slug is derived from issue number
            title: issue.title || 'Untitled',
            content: issue.body || '',
            tags: issue.labels ? issue.labels.map(l => ({ name: l.name })) : [],
            excerpt: simpleMarkdownToText((issue.body || '').substring(0, 200)) + '...'
        }));
    } catch (error) {
        console.error('[generate-search-index] Error fetching or processing live posts:', error);
        process.exit(1);
    }
}

async function generateIndex() {
    const posts = await fetchAllPostsForIndexInternal();
    const searchDir = path.join(process.cwd(), 'public', 'search');
    if (!fs.existsSync(searchDir)) fs.mkdirSync(searchDir, { recursive: true });

    if (!posts || posts.length === 0) {
        console.log('[generate-search-index] No posts found to index. Creating empty index files.');
        fs.writeFileSync(path.join(searchDir, 'search-store.json'), JSON.stringify([]));
        const tempIndex = new FlexSearch.Document({ document: { id: 'id', index: ['title', 'content', 'tags'], store: false }});
        tempIndex.export((key, data) => fs.writeFileSync(path.join(searchDir, `search-${key}.json`), data || ''));
        console.log('[generate-search-index] Empty search index files created.');
        return;
    }

    const storeData = posts.map(post => ({
        id: post.slug,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || simpleMarkdownToText((post.content || '').substring(0,150)) // Ensure excerpt exists
    }));
    fs.writeFileSync(path.join(searchDir, 'search-store.json'), JSON.stringify(storeData));
    console.log(`[generate-search-index] Exported search-store.json with ${storeData.length} items.`);

    const index = new FlexSearch.Document({
        document: { id: 'id', index: ['title', 'content', 'tags'], store: false },
        tokenize: 'forward',
        language: 'zh' // Assuming FlexSearch has some Chinese tokenization support or handles it gracefully
    });

    posts.forEach(post => {
        if (!post.slug) {
            console.warn(`[generate-search-index] Skipping post due to missing slug: ${post.title || 'Untitled Post'}`);
            return;
        }
        index.add({
            id: post.slug,
            title: post.title,
            content: simpleMarkdownToText(post.content || ''), // Ensure content is a string
            tags: post.tags && Array.isArray(post.tags) ? post.tags.map(t => t.name).join(' ') : ''
        });
    });

    index.export((key, data) => {
        const filePath = path.join(searchDir, `search-${key}.json`);
        fs.writeFileSync(filePath, data === undefined ? '' : data);
    });
    console.log('[generate-search-index] FlexSearch index parts exported.');
}

generateIndex().catch(error => {
    console.error('[generate-search-index] Unhandled error during index generation:', error);
    process.exit(1);
});
