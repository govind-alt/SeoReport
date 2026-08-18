/**
 * RankFlow — Legacy Demo Seed Delegate Script
 * Delegates to master seed script at scripts/seed.ts
 */

import { execSync } from 'child_process';
import path from 'path';

async function main() {
  console.log('🌱 Executing master seed script via scripts/seed.ts...\n');
  const seedPath = path.join(__dirname, 'seed.ts');
  execSync(`node -r tsx/register "${seedPath}"`, { stdio: 'inherit' });
}

main().catch(err => {
  console.error('Seed delegate failed:', err);
  process.exit(1);
});
