import fs from 'fs';
import path from 'path';

const distRoot = path.resolve(process.cwd(), 'dist');
const indexPath = path.join(distRoot, 'index.html');
if (!fs.existsSync(indexPath)) throw new Error('dist/index.html is missing.');

const html = fs.readFileSync(indexPath, 'utf8');
const assetReferences = [...html.matchAll(/(?:src|href)="([^"]*assets\/[^"]+)"/g)].map((match) =>
  match[1].replace(/^(?:\.\/|\/)/, '')
);
if (assetReferences.length === 0) throw new Error('Built index.html contains no asset references.');

const missing = assetReferences.filter((asset) => !fs.existsSync(path.join(distRoot, asset)));
if (missing.length > 0) throw new Error(`Built index references missing assets: ${missing.join(', ')}`);
console.log(`Distribution smoke test passed with ${assetReferences.length} referenced assets.`);
