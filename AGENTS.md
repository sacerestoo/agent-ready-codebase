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
- Keep trivial one-use wrappers inline. Extract a function when it is shared,
  names a meaningful operation, or owns non-trivial behavior. Do not decide by
  call count alone.
- Keep one Void app and one package at the repository root.
- For folder, import, and schema examples, read
  [docs/architecture/web-structure.md](docs/architecture/web-structure.md) when
  changing those boundaries.
- For Void page loaders, actions, and layouts, follow the official guides linked
  from that document. The Void lint profile checks the supported static rules.
- Keep the architecture checker framework-neutral. Put framework-specific lint
  rules in the selected project profile.
- Keep database module imports inside the configured database boundary in
  `tooling/architecture/project.ts`. In this Void app, only
  `routes/api/<feature>/**` may import `void/db`; pages and browser code call
  those handlers with typed fetch.
- Run `bun run check:architecture` to verify the single-app and import
  boundaries. The checked paths live in `tooling/architecture/paths.ts`.
  `bun run build` runs this check before building.

## Promise failure handling

- Await or return a Promise so its caller can handle failure. Do not leave a
  Promise rejection without an owner.
- Handle failures at the boundary that can respond. User-triggered failures must
  show useful feedback and must not continue success-only actions.
- Catch only to report, recover, or convert an error. Otherwise let it propagate
  to the caller that owns the response.
- `void` only marks a Promise as intentionally detached. It does not handle
  failure. Use it only when the operation handles every rejection itself, or
  attach a rejection handler at the boundary.
- Best-effort work may skip user-facing feedback only when failure cannot affect
  the user's task or data. Record or handle its rejection, and explain the
  reason when detaching it.
- React error boundaries do not catch event-handler or other asynchronous
  failures. Catch those in the handler and show component state or a toast.
