import Image from "next/image";
import Link from "next/link";
import { appInfo } from "./info";
import HealthCheck from "./health-check";

export default function Home() {
  return (
    <main>
      <p className="eyebrow">App Service Builder / Next.js</p>
      <h1>Next.js App Router is running</h1>
      <p>
        This landing page is prerendered during the production build while the
        linked routes exercise request-time framework behavior.
      </p>

      <nav aria-label="Test routes">
        <Link className="button" href="/dynamic">
          Open dynamic SSR page
        </Link>
        <Link href="/products/widget-1">Open dynamic segment</Link>
        <Link href="/server-action">Test server action</Link>
        <Link href="/middleware-check">Test proxy</Link>
        <Link href="/api/version">View version route</Link>
      </nav>
      <HealthCheck />

      <section className="feature-card" aria-labelledby="image-heading">
        <div>
          <p className="eyebrow">Image optimization</p>
          <h2 id="image-heading">Framework-managed raster image</h2>
          <p>
            The image is loaded from the public directory through the Next.js
            image optimizer.
          </p>
        </div>
        <Image
          src="/shape.png"
          alt="Sample raster image"
          width={128}
          height={128}
          priority
        />
      </section>
      <details>
        <summary>Customize this sample</summary>
        <p>In your fork, edit the home page in <code>src/app/page.js</code> and the
          styles in <code>src/app/globals.css</code>. Commit your changes and
          deploy your fork through your Builder App.</p>
      </details>
      <nav className="documentation" aria-label="Documentation">
        <a href="https://nextjs.org/docs">Framework documentation</a>
        <a href="https://builderapps.azure.com/docs/">App Service Builder documentation</a>
      </nav>

      <section aria-labelledby="deployment-heading">
        <h2 id="deployment-heading">Deployment details</h2>
        <dl>
          <div>
            <dt>Application</dt>
            <dd>
              {appInfo.app} {appInfo.version}
            </dd>
          </div>
          <div>
            <dt>Framework</dt>
            <dd>{appInfo.framework}</dd>
          </div>
          <div>
            <dt>Deployment</dt>
            <dd>{appInfo.deploymentMarker}</dd>
          </div>
          <div>
            <dt>Build setting</dt>
            <dd>{appInfo.buildMarker}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
