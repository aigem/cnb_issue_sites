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

    // No try-catch here; let errors propagate to the caller (useConfig hook)
    // In static export, /api/config should always be available as it's pre-rendered.
    // If it fails, it's a more significant issue than just falling back to client defaults.
    const response = await fetch('/api/config');
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch config:', response.status, errorText);
        throw new Error(`配置接口请求失败: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const config = await response.json();
    if (config.error) { // Should match the error structure from GET /api/config
        console.error('Error field in config response:', config.error);
        throw new Error(config.error);
    }

    clientConfig = config;
    return config;
}

// getDefaultClientConfig function removed.

// 主配置Hook
export function useConfig() {
    const [config, setConfig] = useState<BlogConfig | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchConfig()
            .then(data => {
                setConfig(data);
                setError(null); // Clear previous errors on success
            })
            .catch((err) => {
                console.error("useConfig - fetchConfig error:", err);
                setError(err.message || '获取配置时发生未知错误');
                setConfig(null); // Set config to null on error
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