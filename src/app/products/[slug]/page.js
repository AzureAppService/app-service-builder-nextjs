import Link from "next/link";
import { notFound } from "next/navigation";

const products = {
  "widget-1": {
    name: "Widget 1",
    description: "A request-time dynamic App Router segment.",
  },
  "widget-2": {
    name: "Widget 2",
    description: "A second deterministic dynamic-segment value.",
  },
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = products[slug];

  return {
    title: product?.name ?? "Product not found",
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = products[slug];

  if (!product) {
    notFound();
  }

  return (
    <main>
      <p className="eyebrow">Dynamic segment test</p>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>
        Segment value: <code>{slug}</code>
      </p>
      <nav>
        <Link className="button" href="/">
          Return home
        </Link>
      </nav>
    </main>
  );
}
