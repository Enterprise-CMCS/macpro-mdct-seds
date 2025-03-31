# MDCT SEDS DynamoDB

SEDS utilizes AWS DynamoDB for its backend database. When saved, the data from SEDS is written to DynamoDB and then transferred via Kafka services to BigMac.

## Seeding Data to an Environment

All json files for seeding SEDS are in the src > database > initial_data_load folder.
As the files are no longer needed, a new folder will be created in the database folder for each
year and the old files moved there for historical retention as needed.

SEDS data is seeded to a developer's local + AWS environments dynamodb via the deployment/stacks/data.ts file.

When seeding data, it is important to remember that any records in a table with a matching partition key will be OVERWRITTEN as part of the update process.
Any records without a matching partition key will be inserted into the table.

## Seeding Data and Upper Environments

When new data needs to be added to the VAL or PROD environments, it can be pushed as part of the deployment using the deployment/stacks/data.ts file.

Seeding data will only occur for `isDev` environments; never for master, val, or production. However, because of the way the cdk is setup it will only happen on environment creation, not on updates to the custom resource that seeds the data.

This process is most relevant to the form-answers and state-forms tables which house user entered data.
Most other tables contain master data which would not be impacted or impede user experience by being updated on every deployment.

## Yearly Question Updates

This does not happen often. If it is needed write a script to update the dynamo records and run it in each environment.

## Quarterly Answer Updates

This does not happen often. If it is needed write a script to update the dynamo records and run it in each environment.
