// Uncomment the next line to set different values for  different execution environments to fit your needs
// const isProd = process.env.NODE_ENV === "production";

module.exports = {
  // isProd,

  dbConfig: {
    host: "127.0.0.1",
    port: "dbPort",
    user: "user",
    pass: "pass",
    dbName: "blog",
    authSource: "admin",
  },

  webConfig: {
    host: "127.0.0.1",
    port: 4000,
  },

  clients: [
    {
      id: "",
      secret: "",
      type: "",
    },
    {
      id: "",
      secret: "",
    },
  ],

  adminInfo: {
    ADMINNAME: "",
    NICKNAME: "",
    PWD: "",
  },
};
