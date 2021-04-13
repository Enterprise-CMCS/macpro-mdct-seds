import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

/**
 * This handler will loop through a question array and save each row
 */

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  const data = JSON.parse(event.body);
  const answers = data.formAnswers;
  let result = [];

  for (const answer in answers) {
    // Extract question number
    const questionNumber = answers[answer].question.split("-")[2];

    // Create answer_entry id from question info
    const answerEntry =
      answers[answer].state_form +
      "-" +
      answers[answer].rangeId +
      "-" +
      questionNumber;

    console.log("\n\n\n\n zzzAnswerEntry", answerEntry);
    const params = {
      TableName: process.env.FormAnswersTableName,
      Key: {
        answer_entry: answerEntry,
      },
      UpdateExpression: "SET #r = :rows",
      ExpressionAttributeValues: {
        ":rows": answers[answer].rows,
      },
      ExpressionAttributeNames: {
        "#r": "rows",
      },

      ReturnValues: "ALL_NEW",
    };

    result.push(await dynamoDb.update(params));
  }

  if (result.Count === 0) {
    throw new Error("Form type query failed");
  }

  return result;
});
