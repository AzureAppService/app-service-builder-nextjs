import { appInfo } from "../../info";

export function GET() {
  return Response.json({
    status: "ok",
    app: appInfo.app,
  });
}
