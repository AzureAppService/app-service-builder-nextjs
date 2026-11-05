import Link from "next/link";
import { ServerActionForm } from "./server-action-form";

export const metadata = {
  title: "Server action",
};

export default function ServerActionPage() {
  return (
    <main>
      <p className="eyebrow">React Server Action test</p>
      <h1>Submit data to the server</h1>
      <p>
        This form invokes a Server Action and renders its serializable result
        without a custom API endpoint.
      </p>
      <ServerActionForm />
      <nav>
        <Link href="/">Return home</Link>
      </nav>
    </main>
  );
}
