const seed = {
  name: "Form Templates",
  filenames: [
    "../../../../../src/database/initial_data_load/form_template_2019.json",
    "../../../../../src/database/initial_data_load/form_template_2020.json",
    "../../../../../src/database/initial_data_load/form_template_2021.json",
  ],
  tableNameBuilder: (stage) => `${stage}-form-templates`,
  keys: ["year"],
};

module.exports = seed;
