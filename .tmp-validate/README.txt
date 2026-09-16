Scratch folder created by the 2026-09-16 midnight BTC run to validate public/data
JSON against the zod schemas in src/lib/types.ts. The run could not delete it
(sandbox file deletion was declined with no one present to approve). It is inert:
tsconfig.app.json only includes "src", so nothing here is compiled or bundled.
Safe to delete: rm -rf .tmp-validate
