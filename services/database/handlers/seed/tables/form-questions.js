const seed = {
  name: "Form QUestions",
  filenames: [
    "../../../data/initial_data_load/form_questions_2021.json",
    "../../../data/initial_data_load/form_questions_2020.json",
  ],
  tableNameBuilder: (stage) => `${stage}-form-questions`,
  keys: ["question"],
};

module.exports = seed;
