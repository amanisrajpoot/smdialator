/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@scheduler/common"],
  },
  transpilePackages: ["@scheduler/common"],
};

export default nextConfig;
