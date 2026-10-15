PROJECT=seds

FormAnswersTable=local-form-answers
FormQuestionsTable=local-form-questions
FormTemplatesTable=local-form-templates
StateFormsTable=local-state-forms
AuthUserTable=local-auth-user
# Note if you are running locally without access to the op vault, just create your own local password via the .env
LOCAL_COGNITO_PASSWORD=op://mdct_devs/seds_secrets/TEST_STATE_USER_PASSWORD # pragma: allowlist secret
MDCT_STACKPORT=1
