import { Issue, IssueDetail, IssueComment, Label, IssuesListParams, UserInfo, BlogPost } from '@/types/blog'
import { issueToBlogPost } from '@/lib/utils'
import { getApiConfig } from '@/lib/config'

// 获取API配置
async function getApiSettings() {
    const config = await getApiConfig()
    return {
        baseUrl: config.baseUrl,
        repo: config.repo,
        authToken: config.authToken,
        timeout: config.timeout,
        retries: config.retries,
    }
}

// Function to dump all posts to a JSON file for search indexing
export async function exportAllPostsForIndex() {
    if (process.env.GENERATE_SEARCH_INDEX_DATA === 'true') {
        console.log('📦 Exporting all posts to all-posts-for-index.json...');
        // Attempt to get all posts - potentially many pages if not mocked
        // For simplicity with current getAllPosts, we'll fetch a large number.
        // In a real scenario with many posts, this would need proper pagination.
        const allPostsData = await getAllPosts(1, 10000); // Assuming up to 10000 posts for now

        try {
            const fs = await import('fs');
            const path = await import('path');
            // Ensure the directory exists (though fs.writeFileSync will create the file, not dir)
            const outputDir = path.resolve(process.cwd()); // project root
            const outputFile = path.join(outputDir, 'all-posts-for-index.json');

            fs.writeFileSync(outputFile, JSON.stringify(allPostsData, null, 2));
            console.log(`✅ Successfully exported ${allPostsData.length} posts to ${outputFile}`);
        } catch (error) {
            console.error('❌ Error exporting posts to JSON:', error);
            process.exit(1); // Exit if we can't create the data file
        }
    }
}

// Potentially call this if the script is run directly with the env var
if (process.env.GENERATE_SEARCH_INDEX_DATA === 'true' && require.main === module) {
    exportAllPostsForIndex().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

// 创建API请求配置
async function createApiConfig() {
    const { authToken, timeout } = await getApiSettings()

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
    }

    return {
        headers,
        timeout,
    }
}

// 构建API URL
async function buildApiUrl(endpoint: string, params?: Record<string, any>): Promise<string> {
    const { baseUrl, repo } = await getApiSettings()
    const url = new URL(`${baseUrl}/${repo}/-${endpoint}`)

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                url.searchParams.append(key, String(value))
            }
        })
    }

    return url.toString()
}

// API请求封装
async function apiRequest<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const { retries } = await getApiSettings()
    let lastError: Error

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const url = await buildApiUrl(endpoint, params)
            const config = await createApiConfig()

            const response = await fetch(url, {
                ...config,
                signal: AbortSignal.timeout(config.timeout),
            })

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
            }

            return await response.json()
        } catch (error) {
            lastError = error as Error
            console.error(`API请求错误 (尝试 ${attempt + 1}/${retries + 1}):`, error)

            // 如果不是最后一次尝试，等待后重试
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
            }
        }
    }

    throw lastError!
}

// 获取Issues列表（博客文章列表）
export async function getIssues(params: IssuesListParams = {}): Promise<Issue[]> {
    if (process.env.MOCK_API_FOR_BUILD === 'true') {
        console.log('🚧 Using mock API data for getIssues 🚧');
        const mockIssues: Issue[] = [
            {
                id: 1,
                number: 1,
                title: 'Mock Post 1: Exploring Next.js',
                body: 'This is the full content of mock post 1 about Next.js. Used for slug generation.',
                state: 'open',
                created_at: new Date('2023-10-01T10:00:00Z').toISOString(),
                updated_at: new Date('2023-10-01T12:00:00Z').toISOString(),
                author: { id: 1, username: 'mockuser', name: 'Mock User' },
                assignees: [],
                labels: [{ id: 1, name: 'Next.js', color: '0070F3' }],
                comments_count: 2,
            },
            {
                id: 2,
                number: 2,
                title: 'Mock Post 2: Mastering TypeScript',
                body: 'Full content of mock post 2 about TypeScript. Used for slug generation.',
                state: 'open',
                created_at: new Date('2023-10-05T14:00:00Z').toISOString(),
                updated_at: new Date('2023-10-05T15:30:00Z').toISOString(),
                author: { id: 1, username: 'mockuser', name: 'Mock User' },
                assignees: [],
                labels: [{ id: 2, name: 'TypeScript', color: '3178C6' }],
                comments_count: 0,
            },
        ];
        // Simulate pagination for pageSize if needed, though generateStaticParams usually gets many
        const pageSize = params.page_size || 30;
        const page = params.page || 1;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return Promise.resolve(mockIssues.slice(start, end));
    }

    const defaultParams = {
        state: 'open',
        page: 1,
        page_size: 30,
        order_by: '-updated_at',
        ...params,
    }

    return apiRequest<Issue[]>('/issues', defaultParams)
}

// 增强的搜索功能 - 支持优先级、分配者、时间范围等
export interface EnhancedSearchParams extends IssuesListParams {
    priority?: string
    assignees?: string
    created_after?: string
    created_before?: string
    updated_after?: string
    updated_before?: string
    difficulty?: string
    category?: string
    hotness_min?: number
    sort_by?: 'hotness' | 'priority' | 'created_at' | 'updated_at' | 'comments'
}

export async function searchIssuesEnhanced(params: EnhancedSearchParams = {}): Promise<Issue[]> {
    const searchParams: Record<string, any> = {
        state: 'open',
        page: params.page || 1,
        page_size: params.page_size || 30,
        order_by: params.order_by || '-updated_at',
    }

    // 基础搜索参数
    if (params.keyword) searchParams.keyword = params.keyword
    if (params.labels) searchParams.labels = params.labels
    if (params.authors) searchParams.authors = params.authors
    if (params.assignees) searchParams.assignees = params.assignees

    // 时间范围参数
    if (params.created_after) searchParams.created_after = params.created_after
    if (params.created_before) searchParams.created_before = params.created_before
    if (params.updated_after) searchParams.updated_after = params.updated_after
    if (params.updated_before) searchParams.updated_before = params.updated_before

    // 自定义标签过滤
    const labelFilters = []
    if (params.priority) labelFilters.push(`priority:${params.priority}`)
    if (params.difficulty) labelFilters.push(`difficulty:${params.difficulty}`)
    if (params.category) labelFilters.push(`category:${params.category}`)

    if (labelFilters.length > 0) {
        const existingLabels = searchParams.labels ? `${searchParams.labels},` : ''
        searchParams.labels = existingLabels + labelFilters.join(',')
    }

    const issues = await apiRequest<Issue[]>('/issues', searchParams)

    // 客户端过滤和排序
    let filteredIssues = issues

    // 按热度过滤
    if (params.hotness_min) {
        filteredIssues = filteredIssues.filter(issue => {
            const hotness = (issue.comments_count || 0) * 2 +
                (issue.reference_count || 0) * 3 +
                Math.max(0, 30 - Math.floor((Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24)))
            return hotness >= params.hotness_min!
        })
    }

    // 自定义排序
    if (params.sort_by) {
        switch (params.sort_by) {
            case 'hotness':
                filteredIssues.sort((a, b) => {
                    const hotnessA = (a.comments_count || 0) * 2 + (a.reference_count || 0) * 3
                    const hotnessB = (b.comments_count || 0) * 2 + (b.reference_count || 0) * 3
                    return hotnessB - hotnessA
                })
                break
            case 'comments':
                filteredIssues.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0))
                break
            case 'priority':
                filteredIssues.sort((a, b) => {
                    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1, p0: 4, p1: 3, p2: 2, p3: 1 }
                    const getPriority = (issue: Issue) => {
                        const priorityLabel = issue.labels?.find(l => l.name.startsWith('priority:'))
                        const priority = priorityLabel?.name.split(':')[1] as keyof typeof priorityOrder
                        return priorityOrder[priority] || 2
                    }
                    return getPriority(b) - getPriority(a)
                })
                break
        }
    }

    return filteredIssues
}

// 获取单个Issue详情（博客文章详情）
export async function getIssue(number: number): Promise<IssueDetail> {
    if (process.env.MOCK_API_FOR_BUILD === 'true') {
        console.log(`🚧 Using mock API data for getIssue (number: ${number}) 🚧`);
        const mockIssuesList: IssueDetail[] = [ // Explicitly type the array
            {
                id: 1, number: 1, title: 'Mock Post 1: Exploring Next.js', body: 'Full content for post 1.', state: 'open',
                created_at: new Date('2023-10-01T10:00:00Z').toISOString(), updated_at: new Date('2023-10-01T12:00:00Z').toISOString(),
                author: { id: 1, username: 'mockuser', name: 'Mock User' } as UserInfo, assignees: [], labels: [{id: 1, name: 'Next.js', color: '0070F3'}], comments_count: 0,
                body_html: '<p>Full content for post 1.</p>', comments: []
            },
            {
                id: 2, number: 2, title: 'Mock Post 2: Mastering TypeScript', body: 'Full content for post 2.', state: 'open',
                created_at: new Date('2023-10-05T14:00:00Z').toISOString(), updated_at: new Date('2023-10-05T15:30:00Z').toISOString(),
                author: { id: 1, username: 'mockuser', name: 'Mock User' } as UserInfo, assignees: [], labels: [{id: 2, name: 'TypeScript', color: '3178C6'}], comments_count: 0,
                body_html: '<p>Full content for post 2.</p>', comments: []
            },
        ];
        const foundIssue: IssueDetail | undefined = mockIssuesList.find(p => p.number === number);

        if (foundIssue) {
            return Promise.resolve(foundIssue);
        } else {
            return Promise.reject(new Error(`Mock issue with number ${number} not found`));
        }
    }
    return apiRequest<IssueDetail>(`/issues/${number}`)
}

// 获取Issue评论列表
export async function getIssueComments(
    number: number,
    page: number = 1,
    pageSize: number = 30
): Promise<IssueComment[]> {
    if (process.env.MOCK_API_FOR_BUILD === 'true') {
        console.log(`🚧 Using mock API data for getIssueComments (number: ${number}) 🚧`);
        // Return empty comments array for mock by default
        return Promise.resolve([]);
    }
    return apiRequest<IssueComment[]>(`/issues/${number}/comments`, {
        page,
        page_size: pageSize,
    })
}

// 获取Issue标签列表
export async function getIssueLabels(
    number: number,
    page: number = 1,
    pageSize: number = 30
): Promise<Label[]> {
    return apiRequest<Label[]>(`/issues/${number}/labels`, {
        page,
        page_size: pageSize,
    })
}

// 获取Issue分配者列表
export async function getIssueAssignees(number: number): Promise<UserInfo[]> {
    return apiRequest<UserInfo[]>(`/issues/${number}/assignees`)
}

// 获取所有标签（用于标签页面）
export async function getAllLabels(): Promise<Label[]> {
    try {
        // 先获取所有issues来收集标签
        const issues = await getIssues({ page_size: 100 })
        const labelsMap = new Map<string, Label>()

        // 收集所有唯一标签
        for (const issue of issues) {
            if (issue.labels) {
                issue.labels.forEach(label => {
                    if (!labelsMap.has(label.name)) {
                        labelsMap.set(label.name, {
                            ...label,
                            // 这里可以添加标签使用计数逻辑
                        })
                    }
                })
            }
        }

        return Array.from(labelsMap.values())
    } catch (error) {
        console.error('获取标签失败:', error)
        return []
    }
}

// 获取所有作者（用于作者页面）
export async function getAllAuthors(): Promise<UserInfo[]> {
    try {
        const issues = await getIssues({ page_size: 100 })
        const authorsMap = new Map<string, UserInfo>()

        issues.forEach(issue => {
            if (issue.author && !authorsMap.has(issue.author.username)) {
                authorsMap.set(issue.author.username, issue.author)
            }
        })

        return Array.from(authorsMap.values())
    } catch (error) {
        console.error('获取作者列表失败:', error)
        return []
    }
}

// 搜索Issues
export async function searchIssues(keyword: string, page: number = 1): Promise<Issue[]> {
    return getIssues({
        keyword,
        page,
        page_size: 20,
        state: 'open',
    })
}

// 按标签获取Issues
export async function getIssuesByLabel(labelName: string, page: number = 1): Promise<Issue[]> {
    return getIssues({
        labels: labelName,
        page,
        page_size: 20,
        state: 'open',
    })
}

// 按作者获取Issues
export async function getIssuesByAuthor(authorName: string, page: number = 1): Promise<Issue[]> {
    return getIssues({
        authors: authorName,
        page,
        page_size: 20,
        state: 'open',
    })
}

// 获取热门文章（按评论数排序）
export async function getPopularIssues(limit: number = 10): Promise<Issue[]> {
    const issues = await getIssues({
        page_size: 50,
        state: 'open',
    })

    // 按评论数排序
    return issues
        .sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0))
        .slice(0, limit)
}

// 获取最新文章
export async function getLatestIssues(limit: number = 10): Promise<Issue[]> {
    return getIssues({
        page_size: limit,
        state: 'open',
        order_by: '-created_at',
    })
}

// 获取精选文章（可以通过特定标签标识）
export async function getFeaturedIssues(limit: number = 5): Promise<Issue[]> {
    return getIssues({
        labels: 'featured,精选',
        page_size: limit,
        state: 'open',
    })
}

// 将Issue转换为博客文章格式
function transformIssueToPost(issue: Issue): any {
    return {
        id: issue.id,
        number: issue.number,
        title: issue.title,
        slug: `${issue.number}-${issue.title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '')}`,
        excerpt: issue.body ? issue.body.substring(0, 200).replace(/[#*`]/g, '') + '...' : '',
        content: issue.body || '',
        author: issue.author?.name || issue.author?.username || '匿名',
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        labels: issue.labels || [],
        comments: issue.comments_count || 0,
        state: issue.state,
    }
}

// 获取所有文章（转换后的格式）
export async function getAllPosts(page: number = 1, pageSize: number = 30): Promise<BlogPost[]> {
    if (process.env.MOCK_API_FOR_BUILD === 'true') {
        console.log('🚧 Using mock API data for getAllPosts 🚧');
        const mockPosts: BlogPost[] = [
            {
                id: 1,
                number: 1,
                title: 'Mock Post 1: Exploring Next.js',
                content: 'This is the full content of mock post 1 about Next.js.',
                excerpt: 'Short excerpt for mock post 1...',
                slug: '1-mock-post-1-exploring-next-js',
                publishedAt: new Date('2023-10-01T10:00:00Z').toISOString(),
                updatedAt: new Date('2023-10-01T12:00:00Z').toISOString(),
                author: { id: 1, name: 'Mock User', username: 'mockuser', avatar: 'https://via.placeholder.com/40' },
                collaborators: [],
                tags: [{ id: 1, name: 'Next.js', slug: 'next-js', color: '0070F3', count: 1 }],
                category: 'Web Development',
                readingTime: 5,
                featured: true,
                priority: 'medium',
                status: 'published',
                hotness: 10,
                commentsCount: 2,
                referenceCount: 1,
                metadata: {},
            },
            {
                id: 2,
                number: 2,
                title: 'Mock Post 2: Mastering TypeScript',
                content: 'Full content of mock post 2 about TypeScript.',
                excerpt: 'Short excerpt for mock post 2...',
                slug: '2-mock-post-2-mastering-typescript',
                publishedAt: new Date('2023-10-05T14:00:00Z').toISOString(),
                updatedAt: new Date('2023-10-05T15:30:00Z').toISOString(),
                author: { id: 1, name: 'Mock User', username: 'mockuser', avatar: 'https://via.placeholder.com/40' },
                collaborators: [],
                tags: [{ id: 2, name: 'TypeScript', slug: 'typescript', color: '3178C6', count: 1 }],
                category: 'Programming Languages',
                readingTime: 8,
                featured: false,
                priority: 'high',
                status: 'published',
                hotness: 5,
                commentsCount: 0,
                referenceCount: 0,
                metadata: {},
            },
        ];
        // Simulate pagination for pageSize
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return Promise.resolve(mockPosts.slice(start, end));
    }

    try {
        const issues = await getIssues({
            page,
            page_size: pageSize,
            state: 'open',
            order_by: '-updated_at',
        })

        return issues
            .filter(issue => issue && issue.title) // 过滤掉无效的issue
            .map(issue => {
                try {
                    return issueToBlogPost(issue)
                } catch (err) {
                    console.error('转换issue失败:', err, issue)
                    return null
                }
            })
            .filter(Boolean) as BlogPost[] // 移除null值
    } catch (error) {
        console.error('获取所有文章失败:', error)
        return []
    }
}

// 根据slug获取文章详情 - 现在slug就是issue number
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
        const issueNumber = parseInt(slug, 10)
        if (isNaN(issueNumber)) {
            console.warn(`Invalid issue number: ${slug}`)
            return null
        }

        // 直接通过issue number获取issue详情
        const issue = await getIssue(issueNumber)
        if (!issue) {
            return null
        }

        return issueToBlogPost(issue)
    } catch (error) {
        console.error('获取文章详情失败:', error)
        return null
    }
}

// 获取相关文章（基于标签）
export async function getRelatedPosts(currentPost: BlogPost, limit: number = 3): Promise<BlogPost[]> {
    try {
        if (!currentPost.tags || currentPost.tags.length === 0) {
            return []
        }

        // 获取有相同标签的文章
        const labelNames = currentPost.tags.map(tag => tag.name).join(',')
        const issues = await getIssuesByLabel(labelNames)

        // 过滤掉当前文章，并限制数量
        return issues
            .filter(issue => issue.id !== currentPost.id)
            .map(issue => {
                try {
                    return issueToBlogPost(issue)
                } catch (err) {
                    console.error('转换issue失败:', err, issue)
                    return null
                }
            })
            .filter(Boolean)
            .slice(0, limit) as BlogPost[]
    } catch (error) {
        console.error('获取相关文章失败:', error)
        return []
    }
}
// 按优先级获取文章
export async function getPostsByPriority(priority: string, page: number = 1, pageSize: number = 20): Promise<BlogPost[]> {
    try {
        const issues = await searchIssuesEnhanced({
            priority,
            page,
            page_size: pageSize,
            sort_by: 'priority'
        })

        return issues
            .map(issue => {
                try {
                    return issueToBlogPost(issue)
                } catch (err) {
                    console.error('转换issue失败:', err, issue)
                    return null
                }
            })
            .filter(Boolean) as BlogPost[]
    } catch (error) {
        console.error('按优先级获取文章失败:', error)
        return []
    }
}

// 按状态获取文章
export async function getPostsByStatus(status: 'open' | 'closed' | 'all' = 'open', page: number = 1, pageSize: number = 20): Promise<BlogPost[]> {
    try {
        const params: any = {
            page,
            page_size: pageSize,
        }

        if (status !== 'all') {
            params.state = status
        }

        const issues = await getIssues(params)

        return issues
            .map(issue => {
                try {
                    return issueToBlogPost(issue)
                } catch (err) {
                    console.error('转换issue失败:', err, issue)
                    return null
                }
            })
            .filter(Boolean) as BlogPost[]
    } catch (error) {
        console.error('按状态获取文章失败:', error)
        return []
    }
}

// 按热度获取文章
export async function getPostsByHotness(limit: number = 20): Promise<BlogPost[]> {
    try {
        const issues = await searchIssuesEnhanced({
            page_size: Math.min(limit * 2, 100), // 获取更多数据以便排序
            sort_by: 'hotness'
        })

        return issues
            .slice(0, limit)
            .map(issue => {
                try {
                    return issueToBlogPost(issue)
                } catch (err) {
                    console.error('转换issue失败:', err, issue)
                    return null
                }
            })
            .filter(Boolean) as BlogPost[]
    } catch (error) {
        console.error('按热度获取文章失败:', error)
        return []
    }
}

// 按分配者获取文章
export async function getPostsByAssignee(assignee: string, page: number = 1, pageSize: number = 20): Promise<BlogPost[]> {
    try {
        const issues = await searchIssuesEnhanced({
            assignees: assignee,
            page,
            page_size: pageSize,
        })

        return issues
            .map(issue => {
                try {
                    return issueToBlogPost(issue)
                } catch (err) {
                    console.error('转换issue失败:', err, issue)
                    return null
                }
            })
            .filter(Boolean) as BlogPost[]
    } catch (error) {
        console.error('按分配者获取文章失败:', error)
        return []
    }
}

// 按时间范围获取文章
export async function getPostsByDateRange(
    startDate: string,
    endDate: string,
    page: number = 1,
    pageSize: number = 20
): Promise<BlogPost[]> {
    try {
        const issues = await searchIssuesEnhanced({
            created_after: startDate,
            created_before: endDate,
            page,
            page_size: pageSize,
            order_by: '-created_at'
        })

        return issues
            .map(issue => {
                try {
                    return issueToBlogPost(issue)
                } catch (err) {
                    console.error('转换issue失败:', err, issue)
                    return null
                }
            })
            .filter(Boolean) as BlogPost[]
    } catch (error) {
        console.error('按时间范围获取文章失败:', error)
        return []
    }
}

// 获取统计信息
export async function getBlogStats(): Promise<{
    totalPosts: number
    totalComments: number
    totalAuthors: number
    totalTags: number
    postsByPriority: Record<string, number>
    postsByStatus: Record<string, number>
    recentActivity: number
}> {
    try {
        // TODO: Enhance error handling. Consider throwing an error or returning null/undefined
        // if critical API calls fail, allowing the caller to distinguish "no data" from "error fetching data".
        // Currently, errors in getIssues will result in empty arrays and thus zeroed stats.

        // 获取所有文章进行统计 - 分别获取开放和关闭的issues
        const [openIssues, closedIssues] = await Promise.all([
            getIssues({ page_size: 500, state: 'open' }), // Fetches up to 500 open issues
            getIssues({ page_size: 500, state: 'closed' }) // Fetches up to 500 closed issues
        ]);
        const allIssues = [...openIssues, ...closedIssues];
        const authors = new Set<string>()
        const tags = new Set<string>()
        const postsByPriority: Record<string, number> = {}
        const postsByStatus: Record<string, number> = {}
        let totalComments = 0

        // 计算最近7天的活动
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        let recentActivity = 0

        allIssues.forEach(issue => {
            // 统计作者
            if (issue.author?.username) {
                authors.add(issue.author.username)
            }

            // 统计标签
            issue.labels?.forEach(label => tags.add(label.name))

            // 统计评论
            totalComments += issue.comments_count || 0

            // 统计优先级
            const priorityLabel = issue.labels?.find(l => l.name.startsWith('priority:'))
            const priority = priorityLabel?.name.split(':')[1] || 'medium'
            postsByPriority[priority] = (postsByPriority[priority] || 0) + 1

            // 统计状态
            const status = issue.state === 'open' ? 'published' : 'closed'
            postsByStatus[status] = (postsByStatus[status] || 0) + 1

            // 统计最近活动
            const updatedAt = new Date(issue.updated_at)
            if (updatedAt > weekAgo) {
                recentActivity++
            }
        })

        return {
            totalPosts: allIssues.length,
            totalComments,
            totalAuthors: authors.size,
            totalTags: tags.size,
            postsByPriority,
            postsByStatus,
            recentActivity
        }
    } catch (error) {
        console.error('获取博客统计失败:', error)
        return {
            totalPosts: 0,
            totalComments: 0,
            totalAuthors: 0,
            totalTags: 0,
            postsByPriority: {},
            postsByStatus: {},
            recentActivity: 0
        }
    }
}

// 获取热门标签（按使用频率排序）
export async function getPopularTags(limit: number = 20): Promise<Array<{ name: string; count: number; color?: string }>> {
    try {
        const issues = await getIssues({ page_size: 200 })
        const tagCounts = new Map<string, { count: number; color?: string }>()

        issues.forEach(issue => {
            issue.labels?.forEach(label => {
                const current = tagCounts.get(label.name) || { count: 0 }
                tagCounts.set(label.name, {
                    count: current.count + 1,
                    color: label.color || current.color
                })
            })
        })

        return Array.from(tagCounts.entries())
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit)
    } catch (error) {
        console.error('获取热门标签失败:', error)
        return []
    }
}

// 获取活跃作者（按文章数量排序）
export async function getActiveAuthors(limit: number = 10): Promise<Array<{ author: UserInfo; postCount: number }>> {
    try {
        const issues = await getIssues({ page_size: 200 })
        const authorCounts = new Map<string, { author: UserInfo; postCount: number }>()

        issues.forEach(issue => {
            if (issue.author) {
                const current = authorCounts.get(issue.author.username) || { author: issue.author, postCount: 0 }
                authorCounts.set(issue.author.username, {
                    author: issue.author,
                    postCount: current.postCount + 1
                })
            }
        })

        return Array.from(authorCounts.values())
            .sort((a, b) => b.postCount - a.postCount)
            .slice(0, limit)
    } catch (error) {
        console.error('获取活跃作者失败:', error)
        return []
    }
}