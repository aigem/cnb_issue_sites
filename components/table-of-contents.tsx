'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TocItem {
    id: string
    text: string
    level: number
}

interface TableOfContentsProps {
    toc: TocItem[]
    className?: string
}

export function TableOfContents({ toc, className = '' }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>('')
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // 监听滚动事件，高亮当前可见的标题
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id)
                    }
                })
            },
            {
                rootMargin: '-20% 0% -35% 0%',
            }
        )

        // 观察所有标题元素
        toc.forEach(({ id }) => {
            const element = document.getElementById(id)
            if (element) {
                observer.observe(element)
            }
        })

        return () => observer.disconnect()
    }, [toc])

    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            })
        }
    }

    if (toc.length === 0) {
        return null
    }

    return (
        <div className={`sticky top-24 ${className}`}>
            <Card className="w-64">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">目录</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsVisible(!isVisible)}
                            className="md:hidden"
                        >
                            {isVisible ? '隐藏' : '显示'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className={`pt-0 ${isVisible ? 'block' : 'hidden md:block'}`}>
                    <nav className="space-y-1">
                        {toc.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToHeading(item.id)}
                                className={`
                  block w-full text-left text-sm transition-colors
                  ${activeId === item.id
                                        ? 'text-primary font-medium border-l-2 border-primary pl-3' // Active state
                                        : 'text-muted-foreground hover:text-primary pl-3' // Default state, updated hover
                                    }
                  ${item.level === 1 ? 'font-semibold' : ''}
                  ${item.level === 2 ? 'ml-2' : ''}
                  ${item.level === 3 ? 'ml-4' : ''}
                  ${item.level === 4 ? 'ml-6' : ''}
                  ${item.level === 5 ? 'ml-8' : ''}
                  ${item.level === 6 ? 'ml-10' : ''}
                `}
                            >
                                {item.text}
                            </button>
                        ))}
                    </nav>
                </CardContent>
            </Card>
        </div>
    )
}

// 简化版目录组件，用于移动端
export function SimpleToc({ toc }: { toc: TocItem[] }) {
    if (toc.length === 0) return null

    return (
        <details className="mb-6 md:hidden">
            <summary className="cursor-pointer font-semibold text-lg mb-2 list-none">
                <div className="flex items-center">
                    <span>📋 文章目录</span>
                    <svg
                        className="w-4 h-4 ml-2 transition-transform duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </summary>
            <div className="mt-3 pl-4 border-l-2 border-border"> {/* Updated border color */}
                {toc.map((item) => (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`
              block py-1 text-sm text-muted-foreground hover:text-primary transition-colors
              ${item.level === 1 ? 'font-semibold' : ''}
              ${item.level === 2 ? 'ml-2' : ''}
              ${item.level === 3 ? 'ml-4' : ''}
              ${item.level === 4 ? 'ml-6' : ''}
              ${item.level === 5 ? 'ml-8' : ''}
              ${item.level === 6 ? 'ml-10' : ''}
            `}
                    >
                        {item.text}
                    </a>
                ))}
            </div>
        </details>
    )
}