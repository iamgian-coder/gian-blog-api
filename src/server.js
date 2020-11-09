// load the configuration
const { isProd, dbConfig, webConfig } = require("./config");

const Koa = require("koa");

const app = new Koa();

// supports X-Forwarded-For when app.proxy is true.
app.proxy = true;

// logger middleware
app.use(require("./middlewares/logger"));

// filter invalid requests,enabled in production
if (isProd) {
  app.use(require("./middlewares/filterInvalidReqs"));
}

// authenticate middleware,enabled in production
if (isProd) {
  app.use(require("./middlewares/authenticate"));
}

// set isFromAdmin on ctx.state.isFromAdmin
app.use(require("./middlewares/setCtxState"));

// api middleware to match /^\/increaseViewsById\/(\w{24})$/i
app.use(require("./middlewares/increaseViewsById"));

// api middleware to match /^\/updateLikedById\/(\w{24})\/(i|m)$/i
app.use(require("./middlewares/updateLikedById"));

// get a ApolloServer instance
const apolloServer = require("./graphql/index")({
  dataSources() {
    return {
      mongodbSource: new (require("./datasources/mongodbSource"))(),
    };
  },
});

// apply the integrated middlewares
apolloServer.applyMiddleware({ app, disableHealthCheck: true, path: "/" });

const mongoose = require("mongoose");

// register the connected event
mongoose.connection.on("connected", () => {
  // start the server
  app.listen({ host: webConfig.host, port: webConfig.port }, () => {
    // log info
    console.log(
      `Listening: http://${webConfig.host}:${webConfig.port}${apolloServer.graphqlPath}`
    );

    // start a timer to update the views regularly
    require("./plugins/updateViewsTimer");

    // start a timer to update the liked regularly
    require("./plugins/updateLikedTimer");

    // generate and insert the fake data when not running under production
    if (!isProd) {
      const { generateArticlesData } = require("./seed");
      const { articleModel } = require("./mongooseModel");
      articleModel.insertMany(generateArticlesData(20)).then(
        () => {
          console.log("Insert data succeed");
        },
        (e) => {
          console.error("Insert data failed: %s", e);
        }
      );
    }
  });
});

mongoose
  .connect(
    `mongodb://${dbConfig.user}:${dbConfig.pass}@${dbConfig.host}:${dbConfig.port}/${dbConfig.dbName}`,
    {
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      autoIndex: false,
      auth: {
        user: dbConfig.user,
        password: dbConfig.pass,
      },
      authSource: dbConfig.authSource,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 1000 * 3,
      socketTimeoutMS: 1000 * 5,
      connectTimeoutMS: 1000 * 5,
      family: 4,
    }
  )
  .catch((err) => {
    console.error("Connect to database failed: %s", err);
  });
