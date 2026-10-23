# Agent Ready Codebase

> This repository is a system for building a **consistent, well-structured
> codebase** without having to monitor every change an agent makes. Custom
> architecture rules constrain the codebase, while lint and CI use static
> analysis to mechanically enforce the rules they can check. This respository
> uses [Void](https://void.cloud/guide/), but its approach is
> framework-independent. It tests ways to build consistent, well-structured
> codebases.
>
> This structure is not perfect, so adapt it to your framework. Whenever an
> agent makes a mistake, prevent it from recurring by enforcing the fix in the
> codebase or lint rules. If you cannot enforce it in code, add the guidance to
> Rules first, then to `AGETNS.md`
>
> Make it yours! (〃ω〃)

## If you want to see how it works

Write lots of code that ignores the rules, then run the checks below.

```sh
bun run check
bun run test
bun run build
```

To install the project and start the app locally, run:

```sh
bunx --package vite-plus vp install
bun run dev
```

## Codebase

- Keep one Void app and one package at the repository root. The architecture
  check requires a single root `package.json`, a single root `void.config.ts`,
  and no `workspaces` field in `package.json`.
- Keep root directories in the allowlist. The architecture check rejects
  directories that are not listed in `rootDirectories` in
  `tooling/architecture/paths.ts`.
- Keep only `ui/` and `__tests__/` inside feature directories. Create either
  directory only when needed. The architecture check rejects other feature
  subdirectories.
- Put CSS files under `styles/`.
- Keep features independent. `dependency-cruiser` blocks imports from one
  feature into another.
- Export feature code to other folders through `features/<name>/index.ts` only.
- Keep `shared/` independent of app code such as `pages/`, `routes/`, and
  `features/`.
- Use code in `features/` and `shared/` from the app. Tests are exempt from the
  no-orphan check.
- Define checked app paths in `tooling/architecture/paths.ts`. The architecture
  check and lint use the same directory list.

## Static analysis

### Lint

- Treat correctness, strictness, and suspicious-code lint rules as errors.
  Type-aware lint checks the code.
- Do not leave unused variables or duplicate imports.
- Do not use `any`, reassign parameters, or create circular imports.
- Use `type` for type-only imports and prefer readonly parameter types.
- Avoid unnecessary template strings, `else` branches, and multiple variable
  declarations. Prefer direct expressions and early returns.
- Use lowercase file names and the `Number` object for numeric conversion.
- Use only `console.warn` and `console.error` in app code.
- Do not use JavaScript files, `enum`, or `else` branches in app source.
- Add return types to app functions and use camelCase identifiers. HTTP method
  names are exempt.
- Export non-JSX functions as named `export const` declarations.
- Export components as default functions with PascalCase names.
- Name custom hooks `useX` and callback props `onX`.
- Use `handleX` functions or `onX` callback props for JSX event handlers. Do not
  create inline event handlers while rendering.
- Self-close empty JSX elements and do not use array indexes as React keys.
- Include every required React Hook dependency.
- Do not use non-null assertions or unexplained TypeScript suppression comments.
  Handle nullable values and type errors explicitly.
- Use the typed `fetch` from `void/client` instead of the global `fetch`, and
  handle `FetchError`.
- Read environment values through `void/env` instead of `process.env`.
- Get TanStack Query keys from the imported key factory and include request
  inputs in the key.
- Keep `QueryClient` stable across renders and return cacheable data from query
  functions.
- Subscribe only to the query result fields you need. Keep mutation options and
  shared query options in their required forms.
- Follow web accessibility rules for keyboard support on clickable elements,
  associated labels, and image alt text.

### CI

- Run checks on pull requests and pushes to `main`. GitHub Actions uses Ubuntu,
  Node.js 24, and Bun.
- Install dependencies with `bun install --frozen-lockfile` to use the versions
  in the lockfile.
- Run `bun run test` to check feature tests and custom lint-rule tests.
- Run `bun run build`. It runs `bun run check` first. The check runs `vp check`
  and validates the repository structure and dependencies before Vite+ builds
  the app.
- The local pre-commit hook runs `vp staged`, `bun run check`, and
  `bun run check:env`, in that order. The staged-file rule in `vite.config.ts`
  runs `vp check --fix` on staged files before the full checks. A failed command
  stops the hook, so later commands do not run. CI does not need a local `.env`
  file.
- The local pre-push hook runs `bun run test` and then `bun run build`. A failed
  command stops the hook. `build` runs `check` before building.
- If you use pull requests, block direct pushes to `main` and require the
  `check` status before merging. CI runs on each pull request, so merge only
  after it passes.
- If you do not use pull requests, allow direct pushes to `main`. Run
  `bun run test` and `bun run build` before pushing. The pre-push hook runs both
  commands. CI on a push to `main` reports results after the push, so it cannot
  stop a failed change from reaching `main`.

## Agent instructions

`AGENTS.md` gives coding agents project-specific context and steps that are hard
to express as automatic checks. It is guidance, not a hard enforcement layer.
Keep rules in the architecture check, lint, types, or CI when those tools can
enforce them.

Use `AGENTS.md` for:

- The project-specific docs an agent must read before using Void, including
  their paths.
- The directory map and where each kind of code belongs.
- Commands for checks and builds, and when to run them.
- Work practices that tools cannot check, such as using Void's typed APIs or
  checking the real user flow when a change affects behavior.
- Pointers to canonical examples and to the checks that enforce repository
  rules.

Keep instructions short, concrete, and limited to this repository. Avoid
repeating long style rules that lint already checks. When you see the same agent
mistake more than once, first consider whether the codebase or an automatic
check can prevent it.

This follows Lauren Tan's distinction between hard constraints in the codebase
and static analysis, and softer instructions that an agent may miss. Her talk
does not name `AGENTS.md` specifically. The file is this repository's way to
provide project guidance to coding agents.

### Background

- [Lauren Tan's talk, "How I Shipped 2,000 PRs Last Month"](https://x.com/poteto/status/2102050467505430555/)
  describes her approach to agent trust, verification, architecture, and CI. The
  PR count is her own claim, not an independently audited result.
- [Cursor's Compile London session listing](https://cursor.com/de/compile/london)
  lists Lauren Tan's talk, "I Shipped 2,000 PRs Last Month."
- [Lauren Tan's pstack plugin](https://github.com/cursor/plugins/tree/main/pstack)
  contains her published agent workflows and guidance. It is a separate resource
  from this repository's `AGENTS.md`.
