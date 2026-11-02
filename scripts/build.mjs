// Builds the deployed site: a landing page at the root, with the control at A/ and the impact message at B/.
import { execSync } from 'node:child_process';
import { copyFileSync, rmSync } from 'node:fs';

const root = process.env.BASE_PATH ?? '/pantry-pal/';

rmSync('dist', { recursive: true, force: true });
for (const version of ['A', 'B']) {
  execSync(`npx vite build --base ${root}${version}/ --outDir dist/${version} --emptyOutDir`, {
    stdio: 'inherit',
    env: { ...process.env, VITE_VARIANT: version.toLowerCase() },
  });
}
copyFileSync('landing/index.html', 'dist/index.html');
