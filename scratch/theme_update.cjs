const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Slate -> Neutral (Global gray swap)
    content = content.replace(/slate-/g, 'neutral-');

    // 2. Buttons & Primary accents (Blue -> Charcoal/Neutral)
    content = content.replace(/bg-blue-600/g, 'bg-neutral-900');
    content = content.replace(/hover:bg-blue-700/g, 'hover:bg-neutral-800');
    content = content.replace(/text-blue-600/g, 'text-neutral-900');
    content = content.replace(/text-blue-500/g, 'text-neutral-800');
    content = content.replace(/border-blue-500/g, 'border-neutral-800');
    content = content.replace(/border-blue-600/g, 'border-neutral-900');
    content = content.replace(/focus:ring-blue-500/g, 'focus:ring-neutral-900');
    
    // Light accents
    content = content.replace(/bg-blue-50/g, 'bg-neutral-100');
    content = content.replace(/hover:bg-blue-50/g, 'hover:bg-neutral-100');
    content = content.replace(/hover:bg-blue-100/g, 'hover:bg-neutral-200');
    content = content.replace(/bg-blue-100/g, 'bg-neutral-100');
    content = content.replace(/border-blue-100/g, 'border-neutral-200');
    content = content.replace(/border-blue-200/g, 'border-neutral-300');
    content = content.replace(/text-blue-400/g, 'text-neutral-500');
    content = content.replace(/text-blue-700/g, 'text-neutral-800');
    content = content.replace(/text-blue-800/g, 'text-neutral-900');

    // Violet accents (from KPI cards or other places)
    content = content.replace(/bg-violet-50/g, 'bg-neutral-100');
    content = content.replace(/text-violet-600/g, 'text-neutral-700');
    content = content.replace(/text-violet-700/g, 'text-neutral-800');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  }
});

// Update index.css for background
let cssPath = './src/index.css';
let css = fs.readFileSync(cssPath, 'utf8');
css = css.replace('background-color: #f1f5f9;', 'background-color: #F7F7F7;');
fs.writeFileSync(cssPath, css, 'utf8');
