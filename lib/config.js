require('dotenv').load();

module.exports = {
  api: {
    port: process.env.APP_PORT || 8080,
    prefix: process.env.APP_PREFIX || '/'
  },
  db: {
    server: process.env.DB_SERVER || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_DATABASE || 'test',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    pool: {
      min: process.env.DB_POOL_MIN || 1,
      max: process.env.DB_POOL_MAX || 5
    }
  }
};
