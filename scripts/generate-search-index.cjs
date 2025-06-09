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

    // The actual API call is now delegated to getAllPosts from lib/api
    try {
        // Attempt to require getAllPosts. This path might need adjustment based on
        // the project's build output (e.g., '../dist/lib/api') or if using ts-node.
        const { getAllPosts } = require('../lib/api'); // Assuming lib/api.ts is compiled to lib/api.js

        console.log('[generate-search-index] Fetching live data using getAllPosts from lib/api...');
        const blogPosts = await getAllPosts(); // getAllPosts now returns BlogPost[]

        console.log(`[generate-search-index] Fetched ${blogPosts.length} posts using getAllPosts.`);

        // The BlogPost[] structure from getAllPosts should be largely compatible.
        // Ensure 'slug', 'title', 'content', 'tags', and 'excerpt' are available as expected by generateIndex.
        // The issueToBlogPost transformation already creates these fields.
        // 'content' in BlogPost is the raw markdown body.
        // 'tags' in BlogPost are objects like { id, name, slug, color, count }. We need just the name for indexing.
        // 'excerpt' in BlogPost is already generated.
        return blogPosts.map(post => ({
            id: post.id.toString(), // FlexSearch expects 'id' for the document
            slug: post.slug,
            title: post.title,
            content: post.content, // Raw markdown, will be stripped by simpleMarkdownToText later
            tags: post.tags.map(tag => tag.name), // Extract tag names for indexing
            excerpt: post.excerpt
        }));
    } catch (error) {
        console.error('[generate-search-index] Error fetching or processing live posts via getAllPosts:', error);
        if (error.code === 'MODULE_NOT_FOUND') {
            console.error("[generate-search-index] Hint: Ensure 'lib/api.ts' is compiled to JavaScript at the expected path or use ts-node/register if running TypeScript directly.");
        }
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
        // Ensure 'id' used here matches what's added to FlexSearch index (slug or post.id.toString())
        id: post.id, // fetchAllPostsForIndexInternal now returns 'id' field from BlogPost
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
        // Ensure 'id' used here matches what's in storeData and what FlexSearch expects
        if (!post.id) { // Changed from post.slug to post.id for consistency with storeData
            console.warn(`[generate-search-index] Skipping post due to missing id: ${post.title || 'Untitled Post'}`);
            return;
        }
        index.add({
            id: post.id, // Using 'id' from BlogPost as document id
            title: post.title,
            content: simpleMarkdownToText(post.content || ''), // Ensure content is a string
            tags: Array.isArray(post.tags) ? post.tags.join(' ') : '' // post.tags is now string[] from the mapping
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
