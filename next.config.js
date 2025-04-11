/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/fastapi/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ]
  },
};

module.exports = nextConfig; 