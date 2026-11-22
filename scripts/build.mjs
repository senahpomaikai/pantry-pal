// Builds the deployed site: a landing page at the root, the control at A/, the impact message at B/,
// and the version revised after user testing at v2/. A and B stay exactly as tested.
import { execSync } from 'node:child_process';
import { copyFileSync, rmSync } from 'node:fs';

const root = process.env.BASE_PATH ?? '/pantry-pal/';

rmSync('dist', { recursive: true, force: true });
for (const version of ['A', 'B', 'v2']) {
  execSync(`npx vite build --base ${root}${version}/ --outDir dist/${version} --emptyOutDir`, {
    stdio: 'inherit',
    env: { ...process.env, VITE_VARIANT: version.toLowerCase() },
  });
}
copyFileSync('landing/index.html', 'dist/index.html');
