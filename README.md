# App Service Builder: Next.js sample

A standalone Next.js App Router application for
[Azure App Service Builder](https://builder.appservice.azure.com/docs/). It combines
prerendered pages, request-time SSR, dynamic segments, route handlers, a React
Server Action, image optimization, redirects, and a custom not-found page.
No database, external service, or parent workspace is required.

**App Service Builder is in Private Preview. Use this sample for development
and testing, not as a production application template.** This repository's
startup manifest explicitly binds the standalone server to `0.0.0.0`.
Earlier inferred startup completed its build but timed out during health checks.
The production build also copies public assets and static chunks into the
standalone server output. A hosted check of the earlier build served framework
routes but returned 404 for `/shape.png` and 400 for its optimized image.
Hosted qualification now demonstrates the bounded standalone behavior below,
not every Next.js mode or location. Browser Server Actions remain blocked by
the hosted request-origin boundary.

## Sample preview

![Next.js root page with framework route actions, inline app health feedback, image optimization, and customization help](docs/images/sample.png)

**LOCAL — Microsoft Edge, 1440px desktop, root `/`, standalone production build.**
This screenshot is not evidence of an Azure deployment.

The route-focused daylight composition keeps prerendering, request-time SSR,
dynamic segments, the existing Server Action, proxy checks, and the real
`/shape.png` raster through the Next.js image optimizer. Edit `src/app/page.js`
for content and `src/app/family.css` for the visual family; baseline styles
remain in `src/app/globals.css`. The documented hosted-origin Server Action
limitation below is unchanged; local rendering does not qualify that workflow.

### Logo provenance

`public/brand/builder.svg` is the supplied official App Service Builder mark.
`public/brand/next.svg` is an unmodified copy of the existing official Next.js
wordmark in `public/next.svg`; see [Vercel brand guidance](https://vercel.com/geist/brands).
Next.js is a trademark of Vercel, Inc. Logos identify the stack; no endorsement
is implied.

**Check app health** reads this app's compatibility `/health` JSON endpoint and
displays the result in place, including failures and retry guidance. It does not
report Azure deployment status; Builder's `/api/health` readiness endpoint is
unchanged. **Customize this sample** explains which files to edit in your fork;
it does not guess your repository or app URL. Framework and App Service Builder
documentation are labeled separately.

## Repository structure

```text
src/app/                         App Router pages, route handlers, and Server Action
src/proxy.js                     Pre-render request header example
public/                          Public assets, including the sample image
next.config.mjs                  Standalone output and redirect configuration
builder.yaml                     Web component runtime contract
scripts/prepare-standalone.mjs   Local standalone asset preparation
scripts/verify.ps1               Local or deployed HTTP verification
standalone.test.mjs              Manifest, action, and standalone integration tests
```

## Prerequisites

- [Node.js 24 LTS](https://nodejs.org/) and its bundled npm are recommended.
- [Git](https://git-scm.com/) and a GitHub account.
- For deployment: App Service Builder Private Preview access, an authorized
  Azure subscription, and an existing resource group in a supported preview location.
- Optional: [PowerShell 7](https://learn.microsoft.com/powershell/scripting/install/installing-powershell)
  for the endpoint verification script.

The sample pins Next.js **16.4.4**, React **19.3.1**, and React DOM **19.3.1**.
Keep the lockfile and use `npm ci`; setup does not require dependency upgrades.
The hosted observations below apply to Next.js 16.3.7, not these updated pins.

### Dependency maintenance

The lockfile includes patched `source-map-js` (1.2.2) and Zod (4.6.7),
within the ranges already allowed by PostCSS and the React Hooks lint plugin.
Three scoped npm overrides select minimatch 11.0.1 for ESLint,
`@eslint/config-array`, and `@typescript-eslint/typescript-estree` to address
GHSA-g3hv-75wg-m249. Their declared minimatch 10 ranges do not admit the fix.
These consumers use the retained `minimatch()` or `Minimatch.match()` APIs,
including partial directory matching; they do not use the removed regular
expression APIs. The overrides leave the separate minimatch 3 tree unchanged.
Revisit them when these tooling packages accept the patched major directly.

Check both the runtime and complete dependency trees after updates:

```sh
npm audit --omit=dev
npm audit
npm run lint
npm run build
npm test
```

Audit results are dependency advisory findings, not proof of runtime
exploitability. Local checks do not qualify a new hosted deployment.

## Run locally

Fork
[AzureAppService/app-service-builder-nextjs](https://github.com/AzureAppService/app-service-builder-nextjs/fork)
to your GitHub account. Clone your fork, replacing `<your-github-account>`:

```sh
git clone https://github.com/<your-github-account>/app-service-builder-nextjs.git
cd app-service-builder-nextjs
npm ci --ignore-scripts
npm run dev -- --hostname 127.0.0.1
```

Open `http://localhost:3000/`. Expect the heading
`Next.js App Router is running`. Stop the development server before using
the same port for production validation.

## Build and test the standalone output

From the repository root:

```sh
npm run lint
npm run build
npm test
```

`next.config.mjs` retains `output: "standalone"`. Next.js generates
`.next/standalone/server.js`, but does not copy `public/` or `.next/static/`
there by default. `npm run build` runs the preparation command after `next build`
to copy both into the standalone directory. This is required in the hosted
build as well as local validation: the image optimizer needs the source image
inside the compute artifact, not only in a separate static output.
`npm run prepare:standalone` remains available to restage assets manually.

The tests verify the exact startup manifest, prepared output, Server Action
validation (including the 40-character boundary), and live standalone HTTP
behavior. They check runtime SSR, JSON handlers, static assets, optimized
images, proxy headers, redirects, and not-found status codes. The real local
Server Action POST succeeds with matching request origin/forwarded host and
rejects a mismatch, preserving Next.js's CSRF protection.
The test decodes the Flight action result and requires the server's explicit
origin-mismatch abort diagnostic for rejection; an arbitrary HTTP 500 is not
sufficient. Production error digests and internal error-code suffixes are not
stable behavior contracts.
The standalone integration server uses an available port and is stopped
after the test. Its `HOSTNAME` is explicitly `0.0.0.0`, matching the manifest.
GitHub Actions runs lint, build, preparation, and tests on Linux and Windows.

### Start the same generated server manually

In PowerShell, from the repository root:

```powershell
$env:PORT = "3000"
$env:HOSTNAME = "0.0.0.0"
npm run start:standalone
```

On Linux or macOS:

```sh
PORT=3000 HOSTNAME=0.0.0.0 npm run start:standalone
```

Open `http://127.0.0.1:3000/`. `0.0.0.0` is a bind address, not the browser
URL. It exposes the application on all network interfaces; use a trusted
development network. For loopback-only local use, set `HOSTNAME=127.0.0.1`.
Keep the explicit `0.0.0.0` binding in the deployed manifest.

The existing `npm start` command uses `next start` and is retained for
compatibility. It is not the standalone startup contract used by Builder
or these tests. Do not substitute it for `node server.js` in the manifest.

In a second terminal, optionally use PowerShell 7:

```powershell
npm run verify
```

For a different local port or a deployed URL:

```powershell
pwsh -NoProfile -File .\scripts\verify.ps1 -BaseUrl https://your-app-hostname
```

The HTTP script does not execute browser JavaScript or supply a hosted visitor
session. Use the app's required sign-in rather than bypassing it.
For local browser validation, open `/server-action`,
enter a non-sensitive test name, and submit the form. Expect
`Server action received: <your value>`. Check client navigation, direct product
links, refreshes, the displayed image, and the custom not-found page.

## Routes and behavior

| Route | Expected behavior |
|---|---|
| `/` | Prerendered landing page, deployment details, and optimized image |
| `/dynamic` | Request-time SSR with a new rendered timestamp and runtime marker |
| `/products/widget-1` | Dynamic App Router segment rendering `Widget 1` |
| `/products/widget-2` | A second valid dynamic segment |
| `/products/unknown` | HTTP 404 with `Next.js page not found` |
| `/api/version` | Application, framework, Node.js runtime, public markers, and request metadata |
| `/api/health` | HTTP 200 JSON health and application identity; Builder readiness route |
| `/health` | Compatibility JSON health endpoint |
| `/middleware-check` | Page with `x-builder-apps-proxy: active` response header |
| `/server-action` | Interactive greeting form backed by a React Server Action |
| `/legacy` | HTTP 307 redirect to `/` |
| `/missing-page` | HTTP 404 with the custom not-found page |
| `/shape.png` | Public raster image |
| `/_next/image?url=%2Fshape.png&w=256&q=75` | Framework-optimized image |

This is a running Next.js application, not a static export. Preserve its
framework routing rather than applying a generic SPA fallback.
Next.js 16 uses the `proxy.js` convention for the pre-render request behavior
previously called middleware. The existing header name is intentionally retained.

The form and JSON handlers are public and unauthenticated. The Server Action
returns a demonstration greeting and does not persist data. It trims input
and accepts names from 1 to 40 characters. Do not submit sensitive information.

## Hosted qualification and limitations

On November 5, 2026, an isolated Builder app in `westus2` successfully activated
Next.js **16.3.7** standalone output with this manifest. The build used Node.js
**24.20.0**; `/api/version` reported hosted Node.js **24.22.1**.
The tested source was commit
`0bbf38090f76c64dba443e5bce4b90e02984ec20`, uploaded as a source ZIP with SHA-256
`32413b61aa872432646c6f122db4f4ba2c974035a86eb996ffb9515b0f120b74`.
Builder built and activated version `ver_20261105_829e14ea70fa` through deployment
`dep_20261105_829e14ea70fa`. The ZIP, not a GitHub commit identity, is the source
revision recorded by the service.

| Hosted behavior | Observed result |
|---|---|
| Prerendered landing page and JS/CSS chunks | HTTP 200; browser renders the UI |
| Request-time SSR | HTTP 200 with different timestamps on successive requests |
| Product segments and direct deep links | Valid products return 200; unknown products return the custom 404 |
| JSON health and version handlers | HTTP 200 with the expected application identity |
| `proxy.js` | Expected `x-builder-apps-proxy: active` header |
| Public image and `/_next/image` | HTTP 200; PNG and negotiated WebP decode successfully after the build fix |
| Client navigation | App Router navigation preserves the browser document |
| Redirect and missing page | `/legacy` reaches `/`; missing routes return the custom 404 |
| Browser Server Action | POST returns HTTP 500, Next.js digest `1060516640@E80` |

`E80` identifies Next.js's request-origin/host validation failure, not a failure
inside the greeting function. The platform proxy must preserve the public host
consistently with the browser's `Origin` for same-origin Server Actions.
Do not remove the origin check or add a shared-domain wildcard to hide it.
The same action succeeds against the local standalone server with matching
headers. Hosted Server Actions are **not qualified** by this sample.

The hosted app required the preview environment's visitor sign-in. Browser
checks used that session; an anonymous health request returned HTTP 401 at the
visitor boundary. This does not change the app source's own lack of authentication.
GitHub source connection was separately blocked by missing GitHub App access
to the canonical repository; ZIP deployment did not verify GitHub integration
or automatic deployment on push.

These observations establish a running Node.js standalone app with the tested
App Router routes and assets, not complete Next.js feature parity.
Edge Runtime routes, static export, ISR/revalidation, streaming behavior,
custom servers, other versions/regions, and production workloads were not
qualified. Consult the current
[feature availability](https://builder.appservice.azure.com/docs/resources/feature-status/)
and [runtime guidance](https://builder.appservice.azure.com/docs/reference/runtimes/);
this bounded experiment does not override the product's support policy.

## Deployment contract

The root `builder.yaml` contains:

```yaml
components:
  - name: web
    role: web
    path: /
    run:
      port: 3000
      start: HOSTNAME=0.0.0.0 node server.js
      healthCheckPath: /api/health
```

`HOSTNAME=0.0.0.0` is a shell environment assignment, without Markdown
asterisks. It overrides any inherited hostname that could otherwise control
where the generated Next.js server listens. Builder supplies component port
`3000` and runs the command from the prepared compute artifact root, where
`server.js` exists.

The manifest intentionally leaves framework detection to supply the Next.js
adapter, Node.js platform/runtime, build command, and static/compute outputs.
`output: "standalone"` is application configuration and stays in
`next.config.mjs`. The repository does not add a broad Node.js engine range:
an earlier provider resolution selected unsupported Node.js major version 20.

The production build invokes the preparation helper so Builder's standalone
compute artifact includes its public image and static chunks.
It complements Builder's framework-specific artifact assembly; publishing
assets as a separate static output alone does not make them available to
the server-side image optimizer.
Deploy the committed source and manifest, not `node_modules/` or `.next/`.

## Deploy your fork through Builder Portal

Follow the [Portal quickstart](https://builder.appservice.azure.com/docs/quickstarts/portal/)
for your authorized Private Preview environment:

1. Commit and push the sample to your GitHub repository's `main` branch.
2. Select your enabled subscription, existing resource group, and supported preview location.
3. Connect GitHub and authorize the Builder GitHub app for the repository.
   Obtain organization-owner approval if required.
4. Create an app using branch `main` and the repository root as its source directory.
5. Explicitly deploy and wait for a successful terminal status. Connecting source
   or pushing a commit is not proof of deployment.
6. Confirm `/api/health` and `/api/version` at the returned runtime URL, then
   verify dynamic SSR, product routes, images, proxy headers, and the Server Action.

### Public build and runtime markers

| Variable | Evaluated | Visible at |
|---|---|---|
| `NEXT_PUBLIC_DEPLOYMENT_MARKER` | Build time; default `v1-local` | Landing page, dynamic page, and version JSON |
| `NEXT_PUBLIC_BUILD_MARKER` | Build time; default `local-build` | Landing page and version JSON |
| `RUNTIME_MARKER` | Request time; default `local-runtime` | Dynamic page and version JSON |

These are intentionally public. **Never put credentials, connection strings,
or private information in them.** `NEXT_PUBLIC_*` values are captured during
the build; changing runtime settings alone does not update prerendered output.
Configure build/runtime values appropriately through Portal **Variables**,
then deploy and verify them. See the
[variables guide](https://builder.appservice.azure.com/docs/guides/variables/).

For code changes, run the checks, commit, and push to your fork's `main` branch.
Explicitly deploy through Builder Portal and verify the running application.
Automatic deployment on push is not qualified by this sample.

### Cleanup

Delete only the Builder app you created and wait for deletion to complete.
Do not delete a shared resource group, subscription, or unrelated resources.
Deleting the app does not delete your GitHub repository or local clone.

## Resources and contributions

- [App Service Builder documentation](https://builder.appservice.azure.com/docs/)
- [Sample catalog](https://builder.appservice.azure.com/docs/samples/)
- [Manifest guide](https://builder.appservice.azure.com/docs/guides/builder-yaml/)
- [Next.js standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](.github/CODE_OF_CONDUCT.md)
- [Security reporting](SECURITY.md)
- [Changelog](CHANGELOG.md)
- [MIT license](LICENSE.md)
