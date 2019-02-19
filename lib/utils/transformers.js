module.exports = {
  password: (name, value) => ({
    value: 'PASSWORD(:' + name + ')',
    param: value,
  }),
};
