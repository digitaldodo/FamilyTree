import fs from 'fs';
import path from 'path';

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

const files = walk('src');
let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace double nested tries:
  // try {
  //   try {
  //     data = await res.json();
  //   } catch (e) {
  //     throw new Error("Invalid JSON response from server");
  //   }
  // } catch (e) { ... }
  // OR similar variations.
  
  const nestedRegex = /try\s*\{\s*(?:try\s*\{\s*)?([a-zA-Z0-9_]+)\s*=\s*await\s+([a-zA-Z0-9_]+)\.json\(\);?(?:\s*\}\s*catch\s*\([^)]*\)\s*\{\s*throw new Error\([^)]*\);\s*\})?\s*\}\s*catch\s*\([^)]*\)\s*\{[^}]*\}/gs;

  content = content.replace(nestedRegex, (match, varName, resObj) => {
    return `try {
      ${varName} = await ${resObj}.json();
    } catch {
      throw new Error("Server returned invalid response");
    }`;
  });

  // Just to be sure, catch single ones that throw "Invalid JSON response from server"
  const singleRegex = /try\s*\{\s*([a-zA-Z0-9_]+)\s*=\s*await\s+([a-zA-Z0-9_]+)\.json\(\);?\s*\}\s*catch\s*\([^)]*\)\s*\{\s*throw new Error\([^)]*\);\s*\}/gs;
  content = content.replace(singleRegex, (match, varName, resObj) => {
    return `try {
      ${varName} = await ${resObj}.json();
    } catch {
      throw new Error("Server returned invalid response");
    }`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated: ' + file);
    count++;
  }
});
console.log('Total files updated: ' + count);
