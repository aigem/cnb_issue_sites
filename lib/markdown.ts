import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-scss'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-docker'
import 'prismjs/components/prism-markdown'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { getMarkdownConfig } from '@/lib/config'

// 配置 marked 的高亮插件
marked.use(markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
        try {
            if (lang && Prism.languages[lang]) {
                return Prism.highlight(code, Prism.languages[lang], lang)
            }
            return code
        } catch (err) {
            console.warn('代码高亮失败:', err)
            return code
        }
    }
}))

// 自定义渲染器
const renderer = new marked.Renderer()

// 增强链接渲染 - 外部链接添加 target="_blank"
renderer.link = function (href, title, text) {
    const isExternal = href && (href.startsWith('http') || href.startsWith('//'))
    const titleAttr = title ? ` title="${title}"` : ''
    const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''

    return `<a href="${href}"${titleAttr}${targetAttr}>${text}</a>`
}

// 增强图片渲染 - 添加懒加载和响应式
renderer.image = function (href, title, text) {
    const titleAttr = title ? ` title="${title}"` : ''
    const altAttr = text ? ` alt="${text}"` : ''

    return `<img src="${href}"${altAttr}${titleAttr} loading="lazy" class="max-w-full h-auto rounded-lg shadow-md mx-auto block my-6" />` // Added mx-auto, block, shadow-md, and my-6 for margin
}

// 增强表格渲染 - 添加样式类
renderer.table = function (header, body) {
    // Rely on global .prose table styles for borders, padding, and th background
    return `
    <div class="overflow-x-auto my-6">
      <table class="min-w-full">
        <thead>${header}</thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `
}

// 增强代码块渲染 - 添加复制按钮和语言标签
renderer.code = function (code, language, escaped) {
    const lang = language || 'text'
    const highlightedCode = language && Prism.languages[language]
        ? Prism.highlight(code, Prism.languages[language], language)
        : code

    return `
    <div class="code-block-wrapper relative my-6 rounded-lg border border-border"> {/* Added border and rounded to wrapper */}
      <div class="flex items-center justify-between bg-muted px-4 py-2 border-b border-border"> {/* Changed background and added border */}
        <span class="text-sm font-medium text-muted-foreground">${lang}</span>
        <button 
          class="copy-code-btn text-xs px-2 py-1 rounded-md hover:bg-accent hover:text-accent-foreground" /* Styled like a small ghost button */
          onclick="copyToClipboard(this)"
          data-code="${code.replace(/"/g, '"')}"
        >
          Copy
        </button>
      </div>
      {/* The pre tag itself will be styled by Prism theme / global CSS.
          The bg-muted/50 dark:bg-muted/30 will be for the container if Prism theme is transparent.
          Or, remove bg from pre and let Prism's own background take over fully.
          Let's make <pre> have a subtle background that Prism can paint over.
      */}
      <pre class="bg-muted/20 dark:bg-muted/10 p-4 rounded-b-lg overflow-x-auto"><code class="language-${lang}">${highlightedCode}</code></pre>
    </div>
  `
}

// 增强引用渲染 - 添加样式
renderer.blockquote = function (quote) {
    return `
    <blockquote class="border-l-4 border-accent pl-4 py-3 my-6 bg-muted dark:bg-muted/50 italic text-muted-foreground">
      ${quote}
    </blockquote>
  `
}

// 数学公式渲染函数
function renderMath(text: string): string {
    // 处理行内数学公式 $...$
    text = text.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
        try {
            return katex.renderToString(formula, {
                throwOnError: false,
                displayMode: false
            })
        } catch (err) {
            console.warn('行内数学公式渲染失败:', err)
            return match
        }
    })

    // 处理块级数学公式 $$...$$
    text = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
        try {
            return `<div class="math-block my-6 text-center">${katex.renderToString(formula, {
                throwOnError: false,
                displayMode: true
            })}</div>`
        } catch (err) {
            console.warn('块级数学公式渲染失败:', err)
            return match
        }
    })

    return text
}

// 任务列表渲染
function renderTaskLists(html: string): string {
    // 将 GitHub 风格的任务列表转换为带样式的复选框
    return html
        .replace(/<li>\s*\[ \]\s*/g, '<li class="task-list-item"><input type="checkbox" disabled class="mr-2" />')
        .replace(/<li>\s*\[x\]\s*/gi, '<li class="task-list-item"><input type="checkbox" disabled checked class="mr-2" />')
}

// 添加目录生成功能
interface TocItem {
    id: string
    text: string
    level: number
}

function generateToc(html: string): { html: string; toc: TocItem[] } {
    const toc: TocItem[] = []
    let tocHtml = html

    // 匹配所有标题
    tocHtml = tocHtml.replace(/<h([1-6])>(.*?)<\/h[1-6]>/g, (match, level, text) => {
        const cleanText = text.replace(/<[^>]*>/g, '') // 移除HTML标签
        const id = cleanText
            .toLowerCase()
            .replace(/[^\w\u4e00-\u9fa5\s-]/g, '') // 保留中文、英文、数字、空格、连字符
            .replace(/\s+/g, '-') // 空格替换为连字符
            .replace(/-+/g, '-') // 多个连字符合并为一个
            .replace(/^-|-$/g, '') // 移除开头和结尾的连字符

        toc.push({
            id,
            text: cleanText,
            level: parseInt(level)
        })

        return `<h${level} id="${id}">${text}</h${level}>`
    })

    return { html: tocHtml, toc }
}

// 主要的 Markdown 转 HTML 函数
export function markdownToHtml(markdown: string): string {
    if (!markdown) return ''

    try {
        // 配置 marked 选项
        marked.setOptions({
            renderer,
            gfm: true, // GitHub Flavored Markdown
            breaks: true, // 支持换行
            pedantic: false,
        })

        // 预处理：处理数学公式
        let processedMarkdown = renderMath(markdown)

        // 转换为 HTML
        let html = marked(processedMarkdown) as string

        // 后处理：任务列表
        html = renderTaskLists(html)

        // Adding minimal structural classes, relying on global styles for typography and color
        html = html
            // Paragraphs will use global styles from app/globals.css
            // Lists - keep current specific styling for lists
            .replace(/<ul>/g, '<ul class="list-disc list-inside mb-4 space-y-2">')
            .replace(/<ol>/g, '<ol class="list-decimal list-inside mb-4 space-y-2">')
            .replace(/<li>/g, '<li class="leading-relaxed">')
            // Headings - remove specific text color, size, margin, leading. Rely on global h1-h6 styles.
            // Keep font-bold if desired, but global styles already set font-semibold.
            // For simplicity, just ensure the tags are there. Global styles will apply.
            // .replace(/<h1>/g, '<h1 class="font-bold">') // Example if only bold was needed
            // .replace(/<h2>/g, '<h2 class="font-bold">')
            // .replace(/<h3>/g, '<h3 class="font-bold">')
            // .replace(/<h4>/g, '<h4 class="font-bold">')
            // .replace(/<h5>/g, '<h5 class="font-bold">')
            // .replace(/<h6>/g, '<h6 class="font-bold">')
            // No specific class changes for h1-h6 and p needed here if global styles are comprehensive.
            // The default marked output (e.g. <h1>Title</h1>) will be styled by globals.css.

        return html
    } catch (error) {
        console.error('Markdown 渲染失败:', error)
        return `<p class="text-red-500">Markdown 渲染失败: ${error}</p>`
    }
}

// 配置感知的 Markdown 渲染函数
export async function renderMarkdownWithConfig(markdown: string): Promise<string> {
    if (!markdown) return ''

    try {
        const config = await getMarkdownConfig()

        // 根据配置决定是否处理数学公式
        let processedMarkdown = markdown
        if (config.enableMath && config.mathRenderer === 'katex') {
            processedMarkdown = renderMath(markdown)
        }

        // 配置 marked 选项
        marked.setOptions({
            renderer,
            gfm: true,
            breaks: true,
            pedantic: false,
        })

        // 转换为 HTML
        let html = marked(processedMarkdown) as string

        // 根据配置决定是否处理任务列表
        if (config.enableTaskList) {
            html = renderTaskLists(html)
        }

        // Adding minimal structural classes, relying on global styles for typography and color
        html = html
            // Paragraphs will use global styles from app/globals.css
            // Lists - keep current specific styling for lists
            .replace(/<ul>/g, '<ul class="list-disc list-inside mb-4 space-y-2">')
            .replace(/<ol>/g, '<ol class="list-decimal list-inside mb-4 space-y-2">')
            .replace(/<li>/g, '<li class="leading-relaxed">')
            // Headings - remove specific text color, size, margin, leading. Rely on global h1-h6 styles.
            // No specific class changes for h1-h6 and p needed here if global styles are comprehensive.

        return html
    } catch (error) {
        console.error('配置感知 Markdown 渲染失败:', error)
        return `<p class="text-red-500">Markdown 渲染失败: ${error}</p>`
    }
}

// 配置感知的带目录 HTML 生成
export async function renderMarkdownWithConfigAndToc(markdown: string): Promise<{ html: string; toc: TocItem[] }> {
    const html = await renderMarkdownWithConfig(markdown)
    const config = await getMarkdownConfig()

    if (config.enableToc) {
        return generateToc(html)
    }

    return { html, toc: [] }
}

// 生成带目录的 HTML
export function markdownToHtmlWithToc(markdown: string): { html: string; toc: TocItem[] } {
    const html = markdownToHtml(markdown)
    return generateToc(html)
}

// 提取纯文本（用于搜索和摘要）
export function markdownToText(markdown: string): string {
    if (!markdown) return ''

    try {
        // 简单的 Markdown 转文本
        return markdown
            .replace(/#{1,6}\s+/g, '') // 移除标题标记
            .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
            .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
            .replace(/`(.*?)`/g, '$1') // 移除行内代码标记
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文本
            .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 移除图片
            .replace(/```[\s\S]*?```/g, '') // 移除代码块
            .replace(/\$\$[\s\S]*?\$\$/g, '') // 移除块级数学公式
            .replace(/\$[^$\n]+?\$/g, '') // 移除行内数学公式
            .replace(/\n+/g, ' ') // 将换行符替换为空格
            .replace(/\s+/g, ' ') // 合并多个空格
            .trim()
    } catch (error) {
        console.error('Markdown 转文本失败:', error)
        return ''
    }
}

// 客户端复制代码功能（需要在页面中添加）
export const copyCodeScript = `
<script>
function copyToClipboard(button) {
  const code = button.getAttribute('data-code');
  navigator.clipboard.writeText(code).then(() => {
    const originalText = button.textContent;
    button.textContent = '已复制!';
    button.classList.add('text-green-500');
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('text-green-500');
    }, 2000);
  }).catch(err => {
    console.error('复制失败:', err);
  });
}
</script>
`