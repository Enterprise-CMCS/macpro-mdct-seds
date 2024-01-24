import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { getUserCredentialsFromJwt } from "../../../libs/authorization";

export const main = handler(async (event, context) => {
  // verify whether there is a user logged in
  const currentUser = await getUserCredentialsFromJwt(event);
  if (!currentUser) {
    throw new Error("No authorized user.");
  }

  const params = {
    TableName: process.env.FormsTableName,
    Select: "ALL_ATTRIBUTES",
  };

  const result = await dynamoDb.scan(params);

  return result.Items;
});
