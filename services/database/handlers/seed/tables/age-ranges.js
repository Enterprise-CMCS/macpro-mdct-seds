const seed = {
  name: "Age Ranges",
  filenames: ["../../../../../src/database/initial_data_load/age_ranges.json"],
  tableNameBuilder: (stage) => `${stage}-age-ranges`,
  keys: ["ageRange"],
};

module.exports = seed;