const Redis = require("ioredis");

const redisClient = new Redis();

exports.redisClient = redisClient;
