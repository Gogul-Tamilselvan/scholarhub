const fs = require('fs');
const path = 'client/src/components/AdminJournals.tsx';
let c = fs.readFileSync(path, 'utf8');

// Use 7-space indent to match the file
const oldStr = `                       <Button onClick={() => openEditorial(j)} variant="outline" size="sm" className="h-7 rounded border-slate-200 text-emerald-600 hover:bg-emerald-50 text-[10px] font-bold gap-1 px-2">
                           <Users size={11}/> Board
                       </Button>`;

const newStr = `                       <Button onClick={() => openSpecialIssues(j)} variant="outline" size="sm" className="h-7 rounded border-slate-200 text-amber-600 hover:bg-amber-50 text-[10px] font-bold gap-1 px-2">
                           <BookMarked size={11}/> Special
                       </Button>
                       <Button onClick={() => openEditorial(j)} variant="outline" size="sm" className="h-7 rounded border-slate-200 text-emerald-600 hover:bg-emerald-50 text-[10px] font-bold gap-1 px-2">
                           <Users size={11}/> Board
                       </Button>`;

if (!c.includes(oldStr)) {
  console.error('TARGET NOT FOUND — checking snippet...');
  // Debug: show surrounding area
  const idx = c.indexOf('openEditorial(j)');
  console.log('Found openEditorial at char:', idx);
  console.log(JSON.stringify(c.slice(idx - 30, idx + 100)));
  process.exit(1);
}

c = c.replace(oldStr, newStr);
fs.writeFileSync(path, c, 'utf8');
console.log('Done — Special button inserted.');
