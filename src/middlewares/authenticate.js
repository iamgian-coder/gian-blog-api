const crypto = require("crypto");

const { clients } = require("../config");

module.exports = (ctx, next) => {
  const header = ctx.header;

  if (!header["stamp"]) {
    ctx.status = 400;
    return;
  }
  const stamp = Number(header["stamp"]);

  if (Date.now() - stamp >= 1000 * 30) {
    ctx.status = 400;
    return;
  }

  if (!header["id"]) {
    ctx.status = 400;
    return;
  }
  const id = header["id"];

  let matched = clients.filter((c) => c.id === id);
  if (!matched.length) {
    ctx.status = 400;
    return;
  }
  matched = matched[0];
  ctx.state.matchedClient = matched;

  if (!header["nonce"]) {
    ctx.status = 400;
    return;
  }
  const nonce = header["nonce"];

  if (!header["sign"]) {
    ctx.status = 400;
    return;
  }
  const csign = header["sign"];

  const hmac = crypto.createHmac("sha256", matched.secret);
  hmac.update(`${nonce}${id}${stamp}`);
  if (hmac.digest("hex") !== csign) {
    ctx.status = 400;
    return;
  }

  return next();
};
