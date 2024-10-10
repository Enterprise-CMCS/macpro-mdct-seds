# MDCT SEDS DynamoDB

SEDS utilizes AWS DynamoDB for its backend database. When saved, the data from SEDS is written to DynamoDB and then transferred via Kafka services to BigMac.

## Seeding Data to an Environment

All json files for seeding SEDS are in the src > database > initial_data_load folder.
As the files are no longer needed, a new folder will be created in the database folder for each
year and the old files moved there for historical retention as needed.

SEDS data is seeded to a developer's local dynamodb via the serverless.yml file in services > database.

SEDS data is seeded to the AWS environments via the serverless.yml file in services > database > handlers > seed.

When seeding data, it is important to remember that any records in a table with a matching partition key will be OVERWRITTEN as part of the update process.
Any records without a matching partition key will be inserted into the table.

## Seeding Data and Upper Environments

When new data needs to be added to the VAL or PROD environments, it can be pushed as part of the deployment using the serverless.yml file in services > data deployment.
After the deployment has successfully occurred to both VAL and PROD, it is important to then REMOVE those files from the serverless.yml file.
If the files are not removed from that yml file, they will be deployed again with the next merge and the records which the files relate to will be overwritten.

1. Prepare necessary json files for deployment
2. Add the files to services > database > handlers > seed to deploy them to AWS environments
3. Add the files to services > database > serverless.yml to deploy them locally
4. Merge to `master`
5. Merge from `master` to `val`
6. Merge from `val` to `production`
7. Create a new branch and remove the loaded files from services > database > handlers > seed to stop the new data from being overwritten in AWS environments
8. Merge to `master`
9. Merge from `master` to `val`
10. Merge from `val` to `production`

You can stop at Step 8 above but, if for any reason VAL or PROD needs to be redeployed,
the data would be overwritten as part of that redeployment process so there is some risk involved.

This process is most relevant to the form-answers and state-forms tables which house user entered data.
Most other tables contain master data which would not be impacted or impede user experience by being updated on every deployment.

## Yearly Question Updates

Each year, new questions for SEDS will be required in order for the new forms to display.
The best practice is:

1. Take the form_questions_XXXX.json file for the most recent year and copy it
2. Rename it to the new year
3. Find & Replace the most recent year with the new year
4. Add the new json file to the serverless.yml files in services > database and the handler in services > database > handlers > seed
5. Remove the load of the most recent year's form_questions_XXXX.json file (optional)
6. Archive the most recent year's form_questions_XXXX.json file (optional)

## Quarterly Answer Updates

Each federal fiscal quarter, a new set of answers will need to be created for each state/form/age range combination.
A blank template is available in form-answers-template.json in src > database > initial_data_load.

If the answer format from form-questions.rows changes, this template will need to be updated.

To use the template for a state, you simply need to change the "XX" to be the state abbreviation.
