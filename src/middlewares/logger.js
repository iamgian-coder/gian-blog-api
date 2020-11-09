module.exports = async (ctx, next) => {
  const start = Date.now();
  await next();
  const end = Date.now();
  console.log(
    `${ctx.ip} ${ctx.method} ${ctx.url} ${
      ctx.request.rawBody || "no-request-body"
    } ${ctx.status} ${end - start}`
  );
  // console.log(
  //   `${ctx.ip} ${ctx.method} ${ctx.url} ${ctx.status} ${end - start}`
  // );
};
