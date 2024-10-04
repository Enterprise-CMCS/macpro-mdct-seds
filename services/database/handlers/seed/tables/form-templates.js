const seed = {
  name: "Form Templates",
  filenames: [
    "../../../data/initial_data_load/form_template_2019.json",
    "../../../data/initial_data_load/form_template_2020.json",
    "../../../data/initial_data_load/form_template_2021.json",
  ],
  tableNameBuilder: (stage) => `${stage}-form-templates`,
  keys: ["year"],
};

module.exports = seed;
