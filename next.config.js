/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  env: {
    VERCEL_URL: process.env.VERCEL_URL,
    DEV_URL: (process.env.HOST || ":") + (process.env.PORT || 3000), // -> http://localhost:3000
    MONGODB_URI:
      "mongodb+srv://next-mongo-user:123123123@cluster0.yzggr.mongodb.net/next-app-1?retryWrites=true&w=majority",
    SECRET_KEY: "secret-key",
    SALT_ROUNDS: 10,
  },
  images: {
    domains: ["images.unsplash.com"],
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
