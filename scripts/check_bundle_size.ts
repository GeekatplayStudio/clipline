import fs from 'fs';
import path from 'path';
import { gzipSync } from 'zlib';

const assetDirectory = path.resolve(process.cwd(), 'dist', 'assets');
const maxJavaScriptGzipBytes = 150 * 1024;
const maxTotalJavaScriptGzipBytes = 280 * 1024;

if (!fs.existsSync(assetDirectory)) {
  throw new Error('dist/assets is missing. Run the production build first.');
}

const javascriptAssets = fs.readdirSync(assetDirectory).filter((name) => name.endsWith('.js'));
if (javascriptAssets.length === 0) {
  throw new Error('No JavaScript assets were produced by the build.');
}

let totalGzipBytes = 0;
for (const asset of javascriptAssets) {
  const gzipBytes = gzipSync(fs.readFileSync(path.join(assetDirectory, asset))).length;
  totalGzipBytes += gzipBytes;
  if (gzipBytes > maxJavaScriptGzipBytes) {
    throw new Error(`${asset} is ${gzipBytes} gzip bytes; limit is ${maxJavaScriptGzipBytes}.`);
  }
  console.log(`${asset}: ${(gzipBytes / 1024).toFixed(1)} KiB gzip`);
}

if (totalGzipBytes > maxTotalJavaScriptGzipBytes) {
  throw new Error(
    `Total JavaScript is ${totalGzipBytes} gzip bytes; limit is ${maxTotalJavaScriptGzipBytes}.`
  );
}

console.log(`Total JavaScript: ${(totalGzipBytes / 1024).toFixed(1)} KiB gzip`);
