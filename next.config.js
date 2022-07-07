/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    deviceSizes: [320, 640, 768, 1024, 1280, 1920],
    iconSizes: [],
    domains: ["picsum.photos"],
    loader: "default",
  },
};

module.exports = nextConfig;
