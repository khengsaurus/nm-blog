/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  env: {
    MONGODB_URI:
      "mongodb+srv://next-mongo-user:123123123@cluster0.yzggr.mongodb.net/next-app-1?retryWrites=true&w=majority",
    DB_NAME: "next-app-1",
    SECRET_KEY: "secret-key",
    SALT_ROUNDS: 10,
  },
  images: {
    domains: ["images.unsplash.com"],
  },
  experimental: {
    runtime: "nodejs",
    serverComponents: true,
    styledComponents: true,
  },
};
