import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
const { readFile, writeFile, utils } = xlsx;
import readline from 'readline';
import { fileURLToPath } from 'url';

// Default paths
const DEFAULT_LOCALE_DIR = 'i18n/locales';
const DEFAULT_EXCEL_PATH = 'translations.xlsx';

function flattenJson(data, prefix = '') {
    let result = {};
    for (const key in data) {
        if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
            const flatObject = flattenJson(data[key], prefix + key + '.');
            result = { ...result, ...flatObject };
        } else {
            result[prefix + key] = data[key];
        }
    }
    return result;
}

function unflattenJson(data) {
    const result = {};
    for (const key in data) {
        const value = data[key];
        if (value === undefined || value === null || value === '') continue; // Skip empty

        const parts = key.split('.');
        let current = result;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!current[part]) {
                current[part] = {};
            }
            current = current[part];
        }
        current[parts[parts.length - 1]] = value;
    }
    return result;
}

// Simple deep merge function
function deepMerge(target, source) {
    for (const key in source) {
        if (source[key] instanceof Object && key in target && target[key] instanceof Object && !Array.isArray(source[key])) {
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

function jsonToExcel(sourceDir = DEFAULT_LOCALE_DIR, outputFile = DEFAULT_EXCEL_PATH) {
    if (!fs.existsSync(sourceDir)) {
        console.error(`Error: Source directory not found: ${sourceDir}`);
        return;
    }

    // Scan for JSON files
    const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.json'));

    if (files.length === 0) {
        console.warn(`No JSON files found in ${sourceDir}`);
        return;
    }

    console.log(`Found language files: ${files.join(', ')}`);

    const data = {};
    const allKeys = new Set();
    const languages = [];

    for (const file of files) {
        const lang = path.basename(file, '.json');
        languages.push(lang);
        const filepath = path.join(sourceDir, file);

        try {
            const content = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
            const flat = flattenJson(content);
            data[lang] = flat;
            Object.keys(flat).forEach(k => allKeys.add(k));
        } catch (e) {
            console.error(`Error decoding JSON in ${filepath}: ${e.message}`);
            return;
        }
    }

    // Create rows
    const sortedKeys = Array.from(allKeys).sort();
    const rows = sortedKeys.map(key => {
        const row = { key };
        languages.forEach(lang => {
            row[lang] = data[lang][key] || '';
        });
        return row;
    });

    // Create workbook
    const wb = utils.book_new();
    const ws = utils.json_to_sheet(rows, { header: ['key', ...languages] });
    utils.book_append_sheet(wb, ws, 'Translations');

    try {
        writeFile(wb, outputFile);
        console.log(`Successfully created ${outputFile}`);
    } catch (e) {
        console.error(`Error writing Excel file: ${e.message}`);
    }
}

function excelToJson(excelFile = DEFAULT_EXCEL_PATH, outputDir = DEFAULT_LOCALE_DIR) {
    if (!fs.existsSync(excelFile)) {
        console.error(`Error: File not found: ${excelFile}`);
        console.error(`Tip: Run 'npm run translate -- j2e' first to generate the Excel file.`);
        return;
    }

    try {
        const wb = readFile(excelFile);
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rows = utils.sheet_to_json(ws);

        if (rows.length === 0) {
            console.log("Excel file is empty.");
            return;
        }

        if (!rows[0].hasOwnProperty('key')) {
            console.error("Error: Excel file must have a 'key' column");
            return;
        }

        // Identify languages (columns other than 'key')
        const range = utils.decode_range(ws['!ref']);
        const headers = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = ws[utils.encode_cell({ r: range.s.r, c: C })];
            if (cell && cell.v) headers.push(cell.v);
        }

        const langs = headers.filter(h => h !== 'key');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        console.log(`Extracting languages: ${langs.join(', ')}`);

        langs.forEach(lang => {
            const langData = {};
            rows.forEach(row => {
                const key = row['key'];
                const val = row[lang];
                if (key && val !== undefined && val !== '') {
                    langData[key] = String(val); // Ensure string
                }
            });

            const changes = unflattenJson(langData);
            const outputPath = path.join(outputDir, `${lang}.json`);

            let finalData = changes;

            // Merge with existing data if present
            if (fs.existsSync(outputPath)) {
                try {
                    const existingData = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
                    finalData = deepMerge(existingData, changes);
                } catch (e) {
                    console.warn(`Warning: Could not parse existing ${outputPath}, overwriting. (${e.message})`);
                }
            }

            try {
                fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2), 'utf-8');
                console.log(`Successfully generated ${outputPath}`);
            } catch (e) {
                console.error(`Error writing ${outputPath}: ${e.message}`);
            }
        });

    } catch (e) {
        console.error(`Error reading Excel file: ${e.message}`);
    }
}

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function interactiveMode() {
    console.log("--- 交互式模式 / Interactive Mode ---");
    console.log("1. JSON -> Excel");
    console.log("2. Excel -> JSON");

    const choice = (await askQuestion("请选择 (1/2): ")).trim();

    if (choice === '1') {
        const dir = (await askQuestion(`请输入Locales目录 (默认 ${DEFAULT_LOCALE_DIR}): `)).trim() || DEFAULT_LOCALE_DIR;
        const output = (await askQuestion(`请输入输出Excel文件名 (默认 ${DEFAULT_EXCEL_PATH}): `)).trim() || DEFAULT_EXCEL_PATH;

        console.log(`正在从 ${dir} 扫描JSON文件 -> ${output}`);
        jsonToExcel(dir, output);

    } else if (choice === '2') {
        const excelPath = (await askQuestion(`请输入Excel文件路径 (默认 ${DEFAULT_EXCEL_PATH}): `)).trim() || DEFAULT_EXCEL_PATH;
        const outputDir = (await askQuestion(`请输入输出目录 (默认 ${DEFAULT_LOCALE_DIR}): `)).trim() || DEFAULT_LOCALE_DIR;

        console.log(`正在转换: ${excelPath} -> JSON files in ${outputDir}`);
        excelToJson(excelPath, outputDir);
    } else {
        console.log("无效的选择 / Invalid choice");
    }
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        await interactiveMode();
        return;
    }

    const command = args[0];

    if (command === 'j2e') {
        let dir = DEFAULT_LOCALE_DIR;
        let output = DEFAULT_EXCEL_PATH;

        for (let i = 1; i < args.length; i++) {
            if ((args[i] === '-d' || args[i] === '--dir') && args[i + 1]) dir = args[++i];
            if ((args[i] === '-o' || args[i] === '--output') && args[i + 1]) output = args[++i];
        }
        jsonToExcel(dir, output);

    } else if (command === 'e2j') {
        let input = DEFAULT_EXCEL_PATH;
        let dir = DEFAULT_LOCALE_DIR;

        if (args[1] && !args[1].startsWith('-')) {
            input = args[1];
        }

        for (let i = 1; i < args.length; i++) {
            if ((args[i] === '-d' || args[i] === '--dir') && args[i + 1]) dir = args[++i];
        }

        excelToJson(input, dir);

    } else if (command === '--help' || command === '-h') {
        console.log(`
Usage: node translation_tool.js [command] [options]

Commands:
  j2e       Convert JSON files in directory to Excel
            Options: --dir <path> (default: i18n/locales), -o <output>
  e2j       Convert Excel file to JSON files (Merge/Update mode)
            Usage: e2j [input_file] [--dir <output_dir>]
            Defaults: input=translations.xlsx, output=i18n/locales
    `);
    } else {
        console.log("Unknown command. Use --help for usage.");
    }
}

// Check if run directly
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
    main();
}
