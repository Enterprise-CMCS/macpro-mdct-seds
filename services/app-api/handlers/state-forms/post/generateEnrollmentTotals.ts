import handler from "../../../libs/handler-lib.ts";
import dynamoDb from "../../../libs/dynamodb-lib.ts";
import { authorizeAdmin } from "../../../auth/authConditions.ts";
import { StateForm, writeAllStateForms } from "../../../storage/stateForms.ts";
import { FormQuestion } from "../../../storage/formQuestions.ts";

export const main = handler(async (event, context) => {
  await authorizeAdmin(event);

  const ageRanges = ["0000", "0001", "0105", "0612", "1318"];

  // Get all State Forms
  const stateForms = await getStateForms();
  if (stateForms.status === 404) {
    return stateForms;
  }

  // Get answer entries from forms and bundle totals together
  const generatedTotals = await generateTotals(stateForms.entries, ageRanges);
  if (generatedTotals.status === 404) {
    return generatedTotals;
  }

  await writeAllStateForms(generatedTotals.countsToWrite!);

  return {
    status: 200,
    message: `Generated Totals Successfully`,
  };
});

const getStateForms = async () => {
  try {
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

    const items = await dynamoDb.scan(params);
    const existingItems = items.Items;

    if (existingItems.length === 0) {
      return {
        status: 404,
        message: "Could not find any matching state forms",
      };
    }
    return {
      status: 200,
      message: `Get State Forms Called and Returned Forms Successfully`,
      entries: existingItems,
    };
  } catch (error) {
    return {
      status: 500,
      message: "Something went wrong:\n" + error,
    };
  }
};

const generateTotals = async (stateForms, ageRange) => {
  try {
    const countsToWrite: StateForm[] = [];
    // Loop through all stateForms
    let stateFormsLength = stateForms.length;
    for (let i = 0; i < stateFormsLength; i++) {
      const questionAccumulator: FormQuestion[] = [];
      let questionTotal = 0;
      let ageRangeLength = ageRange.length;
      for (let j = 0; j < ageRangeLength; j++) {
        const answerEntry = `${stateForms[i].state_form}-${ageRange[j]}-07`;
        const existingItems = (
          await dynamoDb.query({
            TableName: process.env.FormAnswersTable,
            ExpressionAttributeValues: { ":answerEntry": answerEntry },
            KeyConditionExpression: "answer_entry = :answerEntry",
          })
        ).Items;

        // Add just the rows, no other details are needed
        let questionResultLength = existingItems.length;
        for (let k = 0; k < questionResultLength; k++) {
          questionAccumulator.push(existingItems[k].rows);
        }

        // Calculate totals (add all columns together only if they are numbers)
        questionTotal = totalEnrollmentCount(questionAccumulator);
      }

      // Setup counts object
      let countObject = [] as any;
      if (stateForms[i].form === "21E") {
        countObject = {
          type: "separate",
          year: stateForms[i].year,
          count: questionTotal,
        };
      }

      if (stateForms[i].form === "64.21E") {
        countObject = {
          type: "expansion",
          year: stateForms[i].year,
          count: questionTotal,
        };
      }

      countsToWrite.push({
        ...stateForms[i],
        enrollmentCounts: countObject,
      });
    }
    return {
      status: 200,
      message: "Answer Entries found and counts accumulated",
      countsToWrite,
    };
  } catch (error) {
    return {
      status: 500,
      message: "Something went wrong:\n" + error,
    };
  }
};

const totalEnrollmentCount = (questionAccumulator) => {
  return questionAccumulator.reduce((accumulator, currentArr) => {
    let currentTotal = 0;
    let currentArrayLength = currentArr.length;
    for (let i = 0; i < currentArrayLength; i++) {
      Object.values(currentArr[i]).forEach((value: any) => {
        if (!isNaN(value)) {
          currentTotal += Number(value);
        }
      });
    }
    return accumulator + currentTotal;
  }, 0);
};
