'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    getPriorityLabel,
    getPriorityColor,
    getStatusLabel,
    getStatusColor
} from '@/lib/utils'
import type { PostPriority, PostStatus } from '@/types/blog'

interface SearchParams {
    keyword?: string
    priority?: PostPriority
    status?: PostStatus
    author?: string
    sortBy?: 'hotness' | 'priority' | 'created_at' | 'updated_at' | 'comments'
}

const priorities: PostPriority[] = ['urgent', 'high', 'medium', 'low']
const statuses: PostStatus[] = ['draft', 'published', 'archived', 'resolved', 'closed']
const sortOptions = [
    { value: 'hotness', label: '热度' },
    { value: 'priority', label: '优先级' },
    { value: 'created_at', label: '创建时间' },
    { value: 'updated_at', label: '更新时间' },
    { value: 'comments', label: '评论数' }
]

export default function AdvancedSearch({ onSearch, className = '' }: {
    onSearch?: (params: SearchParams) => void
    className?: string
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isExpanded, setIsExpanded] = useState(false)
    const [filters, setFilters] = useState<SearchParams>({})

    useEffect(() => {
        const params: SearchParams = {}
        if (searchParams.get('q')) params.keyword = searchParams.get('q') || ''
        if (searchParams.get('priority')) params.priority = searchParams.get('priority') as PostPriority
        if (searchParams.get('status')) params.status = searchParams.get('status') as PostStatus
        if (searchParams.get('author')) params.author = searchParams.get('author') || ''
        if (searchParams.get('sort')) params.sortBy = searchParams.get('sort') as any
        setFilters(params)
    }, [searchParams])

    const handleSearch = () => {
        const params = new URLSearchParams()
        if (filters.keyword) params.set('q', filters.keyword)
        if (filters.priority) params.set('priority', filters.priority)
        if (filters.status) params.set('status', filters.status)
        if (filters.author) params.set('author', filters.author)
        if (filters.sortBy) params.set('sort', filters.sortBy)

        const newUrl = params.toString() ? `/posts?${params.toString()}` : '/posts'
        router.push(newUrl)
        if (onSearch) onSearch(filters)
    }

    const handleReset = () => {
        setFilters({})
        router.push('/posts')
        if (onSearch) onSearch({})
    }

    const updateFilter = (key: keyof SearchParams, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    return (
        <Card className={`p-6 ${className}`}>
            <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="搜索文章标题、内容..."
                            value={filters.keyword || ''}
                            onChange={(e) => updateFilter('keyword', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <select
                        value={filters.sortBy || 'updated_at'}
                        onChange={(e) => updateFilter('sortBy', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <Button onClick={handleSearch} className="px-6">
                        搜索
                    </Button>
                </div>

                <div className="flex justify-between items-center">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        {isExpanded ? '收起高级搜索' : '展开高级搜索'}
                    </button>
                    {Object.keys(filters).length > 0 && (
                        <button
                            onClick={handleReset}
                            className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            清除所有筛选
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                优先级
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {priorities.map(priority => (
                                    <button
                                        key={priority}
                                        onClick={() => updateFilter('priority',
                                            filters.priority === priority ? undefined : priority
                                        )}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filters.priority === priority
                                                ? getPriorityColor(priority)
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {getPriorityLabel(priority)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                状态
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {statuses.map(status => (
                                    <button
                                        key={status}
                                        onClick={() => updateFilter('status',
                                            filters.status === status ? undefined : status
                                        )}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filters.status === status
                                                ? getStatusColor(status)
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {getStatusLabel(status)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            作者
                        </label>
                        <input
                            type="text"
                            placeholder="输入作者用户名"
                            value={filters.author || ''}
                            onChange={(e) => updateFilter('author', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                </div>
            )}
        </Card>
    )
}