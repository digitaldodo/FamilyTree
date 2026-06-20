const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/app/api');
let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/throw new Error\("Invalid server response"\);/g, 'return Response.json({ success: false, message: "Invalid request body" }, { status: 400 });');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated: ' + file);
    count++;
  }
});
console.log('Total API files updated: ' + count);
