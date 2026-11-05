# Contributing to App Service Builder: Next.js sample

This project welcomes contributions and suggestions.

## Contributor License Agreement

Most contributions require a Contributor License Agreement (CLA) declaring
that you have the right to grant us the rights to use your contribution.
See [Microsoft Contributor License Agreements](https://cla.opensource.microsoft.com/).
Follow any CLA instructions shown on your pull request.

## Code of Conduct

This project follows the
[Microsoft Open Source Code of Conduct](.github/CODE_OF_CONDUCT.md).

## Issues and feature requests

Search [existing issues](https://github.com/AzureAppService/app-service-builder-nextjs/issues)
before opening a new one. Include reproduction steps, expected and actual
behavior, Node.js/npm versions, operating system, browser, and sanitized logs.
For larger changes, open an issue to discuss the proposal first.

Do not include credentials or private environment values. For security concerns,
follow [the security policy](SECURITY.md) instead of opening a public issue.

## Development and pull requests

1. Fork the repository and create a branch for your change.
2. Install locked dependencies with `npm ci --ignore-scripts`.
3. Keep the sample standalone, small, and free of external service dependencies.
4. Update tests and documentation when behavior changes.
5. Run the following checks and describe the results in your pull request:

```sh
npm run lint
npm run build
npm run prepare:standalone
npm test
```

For framework or routing changes, also verify the real standalone server in
a browser: client navigation, direct deep links, refreshes, runtime SSR,
optimized images, not-found pages, and Server Action submission.
Preserve `output: "standalone"`, component port 3000, the explicit
`HOSTNAME=0.0.0.0 node server.js` startup, and `/api/health` unless intentionally
changing and validating the deployment contract. Do not treat `next dev` or
`next start` as validation of the generated standalone artifact.

Follow the repository's existing agent guidance when using coding assistants.
Do not commit installed dependencies, build output, environment files, or secrets.
