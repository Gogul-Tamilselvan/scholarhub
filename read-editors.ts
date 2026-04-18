import xlsx from 'xlsx';
import * as path from 'path';

const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
const workbook = xlsx.readFile(file);
const sheet = workbook.Sheets['invite for editors'];

// Get raw array to see ALL columns including unnamed ones
const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
console.log('Row 1 (headers):', data[0]);
console.log('Row 2 (sample):', data[1]);
console.log('Row 3 (sample):', data[2]);
console.log('Total rows:', data.length);
