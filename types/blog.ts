// API响应类型定义
export interface Issue {
    id: number
    number: number
    title: string
    body: string
    state: 'open' | 'closed'
    created_at: string
    updated_at: string
    closed_at?: string
    author: UserInfo
    assignees: UserInfo[]
    labels: Label[]
    comments_count: number
    priority?: string
    reference_count?: number // 引用计数，用于热度排序
}

export interface IssueDetail extends Issue {
    body_html?: string
    comments?: IssueComment[]
}

export interface IssueComment {
    id: number
    body: string
    body_html?: string
    created_at: string
    updated_at: string
    author: UserInfo
}

export interface UserInfo {
    id: number
    username: string
    name: string
    avatar_url?: string
    email?: string
}

export interface Label {
    id: number
    name: string
    color: string
    description?: string
}

// 博客相关类型
export interface BlogPost {
    id: number
    number: number
    title: string
    content: string
    excerpt: string
    slug: string
    publishedAt: string
    updatedAt: string
    closedAt?: string // 关闭时间，用于已解决文章
    author: Author
    collaborators: Author[] // 协作者列表（来自assignees）
    tags: Tag[]
    category?: string
    readingTime: number
    featured: boolean
    coverImage?: string
    // 新增字段
    priority: PostPriority // 优先级
    status: PostStatus // 状态
    hotness: number // 热度指标（基于评论数、引用数等）
    commentsCount: number // 评论数量
    referenceCount: number // 引用计数
    viewCount?: number // 浏览次数（如果有的话）
    metadata: PostMetadata // 额外元数据
}

export interface Author {
    id: number
    name: string
    username: string
    avatar: string
    bio?: string
    website?: string
    social?: {
        twitter?: string
        github?: string
        linkedin?: string
    }
}

export interface Tag {
    id: number
    name: string
    slug: string
    color: string
    count: number
    description?: string // 标签描述
}

export interface Category {
    id: number
    name: string
    slug: string
    description?: string
    count: number
}

// 新增类型定义
export type PostPriority = 'p0' | 'p1' | 'p2' | 'p3' | 'low' | 'medium' | 'high' | 'urgent'

export type PostStatus = 'draft' | 'published' | 'archived' | 'resolved' | 'closed'

export interface PostMetadata {
    estimatedReadTime?: number // 预估阅读时间
    difficulty?: 'beginner' | 'intermediate' | 'advanced' // 难度级别
    lastModifiedBy?: string // 最后修改者
    version?: string // 版本号
    series?: string // 系列文章标识
    seriesOrder?: number // 系列中的顺序
    originalLanguage?: string // 原始语言
    translations?: string[] // 翻译版本
    relatedPosts?: number[] // 相关文章ID
    externalLinks?: ExternalLink[] // 外部链接
    attachments?: Attachment[] // 附件
}

export interface ExternalLink {
    title: string
    url: string
    description?: string
    type?: 'reference' | 'demo' | 'source' | 'documentation'
}

export interface Attachment {
    id: string
    name: string
    url: string
    type: string
    size: number
    uploadedAt: string
}

// API请求参数
export interface IssuesListParams {
    page?: number
    page_size?: number
    state?: 'open' | 'closed'
    keyword?: string
    priority?: string
    labels?: string
    authors?: string
    assignees?: string
    updated_time_begin?: string
    updated_time_end?: string
    close_time_begin?: string
    close_time_end?: string
    order_by?: string
}

// 增强的博客查询参数
export interface BlogPostsParams extends IssuesListParams {
    status?: PostStatus
    priority?: PostPriority
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    series?: string
    minReadTime?: number
    maxReadTime?: number
    hasAttachments?: boolean
    sortBy?: 'hotness' | 'views' | 'comments' | 'created' | 'updated' | 'priority'
    sortOrder?: 'asc' | 'desc'
}

// 分页信息
export interface PaginationInfo {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
}

// 博客配置
export interface BlogConfig {
    title: string
    description: string
    author: string
    url: string
    language: string
    postsPerPage: number
    featuredPostsCount: number
}

// SEO元数据
export interface SEOData {
    title: string
    description: string
    keywords?: string[]
    image?: string
    url?: string
    type?: 'website' | 'article'
    publishedTime?: string
    modifiedTime?: string
    author?: string
}

// 搜索结果
export interface SearchResult {
    posts: BlogPost[]
    total: number
    query: string
}

// RSS Feed项
export interface RSSItem {
    title: string
    description: string
    link: string
    pubDate: string
    author: string
    guid: string
}

// 统计信息
export interface BlogStats {
    totalPosts: number
    totalViews: number
    totalComments: number
    totalTags: number
    totalAuthors: number
    averageReadTime: number
    popularTags: Tag[]
    topAuthors: Author[]
    recentActivity: ActivityItem[]
}

export interface ActivityItem {
    type: 'post_created' | 'post_updated' | 'comment_added' | 'post_closed'
    postId: number
    postTitle: string
    author: string
    timestamp: string
    description: string
}

// 热度计算相关
export interface HotnessFactors {
    commentsWeight: number
    viewsWeight: number
    referencesWeight: number
    recencyWeight: number
    authorWeight: number
}

// 搜索增强
export interface AdvancedSearchParams {
    query: string
    tags?: string[]
    authors?: string[]
    priority?: PostPriority[]
    status?: PostStatus[]
    dateRange?: {
        start: string
        end: string
    }
    readTimeRange?: {
        min: number
        max: number
    }
    difficulty?: string[]
    hasAttachments?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface SearchResult {
    posts: BlogPost[]
    total: number
    query: string
    facets: SearchFacets
}

export interface SearchFacets {
    tags: { name: string; count: number }[]
    authors: { name: string; count: number }[]
    priorities: { priority: PostPriority; count: number }[]
    statuses: { status: PostStatus; count: number }[]
    difficulties: { difficulty: string; count: number }[]
}