# Import Instructions

From `pete-sls` branch:

1. deploy sls to get it ready for deletion with retained resources configured for import

```
./run deploy --stage master
```

2. destroy sls

```
./run destroy --stage master
```

From `jon-cdk` branch:

1. comment out Cloudfront Distribution definition and dependent resources

```
# ONCE YOU COMMENTED THEM OUT
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
