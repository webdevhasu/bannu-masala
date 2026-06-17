/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        destination: 'https://bannumasala.com/:path*',
        permanent: true,
      },
    ];
  },
};
export default nextConfig;
