/**
 * 提取项目中的中文文本，导出给产品翻译
 * 运行: node scripts/extract-chinese.cjs
 */
const fs = require('fs')
const path = require('path')

// 配置
const config = {
  scanDirs: ['app/pages', 'app/components'],
  extensions: ['.vue', '.ts', '.js'],
  outputFile: 'chinese-texts.csv'
}

// 匹配中文的正则
const chineseRegex = /[\u4e00-\u9fa5]+[^\n<>{}]*[\u4e00-\u9fa5]*/g

// 存储结果
const results = new Map()

// 递归扫描目录
function scanDir(dir) {
  if (!fs.existsSync(dir)) return
  
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      scanDir(filePath)
    } else if (config.extensions.some(ext => file.endsWith(ext))) {
      extractFromFile(filePath)
    }
  }
}

// 从文件中提取中文
function extractFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const matches = content.match(chineseRegex)
  
  if (matches) {
    for (const text of matches) {
      // 清理文本
      const cleaned = text
        .replace(/['"`]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      
      // 过滤掉太短或包含代码的
      if (cleaned.length >= 2 && 
          !cleaned.includes('console') && 
          !cleaned.includes('import') &&
          !cleaned.includes('export') &&
          !cleaned.includes('//')) {
        
        if (!results.has(cleaned)) {
          results.set(cleaned, new Set())
        }
        results.get(cleaned).add(filePath.replace(/\\/g, '/'))
      }
    }
  }
}

// 主函数
function main() {
  console.log('开始扫描...')
  
  for (const dir of config.scanDirs) {
    scanDir(dir)
  }
  
  // 生成 CSV
  let csv = '中文文本,英文翻译,所在文件\n'
  
  const sortedResults = [...results.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  
  for (const [text, files] of sortedResults) {
    const fileList = [...files].join('; ')
    // CSV 转义
    const escapedText = `"${text.replace(/"/g, '""')}"`
    csv += `${escapedText},,${fileList}\n`
  }
  
  fs.writeFileSync(config.outputFile, '\ufeff' + csv, 'utf-8') // BOM for Excel
  
  console.log(`\n提取完成！`)
  console.log(`共找到 ${results.size} 条中文文本`)
  console.log(`已导出到: ${config.outputFile}`)
}

main()
