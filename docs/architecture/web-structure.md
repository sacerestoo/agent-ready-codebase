# Web structure

Use these examples when adding or moving web code. Keep each feature focused on
one domain, and let pages assemble features without making them depend on each
other.

## Framework boundaries

Keep folder and import checks framework-neutral. The selected directory and file
rules live in `tooling/architecture/project.ts`, and both the filesystem check
and dependency-cruiser derive their paths from that configuration. When changing
frameworks, update that configuration and select the matching lint profile. Keep
framework APIs and parser rules out of the shared lint rules.

## Pages and features

Do keep page-level composition in `pages/` and domain code in its feature:

```text
pages/index.tsx
features/
  auth/
    index.ts
    ui/
  projects/
    index.ts
    api.ts
    queries.ts
    ui/
    use-projects.ts
```

Do import a feature through its `index.ts` from outside that feature:

```tsx
import { AuthForm, SignOutButton } from "@/features/auth";
import ProjectsApp from "@/features/projects";
```

Do let a page compose features and pass a generic UI slot when needed:

```tsx
<ProjectsApp
  headerAction={<SignOutButton />}
  userId={session.user.id}
/>
```

Do not put authentication UI in `features/projects/`, import another feature
from inside a feature, or import a feature's internal file from a page:

```tsx
// Do not do this inside features/projects/.
import SignOutButton from "@/features/auth/ui/sign-out-button";
// Do not bypass the feature's public entry point from a page.
import ProjectRow from "@/features/projects/ui/project-row";
```

Move code shared by multiple features to `shared/`. Shared code must not import
from `pages/`, `routes/`, or `features/`.

## Feature files

Use only `ui/` and `__tests__/` as feature subfolders. Create either only when
it has files to hold.

Do keep UI components in kebab-case `.tsx` files. Keep hooks, network calls,
query definitions, and other non-UI functions at the feature root. UI files may
contain component types, but their functions should return JSX.

```text
features/projects/
  api.ts
  queries.ts
  use-projects.ts
  projects.server.ts
  ui/
    project-row.tsx
    projects-list.tsx
```

Do keep a feature's query keys and query options together in `queries.ts`:

```text
features/projects/queries.ts  # query keys and query options
```

Do not put hooks or query options in `ui/`, or split a feature's query key and
query options across unrelated files.

## Database access boundary

Only paths listed in `databaseImporterPathPatterns` in
`tooling/architecture/project.ts` may import the configured database modules. In
this Void project, that boundary is `routes/api/<feature>/**`. Keep SQL and
database operators there. Page loaders, page actions, and browser code call the
API handlers with `fetch` from `void/client`:

```ts
// pages/index.server.ts or a feature client module
import { fetch } from "void/client";

const projects = await fetch("/api/projects");
```

Void's typed fetch also works during SSR and in server handlers. App-local calls
go directly to the route without an HTTP round-trip, and forward the incoming
cookie and authorization headers. This keeps database imports inside the
configured boundary while preserving authentication.

## Database schemas

Do split schemas by domain and export them from the root barrel:

```text
db/
  schema/
    projects.ts
  schema.ts
```

```ts
// db/schema.ts
export * from "./schema/projects";
```

Do not collect every domain's table definitions in `db/schema.ts`.

## Void page routing

Use a companion `.server.ts` file for page data. Export its inferred `Props`
type so the page stays aligned with the loader result:

```ts
// pages/index.server.ts
import { defineHandler, type InferProps } from "void";

export type Props = InferProps<typeof loader>;
export const loader = defineHandler((): { greeting: string } => ({
  greeting: "Hello",
}));
```

Use `action` or `actions` in a page server file, not both. Validate action input
with `defineHandler.withValidator()` when the action accepts input. Use page
actions for writes initiated by a page form or button, then use `Form` and
`useForm` for forms or `action()` for other mutations. Keep standalone API
operations under `routes/api/`. Use Void's `auth` client for sign-in, sign-up,
and sign-out, as described in its
[authentication guide](https://void.cloud/guide/auth).

Use `pages/layout.tsx` for the root layout and nested `layout.tsx` files for
shared page UI. Select a named layout with a string export or disable layouts
with `false`.

The Void lint profile checks the page handler shape, inferred loader props,
mutually exclusive action exports, and static layout selections. Void's build
also checks that selected named layouts exist. See the official guides for
[loaders](https://void.cloud/guide/pages-routing/loaders),
[actions and forms](https://void.cloud/guide/pages-routing/actions-and-forms),
and [layouts](https://void.cloud/guide/pages-routing/layouts).
