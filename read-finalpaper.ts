import xlsx from 'xlsx';
import * as path from 'path';

const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
const workbook = xlsx.readFile(file);
const sheet = workbook.Sheets['Final paper'];
const raw = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
console.log('Headers row:', raw[0]);
console.log('Sample row 1:', raw[1]);
console.log('Sample row 2:', raw[2]);
console.log('Total rows:', raw.length);
