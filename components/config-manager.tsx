'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useConfig } from '@/hooks/use-config'
import type { BlogConfig } from '@/lib/config'
import { resetConfigCache, getConfig } from '@/lib/config'

interface ConfigSectionProps {
    title: string
    children: React.ReactNode
}

function ConfigSection({ title, children }: ConfigSectionProps) {
    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                {title}
            </h3>
            <div className="space-y-4">
                {children}
            </div>
        </Card>
    )
}

interface InputFieldProps {
    label: string
    value: string | number
    onChange: (value: string | number) => void
    type?: 'text' | 'number' | 'email' | 'url'
    placeholder?: string
    description?: string
}

function InputField({ label, value, onChange, type = 'text', placeholder, description }: InputFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
            {description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {description}
                </p>
            )}
        </div>
    )
}

interface SelectFieldProps {
    label: string
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
    description?: string
}

function SelectField({ label, value, onChange, options, description }: SelectFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {description}
                </p>
            )}
        </div>
    )
}

interface CheckboxFieldProps {
    label: string
    checked: boolean
    onChange: (checked: boolean) => void
    description?: string
}

function CheckboxField({ label, checked, onChange, description }: CheckboxFieldProps) {
    return (
        <div className="flex items-start">
            <div className="flex items-center h-5">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
            </div>
            <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
                {description && (
                    <p className="text-gray-500 dark:text-gray-400">
                        {description}
                    </p>
                )}
            </div>
        </div>
    )
}

export default function ConfigManager() {
    const { config, loading, error } = useConfig()
    const [localConfig, setLocalConfig] = useState<BlogConfig | null>(null)
    const [saving, setSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState<string | null>(null)

    useEffect(() => {
        // 确保加载最新的配置
        async function loadLatestConfig() {
            resetConfigCache() // 清除缓存
            try {
                const latestConfig = await getConfig() // 获取最新配置
                setLocalConfig({ ...latestConfig })
            } catch (error) {
                console.error("Failed to load latest config for manager:", error)
                // 如果获取最新配置失败，回退到 useConfig 的版本
                if (config) {
                    setLocalConfig({ ...config })
                }
            }
        }

        if (config) { // 初始时 useConfig 会提供一个版本
            loadLatestConfig()
        }
    }, [config]) // 依赖于 useConfig 提供的 config，在其变化时重新加载最新

    const updateConfig = (section: keyof BlogConfig, key: string, value: any) => {
        if (!localConfig) return

        setLocalConfig({
            ...localConfig,
            [section]: {
                ...localConfig[section],
                [key]: value
            }
        })
    }

    const handleSave = async () => {
        if (!localConfig) return

        setSaving(true)
        setSaveMessage(null)

        try {
            // 在静态导出模式下，配置保存功能仅在开发环境可用
            if (process.env.NODE_ENV === 'production') {
                setSaveMessage('生产环境请通过修改 blog.config.json 文件来更新配置')
                setTimeout(() => setSaveMessage(null), 5000)
                return
            }

            const response = await fetch('/api/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(localConfig),
            })

            if (response.ok) {
                setSaveMessage('配置保存成功！')
                setTimeout(() => setSaveMessage(null), 3000)
            } else {
                const errorData = await response.json()
                throw new Error(errorData.error || '保存失败')
            }
        } catch (error) {
            setSaveMessage(`配置保存失败: ${error instanceof Error ? error.message : '请重试'}`)
            setTimeout(() => setSaveMessage(null), 5000)
        } finally {
            setSaving(false)
        }
    }

    const handleReset = () => {
        if (config) {
            setLocalConfig({ ...config })
            setSaveMessage('配置已重置')
            setTimeout(() => setSaveMessage(null), 3000)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-500 dark:text-gray-400">加载配置中...</div>
            </div>
        )
    }

    if (error || !localConfig) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-red-500">配置加载失败: {error}</div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    博客配置管理
                </h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        disabled={saving}
                    >
                        重置
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? '保存中...' : '保存配置'}
                    </Button>
                </div>
            </div>

            {/* 静态导出提示 */}
            {process.env.NODE_ENV === 'production' && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                                静态导出模式
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>
                                    当前为生产环境，配置更改需要通过修改 <code className="bg-blue-100 px-1 rounded">blog.config.json</code> 文件并重新构建来生效。
                                    此界面仅用于查看当前配置。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {saveMessage && (
                <div className={`p-3 rounded-md ${saveMessage.includes('成功')
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {saveMessage}
                </div>
            )}

            <div className="grid gap-6">
                {/* 站点配置 */}
                <ConfigSection title="站点信息">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="站点标题"
                            value={localConfig.site.title}
                            onChange={(value) => updateConfig('site', 'title', value)}
                            placeholder="我的博客"
                        />
                        <InputField
                            label="站点URL"
                            value={localConfig.site.url}
                            onChange={(value) => updateConfig('site', 'url', value)}
                            type="url"
                            placeholder="https://blog.example.com"
                        />
                        <InputField
                            label="作者名称"
                            value={localConfig.site.author}
                            onChange={(value) => updateConfig('site', 'author', value)}
                            placeholder="张三"
                        />
                        <InputField
                            label="联系邮箱"
                            value={localConfig.site.email || ''}
                            onChange={(value) => updateConfig('site', 'email', value)}
                            type="email"
                            placeholder="contact@example.com"
                        />
                    </div>
                    <InputField
                        label="站点描述"
                        value={localConfig.site.description}
                        onChange={(value) => updateConfig('site', 'description', value)}
                        placeholder="分享技术，记录生活"
                    />
                </ConfigSection>

                {/* 内容配置 */}
                <ConfigSection title="内容设置">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="每页文章数"
                            value={localConfig.content.postsPerPage}
                            onChange={(value) => updateConfig('content', 'postsPerPage', value)}
                            type="number"
                            description="首页和列表页显示的文章数量"
                        />
                        <InputField
                            label="摘要长度"
                            value={localConfig.content.excerptLength}
                            onChange={(value) => updateConfig('content', 'excerptLength', value)}
                            type="number"
                            description="文章摘要的字符数"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CheckboxField
                            label="显示阅读时间"
                            checked={localConfig.content.showReadingTime}
                            onChange={(checked) => updateConfig('content', 'showReadingTime', checked)}
                        />
                        <CheckboxField
                            label="显示作者信息"
                            checked={localConfig.content.showAuthor}
                            onChange={(checked) => updateConfig('content', 'showAuthor', checked)}
                        />
                        <CheckboxField
                            label="显示发布日期"
                            checked={localConfig.content.showDate}
                            onChange={(checked) => updateConfig('content', 'showDate', checked)}
                        />
                        <CheckboxField
                            label="显示标签"
                            checked={localConfig.content.showTags}
                            onChange={(checked) => updateConfig('content', 'showTags', checked)}
                        />
                    </div>
                </ConfigSection>

                {/* Markdown配置 */}
                <ConfigSection title="Markdown渲染">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CheckboxField
                            label="启用代码高亮"
                            checked={localConfig.markdown.enableCodeHighlight}
                            onChange={(checked) => updateConfig('markdown', 'enableCodeHighlight', checked)}
                            description="为代码块添加语法高亮"
                        />
                        <CheckboxField
                            label="启用数学公式"
                            checked={localConfig.markdown.enableMath}
                            onChange={(checked) => updateConfig('markdown', 'enableMath', checked)}
                            description="支持LaTeX数学公式渲染"
                        />
                        <CheckboxField
                            label="启用目录导航"
                            checked={localConfig.markdown.enableToc}
                            onChange={(checked) => updateConfig('markdown', 'enableToc', checked)}
                            description="自动生成文章目录"
                        />
                        <CheckboxField
                            label="启用任务列表"
                            checked={localConfig.markdown.enableTaskList}
                            onChange={(checked) => updateConfig('markdown', 'enableTaskList', checked)}
                            description="支持GitHub风格的任务列表"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField
                            label="代码主题"
                            value={localConfig.markdown.codeTheme}
                            onChange={(value) => updateConfig('markdown', 'codeTheme', value)}
                            options={[
                                { value: 'default', label: '默认' },
                                { value: 'dark', label: '深色' },
                                { value: 'light', label: '浅色' },
                            ]}
                        />
                        <SelectField
                            label="数学渲染器"
                            value={localConfig.markdown.mathRenderer}
                            onChange={(value) => updateConfig('markdown', 'mathRenderer', value)}
                            options={[
                                { value: 'katex', label: 'KaTeX' },
                                { value: 'mathjax', label: 'MathJax' },
                            ]}
                        />
                    </div>
                </ConfigSection>

                {/* 主题配置 */}
                <ConfigSection title="主题外观">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="主色调"
                            value={localConfig.theme.primaryColor}
                            onChange={(value) => updateConfig('theme', 'primaryColor', value)}
                            placeholder="#3b82f6"
                            description="十六进制颜色代码"
                        />
                        <SelectField
                            label="深色模式"
                            value={localConfig.theme.darkMode}
                            onChange={(value) => updateConfig('theme', 'darkMode', value)}
                            options={[
                                { value: 'auto', label: '自动' },
                                { value: 'light', label: '浅色' },
                                { value: 'dark', label: '深色' },
                            ]}
                        />
                        <SelectField
                            label="字体大小"
                            value={localConfig.theme.fontSize}
                            onChange={(value) => updateConfig('theme', 'fontSize', value)}
                            options={[
                                { value: 'sm', label: '小' },
                                { value: 'base', label: '中' },
                                { value: 'lg', label: '大' },
                            ]}
                        />
                        <SelectField
                            label="布局样式"
                            value={localConfig.theme.layout}
                            onChange={(value) => updateConfig('theme', 'layout', value)}
                            options={[
                                { value: 'default', label: '默认' },
                                { value: 'wide', label: '宽屏' },
                                { value: 'compact', label: '紧凑' },
                            ]}
                        />
                    </div>
                    <InputField
                        label="字体族"
                        value={localConfig.theme.fontFamily}
                        onChange={(value) => updateConfig('theme', 'fontFamily', value)}
                        placeholder="Inter, sans-serif"
                        description="CSS字体族设置"
                    />
                </ConfigSection>

                {/* 功能开关 */}
                <ConfigSection title="功能开关">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CheckboxField
                            label="邮件订阅"
                            checked={localConfig.features.newsletter}
                            onChange={(checked) => updateConfig('features', 'newsletter', checked)}
                            description="显示邮件订阅组件"
                        />
                        <CheckboxField
                            label="数据分析"
                            checked={localConfig.features.analytics}
                            onChange={(checked) => updateConfig('features', 'analytics', checked)}
                            description="启用访问统计"
                        />
                        <CheckboxField
                            label="PWA支持"
                            checked={localConfig.features.pwa}
                            onChange={(checked) => updateConfig('features', 'pwa', checked)}
                            description="渐进式Web应用功能"
                        />
                        <CheckboxField
                            label="RSS订阅"
                            checked={localConfig.features.rss}
                            onChange={(checked) => updateConfig('features', 'rss', checked)}
                            description="生成RSS订阅源"
                        />
                        <CheckboxField
                            label="社交分享"
                            checked={localConfig.features.socialShare}
                            onChange={(checked) => updateConfig('features', 'socialShare', checked)}
                            description="文章社交分享按钮"
                        />
                        <CheckboxField
                            label="显示首页统计信息"
                            checked={localConfig.features.showHomepageStats}
                            onChange={(checked) => updateConfig('features', 'showHomepageStats', checked)}
                            description="在首页底部显示统计数据"
                        />
                    </div>
                </ConfigSection>

                {/* SEO配置 */}
                <ConfigSection title="SEO设置">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CheckboxField
                            label="生成站点地图"
                            checked={localConfig.seo.enableSitemap}
                            onChange={(checked) => updateConfig('seo', 'enableSitemap', checked)}
                            description="自动生成sitemap.xml"
                        />
                        <CheckboxField
                            label="生成robots.txt"
                            checked={localConfig.seo.enableRobots}
                            onChange={(checked) => updateConfig('seo', 'enableRobots', checked)}
                            description="搜索引擎爬虫规则"
                        />
                        <CheckboxField
                            label="结构化数据"
                            checked={localConfig.seo.enableJsonLd}
                            onChange={(checked) => updateConfig('seo', 'enableJsonLd', checked)}
                            description="JSON-LD结构化数据"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="默认分享图片"
                            value={localConfig.seo.defaultImage || ''}
                            onChange={(value) => updateConfig('seo', 'defaultImage', value)}
                            placeholder="/og-image.png"
                            description="Open Graph默认图片"
                        />
                        <InputField
                            label="Twitter账号"
                            value={localConfig.seo.twitterHandle || ''}
                            onChange={(value) => updateConfig('seo', 'twitterHandle', value)}
                            placeholder="@username"
                            description="Twitter Card作者信息"
                        />
                    </div>
                </ConfigSection>
            </div>
        </div>
    )
}