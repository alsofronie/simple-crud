const path = require('path');
const fs = require('fs');

const normalized = path.join(__dirname, '..', '..', 'app', 'rules');
const rules = fs.readdirSync(normalized).reduce((rules, file) => {
  if (file.substr(0, 1) !== '.' && file.indexOf('example') < 0) {
    const rule = require(path.join(normalized, file));
    if (rule.name) {
      rules[rule.name] = rule;
    }
  }
  return rules;
}, {});

module.exports = rules;
