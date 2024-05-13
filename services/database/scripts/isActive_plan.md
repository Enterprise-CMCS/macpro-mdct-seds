Remove the isActive feature from SEDS

1. ui-src/src/components/Users/Users.js
  - remove button
  - remove callback deactivateUser
  - remove callback activateUser
  - remove unused imports - faUserAltSlash, faUserCheck, activateDeactivateUser
2. ui-src/src/components/EditUser.js
  - remove isActive, setIsActive state
  - remove field === "isActive" block in update function
  - remove status table row in markup
  - remove getStatus function
  - remove statuses array
3. ui-src/src/additional-scss/_buttons.scss
  - remove .row-action-button styling
4. ui-src/src/libs/api.js
  - remove activateDeactivateUser function
5. app-api/serverless.yml
  - remove activateDeactivateUser function
6. app-api/handlers/users/post/activateDeactivateUser.js
  - delete file
7. app-api/handlers/users/post/createUser.js
  - remove isActive property from inserted object
8. app-api/handlers/users/post/updateUser.js
  - remove references to isActive throughout
9. services/ui-src/src/components/LocalLogin.js
  - remove isActive property from stub user
10. src/database/initial_data_load
  - remove isActive flag from test users
11. query all environments to ensure we have no """inactive""" users
  - If we do, raise issue
12. write a data migration to delete isActive key from all users