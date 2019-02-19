const db = require('./../db');
const definitions = require('./../rules');

const handler = function (req, res) {
  const table = req.params.table;
  const rules = definitions[table];

  const paramKey = rules.key;
  const params = {};
  params[paramKey] = req.params.id;

  const query = 'DELETE FROM ' + table + ' WHERE ' + rules.key + ' = :' + paramKey + ' LIMIT 1';

  db(query, params)
    .then(data => {
      res.json({
        operation: 'destroy',
        table: table,
        key: req.params.id,
        // query,
        // params,
        data
      });
    })
    .catch(err => {
      res.status(500).json({
        error: true,
        table,
        key: req.params.id,
        // query,
        // params,
        // details: err,
        message: err.message,
      });
    });
};

module.exports = handler;