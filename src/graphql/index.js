const fs = require("fs");

const { resolve } = require("path");

const { isProd } = require("../config");

const { ApolloServer, gql } = require("apollo-server-koa");

const defaultPath = resolve(__dirname, "./models");

const typeDefFileName = "schema.js";

const resolverFileName = "resolver.js";

const linkSchema = gql`
  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
  type Subscription {
    _: Boolean
  }
`;

function generateTypeDefsAndResolvers() {
  const typeDefs = [linkSchema];
  const resolvers = {};
  const _generateAllComponentRecursive = (path = defaultPath) => {
    const list = fs.readdirSync(path);

    list.forEach((item) => {
      const resolvePath = path + "/" + item;
      const stat = fs.statSync(resolvePath);
      const isDir = stat.isDirectory();
      const isFile = stat.isFile();
      if (isDir) {
        _generateAllComponentRecursive(resolvePath);
      } else if (isFile && item === typeDefFileName) {
        const { schema } = require(resolvePath);
        typeDefs.push(schema);
      } else if (isFile && item === resolverFileName) {
        const resolver = require(resolvePath);
        Object.keys(resolver).forEach((k) => {
          if (!resolvers[k]) resolvers[k] = {};
          resolvers[k] = { ...resolvers[k], ...resolver[k] };
        });
      }
    });
  };
  _generateAllComponentRecursive();
  return { typeDefs, resolvers };
}

const getFormatError = () => {
  return isProd
    ? (error) => ({
        code: error.extensions.code,
        message: error.message,
      })
    : undefined;
};

const defaultOptions = {
  ...generateTypeDefsAndResolvers(),

  formatError: getFormatError(),

  context: ({ ctx }) => {
    return {
      isFromAdmin: ctx.state.isFromAdmin,
    };
  },

  introspection: !isProd,

  playground: isProd
    ? false
    : {
        settings: {
          "schema.polling.enable": false,
        },
      },

  mocks: false,
};

module.exports = (apolloServerOptions) => {
  return new ApolloServer({
    ...defaultOptions,
    ...apolloServerOptions,
  });
};
