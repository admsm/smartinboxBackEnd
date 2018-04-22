var redis = require('redis');
exports.client = redis.createClient(6380,'smartinbox.redis.cache.windows.net', {auth_pass: 'S7h8jQya6sxY97LQaS5WeIcIzQ9+eNpaDfWplrn3YNM=', tls: {servername: 'smartinbox.redis.cache.windows.net'}})

