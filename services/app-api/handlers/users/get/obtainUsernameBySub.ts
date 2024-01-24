import { DocumentClient } from "aws-sdk/clients/dynamodb";
import dynamoDb from "../../../libs/dynamodb-lib";

/**
 * @param usernameSub - This is the userpool user id from cognito
 */
export const obtainUsernameBySub = async (usernameSub: string): Promise<DocumentClient.AttributeMap | undefined> => {
  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":usernameSub": usernameSub,
    },
    FilterExpression: "usernameSub = :usernameSub",
  };

  const result = await dynamoDb.scan(params);

  return result.Items?.[0];
};
