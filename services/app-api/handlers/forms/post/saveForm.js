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
  const statusData = data.statusData;
  let questionResult = [];

  // Loop through answers to add individually
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

    // Params for updating questions
    const questionParams = {
      TableName: process.env.FormAnswersTableName,
      Key: {
        answer_entry: answerEntry,
      },
      UpdateExpression:
        "SET #r = :rows, last_modified_by = :last_modified_by, last_modified = :last_modified",
      ExpressionAttributeValues: {
        ":rows": answers[answer].rows,
        ":last_modified_by": data.username,
        ":last_modified": new Date().toISOString(),
      },
      ExpressionAttributeNames: {
        "#r": "rows",
      },

      ReturnValues: "ALL_NEW",
    };

    questionResult.push(await dynamoDb.update(questionParams));
  }

  // Params for updating for statusData;
  const formParams = {
    TableName:
      process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName,
    Key: {
      state_form: answers[0].state_form,
    },
    UpdateExpression:
      "SET last_modified_by = :last_modified_by, last_modified = :last_modified, status_modified_by = :status_modified_by, status_date = :status_date, status_id = :status_id, #s = :status, not_applicable = :not_applicable",
    ExpressionAttributeValues: {
      ":last_modified_by": statusData.last_modified_by,
      ":last_modified": statusData.last_modified,
      ":status_modified_by": statusData.status_modified_by,
      ":status_date": statusData.status_date,
      ":status": statusData.status,
      ":status_id": statusData.status_id,
      ":not_applicable": statusData.not_applicable,
    },
    ExpressionAttributeNames: {
      "#s": "status",
    },
    ReturnValues: "ALL_NEW",
  };
  const formResult = await dynamoDb.update(formParams);

  if (questionResult.Count === 0 || !formResult) {
    throw new Error("Form save query failed");
  }

  return questionResult;
});
