export const appInfo = {
  app: "app-service-builder-nextjs",
  version: "1.0.0",
  framework: "Next.js 16 App Router",
  deploymentMarker: process.env.NEXT_PUBLIC_DEPLOYMENT_MARKER ?? "v1-local",
  buildMarker: process.env.NEXT_PUBLIC_BUILD_MARKER ?? "local-build",
};
