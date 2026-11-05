import { appInfo } from "../../info";

export async function GET(request) {
  return Response.json({
    ...appInfo,
    runtime: `Node.js ${process.version}`,
    runtimeMarker: process.env.RUNTIME_MARKER ?? "local-runtime",
    method: request.method,
    path: new URL(request.url).pathname,
  });
}
