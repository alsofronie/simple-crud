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
  const excluded = rules.update.exclude || [];
  const autos = rules.update.auto || [];
  const transforms = rules.update.transform || [];
  let update = [];
  let params = {};

  // lets do auto
  autos.forEach(autoField => {
    const name = Object.keys(autoField)[0];
    let upd = { name, value: 'NULL' };
    const generator = autoField[name];
    if (generator && generators[generator]) {
      if (generators[generator].call && generators.generator.apply && typeof generator === 'function') {
        upd.value = generators[generator](name);
      } else {
        upd.value = generators[generator];
      }
    }

    update.push(upd);
  });

  rules.fields.filter(field => (excluded.indexOf(field) < 0 && autos.indexOf(field) < 0)).map(field => field.trim()).forEach(field => {
    if (req.body[field]) {
      let val = req.body[field];
      let upd = { name: field, value: 'NULL' };
      const transformer = findTransformer(transforms, field);
      if (transformer && transformers[transformer]) {
        let transformed = transformers[transformer](field, val);
        upd.value = transformed.value;
        if (transformed.param) {
          params[field] = transformed.param;
        }
      } else {
        upd.value = ':' + field;
        params[field] = val;
      }
      update.push(upd);
    }
  });

  const paramKey = rules.key;
  params[paramKey] = req.params.id;

  const setup = update.reduce((setup, item) => {
    setup.push(item.name + ' = ' + item.value);
    return setup;
  }, []).join(', ');


  const query = 'UPDATE ' + table + ' SET ' + setup + ' WHERE ' + rules.key + ' = :' + paramKey + ' LIMIT 1';

  db(query, params)
    .then(data => {
      res.json({
        operation: 'update',
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