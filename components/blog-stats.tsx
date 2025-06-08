'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { getBlogStats, getPopularTags, getActiveAuthors } from '@/lib/api'
import { formatNumber, getPriorityLabel, getStatusLabel } from '@/lib/utils'
import type { UserInfo } from '@/types/blog'

interface BlogStatsData {
    totalPosts: number
    totalComments: number
    totalAuthors: number
    totalTags: number
    postsByPriority: Record<string, number>
    postsByStatus: Record<string, number>
    recentActivity: number
}

interface PopularTag {
    name: string
    count: number
    color?: string
}

interface ActiveAuthor {
    author: UserInfo
    postCount: number
}

export default function BlogStats() {
    const [stats, setStats] = useState<BlogStatsData | null>(null)
    const [popularTags, setPopularTags] = useState<PopularTag[]>([])
    const [activeAuthors, setActiveAuthors] = useState<ActiveAuthor[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true)
                const [statsData, tagsData, authorsData] = await Promise.all([
                    getBlogStats(),
                    getPopularTags(10),
                    getActiveAuthors(5)
                ])

                setStats(statsData)
                setPopularTags(tagsData)
                setActiveAuthors(authorsData)
            } catch (err) {
                console.error('获取统计数据失败:', err)
                setError('获取统计数据失败')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
            </div>
        )
    }

    if (error || !stats) {
        return (
            <Card className="p-6">
                <div className="text-center text-red-600 dark:text-red-400">
                    {error || '无法加载统计数据'}
                </div>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* 总体统计 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {formatNumber(stats.totalPosts)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            总文章数
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {formatNumber(stats.totalComments)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            总评论数
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {stats.totalAuthors}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            作者数量
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {stats.recentActivity}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            近7天活跃
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 按优先级分布 */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">按优先级分布</h3>
                    <div className="space-y-3">
                        {Object.entries(stats.postsByPriority).map(([priority, count]) => (
                            <div key={priority} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span className="text-sm">
                                        {getPriorityLabel(priority as any)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{count}</span>
                                    <div className="w-20 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{
                                                width: `${(count / stats.totalPosts) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* 按状态分布 */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">按状态分布</h3>
                    <div className="space-y-3">
                        {Object.entries(stats.postsByStatus).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-sm">
                                        {getStatusLabel(status as any)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{count}</span>
                                    <div className="w-20 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{
                                                width: `${(count / stats.totalPosts) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 热门标签 */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">热门标签</h3>
                    <div className="space-y-2">
                        {popularTags.map((tag, index) => (
                            <div key={tag.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 w-4">
                                        #{index + 1}
                                    </span>
                                    <span
                                        className="px-2 py-1 rounded text-xs"
                                        style={{
                                            backgroundColor: tag.color ? `#${tag.color}20` : '#f3f4f6',
                                            color: tag.color ? `#${tag.color}` : '#374151'
                                        }}
                                    >
                                        {tag.name}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {tag.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* 活跃作者 */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">活跃作者</h3>
                    <div className="space-y-3">
                        {activeAuthors.map((item, index) => (
                            <div key={item.author.username} className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 w-4">
                                    #{index + 1}
                                </span>
                                <img
                                    src={item.author.avatar_url || '/default-avatar.png'}
                                    alt={item.author.name}
                                    className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1">
                                    <div className="text-sm font-medium">
                                        {item.author.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        @{item.author.username}
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    {item.postCount} 篇
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}