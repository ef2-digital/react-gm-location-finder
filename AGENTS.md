# @ef2/react-gm-location-finder

A React component library for a Google Maps location finder (map, search, list, opening hours),
published to npm as `@ef2/react-gm-location-finder`. The NAPA multidomain site
(`ef2-digital/napa`, `apps/web`) is the consumer we know of.

## Run and test

Yarn 4 through Corepack (`packageManager` in `package.json`, `nodeLinker: node-modules` in
`.yarnrc.yml`). A plain Yarn 1 refuses to run here, and a Yarn 1 install rewrites `yarn.lock` into
the v1 format, which Yarn 4 then rejects. Vite 8 needs Node 20.19 or newer.

```bash
corepack yarn install
corepack yarn dev
corepack yarn build
corepack yarn lint
```

`dev` serves `src/demo.tsx`. `build` writes the library and its type declarations to `dist/`.

## Releases

The published source lives on branch `new`, not on `main`: `main` still holds the 0.1.x line.
Nothing publishes from CI. After a merge to `new`, somebody with publish rights on the `@ef2` scope
runs `npm publish` from a clean `build`; check the result with
`npm view @ef2/react-gm-location-finder version peerDependencies`.

Since 2.0.0 the peers are React 19 and HeroUI 3 (`@heroui/react`), styled with Tailwind 4.

## Consumers

- The components use Tailwind classes that the consumer generates. Its CSS has to scan this
  package, `@source '../node_modules/@ef2/react-gm-location-finder/dist';`, and import
  `@heroui/styles`. Without the `@source` line the classes silently do not exist.
- `exports` carries a `types` condition; without it a consumer on `moduleResolution: bundler`
  sees the package as untyped.

## Proving a change

Build here, then try it in the consumer before publishing. Copy `dist/` into the consumer's
`node_modules/@ef2/react-gm-location-finder/dist` and build the consumer. A `file:` tarball is
less reliable: Yarn 1 in the consumer reuses a cached tarball with the same name and version, so
a rebuilt package can install as the old one.

## Branches and pull requests

Open pull requests against `new`. Someone from CS reviews. No `Co-Authored-By` trailers and no
"Generated with" lines.

## Known pitfalls

- `.github/workflows/deploy-storybook.yml` (Storybook to GitHub Pages on push to `new`) runs on
  Node 18 with a plain `yarn`, and its last run, in February 2026, failed. Storybook itself is
  still an early 7.5 alpha and has no stories in `src/`.
