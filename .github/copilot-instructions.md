# @fazer-ai/n8n-nodes-chatwoot

## Repository Purpose

- This package publishes a single community node called `Chatwoot` for interacting with the Chatwoot API from n8n.
- The canonical package name is `@fazer-ai/n8n-nodes-chatwoot`. Always reference the company as `fazer.ai` (all lowercase).

## Project Structure

- `nodes/Chatwoot/Chatwoot.node.ts` is the only node entry point. Its `description` defines the UI, credentials, and resource/operation routing.
- Resource-specific parameter definitions live in `nodes/Chatwoot/resources/` (e.g., `conversation.ts`, `message.ts`). When adding an operation, place the `description` fragment in the corresponding resource file and spread it into the node.
- Dynamic dropdowns and resource-locator helpers live in `nodes/Chatwoot/listSearch/`. Add new list-search or load-option handlers here, then expose them via the `methods` object of the node.
- HTTP helpers and shared logic live in `nodes/Chatwoot/shared/` (e.g., `transport.ts`). Reuse utilities here instead of duplicating REST logic inside `execute`.
- Credentials are defined in `credentials/ChatwootApi.credentials.ts`. Align any property or display-name changes with the `credentials` entry in `package.json`.
- Static assets belong under `icons/` (the node uses `icons/fazer-ai.svg`). Build output is emitted to `dist/` and is the only folder published (see the `"files"` array in `package.json`).

## Coding Conventions

- TypeScript only. Import types from `n8n-workflow` and helpers from local files with relative paths.
- Stick to the declarative node style already in `Chatwoot.node.ts`.
- Keep naming consistent with existing casing (`Chatwoot` is still the public-facing display name until TODOs are resolved).
- Default to the `n8n-node` CLI wrappers defined in `package.json` (see the command list below) so tooling stays consistent across contributors.

## Scripts (`pnpm <command>`)

- `pnpm build` → Compile sources via `n8n-node build` and populate `dist/`.
- `pnpm lint` / `pnpm lint:fix` → Run or auto-fix ESLint through `n8n-node lint`.

## Documentation & Comment Style

- Default to self-explanatory code. Only add inline comments or TSDoc when a reader cannot easily infer intent or when required by the n8n/node CLI (e.g., credential classes). Do **not** add boilerplate or repetitive comments.
- When TSDoc is needed (public classes, exported helpers), keep it focused: describe intent, include `@param`/`@returns` only if they clarify behavior, and add examples sparingly.
- Prefer `// NOTE:` and `// TODO:` tags for important rationale or follow-ups, respectively.
- Update `README.md` (based on `README_TEMPLATE.md`) whenever the node surface area changes.

## References

- Primary docs: [n8n community nodes guide](https://docs.n8n.io/integrations/community-nodes/build-community-nodes/).
- Mirror logic and naming from existing Chatwoot resource modules before introducing new patterns to keep the node consistent.
