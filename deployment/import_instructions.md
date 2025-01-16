# Import Instructions

## From `pete-sls` branch:

1. Deploy sls to get it ready for deletion with retained resources configured for import

```
./run deploy --stage <YOUR_BRANCH_NAME>
```

2. Collect information about the resources we're going to be importing into the new cdk stack.
```
cloudfront.Distribution -
cognito.UserPool -
```

3. Destroy sls

```
./run destroy --stage <YOUR_BRANCH_NAME>
```

:warning: Make sure that all sls associated stacks have been fully destroyed before proceeding.


## From `jon-cdk` branch:


1. Create just the new cdk stack without anything inside of it.

```bash
WITHOUT_IMPORTS=true ./run deploy --stage <YOUR_BRANCH_NAME>
```

2. Now import all the serverless ejected resources.

```bash
WITH_IMPORTS=true PROJECT=seds cdk import --context stage=<YOUR_BRANCH_NAME> --force
```
As this import occurs you'll have to provide the information you gathered just before destroying the serverless stacks. For the dynamo tables the default should be correct but read closely to be sure.

3. Run a deploy on that same imported resource set.

```bash
WITH_IMPORTS=true ./run deploy --stage <YOUR_BRANCH_NAME>
```

4. Run a full deploy by kicking off the full cdk deploy.

```bash
./run deploy --stage <YOUR_BRANCH_NAME>
```


5. Find the Cloudfront Url in the Github Action's logs (or in the outputs section of your Cloudformation Stack). Visit the site and confirm that you can login and use the application. :tada: Congrats, you did it!


## What if it all goes pear shaped?

### If during the middle of the migration, things begin to break and we need to reinstate the serverless stack, we need a way to bring the Cloudfront Distribution back into the newly rebuilt serverless stack. Fortunately this is possible if you follow these steps.

:grey_exclamation: These instructions are specific to reimporting a Cloudfront Distribution but the same pattern should also apply to any other imported resources that need un-importing should the need arise.

1) Get the Cloudfront Distribution unaffiliated with any Cloudformation stack. If it's already been successfully imported into the new cdk stack then you'll need to destroy the cdk stack to eject it from that stack.
```
# this assumes you're on `jon-cdk` branch
./run destroy --stage <YOUR_BRANCH_NAME>
```

2) Now you need switch to `pete-sls` branch and comment out any CloudfrontDistribution and dependent configuration.
These are the necessary changes: https://github.com/Enterprise-CMCS/macpro-mdct-seds/commit/8eb551f980a37355729dc1795f5d229987699c84

3) Deploy serverless stack (without CloudfrontDistribution) via Github Action (necessary because of permissions limitations) by pushing up changes made in the last step.

4) Now you need to import the CloudfrontDistribution to the existing ui-XXXXX stack created by the last step. First you'll need to get the existing stack's template and save it to a local file.
```
aws cloudformation get-template --stack-name ui-cmdct-4188-sls | jq '.TemplateBody' > deployment/cfn_template.json
```

5) Now open up the file you just created (deployment/cfn_template.json) and add the following Cloudfront Distribution config to it's resources section:
```json
    "CloudFrontDistribution": {
      "Type": "AWS::CloudFront::Distribution",
      "DeletionPolicy": "Retain",
      "Properties": {
          "DistributionConfig": {
              "CustomOrigin": {
                  "DNSName": "www.example.com",
                  "OriginProtocolPolicy": "http-only",
                  "OriginSSLProtocols": [
                      "TLSv1"
                  ]
              },
              "Enabled": true,
              "DefaultCacheBehavior": {
                  "CachePolicyId": "Managed-CachingDisabled",
                  "TargetOriginId": "some_target_origin_id",
                  "ViewerProtocolPolicy": "allow-all"
              }
          }
      }
    },
```

6) Now open up the AWS console and navigate to the Cloudformation console's show page for the particular ui-XXXXX stack.

7) Import the stack by doing the following:
    - Under `Stack Actions` select `Import resources into stack`
    - In the `Specify template` section choose upload a template file and upload the one we just created: `deployment/cfn_template.json`
    - In the `Identify resources` section you'll have to provide the ID of the incoming Cloudfront Distribution
    - Next and confirm until it begins the import

8) Once the import is complete, take a breath.

9) Revert the changes where you commented out the Serverless definition of Cloudfront Distribution (undo step 2).

10) Verify that the Serverless definition now contains the Cloudfront Distribution then deploy via Github Action.

11) Verify that Cloudfront Distribution is back into the stack and appropriately pointing at the application.
