import { readFileSync } from 'fs';

function getKeys(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...getKeys(v, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

// 用正则手动找重复 key
function findDuplicateKeys(text) {
  const stack = [];
  const dupes = [];
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.includes('{')) stack.push(new Set());
    const m = line.match(/^\s*"([^"]+)"\s*:/);
    if (m && stack.length > 0) {
      const key = m[1];
      const current = stack[stack.length - 1];
      if (current.has(key)) dupes.push(key);
      else current.add(key);
    }
    if (line.includes('}') && stack.length > 0) stack.pop();
  }
  return dupes;
}

const zhText = readFileSync('i18n/locales/zh.json', 'utf8');
const enText = readFileSync('i18n/locales/en.json', 'utf8');

// 检查重复 key
const zhDupes = findDuplicateKeys(zhText);
const enDupes = findDuplicateKeys(enText);
if (zhDupes.length) console.log('⚠ zh.json 重复 key:', zhDupes.join(', '));
if (enDupes.length) console.log('⚠ en.json 重复 key:', enDupes.join(', '));

const zh = JSON.parse(zhText);
const en = JSON.parse(enText);

const zhKeys = new Set(getKeys(zh));
const enKeys = new Set(getKeys(en));

const onlyZh = [...zhKeys].filter(k => !enKeys.has(k)).sort();
const onlyEn = [...enKeys].filter(k => !zhKeys.has(k)).sort();

console.log(`\n=== zh.json 有但 en.json 缺失 (${onlyZh.length} 个) ===`);
onlyZh.forEach(k => console.log(`  ${k}`));

console.log(`\n=== en.json 有但 zh.json 缺失 (${onlyEn.length} 个) ===`);
onlyEn.forEach(k => console.log(`  ${k}`));
