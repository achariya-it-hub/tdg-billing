const fs = require('fs');
const text = fs.readFileSync('F:/New folder (3)/tdg/User Data/Profile 4/Local Storage/leveldb/006759.ldb').toString('latin1');
const matches = text.match(/"orderNumber":(\d+)/g);
if (matches) {
  const nums = matches.map(m => m.split(':')[1]).filter((v,i,a) => a.indexOf(v)===i);
  console.log('Order numbers found in 006759.ldb:', nums.join(', '));
  
  // Also try to extract created at dates to see if they are from tonight
  const dMatches = text.match(/"createdAt":"2026-08-2[89][^"]*"/g);
  if (dMatches) console.log('Dates found:', dMatches.slice(0, 5).join(', '));
} else {
  console.log('No orderNumber found.');
}
