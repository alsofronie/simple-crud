const mysql = require('mysql2');
const config = require('./../config');

const pool = mysql.createPool({
  host: config.db.server,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: config.db.pool.max,
  queueLimit: 0
});

const builder = function (query, params) {

  return new Promise((resolve, reject) => {
    let q = '' + query;
    let p = [];
    let pa;

    Object.keys(params).forEach(name => {
      if (Array.isArray(params[name])) {
        pa = new Array(params[name].length);
        pa.fill('?', 0, params[name].length);
        p = p.concat(params[name]);
        q = q.replace(':' + name, '[' + pa.join(',') + ']');
      } else {
        q = q.replace(':' + name, '?');
        p.push(params[name]);
      }
    });

    pool.query(q, p, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = builder;
