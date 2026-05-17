const fs = require('fs');
const files = ['src/styles/pages.js', 'src/styles/styles.js', 'src/styles/layout.js', 'src/styles/ui.js'];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/backgroundColor:\s*['"]#fff['"]/g, 'backgroundColor: C.card');
  content = content.replace(/backgroundColor:\s*['"]#ffffff['"]/g, 'backgroundColor: C.card');
  content = content.replace(/backgroundColor:\s*['"]#f9f9f9['"]/g, 'backgroundColor: C.surface');
  content = content.replace(/backgroundColor:\s*['"]#f5f7fa['"]/g, 'backgroundColor: C.surface');
  
  content = content.replace(/color:\s*['"]#333['"]/g, 'color: C.text');
  content = content.replace(/color:\s*['"]#333333['"]/g, 'color: C.text');
  
  fs.writeFileSync(f, content);
});
console.log("Color replacement complete.");
