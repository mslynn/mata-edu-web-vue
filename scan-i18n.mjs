import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = '.';
const SCAN_DIRS = ['app/pages', 'app/components', 'app/layouts'];
const EXTENSIONS = ['.vue'];

// 匹配模板中的中文字符（排除注释、$t()、v-bind 表达式内等）
const CHINESE_RE = /[\u4e00-\u9fff]/;

function walkDir(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === '.nuxt' || entry === '.output') continue;
      results.push(...walkDir(full));
    } else if (EXTENSIONS.some(ext => full.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

function scanFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let inTemplate = false;
  let inScript = false;
  let inStyle = false;
  const hits = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 跟踪 SFC 区块
    if (trimmed.startsWith('<template')) { inTemplate = true; inScript = false; inStyle = false; continue; }
    if (trimmed.startsWith('<script')) { inTemplate = false; inScript = true; inStyle = false; continue; }
    if (trimmed.startsWith('<style')) { inTemplate = false; inScript = false; inStyle = true; continue; }
    if (trimmed === '</template>') { inTemplate = false; continue; }
    if (trimmed === '</script>') { inScript = false; continue; }

    // 只检查 template 区域
    if (!inTemplate) continue;
    // 跳过 HTML 注释
    if (trimmed.startsWith('<!--')) continue;

    // 检查是否有中文
    if (!CHINESE_RE.test(line)) continue;

    // 排除已经在 $t() / t() 里的
    // 简单策略：移除所有 $t('...') / $t("...") / t('...') / t("...") 后还有中文则报
    const cleaned = line
      .replace(/\$?t\(\s*['"][^'"]*['"]\s*\)/g, '')   // 移除 $t('key')
      .replace(/\$?t\(\s*['"][^'"]*['"]\s*,\s*\{[^}]*\}\s*\)/g, '') // 移除 $t('key', {params})
      .replace(/<!--[\s\S]*?-->/g, '');  // 移除行内注释

    if (CHINESE_RE.test(cleaned)) {
      hits.push({ line: i + 1, text: trimmed.substring(0, 120) });
    }
  }

  return hits;
}

// 主流程
let totalFiles = 0;
let totalHits = 0;
const fileResults = [];

for (const dir of SCAN_DIRS) {
  let files;
  try { files = walkDir(join(ROOT, dir)); } catch { continue; }
  
  for (const f of files) {
    totalFiles++;
    const hits = scanFile(f);
    if (hits.length > 0) {
      totalHits += hits.length;
      fileResults.push({ file: relative(ROOT, f).replace(/\\/g, '/'), hits });
    }
  }
}

// 按命中数降序
fileResults.sort((a, b) => b.hits.length - a.hits.length);

console.log(`扫描完成: ${totalFiles} 个 .vue 文件, ${fileResults.length} 个文件含未翻译中文, 共 ${totalHits} 处\n`);

for (const { file, hits } of fileResults) {
  console.log(`📄 ${file} (${hits.length} 处)`);
  // 最多显示前5个
  const show = hits.slice(0, 5);
  for (const h of show) {
    console.log(`   L${h.line}: ${h.text}`);
  }
  if (hits.length > 5) console.log(`   ... 还有 ${hits.length - 5} 处`);
  console.log('');
}
