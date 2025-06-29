'use client'

import { useState, useEffect } from 'react'
import type { BlogConfig } from '@/lib/config'

// 客户端配置缓存
let clientConfig: BlogConfig | null = null

// 从服务端获取配置的API端点
async function fetchConfig(): Promise<BlogConfig> {
    if (clientConfig) {
        return clientConfig
    }

    try {
        // 在静态导出模式下，尝试从API获取配置
        const response = await fetch('/api/config')
        if (!response.ok) {
            throw new Error('Failed to fetch config')
        }
        const config = await response.json()

        // 如果API返回错误，使用默认配置
        if (config.error) {
            throw new Error(config.error)
        }

        clientConfig = config
        return config
    } catch (error) {
        console.warn('从API获取配置失败，使用默认配置:', error)
        // 返回默认配置
        const defaultConfig = getDefaultClientConfig()
        clientConfig = defaultConfig
        return defaultConfig
    }
}

// 获取默认客户端配置
function getDefaultClientConfig(): BlogConfig {
    return {
        site: {
            title: 'CNB博客',
            description: '基于CNB Issues API的现代化静态博客',
            url: typeof window !== 'undefined' ? window.location.origin : 'https://blog.cnb.cool',
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
            showHomepageStats: true, // 与 lib/config.ts 中的 defaultConfig 保持一致
        },
    }
}

// 主配置Hook
export function useConfig() {
    const [config, setConfig] = useState<BlogConfig | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchConfig()
            .then(setConfig)
            .catch((err) => {
                setError(err.message)
                setConfig(getDefaultClientConfig())
            })
            .finally(() => setLoading(false))
    }, [])

    return { config, loading, error }
}

// 站点配置Hook
export function useSiteConfig() {
    const { config, loading, error } = useConfig()
    return {
        siteConfig: config?.site,
        loading,
        error
    }
}

// API配置Hook
export function useApiConfig() {
    const { config, loading, error } = useConfig()
    return {
        apiConfig: config?.api,
        loading,
        error
    }
}

// 内容配置Hook
export function useContentConfig() {
    const { config, loading, error } = useConfig()
    return {
        contentConfig: config?.content,
        loading,
        error
    }
}

// Markdown配置Hook
export function useMarkdownConfig() {
    const { config, loading, error } = useConfig()
    return {
        markdownConfig: config?.markdown,
        loading,
        error
    }
}

// 主题配置Hook
export function useThemeConfig() {
    const { config, loading, error } = useConfig()
    return {
        themeConfig: config?.theme,
        loading,
        error
    }
}

// SEO配置Hook
export function useSeoConfig() {
    const { config, loading, error } = useConfig()
    return {
        seoConfig: config?.seo,
        loading,
        error
    }
}

// 功能配置Hook
export function useFeaturesConfig() {
    const { config, loading, error } = useConfig()
    return {
        featuresConfig: config?.features,
        loading,
        error
    }
}

// 重置配置缓存
export function resetConfigCache() {
    clientConfig = null
}