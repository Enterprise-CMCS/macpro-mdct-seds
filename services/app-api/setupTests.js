import { formTypes } from "./handlers/shared/constants";

process.env.STAGE = "local";

process.env.AuthUserTable = "local-auth-user";
process.env.FormAnswersTable = "local-form-answers";
process.env.FormQuestionsTable = "local-form-questions";
process.env.FormsTable = formTypes;
process.env.FormTemplatesTable = "local-form-templates";
process.env.StateFormsTable = "local-state-forms";
process.env.StatesTable = "local-states";

process.env.brokerString = "broker1,broker2";
process.env.KAFKA_CLIENT_ID = "seds-local";
