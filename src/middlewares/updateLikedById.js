const { redisClient } = require("../redis");

const { regIsUpdateLikedById } = require("../utils");

module.exports = (ctx, next) => {
  const result = ctx.url.match(regIsUpdateLikedById);
  const header = ctx.header;
  if (result && result.length && header["user-agent"] && header["host"]) {
    const key = `liked-${result[1]}`;
    const type = result[2];
    switch (type) {
      case "i": {
        redisClient.hincrby(key, "i", 1);
        break;
      }
      case "m": {
        redisClient.hincrby(key, "m", -1);
        break;
      }
      default:
        break;
    }
    ctx.status = 204;
    return;
  }
  return next();
};
