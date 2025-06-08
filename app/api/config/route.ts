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

import fs from 'node:fs/promises';
import path from 'node:path';
import type { BlogConfig } from '@/lib/config'; // For validation structure

// 由于是静态导出，POST方法在生产环境中不可用
// 在开发环境中可以使用，生产环境建议通过配置文件管理
export async function POST(request: Request) {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { error: '生产环境不支持动态配置更新，请使用配置文件' },
            { status: 405 } // Method Not Allowed
        );
    }

    try {
        const newConfig: Partial<BlogConfig> = await request.json();

        // Basic validation: check for some expected top-level keys
        const requiredKeys: (keyof BlogConfig)[] = ['site', 'api', 'content', 'seo', 'features', 'theme', 'markdown'];
        const missingKeys = requiredKeys.filter(key => !(key in newConfig));
        if (missingKeys.length > 0) {
            return NextResponse.json(
                { error: `配置保存失败：缺少必需的配置项: ${missingKeys.join(', ')}` },
                { status: 400 } // Bad Request
            );
        }

        // Ensure sensitive data like authToken is not directly saved if it's part of newConfig from client
        // (it shouldn't be, as GET /api/config strips it, but as a safeguard)
        if (newConfig.api && 'authToken' in newConfig.api) {
            delete newConfig.api.authToken;
        }


        const configFilePath = path.join(process.cwd(), 'blog.config.json');
        await fs.writeFile(configFilePath, JSON.stringify(newConfig, null, 2), 'utf8');

        return NextResponse.json({
            message: '配置已成功保存到 blog.config.json。请重新构建项目以应用更改。'
        });

    } catch (error: any) {
        console.error('保存配置失败:', error);
        if (error instanceof SyntaxError) { // JSON parsing error
            return NextResponse.json({ error: '配置保存失败：无效的JSON格式。' }, { status: 400 });
        }
        return NextResponse.json(
            { error: `配置保存失败: ${error.message || '未知错误'}` },
            { status: 500 } // Internal Server Error
        );
    }
}