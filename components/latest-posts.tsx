import Link from "next/link"
import { BlogPost } from "@/types/blog"
import { formatRelativeTime, formatDate } from "@/lib/utils" // formatDate is used

interface LatestPostsProps {
    posts: BlogPost[]
}

export function LatestPosts({ posts }: LatestPostsProps) {
    if (posts.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">暂无文章</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                        </h3>
                        <time
                            dateTime={post.publishedAt}
                            className="text-sm text-muted-foreground mt-1 sm:mt-0 sm:ml-4 whitespace-nowrap"
                        >
                            {formatDate(post.publishedAt, "yyyy年MM月dd日")} ({formatRelativeTime(post.publishedAt)})
                        </time>
                    </div>
                    {post.category && (
                        <p className="text-sm text-primary mt-1">{post.category}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {post.excerpt}
                    </p>
                </Link>
            ))}
        </div>
    )
}