import handler from "../../libs/handler-lib.ts";
import dynamoDb from "../../libs/dynamodb-lib.ts";
import { StateForm, writeAllStateForms } from "../../storage/stateForms.ts";
import { ok, notFound, forbidden } from "../../libs/response-lib.ts";
import { emptyParser } from "../../libs/parsing.ts";
import { FormAnswer } from "../../storage/formAnswers.ts";

export const main = handler(emptyParser, async (request) => {
  if (request.user.role !== "admin") {
    return forbidden();
  }

  const stateForms = await getStateFormsWithTotals();
  if (stateForms.length === 0) {
    return notFound("No 21E or 64.21E forms exist, for quarter 4 of any year.");
  }

  await recalculateTotals(stateForms);

  await writeAllStateForms(stateForms);

  return ok();
});

const getStateFormsWithTotals = async () => {
  const params = {
    TableName: process.env.StateFormsTable,
    Select: "ALL_ATTRIBUTES",
    FilterExpression: "quarter = :quarter AND form IN (:f1, :f2)",
    ExpressionAttributeValues: {
      ":quarter": 4,
      ":f1": "21E",
      ":f2": "64.21E",
    },
    ConsistentRead: true,
  };

  const response = await dynamoDb.scan(params);
  return response.Items as StateForm[];
};

const recalculateTotals = async (stateForms: StateForm[]) => {
  const ageRanges = ["0000", "0001", "0105", "0612", "1318"];
  for (const stateForm of stateForms) {
    const questionAccumulator: FormAnswer["rows"][] = [];
    let questionTotal = 0;
    for (const ageRange of ageRanges) {
      const answerEntry = `${stateForm.state_form}-${ageRange}-07`;
      const existingItems = (
        await dynamoDb.query({
          TableName: process.env.FormAnswersTable,
          ExpressionAttributeValues: { ":answerEntry": answerEntry },
          KeyConditionExpression: "answer_entry = :answerEntry",
        })
      ).Items as FormAnswer[];

      // Add just the rows, no other details are needed
      let questionResultLength = existingItems.length;
      for (let k = 0; k < questionResultLength; k++) {
        questionAccumulator.push(existingItems[k].rows);
      }

      // Calculate totals (add all columns together only if they are numbers)
      questionTotal = totalEnrollmentCount(questionAccumulator);
    }

    if (stateForm.form === "21E") {
      stateForm.enrollmentCounts = {
        type: "separate",
        year: stateForm.year,
        count: questionTotal,
      };
    } else if (stateForm.form === "64.21E") {
      stateForm.enrollmentCounts = {
        type: "expansion",
        year: stateForm.year,
        count: questionTotal,
      };
    }
  }
};

const totalEnrollmentCount = (questionAccumulator: FormAnswer["rows"][]) => {
  return questionAccumulator.reduce((accumulator, currentArr) => {
    let currentTotal = 0;
    let currentArrayLength = currentArr.length;
    for (let i = 0; i < currentArrayLength; i++) {
      Object.values(currentArr[i]).forEach((value) => {
        if (!isNaN(value)) {
          currentTotal += Number(value);
        }
      });
    }
    return accumulator + currentTotal;
  }, 0);
};
