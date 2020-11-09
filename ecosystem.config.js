module.exports = {
  apps: [
    {
      name: "graphql-api",
      script: "src/server.js",
      watch: false,
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
