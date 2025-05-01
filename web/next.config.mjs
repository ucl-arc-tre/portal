// @ts-check

/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "export",
  // to work with eslint9?
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
