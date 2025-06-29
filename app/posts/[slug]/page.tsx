import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getIssues, getIssue, getIssueComments } from '@/lib/api'
import { issueToBlogPost, formatDate, generateSEOData } from '@/lib/utils'
import { markdownToHtmlWithToc, markdownToHtml, copyCodeScript } from '@/lib/markdown'
import { getApiConfig } from '@/lib/config'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { TableOfContents, SimpleToc } from '@/components/table-of-contents'
import Link from 'next/link'

interface PostPageProps {
    params: Promise<{ slug: string }>
}

// 生成静态路径 - 现在使用issue number作为slug
export async function generateStaticParams() {
    try {
        const issues = await getIssues({ page_size: 100 })
        return issues
            .filter(issue => issue && issue.title && issue.number) // 过滤掉无效的issue
            .map((issue) => {
                try {
                    return {
                        slug: issue.number.toString(), // 直接使用issue number作为slug
                    }
                } catch (err) {
                    console.error('处理issue失败:', err, issue)
                    return null
                }
            })
            .filter(Boolean) // 移除null值
    } catch (error) {
        console.error('生成静态路径失败:', error)
        return []
    }
}

// 根据slug(issue number)查找对应的issue
async function findIssueBySlug(slug: string) {
    try {
        const issueNumber = parseInt(slug, 10)
        if (isNaN(issueNumber)) {
            console.warn(`Invalid issue number: ${slug}`)
            return null
        }

        // 直接通过issue number获取issue
        const issue = await getIssue(issueNumber)
        return issue
    } catch (error) {
        console.error('查找文章失败:', error)
        return null
    }
}

export default async function PostPage({ params }: PostPageProps) {
    const { slug } = await params

    // 根据slug查找对应的issue
    const issue = await findIssueBySlug(slug)

    if (!issue) {
        console.warn(`Issue not found for slug: ${slug}`)
        notFound()
    }

    // 获取评论
    const comments = await getIssueComments(issue.number).catch(err => {
        console.error('获取评论失败:', err)
        return []
    })

    const post = issueToBlogPost(issue)
    const { html: htmlContent, toc } = markdownToHtmlWithToc(post.content)

    const apiConfig = await getApiConfig()
    const repo = apiConfig.repo
    const issueNumber = issue.number
    const originalWebUrl = `https://cnb.cool/${repo}/-/issues/${issueNumber}`
    // const originalApiUrl = `https://api.cnb.cool/${repo}/-/issues/${issueNumber}`

    return (
        <article className="min-h-screen">
            {/* 文章头部 */}
            <header className="bg-muted/30 py-16">
                <div className="container-center">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* 面包屑导航 */}
                        <nav className="mb-8">
                            <ol className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                                <li>
                                    <Link href="/" className="hover:text-primary">
                                        首页
                                    </Link>
                                </li>
                                <li>/</li>
                                <li>
                                    <Link href="/posts" className="hover:text-primary">
                                        文章
                                    </Link>
                                </li>
                                <li>/</li>
                                <li className="text-foreground">{post.title}</li>
                            </ol>
                        </nav>

                        {/* 文章标题 */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            {post.title}
                        </h1>

                        {/* 文章元信息 */}
                        <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground mb-8">
                            <div className="flex items-center space-x-2">
                                <img
                                    src={post.author.avatar}
                                    alt={post.author.name}
                                    className="w-10 h-10 rounded-full"
                                />
                                <span className="font-medium">{post.author.name}</span>
                            </div>
                            <span>•</span>
                            <time dateTime={post.publishedAt}>
                                {formatDate(post.publishedAt)}
                            </time>
                            <span>•</span>
                            <span>{post.readingTime} 分钟阅读</span>
                            {post.category && (
                                <>
                                    <span>•</span>
                                    <span className="text-primary">{post.category}</span>
                                </>
                            )}
                        </div>

                        {/* 文章标签 */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-2">
                                {post.tags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="px-3 py-1 rounded-full text-sm transition-colors"
                                        style={{
                                            backgroundColor: `${tag.color}20`,
                                            color: tag.color,
                                        }}
                                    >
                                        #{tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* 文章内容 */}
            <div className="py-16">
                <div className="container-center">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex gap-8">
                            {/* 主要内容区域 */}
                            <div className="flex-1 max-w-4xl">
                                {/* 移动端目录 */}
                                <SimpleToc toc={toc} />

                                {/* 封面图片 */}
                                {post.coverImage && (
                                    <div className="mb-12">
                                        <img
                                            src={post.coverImage}
                                            alt={post.title}
                                            className="w-full rounded-lg shadow-lg"
                                        />
                                    </div>
                                )}

                                {/* 文章正文 */}
                                <div
                                    className="prose prose-lg max-w-none dark:prose-invert"
                                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                                />
                            </div>

                            {/* 侧边栏目录 - 仅在桌面端显示 */}
                            <aside className="hidden lg:block w-64 flex-shrink-0">
                                <TableOfContents toc={toc} />
                            </aside>
                        </div>

                        {/* 文章底部信息 */}
                        <footer className="mt-16 pt-8 border-t">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={post.author.avatar}
                                        alt={post.author.name}
                                        className="w-16 h-16 rounded-full"
                                    />
                                    <div>
                                        <h3 className="font-semibold text-lg">{post.author.name}</h3>
                                        <p className="text-muted-foreground">
                                            发布于 {formatDate(post.publishedAt)}
                                        </p>
                                        {post.updatedAt !== post.publishedAt && (
                                            <p className="text-sm text-muted-foreground">
                                                更新于 {formatDate(post.updatedAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* 分享按钮 */}
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground mr-2">分享:</span>
                                    <Button variant="outline" size="sm" asChild>
                                        <a
                                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.cnb.cool'}/posts/${post.slug}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Twitter
                                        </a>
                                    </Button>
                                    <Button variant="outline" size="sm" asChild>
                                        <a
                                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.cnb.cool'}/posts/${post.slug}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Facebook
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>

            {/* 评论区域 */}
            <section className="py-16 bg-muted/30">
                <div className="container-center">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold mb-8">
                            评论 {comments && comments.length > 0 ? `(${comments.length})` : ''}
                        </h2>
                        {comments && comments.length > 0 ? (
                            <div className="space-y-4"> {/* Reduced space for compactness */}
                                {comments.map((comment) => (
                                    <div key={comment.id} className="bg-background rounded-lg p-4 shadow-sm"> {/* p-6 to p-4 */}
                                        <div className="flex items-start space-x-3"> {/* space-x-4 to space-x-3 */}
                                            <img
                                                src={comment.author.avatar_url || '/default-avatar.png'}
                                                alt={comment.author.name}
                                                className="w-8 h-8 rounded-full mt-1" /* w-10 h-10 to w-8 h-8, added mt-1 */
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1"> {/* mb-2 to mb-1 */}
                                                    <span className="text-sm font-medium">{comment.author.name}</span> {/* Added text-sm */}
                                                    <time className="text-xs text-muted-foreground"> {/* text-sm to text-xs */}
                                                        {formatDate(comment.created_at)}
                                                    </time>
                                                </div>
                                                <div
                                                    className="prose prose-sm max-w-none dark:prose-invert"
                                                    dangerouslySetInnerHTML={{
                                                        __html: comment.body_html || markdownToHtml(comment.body)
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground mb-6">暂无评论。</p>
                        )}

                        {/* 引导信息 */}
                        <div className="mt-8 pt-6 border-t text-center">
                            <p className="text-muted-foreground mb-3">
                                欢迎到原文中评论及订阅。
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                                <Button variant="outline" size="sm" asChild>
                                    <a href={originalWebUrl} target="_blank" rel="noopener noreferrer">
                                        前往 cnb.cool 原文参与讨论
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 复制代码功能脚本 */}
            <div dangerouslySetInnerHTML={{ __html: copyCodeScript }} />
        </article>
    )
}

// 生成页面元数据
export async function generateMetadata({ params }: PostPageProps) {
    const { slug } = await params
    const issue = await findIssueBySlug(slug)

    if (!issue) {
        return {
            title: '文章未找到',
            description: '请求的文章不存在',
        }
    }

    const post = issueToBlogPost(issue)

    return generateSEOData(
        post.title,
        post.excerpt,
        {
            type: 'article',
            url: `/posts/${post.slug}`,
            image: post.coverImage,
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt,
            author: post.author.name,
            keywords: post.tags?.map(tag => tag.name) || [],
        }
    )
}