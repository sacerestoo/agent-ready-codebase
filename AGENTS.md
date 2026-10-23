<!--injected-by-void-v1.2.1-->

## Void

- This project uses [Void](https://void.cloud), a full-stack Vite framework for
  Cloudflare Workers with file-based API routing, server-rendered pages, and
  typed backend services.
- Use Void's CLI and typed APIs. Before working with Void, read the relevant
  Markdown docs in `node_modules/void/docs/`; start with `guide/quickstart.md`
  for setup and `reference/cli.md` for commands.

<!--/injected-by-void-->

## Web structure

- Type aliases, interfaces, and generic type parameters must use PascalCase.

- Keep one Void app and one package at the repository root.
- `pages/` contains page components and page composition only.
- Use the server feature directories in `tooling/architecture/paths.ts` for
  their matching Void features.
- `features/<name>/` owns one feature. Keep its UI, network requests, tests, and
  types inside that feature.
- Feature subfolders are optional. Use only `ui/` and `__tests__/`, and create
  each only when it has files to hold.
- Import a feature from outside its folder through `features/<name>/index.ts`
  only.
- Features must not import other features. Move code needed by multiple features
  to `shared/`.
- `shared/` contains reusable code and must not depend on app entrypoints or
  features.
- Run `bun run check:architecture` to verify the single-app and import
  boundaries. The checked paths live in `tooling/architecture/paths.ts`.
  `bun run build` runs this check before building.
