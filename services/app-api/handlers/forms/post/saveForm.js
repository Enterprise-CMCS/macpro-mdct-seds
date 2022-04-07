import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import cloneDeepWith from "lodash/cloneDeepWith";

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

  answers.sort(function (a, b) {
    return a.answer_entry > b.answer_entry ? 1 : -1;
  });

  // Loop through answers to add individually
  for (const answer in answers) {

    if (answers[answer].question.slice(-2) === "04") {
      var q4Col2Row1 = answers[answer].rows[1].col2;
      var q4Col3Row1 = answers[answer].rows[1].col3;
      var q4Col4Row1 = answers[answer].rows[1].col4;
      var q4Col5Row1 = answers[answer].rows[1].col5;
      var q4Col6Row1 = answers[answer].rows[1].col6;

      var q4Col2Row2 = answers[answer].rows[2].col2;
      var q4Col3Row2 = answers[answer].rows[2].col3;
      var q4Col4Row2 = answers[answer].rows[2].col4;
      var q4Col5Row2 = answers[answer].rows[2].col5;
      var q4Col6Row2 = answers[answer].rows[2].col6;

      var q4Col2Row3 = answers[answer].rows[3].col2;
      var q4Col3Row3 = answers[answer].rows[3].col3;
      var q4Col4Row3 = answers[answer].rows[3].col4;
      var q4Col5Row3 = answers[answer].rows[3].col5;
      var q4Col6Row3 = answers[answer].rows[3].col6;

    } else if (answers[answer].question.slice(-2) === "01") {
      var q1Col2Row1 = answers[answer].rows[1].col2;
      var q1Col3Row1 = answers[answer].rows[1].col3;
      var q1Col4Row1 = answers[answer].rows[1].col4;
      var q1Col5Row1 = answers[answer].rows[1].col5;
      var q1Col6Row1 = answers[answer].rows[1].col6;

      var q1Col2Row2 = answers[answer].rows[2].col2;
      var q1Col3Row2 = answers[answer].rows[2].col3;
      var q1Col4Row2 = answers[answer].rows[2].col4;
      var q1Col5Row2 = answers[answer].rows[2].col5;
      var q1Col6Row2 = answers[answer].rows[2].col6;

      var q1Col2Row3 = answers[answer].rows[3].col2;
      var q1Col3Row3 = answers[answer].rows[3].col3;
      var q1Col4Row3 = answers[answer].rows[3].col4;
      var q1Col5Row3 = answers[answer].rows[3].col5;
      var q1Col6Row3 = answers[answer].rows[3].col6;

    }
    else if (answers[answer].question.slice(-2) === "05") {
      answers[answer].rows[1].col2[0].answer = (q4Col2Row1 / q1Col2Row1).toFixed(1);
      answers[answer].rows[1].col3[0].answer = (q4Col3Row1 / q1Col3Row1).toFixed(1);
      answers[answer].rows[1].col4[0].answer = (q4Col4Row1 / q1Col4Row1).toFixed(1);
      answers[answer].rows[1].col5[0].answer = (q4Col5Row1 / q1Col5Row1).toFixed(1);
      answers[answer].rows[1].col6[0].answer = (q4Col6Row1 / q1Col6Row1).toFixed(1);

      answers[answer].rows[2].col2[0].answer = (q4Col2Row2 / q1Col2Row2).toFixed(1);
      answers[answer].rows[2].col3[0].answer = (q4Col3Row2 / q1Col3Row2).toFixed(1);
      answers[answer].rows[2].col4[0].answer = (q4Col4Row2 / q1Col4Row2).toFixed(1);
      answers[answer].rows[2].col5[0].answer = (q4Col5Row2 / q1Col5Row2).toFixed(1);
      answers[answer].rows[2].col6[0].answer = (q4Col6Row2 / q1Col6Row2).toFixed(1);

      answers[answer].rows[3].col2[0].answer = (q4Col2Row3 / q1Col2Row3).toFixed(1);
      answers[answer].rows[3].col3[0].answer = (q4Col3Row3 / q1Col3Row3).toFixed(1);
      answers[answer].rows[3].col4[0].answer = (q4Col4Row3 / q1Col4Row3).toFixed(1);
      answers[answer].rows[3].col5[0].answer = (q4Col5Row3 / q1Col5Row3).toFixed(1);
      answers[answer].rows[3].col6[0].answer = (q4Col6Row3 / q1Col6Row3).toFixed(1);

    }
    // Extract question number
    const questionNumber = answers[answer].question.split("-")[2];

    // Create answer_entry id from question info
    const answerEntry =
      answers[answer].state_form +
      "-" +
      answers[answer].rangeId +
      "-" +
      questionNumber;

    //replace null values with 0
    const rowsWithZeroWhereBlank = cloneDeepWith(answers[answer].rows, (value) => {
      if(value === null) {
        return 0;
      }
    });

    // Params for updating questions
    const questionParams = {
      TableName: process.env.FormAnswersTableName,
      Key: {
        answer_entry: answerEntry,
      },
      UpdateExpression:
        "SET #r = :rows, last_modified_by = :last_modified_by, last_modified = :last_modified",
      ExpressionAttributeValues: {
        ":rows": rowsWithZeroWhereBlank,
        ":last_modified_by": data.username,
        ":last_modified": new Date().toISOString(),
      },
      ExpressionAttributeNames: {
        "#r": "rows",
      },

      ReturnValues: "ALL_NEW",
    };

    try {
      const dbResult = await dynamoDb.update(questionParams);
      questionResult.push(dbResult);
    } catch (e) {
      throw("Question params update failed", e);
    }

  }

  // Params for updating for statusData;
  const formParams = {
    TableName:
      process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName,
    Key: {
      state_form: answers[0].state_form,
    },
    UpdateExpression:
      "SET last_modified_by = :last_modified_by, last_modified = :last_modified, status_modified_by = :status_modified_by, status_date = :status_date, status_id = :status_id, #s = :status, not_applicable = :not_applicable, state_comments = :state_comments",
    ExpressionAttributeValues: {
      ":last_modified_by": statusData.last_modified_by,
      ":last_modified": statusData.last_modified,
      ":status_modified_by": statusData.status_modified_by,
      ":status_date": statusData.status_date,
      ":status": statusData.status,
      ":status_id": statusData.status_id,
      ":not_applicable": statusData.not_applicable,
      ":state_comments": statusData.state_comments,
    },
    ExpressionAttributeNames: {
      "#s": "status",
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    await dynamoDb.update(formParams);
  } catch (e) {
    throw("Form params update failed", e);
  }

  if (questionResult.Count === 0) {
    throw new Error("Form save query failed");
  }

  return questionResult;
});
