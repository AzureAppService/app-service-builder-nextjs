/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/legacy",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
