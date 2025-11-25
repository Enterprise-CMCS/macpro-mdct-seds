import handler from "../../../libs/handler-lib.js";
import dynamoDb from "../../../libs/dynamodb-lib.js";
import { authorizeAdmin } from "../../../auth/authConditions.js";
import { writeAllStateForms } from "../../../storage/stateForms.js";

export const main = handler(async (event, context) => {
  await authorizeAdmin(event);

  const ageRanges = ["0000", "0001", "0105", "0612", "1318"];
  const forms = ["21E", "64.21E"];

  // Get all State Forms
  const stateForms = await getStateForms(forms);
  if (stateForms.status === 404) {
    return stateForms;
  }

  // Get answer entries from forms and bundle totals together
  const generatedTotals = await generateTotals(stateForms.entries, ageRanges);
  if (generatedTotals.status === 404) {
    return generatedTotals;
  }

  await writeAllStateForms(generatedTotals.countsToWrite);

  return {
    status: 200,
    message: `Generated Totals Successfully`,
  };
});

const getStateForms = async (forms) => {
  try {
    // Build expression Attribute Value object
    const getExpressions = () => {
      const expressionAttributeValues = {
        ":quarter": 4,
      };
      let filterExpression = "";
      for (const i in forms) {
        const key = `:form_${i}`;
        expressionAttributeValues[key] = forms[i];
        if (key === ":form_0") {
          filterExpression += `(form = ${key} `;
        } else {
          filterExpression += `OR form = ${key}`;
        }
      }
      filterExpression += ") AND quarter = :quarter";
      return [expressionAttributeValues, filterExpression];
    };

    const [expressionAttributeValues, filterExpression] = getExpressions();

    const params = {
      TableName: process.env.StateFormsTable,
      Select: "ALL_ATTRIBUTES",
      ExpressionAttributeValues: { ...expressionAttributeValues },
      FilterExpression: filterExpression,
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
    const countsToWrite = [];
    // Loop through all stateForms
    let stateFormsLength = stateForms.length;
    for (let i = 0; i < stateFormsLength; i++) {
      const questionAccumulator = [];
      let questionTotal = 0;
      let ageRangeLength = ageRange.length;
      for (let j = 0; j < ageRangeLength; j++) {
        const answerEntry = `${stateForms[i].state_form}-${ageRange[j]}-07`;

        const questionParams = {
          TableName: process.env.FormAnswersTable,
          ExpressionAttributeValues: {
            ":answerEntry": answerEntry,
          },
          KeyConditionExpression: "answer_entry = :answerEntry",
        };

        let startingKey;
        let existingItems = [];
        let results;

        const queryTable = async (startingKey) => {
          questionParams.ExclusiveStartKey = startingKey;
          let results = await dynamoDb.query(questionParams);
          if (results.LastEvaluatedKey) {
            startingKey = results.LastEvaluatedKey;
            return [startingKey, results];
          } else {
            return [null, results];
          }
        };

        // Looping to perform complete scan of tables due to 1 mb limit per iteration
        do {
          [startingKey, results] = await queryTable(startingKey);

          const items = results.Items;
          existingItems.push(...items);
        } while (startingKey);

        // Add just the rows, no other details are needed
        let questionResultLength = existingItems.length;
        for (let k = 0; k < questionResultLength; k++) {
          questionAccumulator.push(existingItems[k].rows);
        }

        // Calculate totals (add all columns together only if they are numbers)
        questionTotal = totalEnrollmentCount(questionAccumulator);
      }

      // Setup counts object
      let countObject = [];
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

      if (countsToWrite.Count === 0) {
        return {
          status: 404,
          message: "Could not retrieve Answer Entries",
        };
      }
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
      Object.values(currentArr[i]).forEach((value) => {
        if (!isNaN(value)) {
          currentTotal += Number(value);
        }
      });
    }
    return accumulator + currentTotal;
  }, 0);
};
