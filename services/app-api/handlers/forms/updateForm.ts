import handler from "../../libs/handler-lib.ts";
import dynamoDb from "../../libs/dynamodb-lib.ts";
import {
  canWriteAnswersForState,
  canWriteStatusForState,
} from "../../auth/authConditions.ts";
import { UpdateCommandOutput } from "@aws-sdk/lib-dynamodb";
import { AuthUser } from "../../storage/users.ts";
import { StateForm } from "../../storage/stateForms.ts";
import { badRequest, forbidden, ok } from "../../libs/response-lib.ts";
import {
  isFormId,
  isStatusId as isFormStatus,
  readFormIdentifiersFromPath,
} from "../../libs/parsing.ts";
import { logger } from "../../libs/debug-lib.ts";
import { FormStatusValue } from "../../shared/types.ts";

export const main = handler(readFormIdentifiersFromPath, async (request) => {
  const { state, year, quarter, form } = request.parameters;

  if (!canWriteStatusForState(request.user, state)) {
    return forbidden();
  }

  if (!isValidBody(request.body)) {
    return badRequest();
  }
  const { statusData, formAnswers } = request.body;

  const state_form = `${state}-${year}-${quarter}-${form}`;

  if (statusData.state_form !== state_form) {
    return badRequest("Body state_form does not match URL parameters.");
  }

  for (const answer of formAnswers) {
    if (answer.state_form !== state_form) {
      return badRequest("Answer state_form does not match URL parameters.");
    }
  }

  if (canWriteAnswersForState(request.user, state)) {
    await updateAnswers(formAnswers, request.user);
  }
  await updateStateForm(state_form, statusData, request.user);

  return ok();
});

const updateAnswers = async (
  answers: RequestBody["formAnswers"],
  user: AuthUser
) => {
  let questionResult: UpdateCommandOutput[] = [];
  answers.sort(function (a: any, b: any) {
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

      ReturnValues: "ALL_NEW" as const,
    };

    const dbResult = await dynamoDb.update(questionParams);
    questionResult.push(dbResult);
  }
};

const updateStateForm = async (
  state_form: string,
  statusData: RequestBody["statusData"],
  user: any
) => {
  // Get existing form to compare changes
  const params = {
    TableName: process.env.StateFormsTable,
    Key: { state_form },
  };
  const result = await dynamoDb.get(params);
  if (!result.Item) {
    throw new Error("State Form Not Found");
  }
  const currentForm = result.Item as StateForm;

  const currentTimestamp = new Date().toISOString();

  const statusFlags = {
    ":status_modified_by": currentForm.status_modified_by,
    ":status_date": currentForm.status_date,
  };
  if (currentForm.status_id !== statusData.status_id) {
    statusFlags[":status_modified_by"] = user.username;
    statusFlags[":status_date"] = currentTimestamp;
  }

  // Params for updating for statusData;
  const formParams = {
    TableName: params.TableName,
    Key: { state_form },
    UpdateExpression:
      "SET last_modified_by = :last_modified_by, last_modified = :last_modified, status_modified_by = :status_modified_by, status_date = :status_date, status_id = :status_id, state_comments = :state_comments",
    ExpressionAttributeValues: {
      ":last_modified_by": user.username,
      ":last_modified": currentTimestamp,
      ":status_id": statusData.status_id,
      ":state_comments": statusData.state_comments,
      ...statusFlags,
    },
    ReturnValues: "ALL_NEW" as const,
  };

  await dynamoDb.update(formParams);
};

/**
 * Replace all null values with zero values, anywhere in the object.
 * Guaranteed to work on state forms.
 * Not guaranteed to work with _any_ object in the universe.
 */
function replaceNullsWithZeros(obj: any): any {
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

type RequestBody = {
  statusData: {
    state_form: string;
    status_id: FormStatusValue;
    state_comments: [{ type: "text_multiline"; entry: string | null }];
  };
  formAnswers: {
    state_form: string;
    question: string;
    rangeId: string;
    rows: {
      col1: any;
      col2: any;
      col3: any;
      col4: any;
      col5: any;
      col6: any;
    }[];
  }[];
};

function isValidBody(body: unknown): body is RequestBody {
  if (!body || "object" !== typeof body) {
    logger.warn("body is required.");
    return false;
  }

  if (
    !("statusData" in body) ||
    "object" !== typeof body.statusData ||
    !body.statusData
  ) {
    logger.warn("body.statusData is required.");
    return false;
  }
  const statusData = body.statusData;

  if (!("state_form" in statusData) || !isFormId(statusData.state_form)) {
    logger.warn("body.statusData.state_form is invalid.");
    return false;
  }

  if (!("status_id" in statusData) || !isFormStatus(statusData.status_id)) {
    logger.warn("body.statusData.status_id is invalid.");
    return false;
  }

  if (
    !("state_comments" in statusData) ||
    !Array.isArray(statusData.state_comments) ||
    statusData.state_comments.length !== 1
  ) {
    logger.warn("body.statusData.state_comments must be a singleton array.");
    return false;
  }
  const comment = statusData.state_comments[0] as unknown;

  if (
    "object" !== typeof comment ||
    !comment ||
    !("type" in comment) ||
    comment.type !== "text_multiline" ||
    !("entry" in comment) ||
    ("string" !== typeof comment.entry && null !== comment.entry)
  ) {
    logger.warn("body.statusData.state_comments is invalid.");
    return false;
  }

  if (!("formAnswers" in body) || !Array.isArray(body.formAnswers)) {
    logger.warn("body.formAnswers is required.");
    return false;
  }
  for (let formAnswer of body.formAnswers as unknown[]) {
    if ("object" !== typeof formAnswer || !formAnswer) {
      logger.warn("Each element of body.formAnswers must be an object.");
      return false;
    }

    if (!("state_form" in formAnswer) || !isFormId(formAnswer.state_form)) {
      logger.warn("body.formAnswers[i].state_form must is invalid.");
      return false;
    }

    if (
      !("question" in formAnswer) ||
      "string" !== typeof formAnswer.question
    ) {
      logger.warn("body.formAnswers[i].question must be a string.");
      return false;
    }

    if (!("rangeId" in formAnswer) || "string" !== typeof formAnswer.rangeId) {
      logger.warn("body.formAnswers[i].rangeId must be a string.");
      return false;
    }

    if (!("rows" in formAnswer) || !Array.isArray(formAnswer.rows)) {
      logger.warn("body.formAnswers[i].rows must be an array.");
      return false;
    }

    for (let row of formAnswer.rows as unknown[]) {
      if ("object" !== typeof row || !row) {
        logger.warn("body.formAnswers[i].rows[j] must be an object.");
        return false;
      }

      for (let col of ["col1", "col2", "col3", "col4", "col5", "col6"]) {
        if (!(col in row)) {
          logger.warn(`body.formAnswers[i].rows[j].${col} is required.`);
          return false;
        }
      }
    }
  }

  return true;
}
