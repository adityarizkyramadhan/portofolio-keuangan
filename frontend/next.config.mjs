/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Enable API proxying for local dev server
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5000/api/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
