# Changelog

## 1.0.0 - 2026-11-05

- Prepare `app-service-builder-nextjs` for standalone publication.
- Explicitly bind the generated server with `HOSTNAME=0.0.0.0 node server.js`
  on component port 3000, using `/api/health` for readiness.
- Preserve Next.js/React versions, App Router features, and standalone output.
- Add standalone asset preparation, integration and Server Action tests,
  publication documentation, the MIT license, contribution/security guidance,
  and GitHub validation checks.
