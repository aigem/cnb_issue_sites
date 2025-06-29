const fs = require('fs')
const path = require('path')

// 简单的静态站点生成器
async function buildStaticSite() {
    console.log('开始构建静态博客...')

    // 创建输出目录
    const outDir = path.join(__dirname, 'dist')
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true })
    }

    // 创建基础HTML模板
    const htmlTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CNB博客 - 技术分享平台</title>
    <meta name="description" content="CNB博客致力于分享高质量的技术内容，帮助开发者成长和学习">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        .container-center { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    </style>
</head>
<body class="bg-gray-50 text-gray-900">
    <header class="bg-white shadow-sm border-b">
        <div class="container-center">
            <div class="flex h-16 items-center justify-between">
                <div class="flex items-center space-x-2">
                    <div class="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                        <span class="text-white font-bold text-lg">C</span>
                    </div>
                    <span class="font-bold text-xl">CNB博客</span>
                </div>
                <nav class="hidden md:flex items-center space-x-6">
                    <a href="/" class="text-sm font-medium hover:text-blue-600">首页</a>
                    <a href="/posts.html" class="text-sm font-medium hover:text-blue-600">文章</a>
                    <a href="/about.html" class="text-sm font-medium hover:text-blue-600">关于</a>
                </nav>
            </div>
        </div>
    </header>

    <main class="min-h-screen py-16">
        <div class="container-center">
            <div class="text-center mb-16">
                <h1 class="text-4xl md:text-6xl font-bold mb-6">
                    欢迎来到 <span class="text-blue-600">CNB博客</span>
                </h1>
                <p class="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                    分享前沿技术见解，探索编程世界的无限可能。
                    与开发者社区一起成长，共同创造更好的技术未来。
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="/posts.html" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        浏览文章
                    </a>
                    <a href="/about.html" class="border border-gray-300 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                        了解更多
                    </a>
                </div>
            </div>

            <div class="mb-16">
                <h2 class="text-3xl font-bold text-center mb-8">精选文章</h2>
                <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <div class="p-6">
                            <div class="flex items-center justify-between mb-4">
                                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">前端开发</span>
                                <time class="text-sm text-gray-500">2024-01-15</time>
                            </div>
                            <h3 class="text-xl font-semibold mb-2 line-clamp-2">
                                Next.js 14 新特性详解：App Router 的最佳实践
                            </h3>
                            <p class="text-gray-600 line-clamp-3 mb-4">
                                深入探讨 Next.js 14 中 App Router 的新特性，包括服务端组件、客户端组件的最佳使用方式...
                            </p>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-2 text-sm text-gray-500">
                                    <span>👤 张三</span>
                                    <span>•</span>
                                    <span>💬 12</span>
                                </div>
                                <a href="#" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                    阅读更多 →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <footer class="bg-white border-t mt-16">
        <div class="container-center py-8">
            <div class="text-center text-gray-600">
                <p>&copy; 2024 CNB博客. 保留所有权利.</p>
                <p class="mt-2">基于 CNB Issues API 构建的静态博客系统</p>
            </div>
        </div>
    </footer>
</body>
</html>`

    // 写入首页
    fs.writeFileSync(path.join(outDir, 'index.html'), htmlTemplate)

    // 创建关于页面
    const aboutPage = htmlTemplate.replace(
        /<main[\s\S]*<\/main>/,
        `<main class="min-h-screen py-16">
        <div class="container-center">
            <div class="max-w-4xl mx-auto">
                <div class="text-center mb-16">
                    <h1 class="text-4xl md:text-5xl font-bold mb-6">关于我们</h1>
                    <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                        CNB博客致力于分享高质量的技术内容，帮助开发者成长和学习
                    </p>
                </div>
                
                <div class="grid gap-8 md:grid-cols-2 mb-16">
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h2 class="text-2xl font-bold mb-4 flex items-center">
                            <span class="mr-2">🎯</span>
                            我们的使命
                        </h2>
                        <p class="text-gray-600 leading-relaxed">
                            我们致力于创建一个高质量的中文技术博客平台，分享前沿的技术见解、
                            实用的编程经验和创新的解决方案，帮助开发者社区共同成长。
                        </p>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h2 class="text-2xl font-bold mb-4 flex items-center">
                            <span class="mr-2">💡</span>
                            我们的愿景
                        </h2>
                        <p class="text-gray-600 leading-relaxed">
                            成为开发者首选的技术学习平台，通过优质内容和活跃社区，
                            推动技术进步，促进知识分享，构建更好的开发者生态。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </main>`
    )

    fs.writeFileSync(path.join(outDir, 'about.html'), aboutPage)

    // 创建文章列表页
    const postsPage = htmlTemplate.replace(
        /<main[\s\S]*<\/main>/,
        `<main class="min-h-screen py-16">
        <div class="container-center">
            <div class="text-center mb-16">
                <h1 class="text-4xl md:text-5xl font-bold mb-6">所有文章</h1>
                <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                    探索我们的技术文章，涵盖前端开发、后端架构、DevOps等多个领域
                </p>
            </div>
            
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-4">
                            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">前端开发</span>
                            <time class="text-sm text-gray-500">2024-01-15</time>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">
                            <a href="#" class="hover:text-blue-600 transition-colors">
                                Next.js 14 新特性详解
                            </a>
                        </h3>
                        <p class="text-gray-600 line-clamp-3 mb-4">
                            深入探讨 Next.js 14 中 App Router 的新特性...
                        </p>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-2 text-sm text-gray-500">
                                <span>👤 张三</span>
                                <span>•</span>
                                <span>💬 12</span>
                            </div>
                            <a href="#" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                阅读更多 →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>`
    )

    fs.writeFileSync(path.join(outDir, 'posts.html'), postsPage)

    // 复制静态资源
    const publicDir = path.join(__dirname, 'public')
    if (fs.existsSync(publicDir)) {
        const files = fs.readdirSync(publicDir)
        files.forEach(file => {
            const srcPath = path.join(publicDir, file)
            const destPath = path.join(outDir, file)
            if (fs.statSync(srcPath).isFile()) {
                fs.copyFileSync(srcPath, destPath)
            }
        })
    }

    console.log('✅ 静态博客构建完成！')
    console.log(`📁 输出目录: ${outDir}`)
    console.log('🌐 可以使用任何静态文件服务器来预览网站')
}

// 运行构建
buildStaticSite().catch(console.error)