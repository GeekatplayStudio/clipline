import fs from 'fs';
import path from 'path';

const maximumLines = 500;
const roots = ['src', 'agents', 'scripts'];
const extensions = new Set(['.ts', '.tsx']);

function collectModules(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectModules(entryPath);
    return extensions.has(path.extname(entry.name)) ? [entryPath] : [];
  });
}

const modules = roots.flatMap((root) => collectModules(path.resolve(process.cwd(), root)));
const violations = modules
  .map((modulePath) => ({
    modulePath,
    lines: fs.readFileSync(modulePath, 'utf8').split(/\r?\n/).length,
  }))
  .filter(({ lines }) => lines > maximumLines)
  .sort((left, right) => right.lines - left.lines);

if (violations.length > 0) {
  const details = violations
    .map(({ modulePath, lines }) => `${path.relative(process.cwd(), modulePath)}: ${lines} lines`)
    .join('\n');
  throw new Error(`Modules must not exceed ${maximumLines} lines:\n${details}`);
}

const largest = modules
  .map((modulePath) => ({
    modulePath,
    lines: fs.readFileSync(modulePath, 'utf8').split(/\r?\n/).length,
  }))
  .sort((left, right) => right.lines - left.lines)
  .slice(0, 5);

console.log(`Checked ${modules.length} modules; all are <= ${maximumLines} lines.`);
largest.forEach(({ modulePath, lines }) => {
  console.log(`${path.relative(process.cwd(), modulePath)}: ${lines}`);
});
