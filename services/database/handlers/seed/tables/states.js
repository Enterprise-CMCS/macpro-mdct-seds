const seed = {
  name: "States",
  filenames: ["../../../../../src/database/initial_data_load/states.json"],
  tableNameBuilder: (stage) => `${stage}-states`,
  keys: ["state_id"],
};

module.exports = seed;
