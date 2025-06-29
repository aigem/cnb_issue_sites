import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import readingTime from "reading-time"
import { Issue, BlogPost, SEOData, PostPriority, PostStatus, PostMetadata, Author } from "@/types/blog"
import { markdownToText } from "./markdown"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// 日期格式化
export function formatDate(date: string | Date, formatStr: string = "yyyy年MM月dd日"): string {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    return format(dateObj, formatStr, { locale: zhCN })
}

// 相对时间格式化
export function formatRelativeTime(date: string | Date): string {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: zhCN })
}

// 生成文章摘要
export function generateExcerpt(content: string, maxLength: number = 200): string {
    // 使用增强的 markdownToText 函数
    const plainText = markdownToText(content)

    if (plainText.length <= maxLength) {
        return plainText
    }

    return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
}

// 计算阅读时间
export function calculateReadingTime(content: string): number {
    const stats = readingTime(content, { wordsPerMinute: 200 })
    return Math.ceil(stats.minutes)
}

// 生成URL友好的slug
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // 移除特殊字符
        .replace(/[\s_-]+/g, '-') // 将空格和下划线替换为连字符
        .replace(/^-+|-+$/g, '') // 移除开头和结尾的连字符
}

// 解析优先级
export function parsePriority(priorityStr?: string): PostPriority {
    if (!priorityStr) return 'medium'

    const priority = priorityStr.toLowerCase()
    if (['p0', 'urgent'].includes(priority)) return 'urgent'
    if (['p1', 'high'].includes(priority)) return 'high'
    if (['p2', 'medium'].includes(priority)) return 'medium'
    if (['p3', 'low'].includes(priority)) return 'low'

    return 'medium'
}

// 解析状态
export function parseStatus(issue: Issue): PostStatus {
    if (issue.state === 'closed') {
        return issue.closed_at ? 'resolved' : 'closed'
    }

    // 检查是否为草稿
    const isDraft = issue.labels?.some(label =>
        ['draft', '草稿', 'wip', 'work-in-progress'].includes(label.name.toLowerCase())
    )
    if (isDraft) return 'draft'

    // 检查是否为归档
    const isArchived = issue.labels?.some(label =>
        ['archived', '归档', 'deprecated'].includes(label.name.toLowerCase())
    )
    if (isArchived) return 'archived'

    return 'published'
}

// 计算热度指标
export function calculateHotness(issue: Issue): number {
    const commentsWeight = 1
    const referencesWeight = 2
    const recencyWeight = 0.5

    const commentsScore = (issue.comments_count || 0) * commentsWeight
    const referencesScore = (issue.reference_count || 0) * referencesWeight

    // 计算时间衰减（越新的文章权重越高）
    const daysSinceCreated = Math.floor(
        (Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    const recencyScore = Math.max(0, 30 - daysSinceCreated) * recencyWeight

    return commentsScore + referencesScore + recencyScore
}

// 提取元数据
export function extractMetadata(issue: Issue): PostMetadata {
    const body = issue.body || ''

    // 提取系列信息
    const seriesMatch = body.match(/<!--\s*series:\s*(.+?)\s*-->/)
    const seriesOrderMatch = body.match(/<!--\s*series-order:\s*(\d+)\s*-->/)

    // 提取难度级别
    const difficultyMatch = body.match(/<!--\s*difficulty:\s*(beginner|intermediate|advanced)\s*-->/)

    // 提取版本信息
    const versionMatch = body.match(/<!--\s*version:\s*(.+?)\s*-->/)

    // 提取外部链接
    const externalLinks = extractExternalLinks(body)

    return {
        estimatedReadTime: calculateReadingTime(body),
        difficulty: difficultyMatch ? difficultyMatch[1] as any : undefined,
        lastModifiedBy: issue.author?.username,
        version: versionMatch ? versionMatch[1] : undefined,
        series: seriesMatch ? seriesMatch[1] : undefined,
        seriesOrder: seriesOrderMatch ? parseInt(seriesOrderMatch[1]) : undefined,
        externalLinks,
        relatedPosts: [], // 可以后续通过标签或其他方式关联
        attachments: [], // 可以后续添加附件支持
    }
}

// 提取外部链接
export function extractExternalLinks(content: string) {
    const links = []
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g
    let match

    while ((match = linkRegex.exec(content)) !== null) {
        const [, title, url] = match
        // 排除图片链接
        if (!title.startsWith('!')) {
            links.push({
                title,
                url,
                type: 'reference' as const
            })
        }
    }

    return links
}

// 将Issue转换为增强的BlogPost
export function issueToBlogPost(issue: Issue): BlogPost {
    // 安全处理可能为空的字段
    const body = issue.body || ''
    const title = issue.title || '无标题'

    const excerpt = generateExcerpt(body)
    const readingTimeMinutes = calculateReadingTime(body)
    // 使用issue的number作为slug，确保唯一性和URL友好
    const slug = `${issue.number}`

    // 检查是否为精选文章
    const featured = issue.labels?.some(label =>
        ['featured', '精选', 'highlight', '推荐'].includes(label.name.toLowerCase())
    ) || false

    // 提取封面图片
    const coverImageMatch = body.match(/!\[.*?\]\((.*?)\)/)
    const coverImage = coverImageMatch ? coverImageMatch[1] : undefined

    // 提取分类
    const categoryLabel = issue.labels?.find(label =>
        label.name.startsWith('category:') || label.name.startsWith('分类:')
    )
    const category = categoryLabel ?
        categoryLabel.name.replace(/^(category:|分类:)/, '') : undefined

    // 转换协作者
    const collaborators: Author[] = issue.assignees?.map(assignee => ({
        id: assignee.id,
        name: assignee.name || assignee.username,
        username: assignee.username,
        avatar: assignee.avatar_url || '/default-avatar.png',
    })) || []

    // 解析优先级和状态
    const priority = parsePriority(issue.priority)
    const status = parseStatus(issue)

    // 计算热度
    const hotness = calculateHotness(issue)

    // 提取元数据
    const metadata = extractMetadata(issue)

    return {
        id: issue.id,
        number: issue.number,
        title,
        content: body,
        excerpt,
        slug,
        publishedAt: issue.created_at,
        updatedAt: issue.updated_at,
        closedAt: issue.closed_at,
        author: {
            id: issue.author?.id || 0,
            name: issue.author?.name || issue.author?.username || '匿名用户',
            username: issue.author?.username || 'anonymous',
            avatar: issue.author?.avatar_url || '/default-avatar.png',
        },
        collaborators,
        tags: issue.labels?.map(label => ({
            id: label.id,
            name: label.name,
            slug: generateSlug(label.name),
            color: label.color,
            count: 0, // 这里可以后续添加计数逻辑
            description: label.description,
        })) || [],
        category,
        readingTime: readingTimeMinutes,
        featured,
        coverImage,
        // 新增字段
        priority,
        status,
        hotness,
        commentsCount: issue.comments_count || 0,
        referenceCount: issue.reference_count || 0,
        metadata,
    }
}

// 导入增强的 Markdown 渲染功能
export {
    markdownToHtml,
    markdownToHtmlWithToc,
    markdownToText,
    copyCodeScript
} from './markdown'

// 生成SEO元数据
export function generateSEOData(
    title: string,
    description: string,
    options: Partial<SEOData> = {}
): SEOData {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.cnb.cool'

    return {
        title: `${title} | CNB博客`,
        description,
        keywords: options.keywords || [],
        image: options.image || `${baseUrl}/og-image.png`,
        url: options.url ? `${baseUrl}${options.url}` : baseUrl,
        type: options.type || 'website',
        publishedTime: options.publishedTime,
        modifiedTime: options.modifiedTime,
        author: options.author || 'CNB博客',
    }
}

// 分页计算
export function calculatePagination(
    currentPage: number,
    totalItems: number,
    itemsPerPage: number
) {
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const hasNext = currentPage < totalPages
    const hasPrev = currentPage > 1

    return {
        page: currentPage,
        pageSize: itemsPerPage,
        total: totalItems,
        totalPages,
        hasNext,
        hasPrev,
    }
}

// 颜色工具函数
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null
}

export function getContrastColor(hexColor: string): string {
    const rgb = hexToRgb(hexColor)
    if (!rgb) return '#000000'

    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
}

// 搜索高亮
export function highlightSearchTerm(text: string, searchTerm: string): string {
    if (!searchTerm) return text

    const regex = new RegExp(`(${searchTerm})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch (err) {
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
            document.execCommand('copy')
            document.body.removeChild(textArea)
            return true
        } catch (err) {
            document.body.removeChild(textArea)
            return false
        }
    }
}

// 滚动到顶部
export function scrollToTop(smooth: boolean = true): void {
    window.scrollTo({
        top: 0,
        behavior: smooth ? 'smooth' : 'auto'
    })
}

// 获取滚动进度
export function getScrollProgress(): number {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
    return scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
}
// 优先级相关工具函数
export function getPriorityLabel(priority: PostPriority): string {
    const labels = {
        urgent: '紧急',
        high: '高',
        medium: '中',
        low: '低',
        p0: 'P0',
        p1: 'P1',
        p2: 'P2',
        p3: 'P3'
    }
    return labels[priority] || '中'
}

export function getPriorityColor(priority: PostPriority): string {
    const colors = {
        urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        p0: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        p1: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        p2: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        p3: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }
    return colors[priority] || colors.medium
}

// 状态相关工具函数
export function getStatusLabel(status: PostStatus): string {
    const labels = {
        draft: '草稿',
        published: '已发布',
        archived: '已归档',
        resolved: '已解决',
        closed: '已关闭'
    }
    return labels[status] || '已发布'
}

export function getStatusColor(status: PostStatus): string {
    const colors = {
        draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        archived: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        resolved: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        closed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return colors[status] || colors.published
}

// 难度级别工具函数
export function getDifficultyLabel(difficulty?: string): string {
    const labels = {
        beginner: '初级',
        intermediate: '中级',
        advanced: '高级'
    }
    return difficulty ? labels[difficulty as keyof typeof labels] || difficulty : ''
}

export function getDifficultyColor(difficulty?: string): string {
    const colors = {
        beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return difficulty ? colors[difficulty as keyof typeof colors] || '' : ''
}

// 热度格式化
export function formatHotness(hotness: number): string {
    if (hotness >= 1000) {
        return `${(hotness / 1000).toFixed(1)}k`
    }
    return hotness.toString()
}

// 数字格式化
export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
}

// 排序工具函数
export function sortPostsByHotness(posts: BlogPost[]): BlogPost[] {
    return [...posts].sort((a, b) => b.hotness - a.hotness)
}

export function sortPostsByPriority(posts: BlogPost[]): BlogPost[] {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1, p0: 4, p1: 3, p2: 2, p3: 1 }
    return [...posts].sort((a, b) =>
        (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2)
    )
}

export function sortPostsByStatus(posts: BlogPost[]): BlogPost[] {
    const statusOrder = { published: 4, draft: 3, resolved: 2, archived: 1, closed: 0 }
    return [...posts].sort((a, b) =>
        (statusOrder[b.status] || 2) - (statusOrder[a.status] || 2)
    )
}