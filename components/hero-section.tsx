import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
    return (
        <section className="relative py-20 lg:py-32 overflow-hidden">
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
            </div>

            <div className="container-center relative">
                <div className="text-center max-w-4xl mx-auto">
                    {/* 标题 */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                        <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            技术分享
                        </span>
                        <br />
                        <span className="text-foreground">与创新思考</span>
                    </h1>

                    {/* 描述 */}
                    <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                        探索前沿技术，分享编程经验，记录开发心得。
                        <br className="hidden md:block" />
                        与开发者社区一起成长，共同推动技术进步。
                    </p>

                    {/* 行动按钮 */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                        <Button asChild size="lg" className="text-lg px-8 py-6">
                            <Link href="/posts">
                                开始阅读
                                <svg
                                    className="ml-2 h-5 w-5"
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
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                            <Link href="/about">
                                了解更多
                            </Link>
                        </Button>
                    </div>

                    {/* 特色标签 */}
                    <div className="flex flex-wrap justify-center gap-3 text-sm">
                        <span className="px-3 py-1 bg-accent/20 text-accent-foreground dark:bg-accent/30 dark:text-accent-foreground rounded-full">
                            React
                        </span>
                        <span className="px-3 py-1 bg-accent/20 text-accent-foreground dark:bg-accent/30 dark:text-accent-foreground rounded-full">
                            Next.js
                        </span>
                        <span className="px-3 py-1 bg-accent/20 text-accent-foreground dark:bg-accent/30 dark:text-accent-foreground rounded-full">
                            TypeScript
                        </span>
                        <span className="px-3 py-1 bg-accent/20 text-accent-foreground dark:bg-accent/30 dark:text-accent-foreground rounded-full">
                            Node.js
                        </span>
                        <span className="px-3 py-1 bg-accent/20 text-accent-foreground dark:bg-accent/30 dark:text-accent-foreground rounded-full">
                            云原生
                        </span>
                        <span className="px-3 py-1 bg-accent/20 text-accent-foreground dark:bg-accent/30 dark:text-accent-foreground rounded-full">
                            微服务
                        </span>
                    </div>
                </div>
            </div>

            {/* 滚动指示器 */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <svg
                    className="w-6 h-6 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                </svg>
            </div>
        </section>
    )
}