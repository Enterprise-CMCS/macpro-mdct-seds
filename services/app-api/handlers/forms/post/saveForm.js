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

  ////////////////////CODE TO BE DELETED BELOW/////////////////////////////

  const recursiveScanItems = [];
  const recursiveScan = async (params) => {
    // Get initial scan (up to 1MB)
    const result = await dynamoDb.scan(params);

    // Add current results to return array
    recursiveScanItems.push(...result.Items);

    // If LastEvaluatedKey has a value, recursively call the function with
    // the ExclusiveStartKey set to the last record that was read
    if (result.LastEvaluatedKey !== undefined) {
      params.ExclusiveStartKey = result.LastEvaluatedKey;
      return await recursiveScan(params);
    }

    return recursiveScanItems;
  };
  const params = {
    TableName: process.env.FormAnswersTableName,
  };
  await recursiveScan(params);
  recursiveScanItems.sort(function (a, b) {
    return a.answer_entry > b.answer_entry ? 1 : -1;
  });

  for (const answer in recursiveScanItems) {

    if (recursiveScanItems[answer].question.slice(-2) === "04") {
      var tq4Col2Row1 = recursiveScanItems[answer].rows[1].col2;
      var tq4Col3Row1 = recursiveScanItems[answer].rows[1].col3;
      var tq4Col4Row1 = recursiveScanItems[answer].rows[1].col4;
      var tq4Col5Row1 = recursiveScanItems[answer].rows[1].col5;
      var tq4Col6Row1 = recursiveScanItems[answer].rows[1].col6;

      var tq4Col2Row2 = recursiveScanItems[answer].rows[2].col2;
      var tq4Col3Row2 = recursiveScanItems[answer].rows[2].col3;
      var tq4Col4Row2 = recursiveScanItems[answer].rows[2].col4;
      var tq4Col5Row2 = recursiveScanItems[answer].rows[2].col5;
      var tq4Col6Row2 = recursiveScanItems[answer].rows[2].col6;

      var tq4Col2Row3 = recursiveScanItems[answer].rows[3].col2;
      var tq4Col3Row3 = recursiveScanItems[answer].rows[3].col3;
      var tq4Col4Row3 = recursiveScanItems[answer].rows[3].col4;
      var tq4Col5Row3 = recursiveScanItems[answer].rows[3].col5;
      var tq4Col6Row3 = recursiveScanItems[answer].rows[3].col6;

    } else if (recursiveScanItems[answer].question.slice(-2) === "01") {
      var tq1Col2Row1 = recursiveScanItems[answer].rows[1].col2;
      var tq1Col3Row1 = recursiveScanItems[answer].rows[1].col3;
      var tq1Col4Row1 = recursiveScanItems[answer].rows[1].col4;
      var tq1Col5Row1 = recursiveScanItems[answer].rows[1].col5;
      var tq1Col6Row1 = recursiveScanItems[answer].rows[1].col6;

      var tq1Col2Row2 = recursiveScanItems[answer].rows[2].col2;
      var tq1Col3Row2 = recursiveScanItems[answer].rows[2].col3;
      var tq1Col4Row2 = recursiveScanItems[answer].rows[2].col4;
      var tq1Col5Row2 = recursiveScanItems[answer].rows[2].col5;
      var tq1Col6Row2 = recursiveScanItems[answer].rows[2].col6;

      var tq1Col2Row3 = recursiveScanItems[answer].rows[3].col2;
      var tq1Col3Row3 = recursiveScanItems[answer].rows[3].col3;
      var tq1Col4Row3 = recursiveScanItems[answer].rows[3].col4;
      var tq1Col5Row3 = recursiveScanItems[answer].rows[3].col5;
      var tq1Col6Row3 = recursiveScanItems[answer].rows[3].col6;

    }
    else if (recursiveScanItems[answer].question.slice(-2) === "05") {
      recursiveScanItems[answer].rows[1].col2[0].answer = (tq4Col2Row1 / tq1Col2Row1).toFixed(1);
      recursiveScanItems[answer].rows[1].col3[0].answer = (tq4Col3Row1 / tq1Col3Row1).toFixed(1);
      recursiveScanItems[answer].rows[1].col4[0].answer = (tq4Col4Row1 / tq1Col4Row1).toFixed(1);
      recursiveScanItems[answer].rows[1].col5[0].answer = (tq4Col5Row1 / tq1Col5Row1).toFixed(1);
      recursiveScanItems[answer].rows[1].col6[0].answer = (tq4Col6Row1 / tq1Col6Row1).toFixed(1);

      recursiveScanItems[answer].rows[2].col2[0].answer = (tq4Col2Row2 / tq1Col2Row2).toFixed(1);
      recursiveScanItems[answer].rows[2].col3[0].answer = (tq4Col3Row2 / tq1Col3Row2).toFixed(1);
      recursiveScanItems[answer].rows[2].col4[0].answer = (tq4Col4Row2 / tq1Col4Row2).toFixed(1);
      recursiveScanItems[answer].rows[2].col5[0].answer = (tq4Col5Row2 / tq1Col5Row2).toFixed(1);
      recursiveScanItems[answer].rows[2].col6[0].answer = (tq4Col6Row2 / tq1Col6Row2).toFixed(1);

      recursiveScanItems[answer].rows[3].col2[0].answer = (tq4Col2Row3 / tq1Col2Row3).toFixed(1);
      recursiveScanItems[answer].rows[3].col3[0].answer = (tq4Col3Row3 / tq1Col3Row3).toFixed(1);
      recursiveScanItems[answer].rows[3].col4[0].answer = (tq4Col4Row3 / tq1Col4Row3).toFixed(1);
      recursiveScanItems[answer].rows[3].col5[0].answer = (tq4Col5Row3 / tq1Col5Row3).toFixed(1);
      recursiveScanItems[answer].rows[3].col6[0].answer = (tq4Col6Row3 / tq1Col6Row3).toFixed(1);

    }
    // Params for updating questions
    const questionParams = {
      TableName: process.env.FormAnswersTableName,
      Key: {
        answer_entry: recursiveScanItems[answer].answer_entry,
      },
      UpdateExpression:
        "SET #r = :rows, last_modified_by = :last_modified_by, last_modified = :last_modified",
      ExpressionAttributeValues: {
        ":rows": recursiveScanItems[answer].rows,
        ":last_modified_by": recursiveScanItems[answer].last_modified_by,
        ":last_modified": new Date().toISOString(),
      },
      ExpressionAttributeNames: {
        "#r": "rows",
      },

      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(questionParams);
  }


  //////////////////CODE TO BE DELETED ABOVE/////////////////////////////


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
  const formResult = await dynamoDb.update(formParams);

  if (questionResult.Count === 0 || !formResult) {
    throw new Error("Form save query failed");
  }

  return questionResult;
});
