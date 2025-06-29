'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { getActiveAuthors, getAllAuthors } from '@/lib/api'
import type { UserInfo } from '@/types/blog'

interface CollaboratorManagerProps {
    postId?: number
    currentCollaborators?: UserInfo[]
    onCollaboratorsChange?: (collaborators: UserInfo[]) => void
    className?: string
}

export default function CollaboratorManager({
    postId,
    currentCollaborators = [],
    onCollaboratorsChange,
    className = ''
}: CollaboratorManagerProps) {
    const [allAuthors, setAllAuthors] = useState<UserInfo[]>([])
    const [selectedCollaborators, setSelectedCollaborators] = useState<UserInfo[]>(currentCollaborators)
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                setLoading(true)
                const authors = await getAllAuthors()
                setAllAuthors(authors)
            } catch (err) {
                console.error('获取作者列表失败:', err)
                setError('获取作者列表失败')
            } finally {
                setLoading(false)
            }
        }

        fetchAuthors()
    }, [])

    useEffect(() => {
        setSelectedCollaborators(currentCollaborators)
    }, [currentCollaborators])

    const filteredAuthors = allAuthors.filter(author =>
        author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        author.username.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const isSelected = (author: UserInfo) => {
        return selectedCollaborators.some(c => c.id === author.id)
    }

    const toggleCollaborator = (author: UserInfo) => {
        const newCollaborators = isSelected(author)
            ? selectedCollaborators.filter(c => c.id !== author.id)
            : [...selectedCollaborators, author]

        setSelectedCollaborators(newCollaborators)
        if (onCollaboratorsChange) {
            onCollaboratorsChange(newCollaborators)
        }
    }

    const removeCollaborator = (authorId: number) => {
        const newCollaborators = selectedCollaborators.filter(c => c.id !== authorId)
        setSelectedCollaborators(newCollaborators)
        if (onCollaboratorsChange) {
            onCollaboratorsChange(newCollaborators)
        }
    }

    if (loading) {
        return (
            <Card className={`p-6 ${className}`}>
                <div className="flex justify-center">
                    <LoadingSpinner />
                </div>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className={`p-6 ${className}`}>
                <div className="text-center text-red-600 dark:text-red-400">
                    {error}
                </div>
            </Card>
        )
    }

    return (
        <Card className={`p-6 ${className}`}>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">协作者管理</h3>
                    <span className="text-sm text-gray-500">
                        已选择 {selectedCollaborators.length} 位协作者
                    </span>
                </div>

                {/* 已选择的协作者 */}
                {selectedCollaborators.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            当前协作者
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedCollaborators.map(collaborator => (
                                <div
                                    key={collaborator.id}
                                    className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm dark:bg-blue-900 dark:text-blue-200"
                                >
                                    <img
                                        src={collaborator.avatar_url || '/default-avatar.png'}
                                        alt={collaborator.name}
                                        className="w-5 h-5 rounded-full"
                                    />
                                    <span>{collaborator.name}</span>
                                    <button
                                        onClick={() => removeCollaborator(collaborator.id)}
                                        className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 搜索框 */}
                <div>
                    <input
                        type="text"
                        placeholder="搜索作者..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                </div>

                {/* 作者列表 */}
                <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredAuthors.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">
                            {searchTerm ? '未找到匹配的作者' : '暂无作者'}
                        </div>
                    ) : (
                        filteredAuthors.map(author => (
                            <div
                                key={author.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected(author)
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                                    }`}
                                onClick={() => toggleCollaborator(author)}
                            >
                                <img
                                    src={author.avatar_url || '/default-avatar.png'}
                                    alt={author.name}
                                    className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-sm">
                                        {author.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        @{author.username}
                                    </div>
                                </div>
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isSelected(author)
                                        ? 'border-blue-500 bg-blue-500'
                                        : 'border-gray-300 dark:border-gray-600'
                                    }`}>
                                    {isSelected(author) && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSelectedCollaborators([])
                            if (onCollaboratorsChange) {
                                onCollaboratorsChange([])
                            }
                        }}
                        disabled={selectedCollaborators.length === 0}
                    >
                        清除所有
                    </Button>
                    <div className="text-sm text-gray-500">
                        从 {allAuthors.length} 位作者中选择
                    </div>
                </div>
            </div>
        </Card>
    )
}