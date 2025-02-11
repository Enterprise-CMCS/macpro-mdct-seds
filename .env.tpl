LOCAL_LOGIN=true
LOCAL_PLACEHOLDER_ARN=arn:aws:dynamodb:region:XXXXXX:stream/foobar
IAM_PATH=/
IAM_PERMISSIONS_BOUNDARY="bound"
INFRASTRUCTURE_TYPE="development"
LOCAL_DEFAULT_STRING=""

FORM_ANSWERS_TABLE=local-form-answers
FORM_QUESTIONS_TABLE=local-form-questions
FORM_TEMPLATES_TABLE=local-form-templates
FORMS_TABLE=local-forms
STATE_FORMS_TABLE=local-state-forms
STATES_TABLE=local-states
AUTH_USER_TABLE=local-auth-user

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
