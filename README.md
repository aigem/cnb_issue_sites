# CNB静态博客系统

基于CNB Issues API构建的现代化静态博客系统，使用Next.js 15、React 19、TypeScript和Tailwind CSS开发。

## 🚀 项目特性

- **静态生成**: 使用Next.js静态站点生成(SSG)，确保极速加载
- **现代化UI**: 基于Tailwind CSS和shadcn/ui组件库的响应式设计
- **深色模式**: 支持明暗主题自动切换
- **TypeScript**: 完整的类型安全支持
- **SEO优化**: 完整的元数据、sitemap和结构化数据
- **PWA支持**: 包含Web App Manifest
- **API集成**: 与CNB Issues API无缝集成
- **Markdown增强**: 支持代码高亮、数学公式、目录导航
- **客户端搜索**: 使用FlexSearch实现快速的本地内容搜索功能，索引在构建时生成。
- **部署就绪**: 支持Cloudflare Pages、EdgeOne Pages等平台

## 📁 项目结构

```
cnb-static-blog/
├── app/                    # Next.js App Router页面
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   ├── about/             # 关于页面
│   └── posts/             # 文章相关页面
├── components/            # React组件
│   ├── ui/               # 基础UI组件
│   ├── header.tsx        # 头部导航
│   ├── footer.tsx        # 页脚
│   └── ...               # 其他组件
├── lib/                  # 工具库
│   ├── api.ts           # API集成
│   ├── markdown.ts      # Markdown渲染增强
│   └── utils.ts         # 工具函数
├── types/               # TypeScript类型定义
├── public/              # 静态资源
├── .github/workflows/   # GitHub Actions
└── scripts/             # 构建脚本
```

## 🛠️ 技术栈

### 前端框架
- **Next.js 15**: React全栈框架，支持App Router
- **React 19**: 用户界面库
- **TypeScript**: 类型安全的JavaScript

### 样式和UI
- **Tailwind CSS**: 实用优先的CSS框架
- **shadcn/ui**: 高质量的React组件库
- **Radix UI**: 无障碍的UI原语
- **Lucide React**: 现代图标库

### 内容渲染
- **marked**: 高性能Markdown解析器
- **Prism.js**: 代码语法高亮(支持20+语言)
- **KaTeX**: 数学公式渲染
- **marked-highlight**: Markdown代码高亮集成

### 开发工具
- **ESLint**: 代码质量检查
- **PostCSS**: CSS处理工具
- **Autoprefixer**: CSS前缀自动添加

### 部署平台
- **Cloudflare Pages**: 边缘计算静态托管
- **EdgeOne Pages**: 腾讯云边缘托管

## 🚀 快速开始

### 环境要求
- Node.js 18+
- pnpm

### 安装依赖
```bash
pnpm install
```

### 环境配置
环境变量是配置CNB静态博客系统的关键部分。系统采用分层配置策略：
1.  **`lib/config.ts` (默认值)**: 提供所有配置项的基础默认值。
2.  **`blog.config.json` (配置文件)**: 您可以在项目根目录创建此文件以覆盖默认值。此文件应加入版本控制。
3.  **环境变量 (最高优先级)**: 系统环境变量或 `.env.local` 文件中的变量将覆盖所有其他配置。`.env.local` 文件用于本地开发，不应加入版本控制.

**构建必需的环境变量**:
构建过程 (`scripts/build.js`) 会检查以下环境变量是否已设置：
- `REPO`: 您的CNB仓库标识 (例如, `username/repo_slug`)。
- `AUTH_TOKEN`: 您的CNB API访问令牌。

这些变量必须通过系统环境变量或在 `.env.local` 文件中提供。

**示例 `.env.local`**:
```env
# API相关 - 构建过程必需
REPO=your_username/your_repo_slug
AUTH_TOKEN=your_cnb_api_token # 必须设置

# API基础URL (可选, lib/config.ts 有默认值)
# BASE_URL=https://api.cnb.cool

# 站点URL (可选, lib/config.ts 有默认值, 推荐设置以获得准确的元数据)
# NEXT_PUBLIC_SITE_URL=https://your-domain.com

# 其他CNB博客系统可识别的环境变量 (会覆盖 blog.config.json 和默认值)
# NEXT_PUBLIC_SITE_TITLE=我的自定义博客标题
# NEXT_PUBLIC_POSTS_PER_PAGE=5
# VERIFICATION_GOOGLE=YOUR_GOOGLE_CODE
# ... 更多变量请参考 lib/config.ts 和 blog.config.json 的结构
```

**CI/部署特定环境变量**:
`scripts/build.js` 脚本支持通过以下CI/部署特定的环境变量来设置 `REPO` 和 `AUTH_TOKEN`：
- `CNB_REPO_SLUG_LOWERCASE`: 如果设置且 `REPO` 未设置，则 `REPO` 将使用此值。
- `CNB_TOKEN`: 如果设置且 `AUTH_TOKEN` 未设置，则 `AUTH_TOKEN` 将使用此值。
这为在CI环境中注入凭据提供了便利。

**重要**: `AUTH_TOKEN` 和 `REPO` 是运行和构建博客所必需的。确保它们通过上述任一方式正确配置。

### 开发模式
```bash
pnpm run dev
```

### 构建生产版本
```bash
pnpm run build
```

### 生成静态文件
```bash
pnpm run build:static
```
此命令会执行完整的Next.js构建 (`pnpm build`)，然后运行 `scripts/build.js`。该脚本会进一步处理：
1.  **导出文章数据**: 为搜索索引准备文章数据 (生成 `all-posts-for-index.json`)。
2.  **生成搜索索引**: 使用 FlexSearch 根据导出的文章数据创建客户端搜索索引 (文件位于 `public/search/`)。
3.  处理其他静态文件如 `robots.txt`。

### 预览构建结果
```bash
pnpm run preview
```

## 📝 API集成

### CNB Issues API
项目集成了CNB Issues API，将GitHub Issues作为内容管理系统：

- **文章列表**: 获取所有开放的Issues作为博客文章
- **文章详情**: 获取单个Issue的详细内容
- **评论系统**: 支持Issue评论作为文章评论
- **标签系统**: 使用Issue标签进行文章分类
- **搜索功能**: 支持关键词搜索文章

### API函数
```typescript
// 获取所有文章
const posts = await getAllPosts()

// 获取文章详情
const post = await getPostBySlug(slug)

// 搜索文章
const results = await searchIssues(keyword)

// 按标签获取文章
const posts = await getIssuesByLabel(labelName)
```

## 📊 数据统计与局限性

项目中的一些数据统计功能，例如博客总文章数、总评论数、总作者数、总标签数等 (通过 `lib/api.ts` 中的 `getBlogStats` 函数获取)，以及标签列表 (`getAllLabels`) 和作者列表 (`getAllAuthors`)，目前依赖于获取大量的 Issues (例如，最多500条开放和500条关闭的 Issues) 然后在客户端进行聚合统计。

这种方法的局限性包括：

-   **数据可能不完整或不准确**: 如果博客的 Issues 总数、标签种类数或作者数超过了 API 单次（或几次）获取的上限（例如 `getIssues({ page_size: 500 })`），则统计数据可能不完全准确。例如，如果博客有超过1000篇文章，`getBlogStats` 可能无法统计到所有文章。
-   **性能问题**: 获取大量 Issues 数据（即使仅用于统计）可能会比较缓慢，并增加对 CNB Issues API 的请求次数和负载。这可能影响首页加载速度或构建时间。
-   **API 限制**: 高频率或大量的 API 请求可能会触发 API 的速率限制。

**潜在的改进方向或替代方案**:

-   **调整 API 请求参数**: 可以适当增加 `page_size` 参数的值，但这会增加单次请求的负载和响应时间。
-   **预计算脚本**: 对于需要更高准确性和性能的场景，可以考虑创建一个预计算脚本。该脚本可以定期（例如，通过 GitHub Actions）获取所有分页的 Issues 数据，进行精确统计，并将结果保存到一个 JSON 文件中。前端应用则可以直接读取这个预计算的 JSON 文件，从而避免实时聚合的开销和不准确性。
-   **后端聚合**: 如果 CNB Issues API 未来提供直接的统计聚合端点 (例如，直接返回总文章数、各标签文章数等)，则应更新 `lib/api.ts` 中的相关函数以使用这些高效的 API 端点。

目前，首页展示的统计数据应被视为一种估算，其准确性受限于上述因素。

## 🎨 组件系统

### UI组件
- `Button`: 按钮组件，支持多种变体
- `Card`: 卡片容器组件
- `LoadingSpinner`: 加载动画组件

### 业务组件
- `Header`: 导航头部，包含主题切换
- `Footer`: 页脚信息
- `HeroSection`: 首页英雄区域
- `FeaturedPosts`: 精选文章展示
- `LatestPosts`: 最新文章列表
- `Newsletter`: 邮件订阅组件
- `TableOfContents`: 文章目录导航组件

## 🌐 部署指南

### Cloudflare Pages
1. 连接GitHub仓库
2. 设置构建命令: `pnpm run build:static`
3. 设置输出目录: `out`
4. 配置环境变量

### EdgeOne Pages
1. 导入项目
2. 配置构建设置
3. 设置环境变量
4. 部署

## 📊 SEO优化

### 元数据管理
- 动态生成页面标题和描述
- Open Graph标签支持
- Twitter Card支持
- 结构化数据(JSON-LD)

### 性能优化
- 静态生成确保快速加载
- 图片优化和懒加载
- CSS和JavaScript压缩
- CDN加速

## ✨ Markdown渲染增强 (第一阶段更新)

### 代码语法高亮
支持20+编程语言的语法高亮：
- JavaScript/TypeScript
- Python, Java, C++, C#
- HTML, CSS, JSON, YAML
- Shell, SQL, Docker
- 等等...

### 数学公式支持
使用KaTeX渲染数学公式：
```markdown
行内公式：$E = mc^2$
块级公式：
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

### 目录导航
- 自动生成文章目录
- 桌面端侧边栏显示
- 移动端可折叠显示
- 滚动高亮当前章节
- 平滑滚动导航

### 增强功能
- 任务列表支持：`- [x] 已完成任务`
- 表格样式优化
- 代码块复制按钮
- 深色主题适配
- 响应式设计

## 🔧 配置系统 (第二阶段更新)

### 统一配置管理
本项目通过 `lib/config.ts` 实现统一的配置管理，它定义了所有可用的配置项、它们的默认值以及加载和合并逻辑。

- **配置层次与优先级**:
    1.  **默认值**: 在 `lib/config.ts` 中的 `defaultConfig` 对象中定义。
    2.  **`blog.config.json`**: 项目根目录下的JSON文件，用于覆盖默认值。建议将此文件纳入版本控制，以共享团队配置。
    3.  **环境变量**: 从系统环境或 `.env.local` (用于本地开发)加载。环境变量具有最高优先级，会覆盖 `blog.config.json` 和默认值。
- **类型安全**: 所有配置均有TypeScript类型定义 (`BlogConfig` 接口在 `lib/config.ts`)。
- **配置验证**: `lib/config.ts` 在加载配置后会进行验证，确保关键字段存在且格式正确。
- **构建时检查**: `scripts/build.js` 脚本在构建开始前会检查核心环境变量 (`REPO`, `AUTH_TOKEN`) 是否存在。

### `blog.config.json` 示例
```json
{
  "site": {
    "title": "我的CNB技术博客",
    "description": "分享我的技术见解和学习笔记",
    "url": "https://myblog.example.com"
  },
  "content": {
    "postsPerPage": 8
  },
  "seo": {
    "verification": {
      "google": "YOUR_GOOGLE_CODE",
      "yandex": "YOUR_YANDEX_CODE"
    }
  }
  // ... 其他可配置项见 lib/config.ts BlogConfig 接口
}
```
**注意**: 并非所有环境变量都适合放在 `blog.config.json` (例如 `AUTH_TOKEN`)。敏感信息应仅通过环境变量提供。

**SEO站点验证**:
可以通过环境变量 (参见 `.env.local` 示例) 或在 `blog.config.json` 文件中 `seo.verification` 部分配置站点验证码：
```json
// blog.config.json
{
  "seo": {
    // ... 其他SEO配置
    "verification": {
      "google": "YOUR_GOOGLE_CODE",
      "yandex": "YOUR_YANDEX_CODE",
      "yahoo": "YOUR_YAHOO_CODE"
    }
  }
}
```

### 可视化配置界面 (`/admin/config`)
项目提供一个Web界面 (`/admin/config`) 用于查看和修改配置。其行为根据运行环境有所不同：

-   **开发环境 (`NODE_ENV=development`):**
    *   允许直接在UI中修改配置项。
    *   点击 "保存配置" 按钮会将更改写入项目根目录下的 `blog.config.json` 文件。
    *   **重要:** 保存到 `blog.config.json` 的更改需要**重新构建项目** (`pnpm run build` 或 `pnpm run build:static`) 才能在整个站点中生效。这对于静态导出的站点是标准行为，因为配置在构建时被读取和应用。
    *   "重置表单" 按钮会将界面中的配置项恢复到上次从服务器加载的状态（即 `blog.config.json` 当前内容或默认配置，如果文件不存在）。
-   **生产环境 (`NODE_ENV=production`):**
    *   配置界面变为**只读模式**。所有输入框和按钮均被禁用。
    *   此界面仅用于方便地查看构建时应用的最终配置。
    *   如需在生产环境修改配置，必须直接编辑 `blog.config.json` 文件（或通过环境变量覆盖），然后**重新构建并重新部署**您的站点。
-   **数据来源:** 配置界面通过 `/api/config` 端点加载配置数据。此端点本身应用了 `lib/config.ts` 中的分层逻辑（默认配置 < `blog.config.json` < 环境变量），确保显示的是当前生效的配置（不含敏感信息如 `AUTH_TOKEN`）。

### 配置模块
- **站点信息**: 标题、描述、作者、联系方式
- **内容设置**: 分页、摘要、显示选项
- **Markdown渲染**: 代码高亮、数学公式、目录导航
- **主题外观**: 颜色、字体、布局样式
- **功能开关**: PWA、RSS、社交分享等
- **SEO设置**: 站点地图、结构化数据、社交标签、站点验证码

### React Hooks
```typescript
// 使用配置Hook
const { config, loading, error } = useConfig()
const { siteConfig } = useSiteConfig()
const { themeConfig } = useThemeConfig()
```

## 🔧 自定义配置

### 主题定制
修改 `tailwind.config.js` 来自定义主题：
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // 自定义主色调
        }
      }
    }
  }
}
```

### API端点和仓库配置
API相关的核心配置，如 `api.baseUrl`, `api.repo`, 和 `api.authToken`，通过 `lib/config.ts` 及其分层配置机制（默认值, `blog.config.json`, 环境变量）进行管理。

- **`api.baseUrl`**: CNB API的根URL。默认为 `https://api.cnb.cool`。可以通过环境变量 `BASE_URL` 或 `blog.config.json` 中的 `api.baseUrl` 覆盖。
- **`api.repo`**: 您的CNB仓库标识 (例如 `username/repo_slug`)。**此为必需配置**。通过环境变量 `REPO` (或CI中的 `CNB_REPO_SLUG_LOWERCASE`) 或 `blog.config.json` 中的 `api.repo` 设置。
- **`api.authToken`**: 您的CNB API认证令牌。**此为必需配置**。通过环境变量 `AUTH_TOKEN` (或CI中的 `CNB_TOKEN`) 或 `blog.config.json` 中的 `api.authToken` 设置 (尽管不推荐将token直接放在JSON文件中)。

确保 `REPO` 和 `AUTH_TOKEN` 已正确设置，否则应用无法获取数据。

## 📱 PWA支持

项目包含完整的PWA配置：
- Web App Manifest
- 服务工作者(可选)
- 离线支持(可选)

## 🤝 贡献指南

1. Fork项目
2. 创建特性分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持

如果您遇到问题或有建议，请：
1. 查看[Issues](https://github.com/cnb-cool/blog/issues)
2. 创建新的Issue
3. 联系维护者

## 🔗 相关链接

- [Next.js文档](https://nextjs.org/docs)
- [Tailwind CSS文档](https://tailwindcss.com/docs)
- [shadcn/ui文档](https://ui.shadcn.com)
- [CNB API文档](https://api.cnb.cool/docs)

---

**CNB博客** - 让技术分享更简单 🚀