import { Metadata } from 'next'
import ConfigManager from '@/components/config-manager'

export const metadata: Metadata = {
    title: '配置管理 - CNB博客',
    description: '管理博客系统配置',
}

export default function ConfigPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto py-8">
                <ConfigManager />
            </div>
        </div>
    )
}