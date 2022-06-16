/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", "localhost:3000"],
  },
  async redirects() {
    return [
      {
        source: "/post-form",
        destination: "/post-form/new",
        permanent: true,
      },
    ];
  },
  experimental: {
    runtime: "nodejs",
    serverComponents: true,
  },
  compiler: {
    styledComponents: true,
  },
  // https://stackoverflow.com/questions/64926174/module-not-found-cant-resolve-fs-in-next-js-application
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      child_process: false,
      process: false,
    };
    return config;
  },
};
