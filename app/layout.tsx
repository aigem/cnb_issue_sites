import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import './globals.css'

export const metadata: Metadata = {
    title: {
        default: 'CNB博客 - 技术分享与思考',
        template: '%s | CNB博客'
    },
    description: '分享技术见解、编程经验和创新思考的中文技术博客',
    keywords: ['技术博客', '编程', '开发', '前端', '后端', 'JavaScript', 'TypeScript', 'React', 'Next.js'],
    authors: [{ name: 'CNB团队' }],
    creator: 'CNB',
    publisher: 'CNB',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.cnb.cool'),
    alternates: {
        canonical: '/',
        languages: {
            'zh-CN': '/zh-CN',
            'en-US': '/en-US',
        },
    },
    openGraph: {
        type: 'website',
        locale: 'zh_CN',
        url: '/',
        title: 'CNB博客 - 技术分享与思考',
        description: '分享技术见解、编程经验和创新思考的中文技术博客',
        siteName: 'CNB博客',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'CNB博客',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CNB博客 - 技术分享与思考',
        description: '分享技术见解、编程经验和创新思考的中文技术博客',
        images: ['/og-image.png'],
        creator: '@cnb_blog',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-verification-code',
        yandex: 'your-yandex-verification-code',
        yahoo: 'your-yahoo-verification-code',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh-CN" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
                <meta name="msapplication-TileColor" content="#da532c" />
                <meta name="theme-color" content="#ffffff" />
                <link rel="alternate" type="application/rss+xml" title="CNB博客 RSS Feed" href="/rss.xml" />
                <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
            </head>
            <body className="font-sans antialiased">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <div className="relative flex min-h-screen flex-col">
                        <Header />
                        <main className="flex-1">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    )
}