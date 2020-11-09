const { AuthenticationError } = require("apollo-server-koa");

const { regIsEmpty } = require("../../../utils");

const { adminInfo } = require("../../../config");

const { ADMINNAME, NICKNAME, PWD } = adminInfo;

module.exports = {
  Query: {
    getArticleById(_, arg, { dataSources, isFromAdmin }) {
      return dataSources.mongodbSource.getArticleById(arg, isFromAdmin);
    },

    getPrevNextRelated(_, arg, { dataSources }) {
      return dataSources.mongodbSource.getArticlePrevNext(arg);
    },

    getArticlesByPage(_, arg, { dataSources, isFromAdmin }) {
      return dataSources.mongodbSource.getArticlesByPage(arg, isFromAdmin);
    },

    getArticlesBySearching(_, arg, { dataSources, isFromAdmin }) {
      return dataSources.mongodbSource.getArticlesBySearching(arg, isFromAdmin);
    },

    getArticleTags(_, arg, { dataSources }) {
      return dataSources.mongodbSource.getArticleTags();
    },

    getHotArticles(_, arg, { dataSources }) {
      return dataSources.mongodbSource.getHotArticles(arg);
    },

    async getArticleArchives(_, arg, { dataSources }) {
      return dataSources.mongodbSource.getArticleArchives();
    },

    authenticate(_, { userName, password }, { dataSources }) {
      if (regIsEmpty.test(userName) || regIsEmpty.test(password)) {
        return new AuthenticationError("请输入用户名和密码");
      } else {
        if (userName === ADMINNAME && password === PWD) {
          return {
            name: ADMINNAME,
            nickName: NICKNAME,
          };
        } else {
          return new AuthenticationError("用户名或密码错误");
        }
      }
    },
  },

  Mutation: {
    addArticle(_, arg, { dataSources }) {
      return dataSources.mongodbSource.addArticle(arg);
    },

    updatePublishStatus(_, arg, { dataSources }) {
      return dataSources.mongodbSource.updatePublishStatus(arg);
    },

    updateDeleteStatus(_, arg, { dataSources }) {
      return dataSources.mongodbSource.updateDeleteStatus(arg);
    },

    updateArticle(_, arg, { dataSources }) {
      return dataSources.mongodbSource.updateArticle(arg);
    },
  },
};
