import { Suspense } from 'react'
import { getFeaturedIssues, getLatestIssues, getBlogStats } from '@/lib/api'
import { issueToBlogPost } from '@/lib/utils'
import { getFeaturesConfig, getSiteConfig, getSeoConfig } from '@/lib/config'
import { HeroSection } from '@/components/hero-section'
import { FeaturedPosts } from '@/components/featured-posts'
import { LatestPosts } from '@/components/latest-posts'
import { Newsletter } from '@/components/newsletter'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { BlogPost } from '@/types/blog'

async function getFeaturedPostsData(): Promise<BlogPost[]> {
    try {
        const featuredIssues = await getFeaturedIssues(6)
        return featuredIssues.map(issueToBlogPost)
    } catch (error) {
        console.error('获取精选文章失败:', error)
        return []
    }
}

async function getLatestPostsData(): Promise<BlogPost[]> {
    try {
        const latestIssues = await getLatestIssues(12)
        return latestIssues.map(issueToBlogPost)
    } catch (error) {
        console.error('获取最新文章失败:', error)
        return []
    }
}

export default async function HomePage() {
    const [featuredPosts, latestPosts, blogStats] = await Promise.all([
        getFeaturedPostsData(),
        getLatestPostsData(),
        getBlogStats(), // Fetch blog statistics
    ])
    const featuresConfig = await getFeaturesConfig()

    // Helper function to format large numbers
    const formatStatNumber = (num: number): string => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k+'
        }
        return num.toString() + '+'
    }

    return (
        <div className="min-h-screen">
            {/* 英雄区域 */}
            <HeroSection />

            {/* 精选文章 */}
            {featuredPosts.length > 0 && (
                <section className="py-16 bg-muted/30">
                    <div className="container-center">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">精选文章</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                精心挑选的优质技术文章，为您带来深度思考和实用见解
                            </p>
                        </div>
                        <Suspense fallback={<LoadingSpinner />}>
                            <FeaturedPosts posts={featuredPosts} />
                        </Suspense>
                    </div>
                </section>
            )}

            {/* 最新文章 */}
            <section className="py-16">
                <div className="container-center">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">最新文章</h2>
                            <p className="text-muted-foreground text-lg">
                                探索最新的技术趋势和开发实践
                            </p>
                        </div>
                        <a
                            href="/posts"
                            className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                        >
                            查看全部
                            <svg
                                className="ml-2 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </a>
                    </div>
                    <Suspense fallback={<LoadingSpinner />}>
                        <LatestPosts posts={latestPosts} />
                    </Suspense>
                </div>
            </section>

            {/* 订阅区域 */}
            {featuresConfig.newsletter && (
                <section className="py-16 bg-primary/5">
                    <div className="container-center">
                        <Newsletter />
                    </div>
                </section>
            )}

            {/* 统计信息 */}
            {featuresConfig.showHomepageStats && (
                <section className="py-16 border-t">
                    <div className="container-center">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            <div>
                                <div className="text-3xl font-bold text-primary mb-2">
                                    {formatStatNumber(blogStats.totalPosts)}
                                </div>
                                <div className="text-muted-foreground">技术文章</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary mb-2">
                                    {formatStatNumber(blogStats.totalComments)}
                                </div>
                                <div className="text-muted-foreground">总评论数</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary mb-2">
                                    {formatStatNumber(blogStats.totalAuthors)}
                                </div>
                                <div className="text-muted-foreground">贡献作者</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary mb-2">
                                    {formatStatNumber(blogStats.totalTags)}
                                </div>
                                <div className="text-muted-foreground">技术标签</div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}

// 生成静态页面元数据
export async function generateMetadata() {
    const siteConfig = await getSiteConfig()
    const seoConfig = await getSeoConfig()

    const siteTitle = siteConfig.title || 'CNB博客'
    const siteDescription = siteConfig.description || '技术分享与思考'
    const siteUrl = siteConfig.url || '/'
    const defaultImage = seoConfig.defaultImage || '/og-image.png' // 使用配置中的默认图片
    const twitterHandle = seoConfig.twitterHandle ? `@${seoConfig.twitterHandle.replace('@', '')}` : undefined


    // 基础关键词，可以考虑从配置中读取或进一步扩展
    const baseKeywords = ['技术博客', '编程', '开发']
    const siteKeywords = siteConfig.title.split(' ').concat(siteDescription.split(' ').slice(0, 5)) // 从标题和描述中提取一些关键词
    const keywords = [...new Set([...baseKeywords, ...siteKeywords])].slice(0, 10) // 合并去重并限制数量

    return {
        title: {
            default: siteTitle,
            template: `%s | ${siteTitle}`, // 用于子页面标题模板
        },
        description: siteDescription,
        keywords: keywords,
        authors: [{ name: siteConfig.author, url: siteUrl }],
        creator: siteConfig.author,
        publisher: siteConfig.author,
        metadataBase: new URL(siteUrl), // 确保URL是绝对的

        openGraph: {
            title: siteTitle,
            description: siteDescription,
            url: siteUrl,
            siteName: siteTitle,
            images: [
                {
                    url: defaultImage,
                    width: 1200,
                    height: 630,
                    alt: `${siteTitle} - ${siteDescription}`,
                },
            ],
            locale: 'zh_CN', // 假设是中文站点
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: siteTitle,
            description: siteDescription,
            site: twitterHandle,
            creator: twitterHandle,
            images: [defaultImage],
        },
        robots: { // 根据SEO配置生成robots元数据
            index: seoConfig.enableRobots,
            follow: seoConfig.enableRobots,
            googleBot: {
                index: seoConfig.enableRobots,
                follow: seoConfig.enableRobots,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        // 可以根据需要添加更多元数据，如 manifest, icons 等
        // manifest: `${siteUrl}/site.webmanifest`,
        // icons: {
        //   icon: '/favicon.ico',
        //   shortcut: '/favicon-16x16.png',
        //   apple: '/apple-touch-icon.png',
        // },
    }
}