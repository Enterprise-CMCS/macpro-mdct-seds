import handler from "../../../libs/handler-lib.js";
import dynamoDb from "../../../libs/dynamodb-lib.js";
import { authorizeUserForState } from "../../../auth/authConditions.js";
import { getCurrentUserInfo } from "../../../auth/cognito-auth.js";
import { statusHasChanged } from "../../../libs/formStatus.js";

/**
 * This handler will loop through a question array and save each row
 */

export const main = handler(async (event, context) => {
  const data = JSON.parse(event.body);

  for (let stateId of stateIdsPresentInForm(data.formAnswers)) {
    await authorizeUserForState(event, stateId);
  }

  const user = (await getCurrentUserInfo(event)).data;
  const answers = data.formAnswers;
  const statusData = data.statusData;
  const stateFormId = answers[0].state_form;

  if (user.role === "state") {
    await updateAnswers(answers, user);
  }
  await updateStateForm(stateFormId, statusData, user);
});

// TODO this seems a bit fragile. We should make stateId part of the payload, or, ideally, the path.
const stateIdsPresentInForm = (answers) => {
  const foundStateIds = new Set();
  for (let answer of answers) {
    foundStateIds.add(answer.state_form.substring(0, 2));
  }
  return foundStateIds;
};

const updateAnswers = async (answers, user) => {
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
    } else if (answers[answer].question.slice(-2) === "05") {
      answers[answer].rows[1].col2[0].answer = (
        q4Col2Row1 / q1Col2Row1
      ).toFixed(1);
      answers[answer].rows[1].col3[0].answer = (
        q4Col3Row1 / q1Col3Row1
      ).toFixed(1);
      answers[answer].rows[1].col4[0].answer = (
        q4Col4Row1 / q1Col4Row1
      ).toFixed(1);
      answers[answer].rows[1].col5[0].answer = (
        q4Col5Row1 / q1Col5Row1
      ).toFixed(1);
      answers[answer].rows[1].col6[0].answer = (
        q4Col6Row1 / q1Col6Row1
      ).toFixed(1);

      answers[answer].rows[2].col2[0].answer = (
        q4Col2Row2 / q1Col2Row2
      ).toFixed(1);
      answers[answer].rows[2].col3[0].answer = (
        q4Col3Row2 / q1Col3Row2
      ).toFixed(1);
      answers[answer].rows[2].col4[0].answer = (
        q4Col4Row2 / q1Col4Row2
      ).toFixed(1);
      answers[answer].rows[2].col5[0].answer = (
        q4Col5Row2 / q1Col5Row2
      ).toFixed(1);
      answers[answer].rows[2].col6[0].answer = (
        q4Col6Row2 / q1Col6Row2
      ).toFixed(1);

      answers[answer].rows[3].col2[0].answer = (
        q4Col2Row3 / q1Col2Row3
      ).toFixed(1);
      answers[answer].rows[3].col3[0].answer = (
        q4Col3Row3 / q1Col3Row3
      ).toFixed(1);
      answers[answer].rows[3].col4[0].answer = (
        q4Col4Row3 / q1Col4Row3
      ).toFixed(1);
      answers[answer].rows[3].col5[0].answer = (
        q4Col5Row3 / q1Col5Row3
      ).toFixed(1);
      answers[answer].rows[3].col6[0].answer = (
        q4Col6Row3 / q1Col6Row3
      ).toFixed(1);
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

    const rowsWithZeroWhereBlank = replaceNullsWithZeros(answers[answer].rows);

    // Params for updating questions
    const questionParams = {
      TableName: process.env.FormAnswersTable,
      Key: {
        answer_entry: answerEntry,
      },
      UpdateExpression:
        "SET #r = :rows, last_modified_by = :last_modified_by, last_modified = :last_modified",
      ExpressionAttributeValues: {
        ":rows": rowsWithZeroWhereBlank,
        ":last_modified_by": user.username,
        ":last_modified": new Date().toISOString(),
      },
      ExpressionAttributeNames: {
        "#r": "rows",
      },

      ReturnValues: "ALL_NEW",
    };

    const dbResult = await dynamoDb.update(questionParams);
    questionResult.push(dbResult);
  }
};

const updateStateForm = async (stateFormId, statusData, user) => {
  // Get existing form to compare changes
  const params = {
    TableName: process.env.StateFormsTable,
    ExpressionAttributeNames: {
      "#state_form": "state_form",
    },
    ExpressionAttributeValues: {
      ":state_form": stateFormId,
    },
    KeyConditionExpression: "#state_form = :state_form",
  };
  const result = await dynamoDb.query(params);
  if (result.Count === 0) {
    throw new Error("State Form Not Found");
  }

  const currentForm = result.Items[0];
  let statusFlags = {};
  if (statusHasChanged(currentForm, statusData)) {
    statusFlags[":status_modified_by"] = user.username;
    statusFlags[":status_date"] = new Date().toISOString();
  }
  // Params for updating for statusData;
  const formParams = {
    TableName: params.TableName,
    Key: {
      state_form: stateFormId,
    },
    UpdateExpression:
      "SET last_modified_by = :last_modified_by, last_modified = :last_modified, status_modified_by = :status_modified_by, status_date = :status_date, status_id = :status_id, state_comments = :state_comments",
    ExpressionAttributeValues: {
      ":last_modified_by": user.username,
      ":last_modified": statusData.last_modified,
      ":status_modified_by": currentForm.status_modified_by,
      ":status_date": currentForm.status_date,
      ":status_id": statusData.status_id,
      ":state_comments": statusData.state_comments,
      ...statusFlags,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    await dynamoDb.update(formParams);
  } catch (e) {
    throw ("Form params update failed", e);
  }
};

/**
 * Replace all null values with zero values, anywhere in the object.
 * Guaranteed to work on state forms.
 * Not guaranteed to work with _any_ object in the universe.
 */
function replaceNullsWithZeros(obj) {
  if (obj === null) {
    return 0;
  } else if (Array.isArray(obj)) {
    return obj.map((x) => replaceNullsWithZeros(x));
  } else if (typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => [key, replaceNullsWithZeros(val)])
    );
  } else {
    return obj;
  }
}
