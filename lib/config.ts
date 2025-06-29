/**
 * CNB静态博客系统配置管理
 * 提供统一的配置接口，支持环境变量和配置文件
 */

export interface BlogConfig {
    // 站点基本信息
    site: {
        title: string
        description: string
        url: string
        author: string
        email?: string
        logo?: string
        favicon?: string
    }

    // API配置
    api: {
        baseUrl: string
        repo: string
        authToken?: string
        timeout: number
        retries: number
    }

    // 内容显示配置
    content: {
        postsPerPage: number
        excerptLength: number
        showReadingTime: boolean
        showAuthor: boolean
        showDate: boolean
        showTags: boolean
        enableComments: boolean
        enableSearch: boolean
    }

    // Markdown渲染配置
    markdown: {
        enableCodeHighlight: boolean
        enableMath: boolean
        enableToc: boolean
        enableTaskList: boolean
        codeTheme: 'default' | 'dark' | 'light'
        mathRenderer: 'katex' | 'mathjax'
    }

    // UI主题配置
    theme: {
        primaryColor: string
        darkMode: 'auto' | 'light' | 'dark'
        fontFamily: string
        fontSize: 'sm' | 'base' | 'lg'
        layout: 'default' | 'wide' | 'compact'
    }

    // SEO配置
    seo: {
        enableSitemap: boolean
        enableRobots: boolean
        enableJsonLd: boolean
        defaultImage?: string
        twitterHandle?: string
    }

    // 功能开关
    features: {
        newsletter: boolean
        analytics: boolean
        pwa: boolean
        rss: boolean
        socialShare: boolean
        showHomepageStats: boolean // 新增：控制首页统计信息区域的显示
    }
}

// 默认配置
const defaultConfig: BlogConfig = {
    site: {
        title: 'CNB博客',
        description: '基于CNB Issues API的现代化静态博客',
        url: 'https://blog.cnb.cool',
        author: 'CNB Team',
    },

    api: {
        baseUrl: 'https://api.cnb.cool',
        repo: 'cnb.ai/testblog',
        timeout: 10000,
        retries: 3,
    },

    content: {
        postsPerPage: 10,
        excerptLength: 200,
        showReadingTime: true,
        showAuthor: true,
        showDate: true,
        showTags: true,
        enableComments: true,
        enableSearch: true,
    },

    markdown: {
        enableCodeHighlight: true,
        enableMath: true,
        enableToc: true,
        enableTaskList: true,
        codeTheme: 'default',
        mathRenderer: 'katex',
    },

    theme: {
        primaryColor: '#3b82f6',
        darkMode: 'auto',
        fontFamily: 'Inter, sans-serif',
        fontSize: 'base',
        layout: 'default',
    },

    seo: {
        enableSitemap: true,
        enableRobots: true,
        enableJsonLd: true,
    },

    features: {
        newsletter: true,
        analytics: false,
        pwa: true,
        rss: true,
        socialShare: true,
        showHomepageStats: true, // 新增：默认显示
    },
}

// 从环境变量加载配置
function loadConfigFromEnv(): Partial<BlogConfig> {
    const envConfig: Partial<BlogConfig> = {}

    // 站点配置
    if (process.env.NEXT_PUBLIC_SITE_TITLE) {
        if (!envConfig.site) envConfig.site = {} as any
        envConfig.site!.title = process.env.NEXT_PUBLIC_SITE_TITLE
    }

    if (process.env.NEXT_PUBLIC_SITE_DESCRIPTION) {
        if (!envConfig.site) envConfig.site = {} as any
        envConfig.site!.description = process.env.NEXT_PUBLIC_SITE_DESCRIPTION
    }

    if (process.env.NEXT_PUBLIC_SITE_URL) {
        if (!envConfig.site) envConfig.site = {} as any
        envConfig.site!.url = process.env.NEXT_PUBLIC_SITE_URL
    }

    if (process.env.NEXT_PUBLIC_SITE_AUTHOR) {
        if (!envConfig.site) envConfig.site = {} as any
        envConfig.site!.author = process.env.NEXT_PUBLIC_SITE_AUTHOR
    }

    // API配置
    if (process.env.BASE_URL) {
        if (!envConfig.api) envConfig.api = {} as any
        envConfig.api!.baseUrl = process.env.BASE_URL
    }

    if (process.env.REPO) {
        if (!envConfig.api) envConfig.api = {} as any
        envConfig.api!.repo = process.env.REPO
    }

    if (process.env.AUTH_TOKEN) {
        if (!envConfig.api) envConfig.api = {} as any
        envConfig.api!.authToken = process.env.AUTH_TOKEN
    }

    // 内容配置
    if (process.env.NEXT_PUBLIC_POSTS_PER_PAGE) {
        if (!envConfig.content) envConfig.content = {} as any
        envConfig.content!.postsPerPage = parseInt(process.env.NEXT_PUBLIC_POSTS_PER_PAGE, 10)
    }

    if (process.env.NEXT_PUBLIC_EXCERPT_LENGTH) {
        if (!envConfig.content) envConfig.content = {} as any
        envConfig.content!.excerptLength = parseInt(process.env.NEXT_PUBLIC_EXCERPT_LENGTH, 10)
    }

    // 主题配置
    if (process.env.NEXT_PUBLIC_PRIMARY_COLOR) {
        if (!envConfig.theme) envConfig.theme = {} as any
        envConfig.theme!.primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR
    }

    if (process.env.NEXT_PUBLIC_DARK_MODE) {
        if (!envConfig.theme) envConfig.theme = {} as any
        envConfig.theme!.darkMode = process.env.NEXT_PUBLIC_DARK_MODE as 'auto' | 'light' | 'dark'
    }

    return envConfig
}

// 从配置文件加载配置
async function loadConfigFromFile(): Promise<Partial<BlogConfig>> {
    try {
        // 尝试加载 blog.config.json
        if (typeof window === 'undefined') {
            const fs = await import('fs').catch(() => null)
            const path = await import('path').catch(() => null)

            if (fs && path) {
                const configPath = path.join(process.cwd(), 'blog.config.json')
                if (fs.existsSync(configPath)) {
                    const configContent = fs.readFileSync(configPath, 'utf-8')
                    return JSON.parse(configContent)
                }
            }
        }
    } catch (error) {
        console.warn('配置文件加载失败:', error)
    }

    return {}
}

// 深度合并配置对象
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const result = { ...target }

    for (const key in source) {
        if (source[key] !== undefined) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                result[key] = deepMerge(result[key] || {} as any, source[key])
            } else {
                result[key] = source[key] as T[Extract<keyof T, string>]
            }
        }
    }

    return result
}

// 配置验证
function validateConfig(config: BlogConfig): string[] {
    const errors: string[] = []

    // 验证必需字段
    if (!config.site.title) {
        errors.push('站点标题不能为空')
    }

    if (!config.site.url) {
        errors.push('站点URL不能为空')
    }

    if (!config.api.baseUrl) {
        errors.push('API基础URL不能为空')
    }

    if (!config.api.repo) {
        errors.push('仓库名称不能为空')
    }

    // 验证数值范围
    if (config.content.postsPerPage < 1 || config.content.postsPerPage > 100) {
        errors.push('每页文章数量应在1-100之间')
    }

    if (config.content.excerptLength < 50 || config.content.excerptLength > 500) {
        errors.push('摘要长度应在50-500字符之间')
    }

    if (config.api.timeout < 1000 || config.api.timeout > 60000) {
        errors.push('API超时时间应在1-60秒之间')
    }

    // 验证URL格式
    try {
        new URL(config.site.url)
    } catch {
        errors.push('站点URL格式无效')
    }

    try {
        new URL(config.api.baseUrl)
    } catch {
        errors.push('API基础URL格式无效')
    }

    return errors
}

// 获取完整配置
let cachedConfig: BlogConfig | null = null

export async function getConfig(): Promise<BlogConfig> {
    if (cachedConfig) {
        return cachedConfig
    }

    // 按优先级合并配置：默认配置 < 配置文件 < 环境变量
    const envConfig = loadConfigFromEnv()
    const fileConfig = await loadConfigFromFile()

    let config = deepMerge(defaultConfig, fileConfig)
    config = deepMerge(config, envConfig)

    // 验证配置
    const errors = validateConfig(config)
    if (errors.length > 0) {
        console.error('配置验证失败:')
        errors.forEach(error => console.error(`- ${error}`))
        throw new Error(`配置验证失败: ${errors.join(', ')}`)
    }

    cachedConfig = config
    return config
}

// 获取特定配置部分
export async function getSiteConfig() {
    const config = await getConfig()
    return config.site
}

export async function getApiConfig() {
    const config = await getConfig()
    return config.api
}

export async function getContentConfig() {
    const config = await getConfig()
    return config.content
}

export async function getMarkdownConfig() {
    const config = await getConfig()
    return config.markdown
}

export async function getThemeConfig() {
    const config = await getConfig()
    return config.theme
}

export async function getSeoConfig() {
    const config = await getConfig()
    return config.seo
}

export async function getFeaturesConfig() {
    const config = await getConfig()
    return config.features
}

// 重置缓存（用于测试或配置更新）
export function resetConfigCache() {
    cachedConfig = null
}

// 导出默认配置
export { defaultConfig }