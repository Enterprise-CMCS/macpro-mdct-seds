# Master to Main Transition Instructions

## From `main` branch:

```sh
# deploy with master as stage and imports included as variant
IMPORT_VARIANT=imports_included ./run deploy --stage master

# figure out what is needed for the import! and note all the ids!!!!!

# destroy master
./run destroy --stage master
```

### Collect retained resource value ids:

cloudfront distribution id -
user pool id -

### Use PITR to make correctly named tables which we import with other stuff

`master-form-answers` -> `main-form-answers`
`master-form-questions` -> `main-form-questions`
`master-form-templates` -> `main-form-templates`
`master-forms` -> `main-forms`
`master-state-forms` -> `main-state-forms`
`master-states` -> `main-states`
`master-auth-user` -> `main-auth-user`

Manually turn on new and old image streaming for each restored table.

### Copy secret for `seds-master` to `seds-main`

add 2 new secret values inside `seds-main`

- kafkaClientId: `seds-master`
- userPoolName: `master-user-pool`

### Remove if statement in setBranchName to changes main to master

```sh
IMPORT_VARIANT=empty ./run deploy --stage main
IMPORT_VARIANT=imports_included PROJECT=seds cdk import --context stage=main --force
IMPORT_VARIANT=imports_included ./run deploy --stage main
./run deploy --stage main
```

### Commit the getBranchName change and push to main

### TEST APP!

### Tidy up

- remove `seds-master` secret
- update the cognito secrets in the 1password for seds_secrets
- clean out isDev's definition
- remove reference to master in `deployment-config.ts`
- update readmes and scripts to use stage as main
