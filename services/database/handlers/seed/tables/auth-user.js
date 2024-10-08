const seed = {
  filenames: ["../../../data/initial_data_load/auth_user.json"],
  tableNameBuilder: (stage) => `${stage}-auth-user`,
  keys: ["userId"],
};

module.exports = seed;
