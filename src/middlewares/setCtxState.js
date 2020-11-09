const { isProd } = require("../config");
module.exports = (ctx, next) => {
  if (isProd) {
    const matched = ctx.state.matchedClient;
    const type = matched && matched.type;
    if (type && type === "admin") {
      ctx.state.isFromAdmin = true;
    }
    delete ctx.state.matchedClient;
  } else {
    const header = ctx.header;
    const fromAdmin = header["from-admin"];
    ctx.state.isFromAdmin = fromAdmin && fromAdmin === "true" ? true : false;
  }
  return next();
};
