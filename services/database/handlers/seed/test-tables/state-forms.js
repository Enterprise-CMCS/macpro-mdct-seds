const seed = {
  name: "ACS 2021",
  filenames: [
    "../../../../../src/database/initial_data_load/state_forms.json",
    "../../../../../src/database/initial_data_load/state_forms_2021Q1.json",
    "../../../../../src/database/initial_data_load/state_forms_2020.json",
  ],
  tableNameBuilder: (stage) => `${stage}-state-forms`,
  keys: ["state_form"],
};

module.exports = seed;
