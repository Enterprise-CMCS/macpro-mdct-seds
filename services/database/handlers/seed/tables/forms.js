const seed = {
  name: "Forms",
  filenames: ["../../../../../src/database/initial_data_load/forms.json"],
  tableNameBuilder: (stage) => `${stage}-forms`,
  keys: ["form"],
};

module.exports = seed;
