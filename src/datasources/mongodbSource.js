const { DataSource } = require("apollo-datasource");

const { articleModel } = require("../mongooseModel");

const { regIsInValidMDLine } = require("../utils");

const fixedWhere = {
  isPublished: true,
  isDeleted: false,
};

const fixedSort = {
  postAt: -1,
};

class MongodbSource extends DataSource {
  constructor() {
    super();
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the user making requests
   */
  initialize(config) {
    this.context = config.context;
  }

  buildCondition(where, sort, isFromAdmin = false) {
    const condition = {
      where: isFromAdmin ? {} : { ...fixedWhere },
      sort: isFromAdmin ? {} : { ...fixedSort },
    };
    if (where) {
      const whereKeys = Object.keys(where);
      if (whereKeys.length) {
        if (whereKeys.includes("isPublished")) {
          condition.where.isPublished = { $eq: where.isPublished };
        }
        if (isFromAdmin && whereKeys.includes("isDeleted")) {
          condition.where.isDeleted = { $eq: where.isDeleted };
        }
        if (whereKeys.includes("title")) {
          condition.where.title = { $regex: new RegExp(where["title"], "i") };
        }
        if (whereKeys.includes("tags")) {
          const tags = where.tags;
          tags.length && (condition.where.tags = { $in: tags });
        }
        if (whereKeys.includes("updateAt")) {
          const updateAt = where.updateAt;
          condition.where.updateAt = {
            $gte: updateAt[0],
            $lte: updateAt[1],
          };
        }
        if (whereKeys.includes("postAt")) {
          const postAt = where.postAt;
          condition.where.postAt = { $gte: postAt[0], $lte: postAt[1] };
        }
      }
    }
    if (sort) {
      const sortKeys = Object.keys(sort);
      if (sortKeys.length) {
        if (sortKeys.includes("updateAt")) {
          const direction = sort.updateAt;
          condition.sort.updateAt = direction === "DESCEND" ? -1 : 1;
        }
        if (sortKeys.includes("postAt")) {
          const direction = sort.postAt;
          condition.sort.postAt = direction === "DESCEND" ? -1 : 1;
        }
      }
    }
    return condition;
  }

  getArticleById({ id }, isFromAdmin) {
    const extraCondition = isFromAdmin ? {} : fixedWhere;
    return articleModel
      .find({ _id: id, ...extraCondition })
      .then((values) => values[0]);
  }

  async getArticlePrevNext({ id }) {
    const prev = articleModel
      .find({ ...fixedWhere, _id: { $lt: id } }, { _id: 1, title: 1 })
      .sort({ _id: -1 })
      .limit(1);
    const next = articleModel
      .find({ ...fixedWhere, _id: { $gt: id } }, { _id: 1, title: 1 })
      .sort({ _id: 1 })
      .limit(1);
    const result = await Promise.all([prev, next]);
    const [p, n] = result;
    return p.concat(n);
  }

  getArticlesByPage({ page, limit, where, sort }, isFromAdmin) {
    const condition = this.buildCondition(where, sort, isFromAdmin);
    return articleModel
      .paginate(condition.where, {
        select: { __v: 0 },
        lean: true,
        page,
        limit,
        sort: condition.sort,
      })
      .then((result) => {
        result.docs.forEach((doc) => {
          doc.markdown = doc.markdown
            .split("\n")
            .filter((line) => !regIsInValidMDLine.test(line))
            .slice(0, 5)
            .map((line) => "\n" + line)
            .join("\n");
        });
        return result;
      });
  }

  getArticlesBySearching({ keyword, page, limit, where, sort }, isFromAdmin) {
    const reg = new RegExp(keyword, "i");
    const condition = this.buildCondition(where, sort, isFromAdmin);
    return articleModel
      .paginate(
        {
          ...condition.where,
          $or: [
            { title: { $regex: reg } },
            { markdown: { $regex: reg } },
            { tags: { $in: [keyword] } },
          ],
        },
        {
          select: { __v: 0 },
          lean: true,
          page,
          limit,
          sort: condition.sort,
        }
      )
      .then((result) => {
        result.docs.forEach((doc) => {
          doc.markdown = doc.markdown
            .split("\n")
            .filter((line) => !regIsInValidMDLine.test(line))
            .slice(0, 5)
            .map((line) => "\n" + line)
            .join("\n");
        });
        return result;
      });
  }

  getArticleTags() {
    return articleModel.find(fixedWhere, { tags: 1, _id: 0 }).then((tags) => {
      let tagList = [];
      tags.forEach((item) => {
        tagList.push(...Array.from(new Set(item.tags)));
      });
      const tagListObj = tagList.reduce((p, n) => {
        if (p[n]) {
          p[n]++;
        } else {
          p[n] = 1;
        }
        return p;
      }, {});
      tagList = [];
      for (const [name, related] of Object.entries(tagListObj)) {
        tagList.push({ name, related });
      }
      tagList.sort((prev, next) => next.related - prev.related);
      return tagList;
    });
  }

  getHotArticles({ limit }) {
    return articleModel
      .find(fixedWhere, { _id: 1, title: 1 }, { lean: true })
      .sort({ liked: -1, views: -1 })
      .limit(limit);
  }

  getArticleArchives() {
    return articleModel
      .aggregate([
        { $match: fixedWhere },
        {
          $sort: {
            postAt: -1,
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$postAt" },
              month: { $month: "$postAt" },
            },
            docs: {
              $push: { _id: "$_id", title: "$title", postAt: "$postAt" },
            },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
      ])
      .exec();
  }

  updatePublishStatus({ id, newStatus }) {
    return articleModel.findByIdAndUpdate(
      id,
      {
        $set: { isPublished: newStatus, updateAt: new Date() },
      },
      { new: true }
    );
  }

  updateDeleteStatus({ id, newStatus }) {
    return articleModel.findByIdAndUpdate(
      id,
      {
        $set: { isDeleted: newStatus, updateAt: new Date() },
      },
      { new: true }
    );
  }

  updateArticle(arg) {
    const { id, ...rest } = arg;
    return articleModel.findByIdAndUpdate(
      id,
      {
        $set: { ...rest.data, updateAt: new Date() },
      },
      { new: true }
    );
  }

  addArticle({ data }) {
    data.postAt = new Date();
    return articleModel.insertMany([data]).then((docs) => docs[0]);
  }
}

module.exports = MongodbSource;
