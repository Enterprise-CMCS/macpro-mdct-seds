const seed = {
  name: "Auth User Roles",
  filenames: [
    "../../../../../src/database/initial_data_load/auth_user_roles.json",
  ],
  tableNameBuilder: (stage) => `${stage}-auth-user-roles`,
  keys: ["userId"],
};

module.exports = seed;
