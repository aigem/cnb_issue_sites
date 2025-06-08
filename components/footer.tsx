import Link from "next/link"

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t bg-muted/30">
            <div className="container-center">
                <div className="py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* 品牌信息 */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                                    <span className="text-primary-foreground font-bold text-lg">C</span>
                                </div>
                                <span className="font-bold text-xl">CNB博客</span>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-xs">
                                分享技术见解、编程经验和创新思考的中文技术博客。
                            </p>
                            <div className="flex space-x-4">
                                <Link
                                    href="https://github.com"
                                    className="text-muted-foreground hover:text-primary"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    <span className="sr-only">GitHub</span>
                                </Link>
                                <Link
                                    href="https://twitter.com"
                                    className="text-muted-foreground hover:text-primary"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                    </svg>
                                    <span className="sr-only">Twitter</span>
                                </Link>
                                <Link
                                    href="/rss.xml"
                                    className="text-muted-foreground hover:text-primary"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368c10.58.046 19.152 8.594 19.183 19.188h4.817c-.03-13.231-10.755-23.954-24-24v4.812z" />
                                    </svg>
                                    <span className="sr-only">RSS</span>
                                </Link>
                            </div>
                        </div>

                        {/* 快速链接 */}
                        <div className="space-y-4">
                            <h3 className="font-semibold">快速链接</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href="/" className="text-muted-foreground hover:text-primary">
                                        首页
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/posts" className="text-muted-foreground hover:text-primary">
                                        所有文章
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/categories" className="text-muted-foreground hover:text-primary">
                                        分类
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/tags" className="text-muted-foreground hover:text-primary">
                                        标签
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* 技术栈 */}
                        <div className="space-y-4">
                            <h3 className="font-semibold">技术栈</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href="/tags/react" className="text-muted-foreground hover:text-primary">
                                        React
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/tags/nextjs" className="text-muted-foreground hover:text-primary">
                                        Next.js
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/tags/typescript" className="text-muted-foreground hover:text-primary">
                                        TypeScript
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/tags/nodejs" className="text-muted-foreground hover:text-primary">
                                        Node.js
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* 关于 */}
                        <div className="space-y-4">
                            <h3 className="font-semibold">关于</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href="/about" className="text-muted-foreground hover:text-primary">
                                        关于我们
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="text-muted-foreground hover:text-primary">
                                        联系我们
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                                        隐私政策
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terms" className="text-muted-foreground hover:text-primary">
                                        使用条款
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 底部版权 */}
                    <div className="mt-12 pt-8 border-t border-border">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <div className="text-sm text-muted-foreground">
                                © {currentYear} CNB博客. 保留所有权利.
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>由 Next.js 强力驱动</span>
                                <span>•</span>
                                <span>部署在 Cloudflare Pages</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}