/**
 * Minimal package installer using npm registry + node built-ins only.
 * Downloads package tarballs from registry.npmjs.org and extracts to node_modules.
 * 
 * Usage: node install-packages.js <pkg1> <pkg2> ...
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync } = require('child_process');

const nodeModules = path.join(__dirname, 'node_modules');
const installed = new Set();

function get(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'node-installer/1.0', 'Accept': 'application/json' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(get(res.headers.location));
      }
      let data = [];
      res.on('data', c => data.push(c));
      res.on('end', () => resolve(Buffer.concat(data)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function getPackageMeta(pkg) {
  const encodedPkg = pkg.startsWith('@') ? '@' + encodeURIComponent(pkg.slice(1)) : encodeURIComponent(pkg);
  const url = `https://registry.npmjs.org/${encodedPkg}/latest`;
  const raw = await get(url);
  return JSON.parse(raw.toString());
}

function extractTarball(buf, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  // Write to temp file then use node to extract
  const tmpTar = path.join(__dirname, '_tmp_pkg.tgz');
  fs.writeFileSync(tmpTar, buf);
  
  // Use zlib + manual tar parsing
  const gz = zlib.gunzipSync(fs.readFileSync(tmpTar));
  fs.unlinkSync(tmpTar);
  
  // Parse tar manually
  let offset = 0;
  while (offset < gz.length) {
    const header = gz.slice(offset, offset + 512);
    if (header.every(b => b === 0)) break;
    
    const nameRaw = header.slice(0, 100).toString('utf8').replace(/\0.*/, '');
    const sizeStr = header.slice(124, 136).toString('utf8').replace(/\0.*/, '').trim();
    const size = parseInt(sizeStr, 8) || 0;
    const typeFlag = header[156];
    
    offset += 512;
    
    // Strip "package/" prefix
    const relPath = nameRaw.replace(/^package\//, '');
    const fullPath = path.join(destDir, relPath);
    
    if (typeFlag === 48 || typeFlag === 0) { // regular file
      if (relPath && !relPath.endsWith('/')) {
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, gz.slice(offset, offset + size));
      }
    } else if (typeFlag === 53) { // directory
      if (relPath) fs.mkdirSync(fullPath, { recursive: true });
    }
    
    offset += Math.ceil(size / 512) * 512;
  }
}

async function install(pkgName) {
  if (installed.has(pkgName)) return;
  installed.add(pkgName);
  
  const destDir = path.join(nodeModules, pkgName);
  if (fs.existsSync(path.join(destDir, 'package.json'))) {
    console.log(`  ✓ ${pkgName} (already installed)`);
    return;
  }
  
  console.log(`  ↓ Installing ${pkgName}...`);
  
  let meta;
  try {
    meta = await getPackageMeta(pkgName);
  } catch (e) {
    console.error(`  ✗ Failed to get metadata for ${pkgName}: ${e.message}`);
    return;
  }
  
  const tarUrl = meta.dist.tarball;
  
  try {
    const tarBuf = await get(tarUrl);
    extractTarball(tarBuf, destDir);
    console.log(`  ✓ ${pkgName}@${meta.version} installed`);
  } catch (e) {
    console.error(`  ✗ Failed to install ${pkgName}: ${e.message}`);
  }
  
  // Install dependencies (top-level only to avoid full recursive tree)
  const deps = meta.dependencies || {};
  const topLevelDeps = Object.keys(deps).slice(0, 10); // limit depth
  for (const dep of topLevelDeps) {
    await install(dep);
  }
}

async function main() {
  const packages = process.argv.slice(2);
  if (!packages.length) {
    console.log('Usage: node install-packages.js <pkg1> <pkg2>...');
    process.exit(1);
  }
  
  console.log(`\nInstalling ${packages.length} package(s)...\n`);
  for (const pkg of packages) {
    await install(pkg);
  }
  console.log('\nDone!');
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
