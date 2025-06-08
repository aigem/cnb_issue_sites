import { NextResponse } from 'next/server'
import { getConfig } from '@/lib/config'

// 配置静态导出
export const dynamic = 'force-static'
export const revalidate = false

export async function GET() {
    try {
        const config = await getConfig()

        // 移除敏感信息（如API密钥）
        const clientConfig = {
            ...config,
            api: {
                ...config.api,
                authToken: undefined, // 不向客户端暴露认证令牌
            },
        }

        return NextResponse.json(clientConfig)
    } catch (error) {
        console.error('获取配置失败:', error)
        return NextResponse.json(
            { error: '配置加载失败' },
            { status: 500 }
        )
    }
}

// 由于是静态导出，POST方法在生产环境中不可用
// 在开发环境中可以使用，生产环境建议通过配置文件管理
export async function POST() {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { error: '生产环境不支持动态配置更新，请使用配置文件' },
            { status: 405 }
        )
    }

    return NextResponse.json(
        { error: '配置更新功能仅在开发环境可用' },
        { status: 405 }
    )
}