import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <p className="eyebrow">App Router not-found test</p>
      <h1>Next.js page not found</h1>
      <p>The requested route does not exist in this application.</p>
      <nav>
        <Link className="button" href="/">
          Return home
        </Link>
      </nav>
    </main>
  );
}
