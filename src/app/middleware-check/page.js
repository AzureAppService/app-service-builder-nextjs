import Link from "next/link";

export const metadata = {
  title: "Proxy check",
};

export default function MiddlewareCheckPage() {
  return (
    <main>
      <p className="eyebrow">Request proxy test</p>
      <h1>Proxy check reached the App Router</h1>
      <p>
        The response includes an <code>x-builder-apps-proxy: active</code>{" "}
        header set before this page is rendered.
      </p>
      <nav>
        <Link className="button" href="/">
          Return home
        </Link>
      </nav>
    </main>
  );
}
