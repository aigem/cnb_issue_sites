"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Newsletter() {
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setIsSubmitting(true)

        // 模拟订阅请求
        await new Promise(resolve => setTimeout(resolve, 1000))

        setIsSubscribed(true)
        setIsSubmitting(false)
        setEmail("")
    }

    if (isSubscribed) {
        return (
            <div className="text-center max-w-2xl mx-auto">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-green-600 dark:text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">订阅成功！</h3>
                    <p className="text-muted-foreground">
                        感谢您的订阅！我们会定期向您发送最新的技术文章和见解。
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="text-center max-w-2xl mx-auto">
            <div className="mb-8">
                <h3 className="text-3xl font-bold mb-4">订阅我们的博客</h3>
                <p className="text-lg text-muted-foreground">
                    获取最新的技术文章、编程技巧和行业见解，直接发送到您的邮箱。
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div className="flex-1">
                    <input
                        type="email"
                        placeholder="输入您的邮箱地址"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                        required
                    />
                </div>
                <Button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="px-8 py-3 whitespace-nowrap"
                >
                    {isSubmitting ? (
                        <>
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            订阅中...
                        </>
                    ) : (
                        "立即订阅"
                    )}
                </Button>
            </form>

            <div className="mt-6 text-sm text-muted-foreground">
                <p>
                    我们承诺不会向第三方分享您的邮箱地址，您可以随时取消订阅。
                </p>
            </div>

            {/* 订阅统计 */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div>
                    <div className="text-2xl font-bold text-primary">1000+</div>
                    <div className="text-sm text-muted-foreground">订阅者</div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-primary">每周</div>
                    <div className="text-sm text-muted-foreground">更新频率</div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-muted-foreground">垃圾邮件</div>
                </div>
            </div>
        </div>
    )
}