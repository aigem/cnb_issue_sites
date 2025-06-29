import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BlogPost } from "@/types/blog"
import { formatDate, formatRelativeTime } from "@/lib/utils"

interface FeaturedPostsProps {
    posts: BlogPost[]
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
    if (posts.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">暂无精选文章</p>
            </div>
        )
    }

    const [mainPost, ...otherPosts] = posts

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* 主要精选文章 */}
            {mainPost && (
                <Card className="lg:row-span-2 card-hover">
                    <Link href={`/posts/${mainPost.slug}`}>
                        {mainPost.coverImage && (
                            <div className="aspect-video overflow-hidden rounded-t-lg">
                                <img
                                    src={mainPost.coverImage}
                                    alt={mainPost.title}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                />
                            </div>
                        )}
                        <CardHeader>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                                    精选
                                </span>
                                <time dateTime={mainPost.publishedAt}>
                                    {formatDate(mainPost.publishedAt)}
                                </time>
                                <span>•</span>
                                <span>{mainPost.readingTime} 分钟阅读</span>
                            </div>
                            <CardTitle className="text-2xl line-clamp-2 hover:text-primary transition-colors">
                                {mainPost.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground line-clamp-3 mb-4">
                                {mainPost.excerpt}
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <img
                                        src={mainPost.author.avatar}
                                        alt={mainPost.author.name}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <span className="text-sm font-medium">{mainPost.author.name}</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {mainPost.tags.slice(0, 2).map((tag) => (
                                        <span
                                            key={tag.id}
                                            className="px-2 py-1 text-xs rounded-full"
                                            style={{
                                                backgroundColor: `${tag.color}20`,
                                                color: tag.color,
                                            }}
                                        >
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Link>
                </Card>
            )}

            {/* 其他精选文章 */}
            <div className="space-y-6">
                {otherPosts.slice(0, 4).map((post) => (
                    <Card key={post.id} className="card-hover">
                        <Link href={`/posts/${post.slug}`}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <time dateTime={post.publishedAt}>
                                        {formatRelativeTime(post.publishedAt)}
                                    </time>
                                    <span>•</span>
                                    <span>{post.readingTime} 分钟</span>
                                </div>
                                <CardTitle className="text-lg line-clamp-2 hover:text-primary transition-colors">
                                    {post.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <p className="text-muted-foreground line-clamp-2 text-sm mb-3">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <img
                                            src={post.author.avatar}
                                            alt={post.author.name}
                                            className="w-6 h-6 rounded-full"
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            {post.author.name}
                                        </span>
                                    </div>
                                    {post.tags.length > 0 && (
                                        <span
                                            className="px-2 py-1 text-xs rounded-full"
                                            style={{
                                                backgroundColor: `${post.tags[0].color}20`,
                                                color: post.tags[0].color,
                                            }}
                                        >
                                            {post.tags[0].name}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Link>
                    </Card>
                ))}
            </div>
        </div>
    )
}