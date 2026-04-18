import 'dotenv/config';
import xlsx from 'xlsx';
import * as path from 'path';
const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
const workbook = xlsx.readFile(file);
const worksheet = workbook.Sheets['Payment'];
const data = xlsx.utils.sheet_to_json(worksheet);
if (data.length > 0) {
  console.log("Payment headers:", Object.keys(data[0]));
  console.log("Sample row:", data[0]);
} else {
  console.log("Payment sheet is empty.");
}
