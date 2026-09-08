// @vitest-environment node
import { expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

it('client source/config/build artifacts contain no provider secrets or direct provider authentication', () => {
  const roots = [process.cwd(), path.resolve('../readiness-mobile')];
  const failures: string[] = [];
  function visit(file: string) {
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink()) return;
    if (stat.isDirectory()) {
      if (['node_modules', '.git', 'Pods', '.gradle', '.cxx', 'build'].includes(path.basename(file))) return;
      for (const child of fs.readdirSync(file)) visit(path.join(file, child));
    } else if (/\.(?:[cm]?[jt]sx?|json|map|bundle)$|\/\.env[^/]*$/.test(file) && !file.endsWith('.test.ts')) {
      const text = fs.readFileSync(file, 'utf8');
      if (/sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{24,}/.test(text) || /(?:VITE_|NEXT_PUBLIC_)?OPENAI_API_KEY\s*[:=]\s*["']?[^\s"']+/.test(text) || /api\.openai\.com|api\.anthropic\.com|generativelanguage\.googleapis\.com/.test(text)) failures.push(path.relative(roots[0], file));
    }
  }
  for (const root of roots) visit(root);
  expect(failures, 'Only file paths are reported; secret values are never printed').toEqual([]);
});
