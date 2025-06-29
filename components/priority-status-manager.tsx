'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    getPriorityLabel,
    getPriorityColor,
    getStatusLabel,
    getStatusColor
} from '@/lib/utils'
import type { PostPriority, PostStatus } from '@/types/blog'

interface PriorityStatusManagerProps {
    currentPriority?: PostPriority
    currentStatus?: PostStatus
    onPriorityChange?: (priority: PostPriority) => void
    onStatusChange?: (status: PostStatus) => void
    className?: string
    readOnly?: boolean
}

const priorities: PostPriority[] = ['urgent', 'high', 'medium', 'low', 'p0', 'p1', 'p2', 'p3']
const statuses: PostStatus[] = ['draft', 'published', 'archived', 'resolved', 'closed']

const priorityDescriptions = {
    urgent: '紧急 - 需要立即处理',
    high: '高优先级 - 重要且紧急',
    medium: '中等优先级 - 正常处理',
    low: '低优先级 - 可延后处理',
    p0: 'P0 - 最高优先级',
    p1: 'P1 - 高优先级',
    p2: 'P2 - 中等优先级',
    p3: 'P3 - 低优先级'
}

const statusDescriptions = {
    draft: '草稿 - 正在编写中',
    published: '已发布 - 公开可见',
    archived: '已归档 - 不再活跃',
    resolved: '已解决 - 问题已处理',
    closed: '已关闭 - 已完成或取消'
}

export default function PriorityStatusManager({
    currentPriority = 'medium',
    currentStatus = 'published',
    onPriorityChange,
    onStatusChange,
    className = '',
    readOnly = false
}: PriorityStatusManagerProps) {
    const [selectedPriority, setSelectedPriority] = useState<PostPriority>(currentPriority)
    const [selectedStatus, setSelectedStatus] = useState<PostStatus>(currentStatus)

    const handlePriorityChange = (priority: PostPriority) => {
        if (readOnly) return
        setSelectedPriority(priority)
        if (onPriorityChange) {
            onPriorityChange(priority)
        }
    }

    const handleStatusChange = (status: PostStatus) => {
        if (readOnly) return
        setSelectedStatus(status)
        if (onStatusChange) {
            onStatusChange(status)
        }
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* 优先级管理 */}
            <Card className="p-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">优先级设置</h3>
                        {readOnly && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded dark:bg-gray-800">
                                只读模式
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {priorities.map(priority => (
                            <button
                                key={priority}
                                onClick={() => handlePriorityChange(priority)}
                                disabled={readOnly}
                                className={`p-3 rounded-lg border-2 transition-all text-left ${selectedPriority === priority
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                                    } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getPriorityColor(priority)}`}>
                                    {getPriorityLabel(priority)}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {priorityDescriptions[priority]}
                                </div>
                            </button>
                        ))}
                    </div>

                    {!readOnly && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            当前选择: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedPriority)}`}>
                                {getPriorityLabel(selectedPriority)}
                            </span>
                        </div>
                    )}
                </div>
            </Card>

            {/* 状态管理 */}
            <Card className="p-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">状态设置</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {statuses.map(status => (
                            <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                disabled={readOnly}
                                className={`p-3 rounded-lg border-2 transition-all text-left ${selectedStatus === status
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                                    } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getStatusColor(status)}`}>
                                    {getStatusLabel(status)}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {statusDescriptions[status]}
                                </div>
                            </button>
                        ))}
                    </div>

                    {!readOnly && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            当前状态: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedStatus)}`}>
                                {getStatusLabel(selectedStatus)}
                            </span>
                        </div>
                    )}
                </div>
            </Card>

            {/* 操作按钮 */}
            {!readOnly && (
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => {
                            handlePriorityChange('medium')
                            handleStatusChange('published')
                        }}
                    >
                        重置为默认
                    </Button>
                    <Button
                        onClick={() => {
                            // 这里可以添加保存逻辑
                            console.log('保存设置:', { priority: selectedPriority, status: selectedStatus })
                        }}
                    >
                        保存设置
                    </Button>
                </div>
            )}

            {/* 设置摘要 */}
            <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="text-sm">
                    <div className="font-medium mb-2">当前设置摘要:</div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400">优先级:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedPriority)}`}>
                                {getPriorityLabel(selectedPriority)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400">状态:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedStatus)}`}>
                                {getStatusLabel(selectedStatus)}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}