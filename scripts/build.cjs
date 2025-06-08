#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建CNB静态博客...\n');

// Load environment variables from .env.local first
// (This function can be kept if .env.local is still desired for other parts)
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const envContent = fs.readFileSync(filePath, 'utf8');
    const lines = envContent.split('\n');
    lines.forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      }
    });
    console.log(`✅ 已加载环境变量文件: ${filePath}`);
  }
}
loadEnvFile('.env.local');


// Setup CI-specific environment variables (if any)
// (This function can be kept if needed)
function setupCIEnvironmentVariables() {
  if (process.env.CNB_REPO_SLUG_LOWERCASE && !process.env.REPO) {
    process.env.REPO = process.env.CNB_REPO_SLUG_LOWERCASE;
    console.log(`🔧 REPO设置为CNB_REPO_SLUG_LOWERCASE的值: ${process.env.REPO}`);
  }
  if (process.env.CNB_TOKEN && !process.env.AUTH_TOKEN) {
    process.env.AUTH_TOKEN = process.env.CNB_TOKEN;
    console.log('🔧 AUTH_TOKEN设置为CNB_TOKEN的值');
  }
}
setupCIEnvironmentVariables();


// Log and validate critical environment variables
console.log('🔧 应用环境变量摘要 (for build.cjs):');
console.log(`   BASE_URL: ${process.env.BASE_URL || '未设置 (lib/config.ts default will be used by Next.js)'}`);
console.log(`   REPO: ${process.env.REPO || '未设置 (generate-search-index.cjs or Next.js build might fail if live API is hit)'}`);
console.log(`   AUTH_TOKEN: ${process.env.AUTH_TOKEN ? '***已设置***' : '未设置 (generate-search-index.cjs or Next.js build might fail if live API is hit)'}`);
console.log(`   MOCK_API_FOR_BUILD: ${process.env.MOCK_API_FOR_BUILD || '未设置 (generate-search-index.cjs will attempt live API if not set to true)'}`);

// For Next.js build, REPO and AUTH_TOKEN are made available via next.config.js env
// For generate-search-index.cjs, it checks REPO and AUTH_TOKEN itself if not mocking.

try {
    console.log('🧹 Cleaning up previous build output (out/ and .next/)...');
    fs.rmSync(path.join(process.cwd(), 'out'), { recursive: true, force: true });
    fs.rmSync(path.join(process.cwd(), '.next'), { recursive: true, force: true });

    console.log('🧹 Cleaning up public/search directory...');
    const searchDir = path.join(process.cwd(), 'public', 'search');
    if (fs.existsSync(searchDir)) { // Check if dir exists before removing
        fs.rmSync(searchDir, { recursive: true, force: true });
    }
    // No need to clean scripts/dist_cjs as it's no longer used

    // The simple-data-exporter.ts is no longer compiled or run as a separate step.
    // temp-all-posts.json is also not used by this script anymore.

    console.log('🔨 Building Next.js project...');
    // MOCK_API_FOR_BUILD should be passed to Next.js build if its API calls also need mocking
    // This is typically done by setting it in the environment where 'pnpm next build' is run.
    // The 'exportPostsEnv' was for the old script, Next.js build will pick up process.env directly.
    execSync('pnpm next build', { stdio: 'inherit' });
    console.log('✅ Next.js build complete.');

    console.log('🚀 Generating search index (includes data fetching)...');
    // Pass MOCK_API_FOR_BUILD to the script environment
    const indexGenEnv = { ...process.env };
    // If MOCK_API_FOR_BUILD is set for the overall build:static, it will be inherited.
    // If you want to force it for this script: indexGenEnv.MOCK_API_FOR_BUILD = 'true';
    execSync('node scripts/generate-search-index.cjs', { stdio: 'inherit', env: indexGenEnv });
    console.log('✅ Search index generation complete.');

    // Handle other static files like robots.txt
    console.log('\n📄 Finalizing other static files (e.g. robots.txt)...');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.example.com';
    if (siteUrl === 'https://blog.example.com' && process.env.NODE_ENV === 'production') {
        console.warn('⚠️  NEXT_PUBLIC_SITE_URL is not set. The Sitemap URL in robots.txt might be incorrect.');
    }
    if (!fs.existsSync('out/robots.txt') && fs.existsSync('out')) { // Ensure 'out' dir exists
        const robotsTxtContent = `User-agent: *\nAllow: /\n\nDisallow: /api/\nDisallow: /_next/\nDisallow: /admin/\n\nSitemap: ${siteUrl}/sitemap.xml\n\nCrawl-delay: 1`;
        fs.writeFileSync('out/robots.txt', robotsTxtContent);
        console.log('   ✓ robots.txt generated.');
    }


    console.log('✅ Verifying build output...');
    const outDir = 'out';
    if (!fs.existsSync(outDir)) {
      console.error('❌ Build output directory "out" not found!');
      throw new Error('Build output directory "out" not found!');
    }
    // ... (rest of verification logic from before) ...

    console.log('\n🎉 Full build process complete!');
    console.log(`📂 Static files are in: ${path.resolve(outDir)}`);
    console.log('🚀 Ready to deploy!');

} catch (error) {
    console.error('\n❌ Build process failed:');
    if (error.message) console.error("Error Message:", error.message);
    if (error.stdout && error.stdout.toString) console.error("STDOUT:", error.stdout.toString());
    if (error.stderr && error.stderr.toString) console.error("STDERR:", error.stderr.toString());
    process.exit(1);
}
