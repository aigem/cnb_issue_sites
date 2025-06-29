import { Suspense } from 'react'
import { getAllPosts } from '@/lib/api'
import { generateSEOData, getPriorityLabel, getPriorityColor, getStatusLabel, getStatusColor, formatHotness } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'

// 文章卡片组件
function PostCard({ post }: { post: any }) {
    return (
        <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-wrap gap-2">
                        {/* 优先级标签 */}
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(post.priority || 'medium')}`}>
                            {getPriorityLabel(post.priority || 'medium')}
                        </span>

                        {/* 状态标签 */}
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(post.status || 'published')}`}>
                            {getStatusLabel(post.status || 'published')}
                        </span>

                        {/* 热度标签 */}
                        {post.hotness > 10 && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium dark:bg-red-900 dark:text-red-200">
                                🔥 {formatHotness(post.hotness)}
                            </span>
                        )}

                        {/* 原有标签 */}
                        {post.tags?.slice(0, 1).map((tag: any) => (
                            <span
                                key={tag.name}
                                className="px-2 py-1 text-xs rounded-full"
                                style={{
                                    backgroundColor: `#${tag.color}20`,
                                    color: `#${tag.color}`,
                                }}
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                    <time className="text-sm text-muted-foreground">
                        {new Date(post.publishedAt).toLocaleDateString('zh-CN')}
                    </time>
                </div>
                <CardTitle className="line-clamp-2">
                    <Link
                        href={`/posts/${post.slug}`}
                        className="hover:text-primary transition-colors"
                    >
                        {post.title}
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground line-clamp-3 mb-4">
                    {post.excerpt}
                </p>

                {/* 协作者头像 */}
                {post.collaborators && post.collaborators.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-muted-foreground">协作者:</span>
                        <div className="flex -space-x-2">
                            {post.collaborators.slice(0, 3).map((collaborator: any) => (
                                <img
                                    key={collaborator.id}
                                    src={collaborator.avatar || '/default-avatar.png'}
                                    alt={collaborator.name}
                                    className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800"
                                    title={collaborator.name}
                                />
                            ))}
                            {post.collaborators.length > 3 && (
                                <div className="w-5 h-5 rounded-full bg-gray-200 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                    +{post.collaborators.length - 3}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>👤 {post.author.name}</span>
                        <span>•</span>
                        <span>⏱️ {post.readingTime}分钟</span>
                        <span>•</span>
                        <span>💬 {post.commentsCount || 0}</span>
                        {post.referenceCount > 0 && (
                            <>
                                <span>•</span>
                                <span>🔗 {post.referenceCount}</span>
                            </>
                        )}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/posts/${post.slug}`}>
                            阅读更多 →
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// 文章列表组件
async function PostsList() {
    try {
        const posts = await getAllPosts()

        if (!posts || posts.length === 0) {
            return (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">📝</div>
                    <h2 className="text-2xl font-bold mb-2">暂无文章</h2>
                    <p className="text-muted-foreground">
                        还没有发布任何文章，请稍后再来查看。
                    </p>
                </div>
            )
        }

        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        )
    } catch (error) {
        console.error('获取文章列表失败:', error)
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold mb-2">加载失败</h2>
                <p className="text-muted-foreground mb-4">
                    无法加载文章列表，请稍后重试。
                </p>
                <Button onClick={() => window.location.reload()}>
                    重新加载
                </Button>
            </div>
        )
    }
}

// 加载状态组件
function PostsLoading() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-full">
                    <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex gap-2">
                                <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
                                <div className="h-5 w-12 bg-muted rounded-full animate-pulse" />
                            </div>
                            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                        </div>
                        <div className="h-6 bg-muted rounded animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 mb-4">
                            <div className="h-4 bg-muted rounded animate-pulse" />
                            <div className="h-4 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

// 主页面组件
export default function PostsPage() {
    return (
        <div className="min-h-screen py-16">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    {/* 页面头部 */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">所有文章</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            探索我们的技术文章，涵盖前端开发、后端架构、DevOps等多个领域
                        </p>
                    </div>


                    {/* 文章列表 */}
                    <Suspense fallback={<PostsLoading />}>
                        <PostsList />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}

// 生成页面元数据
export async function generateMetadata() {
    return generateSEOData(
        '所有文章',
        '浏览CNB博客的所有技术文章，涵盖前端开发、后端架构、DevOps等多个技术领域的深度内容。',
        {
            url: '/posts',
            type: 'website',
        }
    )
}