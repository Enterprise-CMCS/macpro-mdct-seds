# Import Instructions

## From `pete-sls` branch:

1. Deploy sls to get it ready for deletion with retained resources configured for import

```
./run deploy --stage master
```

2. Destroy sls

```
./run destroy --stage master
```

## From `jon-cdk` branch:

1. Comment out Cloudfront Distribution definition and dependent resources

```
# ONLY RUN ONCE YOU COMMENTED THEM OUT
./run deploy --stage master
```

2. Restore Cloudfront Distribution definition in the simplified version (there are 2)

```
PROJECT=seds cdk import --context stage=master --force
```

3. Answer questions as you import to make sure you get the SLS UI stack's retained Cloudfront Distribution

4. Run a cdk deploy

```
./run deploy --stage master
```

5. Comment out the simplified version of Cloudfront Distribution definition. Restore the complicated Cloudfront Distribution definition and dependent resources

6. Run a cdk deploy again

```
./run deploy --stage master
```

## What if it all goes pear shaped?

### If during the middle of the migration, things begin to break and we need to reinstate the serverless stack, we need a way to bring the Cloudfront Distribution back into the newly rebuilt serverless stack. Fortunately this is possible if you follow these steps.

1) Get the Cloudfront Distribution unaffiliated with any Cloudformation stack. If it's already been successfully imported into the new cdk stack then you'll need to destroy the cdk stack to eject it from that stack.
```
# this assumes you're on `jon-cdk` branch
./run destroy --stage master
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
