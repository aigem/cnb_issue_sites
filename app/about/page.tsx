import { generateSEOData } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AboutPage() {
    return (
        <div className="min-h-screen py-16">
            <div className="container-center">
                <div className="max-w-4xl mx-auto">
                    {/* 页面头部 */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">关于我们</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            CNB博客致力于分享高质量的技术内容，帮助开发者成长和学习
                        </p>
                    </div>

                    {/* 主要内容 */}
                    <div className="grid gap-8 md:grid-cols-2 mb-16">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <span>🎯</span>
                                    <span>我们的使命</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed">
                                    我们致力于创建一个高质量的中文技术博客平台，分享前沿的技术见解、
                                    实用的编程经验和创新的解决方案，帮助开发者社区共同成长。
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <span>💡</span>
                                    <span>我们的愿景</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed">
                                    成为开发者首选的技术学习平台，通过优质内容和活跃社区，
                                    推动技术进步，促进知识分享，构建更好的开发者生态。
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 技术栈 */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-center mb-8">技术栈</h2>
                        <div className="grid gap-6 md:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-center">前端技术</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-center">
                                        <div className="flex flex-wrap justify-center gap-2">
                                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                                                React
                                            </span>
                                            <span className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm">
                                                Next.js
                                            </span>
                                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                                                TypeScript
                                            </span>
                                            <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 rounded-full text-sm">
                                                Tailwind CSS
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-center">后端服务</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-center">
                                        <div className="flex flex-wrap justify-center gap-2">
                                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                                                CNB API
                                            </span>
                                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                                                Issues API
                                            </span>
                                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                                                静态生成
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-center">部署平台</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-center">
                                        <div className="flex flex-wrap justify-center gap-2">
                                            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm">
                                                Cloudflare Pages
                                            </span>
                                            <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm">
                                                EdgeOne Pages
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* 特性介绍 */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-center mb-8">博客特性</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[
                                { icon: '⚡', title: '极速加载', desc: '静态生成，CDN加速，毫秒级响应' },
                                { icon: '📱', title: '响应式设计', desc: '完美适配各种设备和屏幕尺寸' },
                                { icon: '🌙', title: '深色模式', desc: '支持明暗主题自动切换' },
                                { icon: '🔍', title: '全文搜索', desc: '强大的客户端搜索功能' },
                                { icon: '🏷️', title: '标签系统', desc: '灵活的分类和标签管理' },
                                { icon: '📊', title: 'SEO优化', desc: '完整的SEO支持和结构化数据' },
                            ].map((feature, index) => (
                                <Card key={index}>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <div className="text-3xl mb-3">{feature.icon}</div>
                                            <h3 className="font-semibold mb-2">{feature.title}</h3>
                                            <p className="text-sm text-muted-foreground">{feature.desc}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* 联系方式 */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-6">联系我们</h2>
                        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                            有任何问题或建议？欢迎通过以下方式联系我们，我们很乐意听到您的声音。
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild>
                                <Link href="mailto:contact@cnb.cool">
                                    📧 发送邮件
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="https://github.com/cnb-cool/blog" target="_blank" rel="noopener noreferrer">
                                    🐙 GitHub
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="https://twitter.com/cnb_blog" target="_blank" rel="noopener noreferrer">
                                    🐦 Twitter
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// 生成页面元数据
export async function generateMetadata() {
    return generateSEOData(
        '关于我们',
        'CNB博客致力于分享高质量的技术内容，帮助开发者成长和学习。了解我们的使命、愿景和技术栈。',
        {
            url: '/about',
            type: 'website',
        }
    )
}