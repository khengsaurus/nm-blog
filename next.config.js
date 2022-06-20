/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  outputFileTracing: false,
  env: {
    BEARER: process.env.ENV_VERCEL_BEARER,
    ENV_IMG_SRC: process.env.ENV_IMG_SRC,
  },
  images: {
    domains: ["localhost", "localhost:3000", process.env.ENV_IMG_HOST],
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
