// Set a timer to update the views per 5 min
(() => {
  const interval = 1000 * 60 * 5;

  const { redisClient } = require("../redis");

  const { articleModel } = require("../mongooseModel");

  const makeUpdatePromiseArray = (keys = []) => {
    return keys
      .map((key) => [key, key.split("views-")[1]])
      .map(([key, id]) =>
        redisClient
          .scard(key)
          .then((count) =>
            articleModel.findByIdAndUpdate(id, {
              $inc: { views: count },
            })
          )
          .catch((err) => console.log(err))
      );
  };

  const updateTheViews = () => {
    redisClient
      .keys("views-*")
      .then((keys) => {
        Promise.all(makeUpdatePromiseArray(keys)).then(() => {
          if (keys && keys.length) {
            redisClient.del(keys, () => {
              setTimeout(updateTheViews, interval);
            });
          } else {
            setTimeout(updateTheViews, interval);
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  updateTheViews();
})();
