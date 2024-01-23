import dynamoDb from "../../../libs/dynamodb-lib";

export const obtainUsernameBySub = async (usernameSub) => {
  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":usernameSub": data.usernameSub,
    },
    FilterExpression: "usernameSub = :usernameSub",
  };

  const result = await dynamoDb.scan(params);

  if (result.Count === 0) {
    return false;
  }

  // Return the retrieved item
  return result.Items[0];
};
