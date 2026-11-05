import Link from "next/link";
import { connection } from "next/server";
import { appInfo } from "../info";

export const metadata = {
  title: "Dynamic SSR",
};

export default async function DynamicPage() {
  await connection();

  const renderedAt = new Date().toISOString();
  const runtimeMarker = process.env.RUNTIME_MARKER ?? "local-runtime";

  return (
    <main>
      <p className="eyebrow">Request-time SSR test</p>
      <h1>Dynamic server-rendered page</h1>
      <p>
        This response was rendered after an incoming request rather than during
        the production build.
      </p>
      <dl>
        <div>
          <dt>Rendered at</dt>
          <dd>{renderedAt}</dd>
        </div>
        <div>
          <dt>Runtime setting</dt>
          <dd>{runtimeMarker}</dd>
        </div>
        <div>
          <dt>Deployment</dt>
          <dd>{appInfo.deploymentMarker}</dd>
        </div>
      </dl>
      <nav>
        <Link className="button" href="/">
          Return home
        </Link>
      </nav>
    </main>
  );
}
