import xlsx from 'xlsx';
import * as path from 'path';

const file = path.join(process.cwd(), 'public', 'Forms.xlsx');
const workbook = xlsx.readFile(file);
console.log("All sheets:", workbook.SheetNames);

for (const sheetName of workbook.SheetNames) {
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);
  if (data.length > 0) {
    console.log(`\n========== ${sheetName} (${data.length} rows) ==========`);
    console.log("Headers:", JSON.stringify(Object.keys(data[0]), null, 2));
    console.log("Sample row:", JSON.stringify(data[0], null, 2));
  } else {
    console.log(`\n========== ${sheetName} (EMPTY) ==========`);
  }
}
