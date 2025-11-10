/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@scheduler/common", "@scheduler/api", "@scheduler/connectors", "@scheduler/ai", "@scheduler/n8n"],
};

export default nextConfig;
