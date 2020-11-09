const { gql } = require("apollo-server-koa");

const schema = gql`
  scalar Date

  type Article {
    _id: ID!
    title: String!
    postAt: Date!
    updateAt: Date
    tags: [String!]
    comments: [String!]
    views: Int
    liked: Int
    markdown: String
    summary: String
    isPublished: Boolean!
    isDeleted: Boolean!
  }

  type PaginationArticle {
    docs: [Article!]
    totalDocs: Int! # 总共多少条数据
    totalPages: Int! # 总共有多少页
    hasPrevPage: Boolean!
    hasNextPage: Boolean!
    prevPage: Int
    nextPage: Int
    page: Int! # 当前页号
    limit: Int! # 每页显示多少条数据
  }

  type PartialArticle {
    _id: ID!
    title: String!
    postAt: Date
  }

  type _ID {
    year: String!
    month: String!
  }

  type ArticleArchive {
    _id: _ID!
    docs: [PartialArticle!]
  }

  type AuthenticationResult {
    name: String!
    nickName: String!
  }

  type Tag {
    name: String!
    related: Int!
  }

  type ArticlePrevNext {
    _id: ID!
    title: String!
  }

  input AddOrUpdateArticleInput {
    markdown: String!
    tags: [String!]
    title: String!
    isDeleted: Boolean!
    isPublished: Boolean!
  }

  input QueryWhereInput {
    isPublished: Boolean
    isDeleted: Boolean
    postAt: [Date]
    updateAt: [Date]
    title: String
    tags: [String!]
  }

  input SortInput {
    postAt: SortDirection
    updateAt: SortDirection
  }

  enum SortDirection {
    ASCEND
    DESCEND
  }

  extend type Query {
    getArticleById(id: ID!): Article

    getPrevNextRelated(id: ID!): [ArticlePrevNext]

    getArticlesByPage(
      page: Int!
      limit: Int!
      where: QueryWhereInput
      sort: SortInput
    ): PaginationArticle!

    getArticlesBySearching(
      keyword: String!
      page: Int!
      limit: Int!
      where: QueryWhereInput
      sort: SortInput
    ): PaginationArticle!

    getArticleTags: [Tag!]

    getHotArticles(limit: Int!): [Article!]

    getArticleArchives: [ArticleArchive!]

    authenticate(userName: String!, password: String!): AuthenticationResult!
  }

  extend type Mutation {
    updatePublishStatus(id: ID!, newStatus: Boolean!): Article

    updateDeleteStatus(id: ID!, newStatus: Boolean!): Article

    updateArticle(id: ID!, data: AddOrUpdateArticleInput!): Article

    addArticle(data: AddOrUpdateArticleInput!): Article
  }
`;

module.exports = { schema };
