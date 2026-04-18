import 'dotenv/config';
import xlsx from 'xlsx';
import * as path from 'path';

const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
const workbook = xlsx.readFile(file);
console.log("All sheets:", workbook.SheetNames);

const sheetName = workbook.SheetNames.find(n => n.toLowerCase().includes('assign')) || 'Assignments';
const worksheet = workbook.Sheets[sheetName];
if (!worksheet) {
  console.log("No Assignments sheet found!");
  process.exit(1);
}
const data = xlsx.utils.sheet_to_json(worksheet);
console.log(`Found ${data.length} rows in '${sheetName}' sheet`);
if (data.length > 0) {
  console.log("Headers:", Object.keys(data[0]));
  console.log("Sample row:", data[0]);
}
