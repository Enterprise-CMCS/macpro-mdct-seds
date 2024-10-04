const seed = {
  name: "ACS 2021",
  filenames: [
    "../../../data/initial_data_load/state_forms.json",
    "../../../data/initial_data_load/state_forms_2021Q1.json",
    "../../../data/initial_data_load/state_forms_2020.json",
  ],
  tableNameBuilder: (stage) => `${stage}-state-forms`,
  keys: ["state_form"],
};

module.exports = seed;
