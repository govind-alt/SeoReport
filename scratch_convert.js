const fs = require('fs');
let html = fs.readFileSync('src/dashboard.html', 'utf8');

// Basic replacements
let jsx = html.replace(/class=/g, 'className=')
  .replace(/<input([^>]*?[^\/])>/g, '<input$1 />')
  .replace(/<img([^>]*?[^\/])>/g, '<img$1 />')
  .replace(/<br>/g, '<br />')
  .replace(/for=/g, 'htmlFor=')
  .replace(/autocomplete=/g, 'autoComplete=')
  .replace(/onclick=/g, 'onClick=')
  .replace(/onsubmit=/g, 'onSubmit=')
  .replace(/oninput=/g, 'onInput=')
  .replace(/stroke-width=/g, 'strokeWidth=')
  .replace(/stroke-linecap=/g, 'strokeLinecap=')
  .replace(/stroke-linejoin=/g, 'strokeLinejoin=');

// Fix style="..."
jsx = jsx.replace(/style="([^"]*)"/g, (match, styles) => {
  let s = styles.split(';').filter(x => x.trim()).map(x => {
    let parts = x.split(':');
    if(parts.length < 2) return '';
    let k = parts[0].trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
    let v = parts.slice(1).join(':').trim();
    return `${k}: '${v}'`;
  }).filter(Boolean).join(', ');
  return `style={{${s}}}`;
});

fs.mkdirSync('app/(dashboard)/dashboard', {recursive:true});

// Extract body inner HTML
let bodyMatch = jsx.match(/<body[^>]*>([\s\S]*?)<\/body>/);
let bodyContent = bodyMatch ? bodyMatch[1] : '';
bodyContent = bodyContent.replace(/<script>[\s\S]*?<\/script>/g, '');
bodyContent = bodyContent.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

let pageTsx = `import './dashboard.css';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <>
      ${bodyContent}
    </>
  );
}`;

fs.writeFileSync('app/(dashboard)/dashboard/page.tsx', pageTsx);

// Extract CSS
let styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
  fs.writeFileSync('app/(dashboard)/dashboard/dashboard.css', styleMatch[1]);
}
