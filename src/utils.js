const regIsEmpty = /^\s*$/;

const regIsInValidMDLine = /^(?:\s*|\$\{toc\})$/i;

const regIsIncreaseViewsById = /^\/increaseViewsById\/(\w{24})$/i;

const regIsUpdateLikedById = /^\/updateLikedById\/(\w{24})\/(i|m)$/i;

module.exports = {
  regIsEmpty,
  regIsInValidMDLine,
  regIsIncreaseViewsById,
  regIsUpdateLikedById,
};
