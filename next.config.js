/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  outputFileTracing: false,
  env: {
    BEARER: "vpUnCJhmLITt3IP9F8FjWG9Y",
    ENV_IK_SRC: "https://ik.imagekit.io/tkcodesstuff/",
  },
  images: {
    domains: [
      "localhost",
      "localhost:3000",
      "notes-app-1-sg.s3.ap-southeast-1.amazonaws.com",
      "ik.imagekit.io",
    ],
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
  // experimental: {
  //   runtime: "nodejs",
  //   serverComponents: true,
  // },
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
