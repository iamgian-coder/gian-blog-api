const { regIsIncreaseViewsById, regIsUpdateLikedById } = require("../utils");

const availableApiPaths = [
  /^\/$/,
  regIsIncreaseViewsById,
  regIsUpdateLikedById,
];

const availableMethods = [/post/i];

const fnIsValidApiPath = (url) => {
  return availableApiPaths.some((apipath) => apipath.test(url));
};

const fnIsValidMethod = (method) => {
  return availableMethods.some((_) => _.test(method));
};

module.exports = (ctx, next) => {
  const { method, url } = ctx;
  if (!fnIsValidMethod(method)) {
    ctx.status = 400;
    return;
  }
  if (fnIsValidApiPath(url)) {
    return next();
  }
  ctx.status = 400;
  return;
};
