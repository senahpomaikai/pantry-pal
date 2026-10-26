# Branching and release strategy

## Branches

- **`main`**: protected and always deployable. Every push deploys to https://senahpomaikai.github.io/pantry-pal/.
  Changes land by pull request only: 1 approving review, CI green, squash-merge.
- **Short-lived branches** off `main`, merged within about a day:
  - `feat/<topic>`: new behavior
  - `fix/<topic>`: bug fixes
  - `test/<finding-id>`: a change driven by a user-test finding (e.g. `test/R1-F03`)
  - `docs/<topic>`: documentation only
- **A/B variants live behind the `v` flag in `main`**, never in long-lived branches. See [AB_VARIANTS.md](AB_VARIANTS.md).

## Test rounds

Each round runs against a frozen, tagged build so every result maps to exact code.

1. Before the round, tag `main`:
   ```sh
   git switch main && git pull
   git tag -a test-r1-pilot1 -m "Round 1, pilot 1"
   git push origin test-r1-pilot1
   ```
   The Pages workflow publishes it at `https://senahpomaikai.github.io/pantry-pal/r/test-r1-pilot1/`, which keeps
   working after `main` moves on.
2. Record the tag, URL and variant in [TEST_LOG.md](TEST_LOG.md) and use that URL in UXtweak.
3. While a round is running, only cherry-picked bug fixes go onto a `release/test-rN` branch, then get a new tag:
   ```sh
   git switch -c release/test-r1 test-r1-pilot1
   git cherry-pick <fix-sha>
   git tag -a test-r1-pilot1.1 -m "Round 1, pilot 1 + fix" && git push origin release/test-r1 test-r1-pilot1.1
   ```
   (Tag names must start with `test-` to be published.)
4. Tag names in order: `test-r1-pilot1`, `test-r1-pilot2`, `test-r2`, `test-r3`, …

## Commits and PRs

- Conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:` (e.g. `fix: keep filter badge in sync`).
- PRs are squash-merged, so the PR title becomes the commit message. Use the same convention.
- Fill in the PR template: what changed, the linked finding ID, the variant affected, screenshots, and the checklist.
- PRs have no deploy previews on GitHub Pages. To review UI, run `npm run dev`, or download the `dist` artifact from
  the PR's CI run and serve it with `npx vite preview` (put it in `dist/` first).
