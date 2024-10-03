const seed = {
  name: "Form QUestions",
  filenames: [
    "../../../../../src/database/initial_data_load/form_questions_2021.json",
    "../../../../../src/database/initial_data_load/form_questions_2020.json",
  ],
  tableNameBuilder: (stage) => `${stage}-form-questions`,
  keys: ["question"],
};

module.exports = seed;
