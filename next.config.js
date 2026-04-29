/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/login',
        destination: '/login.html',
      },
      {
        source: '/cadastro',
        destination: '/cadastro.html',
      },
    ];
  },
};

module.exports = nextConfig;
