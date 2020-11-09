const { redisClient } = require("../redis");

const { regIsIncreaseViewsById } = require("../utils");

module.exports = (ctx, next) => {
  const result = ctx.url.match(regIsIncreaseViewsById);
  const header = ctx.header;
  if (result && result.length && header["user-agent"] && header["host"]) {
    redisClient.sadd("views-" + result[1], ctx.state.ip);
    ctx.status = 204;
    return;
  }
  return next();
};
