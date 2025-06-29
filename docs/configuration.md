# CNB博客配置系统使用指南

## 概述

CNB博客系统提供了灵活而强大的配置管理功能，支持多种配置方式和实时配置更新。配置系统采用分层设计，按优先级从低到高依次为：

1. **默认配置** - 系统内置的基础配置
2. **配置文件** - `blog.config.json` 文件中的配置
3. **环境变量** - 以 `NEXT_PUBLIC_` 开头的环境变量

## 配置方式

### 1. 环境变量配置

在 `.env.local` 文件中设置环境变量：

```env
# 站点基本信息
NEXT_PUBLIC_SITE_TITLE=我的技术博客
NEXT_PUBLIC_SITE_DESCRIPTION=分享编程技术和开发经验
NEXT_PUBLIC_SITE_URL=https://blog.example.com
NEXT_PUBLIC_SITE_AUTHOR=张三

# API配置
BASE_URL=https://api.cnb.cool
REPO=username/blog-repo
AUTH_TOKEN=your_auth_token_here

# 内容配置
NEXT_PUBLIC_POSTS_PER_PAGE=12
NEXT_PUBLIC_EXCERPT_LENGTH=200

# 主题配置
NEXT_PUBLIC_PRIMARY_COLOR=#2563eb
NEXT_PUBLIC_DARK_MODE=auto
```

### 2. JSON配置文件

创建 `blog.config.json` 文件：

```json
{
  "site": {
    "title": "CNB技术博客",
    "description": "分享前沿技术，探索创新思维",
    "url": "https://blog.cnb.cool",
    "author": "CNB团队",
    "email": "contact@cnb.cool",
    "logo": "/logo.png",
    "favicon": "/favicon.ico"
  },
  "content": {
    "postsPerPage": 12,
    "excerptLength": 180,
    "showReadingTime": true,
    "showAuthor": true,
    "showDate": true,
    "showTags": true,
    "enableComments": true,
    "enableSearch": true
  },
  "markdown": {
    "enableCodeHighlight": true,
    "enableMath": true,
    "enableToc": true,
    "enableTaskList": true,
    "codeTheme": "default",
    "mathRenderer": "katex"
  },
  "theme": {
    "primaryColor": "#2563eb",
    "darkMode": "auto",
    "fontFamily": "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    "fontSize": "base",
    "layout": "default"
  },
  "features": {
    "newsletter": true,
    "analytics": false,
    "pwa": true,
    "rss": true,
    "socialShare": true
  },
  "seo": {
    "enableSitemap": true,
    "enableRobots": true,
    "enableJsonLd": true,
    "defaultImage": "/og-image.png",
    "twitterHandle": "@cnb_cool"
  }
}
```

### 3. 可视化配置界面

访问 `/admin/config` 路径，使用Web界面管理配置：

- **实时编辑**: 在界面中直接修改配置项
- **即时预览**: 配置更改立即生效
- **分类管理**: 按功能模块组织配置
- **一键保存**: 批量保存所有更改
- **配置重置**: 快速恢复到默认设置

## 配置项详解

### 站点信息 (site)

| 配置项 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| title | string | ✓ | 站点标题 |
| description | string | ✓ | 站点描述 |
| url | string | ✓ | 站点URL |
| author | string | ✓ | 作者名称 |
| email | string | ✗ | 联系邮箱 |
| logo | string | ✗ | 站点Logo路径 |
| favicon | string | ✗ | 网站图标路径 |

### API配置 (api)

| 配置项 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| baseUrl | string | ✓ | API基础URL |
| repo | string | ✓ | 仓库名称 |
| authToken | string | ✗ | 认证令牌 |
| timeout | number | ✗ | 请求超时时间(毫秒) |
| retries | number | ✗ | 重试次数 |

### 内容设置 (content)

| 配置项 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| postsPerPage | number | ✓ | 每页文章数量 |
| excerptLength | number | ✓ | 摘要长度 |
| showReadingTime | boolean | ✓ | 显示阅读时间 |
| showAuthor | boolean | ✓ | 显示作者信息 |
| showDate | boolean | ✓ | 显示发布日期 |
| showTags | boolean | ✓ | 显示标签 |
| enableComments | boolean | ✓ | 启用评论 |
| enableSearch | boolean | ✓ | 启用搜索 |

### Markdown渲染 (markdown)

| 配置项 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| enableCodeHighlight | boolean | ✓ | 启用代码高亮 |
| enableMath | boolean | ✓ | 启用数学公式 |
| enableToc | boolean | ✓ | 启用目录导航 |
| enableTaskList | boolean | ✓ | 启用任务列表 |
| codeTheme | string | ✓ | 代码主题 |
| mathRenderer | string | ✓ | 数学渲染器 |

### 主题外观 (theme)

| 配置项 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| primaryColor | string | ✓ | 主色调 |
| darkMode | string | ✓ | 深色模式设置 |
| fontFamily | string | ✓ | 字体族 |
| fontSize | string | ✓ | 字体大小 |
| layout | string | ✓ | 布局样式 |

### 功能开关 (features)

| 配置项 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| newsletter | boolean | ✓ | 邮件订阅 |
| analytics | boolean | ✓ | 数据分析 |
| pwa | boolean | ✓ | PWA支持 |
| rss | boolean | ✓ | RSS订阅 |
| socialShare | boolean | ✓ | 社交分享 |

### SEO设置 (seo)

| 配置项 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| enableSitemap | boolean | ✓ | 生成站点地图 |
| enableRobots | boolean | ✓ | 生成robots.txt |
| enableJsonLd | boolean | ✓ | 结构化数据 |
| defaultImage | string | ✗ | 默认分享图片 |
| twitterHandle | string | ✗ | Twitter账号 |

## 在代码中使用配置

### 服务端使用

```typescript
import { getConfig, getSiteConfig, getApiConfig } from '@/lib/config'

// 获取完整配置
const config = await getConfig()

// 获取特定配置部分
const siteConfig = await getSiteConfig()
const apiConfig = await getApiConfig()
```

### 客户端使用

```typescript
import { useConfig, useSiteConfig, useThemeConfig } from '@/hooks/use-config'

function MyComponent() {
  const { config, loading, error } = useConfig()
  const { siteConfig } = useSiteConfig()
  const { themeConfig } = useThemeConfig()
  
  if (loading) return <div>加载中...</div>
  if (error) return <div>加载失败</div>
  
  return (
    <div>
      <h1>{siteConfig?.title}</h1>
      <p style={{ color: themeConfig?.primaryColor }}>
        {siteConfig?.description}
      </p>
    </div>
  )
}
```

## 配置验证

系统会自动验证配置的有效性：

- **必需字段检查**: 确保必需的配置项不为空
- **数据类型验证**: 验证配置项的数据类型
- **数值范围检查**: 验证数值配置的合理范围
- **URL格式验证**: 验证URL配置的格式正确性

如果配置验证失败，系统会在控制台输出详细的错误信息。

## 最佳实践

### 1. 环境分离

为不同环境使用不同的配置：

```bash
# 开发环境 (.env.local)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 生产环境 (.env.production)
NEXT_PUBLIC_SITE_URL=https://blog.example.com
```

### 2. 敏感信息保护

将敏感信息（如API密钥）放在环境变量中，不要提交到代码仓库：

```env
# 不要提交到Git
AUTH_TOKEN=your_secret_token_here
```

### 3. 配置文档化

为自定义配置项添加注释和文档：

```json
{
  "content": {
    "postsPerPage": 12,  // 建议值：8-20
    "excerptLength": 180  // 建议值：150-300
  }
}
```

### 4. 渐进式配置

从基础配置开始，逐步添加高级功能：

1. 首先配置站点基本信息
2. 然后配置内容显示选项
3. 最后配置高级功能和SEO

## 故障排除

### 配置不生效

1. 检查配置文件语法是否正确
2. 确认环境变量名称拼写正确
3. 重启开发服务器
4. 清除浏览器缓存

### 配置验证失败

1. 查看控制台错误信息
2. 检查必需字段是否填写
3. 验证数据类型是否正确
4. 确认数值范围是否合理

### 配置界面无法访问

1. 确认路由 `/admin/config` 存在
2. 检查权限设置
3. 验证组件导入是否正确

## 更新日志

### v2.0.0 (第二阶段)
- ✅ 新增统一配置管理系统
- ✅ 支持多层配置覆盖
- ✅ 添加可视化配置界面
- ✅ 实现配置验证和类型安全
- ✅ 提供React Hooks支持
- ✅ 支持静态导出模式
- ✅ 开发/生产环境配置分离

### 静态导出模式说明

由于项目使用 Next.js 静态导出功能，配置管理在不同环境下有不同的行为：

**开发环境** (`npm run dev`):
- 支持通过配置界面实时编辑
- 配置更改立即生效
- 支持API端点动态更新

**生产环境** (静态导出):
- 配置在构建时确定
- 配置界面仅用于查看
- 更新配置需要修改文件并重新构建
- 确保最佳性能和CDN兼容性