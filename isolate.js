const fs = require('fs');
const parser = require('@babel/parser');
const code = fs.readFileSync('C:/Users/somna/OneDrive/Desktop/SEO TASK/SeoReport/app/superadmin/SuperadminClient.tsx', 'utf8');

function test(regexStr) {
  const replaced = code.replace(new RegExp(regexStr), 'null');
  try {
    parser.parse(replaced, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
    return "Valid";
  } catch (e) {
    return e.message;
  }
}

console.log("Original:", test("^$"));
console.log("No Overview:", test("\\\\{activeTab === 'overview' && \\\\([\\\\s\\\\S]*?\\\\)\\n\\\\s*\\\\}"));
console.log("No Agencies:", test("\\\\{activeTab === 'agencies' && \\\\([\\\\s\\\\S]*?\\\\)\\n\\\\s*\\\\}"));
console.log("No Users:", test("\\\\{activeTab === 'users' && \\\\([\\\\s\\\\S]*?\\\\)\\n\\\\s*\\\\}"));
console.log("No System:", test("\\\\{activeTab === 'system' && \\\\([\\\\s\\\\S]*?\\\\)\\n\\\\s*\\\\}"));
console.log("No Billing:", test("\\\\{activeTab === 'billing' && \\\\([\\\\s\\\\S]*?\\\\)\\n\\\\s*\\\\}"));
