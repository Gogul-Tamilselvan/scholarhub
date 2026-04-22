const fs = require('fs');
const files = [
  'client/src/components/AdminSpecialIssueArchives.tsx',
  'client/src/components/PublicSpecialIssueArchive.tsx',
  'client/src/pages/SpecialIssueArticleLanding.tsx'
];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/\\`/g, '`').replace(/\\\$/g, '$');
  fs.writeFileSync(f, c);
});
console.log('Fixed escape issues in all files.');
