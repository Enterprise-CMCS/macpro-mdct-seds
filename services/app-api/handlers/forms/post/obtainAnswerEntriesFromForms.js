import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  // Get stateForms and ageRanges from passed in data
  let data = JSON.parse(event.body);
  const stateForms = data.stateForms;
  const ageRange = data.ageRange;

  const countsToWrite = [];
  // Loop through all stateForms
  for (const i in stateForms) {
    const questionAccumulator = [];

    const answerEntry = `${stateForms[i].state_form}-${ageRange}-07`;

    const questionParams = {
      TableName:
        process.env.FORM_ANSWERS_TABLE_NAME ?? process.env.FormAnswersTableName,
      ExpressionAttributeValues: {
        ":answerEntry": answerEntry,
      },
      KeyConditionExpression: "answer_entry = :answerEntry",
    };

    const questionResult = await dynamoDb.query(questionParams);

    // Add just the rows, no other details are needed
    for (const k in questionResult.Items) {
      questionAccumulator.push(questionResult.Items[k].rows);
    }

    // Calculate totals (add all columns together only if they are numbers)
    const questionTotal = questionAccumulator.reduce(
      (accumulator, currentArr) => {
        let currentTotal = 0;
        for (const rowObj of currentArr) {
          for (const col in rowObj) {
            let value = rowObj[col];
            if (!isNaN(value)) {
              let parsed = Number(value);
              currentTotal += parsed;
            }
          }
        }
        return accumulator + currentTotal;
      },
      0
    );

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
      PutRequest: {
        Item: {
          ...stateForms[i],
          enrollmentCounts: countObject,
        },
      },
    });
  }

  if (countsToWrite.Count === 0) {
    return {
      status: 404,
      message: "Could not retrieve Answer Entries",
    };
  }

  return {
    status: 200,
    message: "Answer Entries found",
    countsToWrite,
  };
});