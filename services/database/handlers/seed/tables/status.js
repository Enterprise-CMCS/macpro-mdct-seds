const seed = {
  name: "Status",
  filenames: ["../../../data/initial_data_load/status.json"],
  tableNameBuilder: (stage) => `${stage}-status`,
  keys: ["status"],
};

module.exports = seed;
