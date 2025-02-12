LOCAL_LOGIN=true
LOCAL_PLACEHOLDER_ARN=arn:aws:dynamodb:region:XXXXXX:stream/foobar
IAM_PATH=/
IAM_PERMISSIONS_BOUNDARY="bound"
INFRASTRUCTURE_TYPE="development"
LOCAL_DEFAULT_STRING=""

FormAnswersTable=local-form-answers
FormQuestionsTable=local-form-questions
FormTemplatesTable=local-form-templates
FormsTable=local-forms
StateFormsTable=local-state-forms
StatesTable=local-states
AuthUserTable=local-auth-user

DYNAMODB_URL=http://host.docker.internal:8000
API_URL=http://localhost:3030/local
API_REGION=op://mdct_devs/seds_secrets/AWS-DEFAULT-REGION
COGNITO_REGION=op://mdct_devs/seds_secrets/AWS-DEFAULT-REGION
COGNITO_IDENTITY_POOL_ID=op://mdct_devs/seds_secrets/COGNITO_IDENTITY_POOL_ID
COGNITO_USER_POOL_ID=op://mdct_devs/seds_secrets/COGNITO_USER_POOL_ID
COGNITO_USER_POOL_CLIENT_ID=op://mdct_devs/seds_secrets/COGNITO_USER_POOL_CLIENT_ID
COGNITO_USER_POOL_CLIENT_DOMAIN=placeholder
COGNITO_REDIRECT_SIGNIN=http://localhost:3000/
COGNITO_REDIRECT_SIGNOUT=http://localhost:3000/

SERVERLESS_LICENSE_KEY=op://mdct_devs/seds_secrets/SERVERLESS_LICENSE_KEY
