import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
    className?: string
    size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12"
    }

    return (
        <div className={cn("flex items-center justify-center", className)}>
            <div
                className={cn(
                    "animate-spin rounded-full border-2 border-muted border-t-primary",
                    sizeClasses[size]
                )}
            />
        </div>
    )
}

export function LoadingSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("animate-pulse rounded-md bg-muted", className)} />
    )
}

export function PostCardSkeleton() {
    return (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="space-y-4">
                <LoadingSkeleton className="h-4 w-3/4" />
                <LoadingSkeleton className="h-3 w-full" />
                <LoadingSkeleton className="h-3 w-2/3" />
                <div className="flex items-center space-x-4 pt-4">
                    <LoadingSkeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                        <LoadingSkeleton className="h-3 w-20" />
                        <LoadingSkeleton className="h-3 w-16" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function PostListSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
                <PostCardSkeleton key={i} />
            ))}
        </div>
    )
}