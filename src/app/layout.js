import "./globals.css";
import "./family.css";

export const metadata = {
  title: {
    default: "App Service Builder: Next.js sample",
    template: "%s | App Service Builder: Next.js sample",
  },
  description: "A standalone Next.js App Router sample for Azure App Service Builder.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
