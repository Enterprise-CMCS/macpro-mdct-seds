# Instructions for running it

pipx install awscli-local

1st terminal tab
SERVICES=cloudformation,serverless,sqs,ssm,secretsmanager localstack start

for some reason you must do this under ks

2nd terminal tab
./run prelocal && cdklocal bootstrap && ./run deploy-prerequisites && ./run deploy --stage cmdct-4318 && ./run postlocal --stage cmdct-4318
./run local --stage cmdct-4318

### not relevant but apparently this sort of thing is possible

awslocal sns list-topics
