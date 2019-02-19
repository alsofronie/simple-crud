const db = require('./../db');

const definitions = require('./../rules');
const generators = require('./../utils/generators');
const transformers = require('./../utils/transformers');

const findTransformer = (definition, name) => {
  const found = definition.find(item => !!item[name]);
  if (found) {
    return found[name];
  }
  return null;
};

const handler = function (req, res) {
  const table = req.params.table;
  const rules = definitions[table];
  const excluded = rules.create.exclude || [];
  const autos = rules.create.auto || [];
  const transforms = rules.create.transform || [];
  let insert = [];
  let values = [];
  let params = {};

  // lets do auto
  autos.forEach(autoField => {
    const name = Object.keys(autoField)[0];
    insert.push(name);
    const generator = autoField[name];
    if (generator && generators[generator]) {
      if (generators[generator].call && generators.generator.apply && typeof generator === 'function') {
        values.push(generators[generator](name));
      } else {
        values.push(generators[generator]);
      }
    } else {
      values.push('NULL');
    }
  });

  rules.fields.filter(field => (excluded.indexOf(field) < 0 && autos.indexOf(field) < 0)).forEach(field => {
    insert.push(field);
    if (!req.body[field]) {
      values.push('NULL');
    } else {
      let val = req.body[field];
      const transformer = findTransformer(transforms, field);
      if (transformer && transformers[transformer]) {
        let transformed = transformers[transformer](field, val);
        values.push(transformed.value);
        if (transformed.param) {
          params[field] = transformed.param;
        }
      } else {
        values.push(':' + field);
        params[field] = val;
      }
    }
  });

  const query = 'INSERT INTO ' + table + ' (' + insert.join(',') + ') SELECT ' + values.join(',');

  db(query, params)
    .then(data => {
      res.json({
        operation: 'create',
        table: table,
        data
      });
    })
    .catch(err => {
      res.status(500).json({
        error: true,
        table,
        query,
        message: err.message,
      });
    });
};

module.exports = handler;