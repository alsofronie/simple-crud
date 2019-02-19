const db = require('./../db');
const definitions = require('./../rules');

const handler = function (req, res) {
  const table = req.params.table;
  const rules = definitions[table];
  const excluded = rules.read.exclude || [];
  let fields = rules.fields.filter(field => {
    return excluded.indexOf(field) < 0;
  });

  db('SELECT ' + fields + ' FROM ' + table + ' WHERE ' + rules.key + ' = :id LIMIT 1', { id: req.params.id })
    .then(rows => {
      if (rows.length === 1) {
        res.json({
          operation: 'read',
          table,
          data: rows[0]
        });
      } else {
        res.status(404).json({
          error: true,
          operation: 'read',
          table,
          key: req.params.id,
          message: 'not found'
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        error: true,
        operation: 'read',
        table,
        key: req.params.id,
        message: err.message,
      });
    });
};

module.exports = handler;