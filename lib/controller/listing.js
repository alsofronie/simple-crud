const db = require('./../db');
const definitions = require('./../rules');

const handler = function (req, res) {
  let queryParams = {};
  const table = req.params.table;
  const rules = definitions[table];
  const excluded = rules.listing.exclude || [];
  let fields = rules.fields.filter(field => {
    return excluded.indexOf(field) < 0;
  });
  let where = [];
  let order = [];

  let limit = '';

  Object.keys(req.query).forEach(name => {
    if (name === '_get') {
      fields = req.query._get;
    } else if (name === '_sort') {
      const matches = req.query._sort.split(',').filter(n => n.trim());
      console.info('matches', matches);
      matches.forEach(field => {
        if (field.substr(0, 1) === '-') {
          let f = field.substr(1);
          if (excluded.indexOf(f) < 0 && rules.fields.indexOf(f) >= 0) {
            order.push(f + ' DESC');
          }
        } else {
          let f = (field.substr(0, 1) === '+' ? field.substr(1) : field);
          if (excluded.indexOf(f) < 0 && rules.fields.indexOf(f) >= 0) {
            order.push(f + ' ASC');
          }
        }
      });
    } else if (name === '_limit') {
      let l = req.query._limit.split(',').filter(l => parseInt(l));
      if (l.length === 2) {
        limit = ' LIMIT ' + l[0] + ',' + l[1];
      } else if (l.length === 1) {
        limit = ' LIMIT 0,' + l[0];
      }
    } else {
      if (excluded.indexOf(name) < 0 && rules.fields.indexOf(name) >= 0) {
        let whereField = 'where_' + name;
        where.push(name + '= :' + whereField);
        queryParams[whereField] = req.query[name];
      }
    }
  });

  if (where.length > 0) {
    where = ' WHERE ' + where.join(' AND ');
  }

  if (order.length > 0) {
    order = ' ORDER BY ' + order.join(', ');
  }

  const query = 'SELECT ' + fields + ' FROM ' + table + where + order + limit;

  db(query, queryParams)
    .then(data => {
      res.json({
        operation: 'read',
        table: table,
        data
      });
    })
    .catch(err => {
      res.status(500).json({
        error: true,
        operation: 'read',
        table,
        message: err.message,
      });
    });
};

module.exports = handler;