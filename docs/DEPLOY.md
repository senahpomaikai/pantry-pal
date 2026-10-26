# Deploying

The app is a static site on **GitHub Pages**, built and published by
[`.github/workflows/pages.yml`](../.github/workflows/pages.yml).

| What | URL |
|---|---|
| `main` (latest) | https://senahpomaikai.github.io/pantry-pal/ |
| Frozen test build | `https://senahpomaikai.github.io/pantry-pal/r/<tag>/` (e.g. `/r/test-r1-pilot1/`) |

## How it works

- Every push to `main`, and every pushed tag matching `test-*`, runs the workflow. It builds `main` into the site root,
  then rebuilds **every** `test-*` tag into `/r/<tag>/` with its own Vite `base`, and deploys the whole site.
  Old rounds keep working after `main` changes.
- Vite's `base` defaults to `/pantry-pal/` (see `vite.config.ts`). If the repo is renamed, the workflow passes
  the new name through `BASE_PATH` automatically. Also update the URLs in these docs and in `playwright.config.ts`.
- `public/.nojekyll` stops Pages from running Jekyll.

## One-time setup (already done for senahpomaikai/pantry-pal)

```sh
gh api -X POST repos/senahpomaikai/pantry-pal/pages -f build_type=workflow
```

Or in the GitHub UI: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Deploy

- **Latest:** merge a PR into `main`. The site updates in about a minute.
- **Re-deploy without a code change:** Actions → "Deploy to GitHub Pages" → Run workflow, or
  `gh workflow run pages.yml`.
- **Freeze a build for a test round:**
  ```sh
  git tag -a test-r1-pilot1 -m "Round 1, pilot 1" && git push origin test-r1-pilot1
  gh run watch   # wait for the deploy, then open /r/test-r1-pilot1/
  ```
  Record the tag and URL in [TEST_LOG.md](TEST_LOG.md).

## Things to know before a test round

- **UXtweak's free plan caps responses per tool and per month.** Don't spend responses on a moving target: always give
  UXtweak a frozen `/r/<tag>/` URL, never the root URL, and always include `v=` in it
  (e.g. `/r/test-r1-pilot1/?v=b&task=0`).
- **Caching:** Pages serves files with `cache-control: max-age=600`. After a deploy, a browser that already loaded the
  page can show the old build for up to 10 minutes. Tag the build well before a session, or hard-refresh.
- **Embedding:** GitHub Pages sends no `X-Frame-Options` or `Content-Security-Policy` headers and sets no cookies
  (checked with `curl -sI` on 2026-10-26), so UXtweak can load the site. Don't add a meta CSP or any
  third-party script. The only external request is Google Fonts.
- **Variant memory:** the variant is kept in `sessionStorage` per browser tab. All builds share the
  `senahpomaikai.github.io` origin, so an explicit `?v=` in the URL is the safe choice.
- **No PR previews.** Unlike Vercel/Netlify, Pages hosts a single site. Review PR UI locally with `npm run dev`.

## Fallback hosting

If Pages is ever unavailable, the `dist/` output works on any static host. Set `BASE_PATH=/` for a root domain
(Netlify/Vercel): `BASE_PATH=/ npm run build`, then publish `dist/`.
