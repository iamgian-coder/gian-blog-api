// Set a timer to update the liked per 5 min
(() => {
  const interval = 1000 * 60 * 5;

  const { redisClient } = require("../redis");

  const { articleModel } = require("../mongooseModel");

  const makeUpdatePromiseArray = (keys = []) => {
    return keys
      .map((key) => [key, key.split("liked-")[1]])
      .map(([key, id]) =>
        redisClient
          .hmget(key, "i", "m")
          .then(([i, m]) =>
            articleModel.findByIdAndUpdate(id, {
              $inc: { liked: Number(i) + Number(m) },
            })
          )
          .catch((err) => console.log(err))
      );
  };

  const updateTheLiked = () => {
    redisClient
      .keys("liked-*")
      .then((keys) => {
        Promise.all(makeUpdatePromiseArray(keys)).then(() => {
          if (keys && keys.length) {
            redisClient.del(keys, () => {
              setTimeout(updateTheLiked, interval);
            });
          } else {
            setTimeout(updateTheLiked, interval);
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  updateTheLiked();
})();
