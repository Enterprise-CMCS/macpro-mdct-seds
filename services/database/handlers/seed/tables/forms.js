const seed = {
  filenames: ["../../../data/initial_data_load/forms.json"],
  tableNameBuilder: (stage) => `${stage}-forms`,
  keys: ["form"],
};

module.exports = seed;
