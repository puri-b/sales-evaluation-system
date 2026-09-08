# Test results - data-entry field definitions

Test date: 2026-09-08. Source baseline: the uploaded sales-evaluation-system.zip.
Runtime: Node 22.16.0, supplied Next.js 14.0.0 / React 18.2.0 dependencies, Linux.
No connection to the user's PostgreSQL server and no Vercel deployment were made.

| Check | Result | Scope |
| --- | --- | --- |
| Changed JS/JSX source parsed with Babel | PASS | Eight modified/new UI/API entry files |
| Automated Node tests | PASS, 39/39 | Validation, SSR table, API with DB mocks |
| Browser scenarios | PASS, 11/11 | Real React components, mocked API fetch |
| Mobile field editor | PASS | 390px viewport; no row overflow |
| Three-field A4 print sample | PASS | One page, table + multiline remarks |
| 100-field A4 print sample | PASS | Seven pages, all 100 labels present, repeated headers |
| Live PostgreSQL migration/integration | NOT RUN | No live database was used |
| Production Next.js build | NOT VERIFIED | Missing Linux SWC binary; registry DNS/network unavailable |
| Vercel Preview / Production | NOT RUN | Must be tested by the project owner |

The normal build was attempted and stopped while loading/downloading
`@next/swc-linux-x64-gnu`. The environment could not resolve/access
`registry.npmjs.org`. A temporary local Babel fallback also failed at SWC loading;
all temporary build configuration was removed. The original `next.config.js` is
unchanged. Do not treat the browser harness as proof that `next build` passes.
Run `npm ci`, `npm test`, `npm run build` in your actual build environment.

An existing warning about the `api` property in `next.config.js` was observed.
That baseline configuration was left unchanged by this feature update.
Dependency versions and lockfile were preserved.

Browser checks:
1. Blank added row blocks Next with inline validation.
2. Add/remove preserves remaining row values and order.
3. Field editor fits a 390px mobile viewport.
4. Definitions and remarks survive Back/Next navigation.
5. Pre-save summary renders definitions and remarks.
6. Save payload carries fields/remarks without React keys.
7. Saved detail calls Print and keeps the table while hiding controls.
8. 100 fields and a long note survive seven PDF pages with repeated headers.
9. Legacy data-entry detail shows an explicit empty field list.
10. Scanning detail does not show data-entry definitions.
11. No browser runtime exceptions.

PDF tests use sample data only. The page count describes that sample, not a fixed
page limit or a guarantee of identical pagination in every printer/browser.
