/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Avoid server-side fetching of remote images in development to prevent
    // DNS/network-related crashes from the image optimizer. The browser will
    // load the images directly instead.
    unoptimized: process.env.NODE_ENV !== 'production',
    remotePatterns: [
      { protocol: 'http', hostname: '**' },
      { protocol: 'https', hostname: '**' }
    ]
  }
};

export default nextConfig;
