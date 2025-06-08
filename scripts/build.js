#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建CNB静态博客...\n');

// 加载环境变量
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const envContent = fs.readFileSync(filePath, 'utf8');
    const lines = envContent.split('\n');

    lines.forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          // 移除引号
          const cleanValue = value.replace(/^["']|["']$/g, '');
          // 只在环境变量不存在时才设置（优先使用系统环境变量）
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = cleanValue;
          }
        }
      }
    });
    console.log(`✅ 已加载环境变量文件: ${filePath}`);
  }
}

// 设置环境变量（优先使用系统环境变量）
function setupEnvironmentVariables() {
  // 设置BASE_URL
  if (!process.env.BASE_URL) {
    process.env.BASE_URL = 'https://api.cnb.cool';
  }

  // 从CNB_REPO_SLUG_LOWERCASE获取REPO值
  if (process.env.CNB_REPO_SLUG_LOWERCASE && !process.env.REPO) {
    process.env.REPO = process.env.CNB_REPO_SLUG_LOWERCASE;
  }

  // 从CNB_TOKEN获取AUTH_TOKEN值
  if (process.env.CNB_TOKEN && !process.env.AUTH_TOKEN) {
    process.env.AUTH_TOKEN = process.env.CNB_TOKEN;
  }

  // 设置其他默认值
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://blog.kuai.host';
  }

  if (!process.env.NEXT_PUBLIC_SITE_NAME) {
    process.env.NEXT_PUBLIC_SITE_NAME = 'CNB博客';
  }

  if (!process.env.NEXT_PUBLIC_SITE_DESCRIPTION) {
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION = '分享技术见解、编程经验和创新思考的中文技术博客';
  }

  if (!process.env.NEXT_PUBLIC_POSTS_PER_PAGE) {
    process.env.NEXT_PUBLIC_POSTS_PER_PAGE = '12';
  }

  if (!process.env.NEXT_PUBLIC_FEATURED_POSTS_COUNT) {
    process.env.NEXT_PUBLIC_FEATURED_POSTS_COUNT = '6';
  }
}

// 首先设置环境变量
setupEnvironmentVariables();

// 然后加载 .env.local 文件（如果存在，但不会覆盖已有的环境变量）
loadEnvFile('.env.local');

console.log('🔧 环境变量配置:');
console.log(`   BASE_URL: ${process.env.BASE_URL}`);
console.log(`   REPO: ${process.env.REPO}`);
console.log(`   AUTH_TOKEN: ${process.env.AUTH_TOKEN ? '***已设置***' : '未设置'}`);
console.log(`   CNB_REPO_SLUG_LOWERCASE: ${process.env.CNB_REPO_SLUG_LOWERCASE || '未设置'}`);
console.log(`   CNB_TOKEN: ${process.env.CNB_TOKEN ? '***已设置***' : '未设置'}`);
console.log(`   NEXT_PUBLIC_SITE_URL: ${process.env.NEXT_PUBLIC_SITE_URL}\n`);

// 验证必需的环境变量
const requiredEnvVars = ['BASE_URL', 'REPO', 'AUTH_TOKEN'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ 缺少必需的环境变量:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n请设置以下环境变量：');
  console.error('   - CNB_REPO_SLUG_LOWERCASE (用于REPO)');
  console.error('   - CNB_TOKEN (用于AUTH_TOKEN)');
  console.error('\n或者创建 .env.local 文件包含这些变量');
  process.exit(1);
}

try {
  // 清理之前的构建
  console.log('🧹 清理之前的构建文件...');

  // 跨平台删除目录
  function removeDir(dirPath) {
    if (fs.existsSync(dirPath)) {
      try {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`   ✅ 已删除: ${dirPath}`);
      } catch (error) {
        console.log(`   ⚠️  删除失败: ${dirPath} - ${error.message}`);
      }
    }
  }

  removeDir('out');
  removeDir('.next');

  // 安装依赖
  console.log('📦 检查依赖...');
  if (!fs.existsSync('node_modules')) {
    console.log('📦 安装依赖...');
    execSync('pnpm install --frozen-lockfile', { stdio: 'inherit' });
  }

  // 构建项目
  console.log('🔨 构建Next.js项目...');
  execSync('pnpm build', { stdio: 'inherit' });

  // 注意：Next.js 15 的 output: 'export' 会自动导出，不需要单独的 export 命令
  console.log('✅ 静态文件已自动导出到 out 目录');

  // 生成额外的静态文件
  console.log('📄 生成额外的静态文件...');

  // 生成sitemap.xml
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.cnb.cool';
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/posts</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}/categories</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${siteUrl}/tags</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${siteUrl}/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

  fs.writeFileSync('out/sitemap.xml', sitemap);

  // 生成RSS feed
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CNB博客 - 技术分享与思考</title>
    <description>分享技术见解、编程经验和创新思考的中文技术博客</description>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>CNB静态博客系统</generator>
  </channel>
</rss>`;

  fs.writeFileSync('out/rss.xml', rss);

  // 复制robots.txt（如果不存在）
  if (!fs.existsSync('out/robots.txt')) {
    const robotsTxt = `User-agent: *
Allow: /

Disallow: /api/
Disallow: /_next/
Disallow: /admin/

Sitemap: ${siteUrl}/sitemap.xml

Crawl-delay: 1`;
    fs.writeFileSync('out/robots.txt', robotsTxt);
  }

  // 检查构建结果
  console.log('✅ 检查构建结果...');
  const outDir = 'out';
  const stats = fs.statSync(outDir);

  if (stats.isDirectory()) {
    const files = fs.readdirSync(outDir);
    console.log(`📊 构建完成！生成了 ${files.length} 个文件/目录`);

    // 显示主要文件
    const mainFiles = files.filter(file =>
      file.endsWith('.html') ||
      file.endsWith('.xml') ||
      file.endsWith('.txt') ||
      file === '_next'
    );

    console.log('📁 主要文件:');
    mainFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
  }

  console.log('\n🎉 构建成功完成！');
  console.log(`📂 静态文件位于: ${path.resolve(outDir)}`);
  console.log('🚀 现在可以部署到任何静态托管服务了！');

} catch (error) {
  console.error('\n❌ 构建失败:', error.message);
  process.exit(1);
}
