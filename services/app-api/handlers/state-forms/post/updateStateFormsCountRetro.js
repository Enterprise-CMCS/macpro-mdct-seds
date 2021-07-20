import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  const failureList = [];
  const retryFailLimit = 5;
  const countsToWrite = [];

  // Batch write all items, rerun if any UnprocessedItems are returned and it's under the retry limit
  const batchWriteAll = async (tryRetryBatch) => {
    console.log("qqqqq");
    // Attempt first batch write
    const { UnprocessedItems } = await dynamoDb.batchWrite(tryRetryBatch.batch);

    // If there are any failures and under the retry limit
    if (UnprocessedItems.length && tryRetryBatch.noOfRetries < retryFailLimit) {
      const retryBatch = {
        noOfRetries: tryRetryBatch.noOfRetries + 1,
        batch: UnprocessedItems,
      };
      return await batchWriteAll(retryBatch);
    } else if (tryRetryBatch.noOfRetries >= retryFailLimit) {
      // exceeded failure limit
      console.error(
        `Tried batch ${
          tryRetryBatch.noOfRetries
        } times. Failing batch ${JSON.stringify(tryRetryBatch)}`
      );
      failureList.push({ failure: JSON.stringify(tryRetryBatch) });
    }
  };

  // Pull all state forms for 21E and 64.21E
  const stateFormsParams = {
    TableName:
      process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":form": "21E",
      ":form_2": "64.21E",
    },
    FilterExpression: "form = :form OR form = :form_2",
    ConsistentRead: true,
  };

  const stateFormsResult = await dynamoDb.scan(stateFormsParams);

  if (stateFormsResult.Count === 0) {
    throw new Error("Cannot find matching record");
  }
  // Loop through all state forms
  const stateForms = stateFormsResult.Items;

  const ageRanges = ["0000", "0001", "0105", "0612", "1318"];

  for (const i in stateForms) {
    const questionAccumulator = [];
    // Loop through each age range and add to questions array
    for (const j in ageRanges) {
      const answerEntry = `${stateForms[i].state_form}-${ageRanges[j]}-07`;
      const questionParams = {
        TableName:
          process.env.FORM_ANSWERS_TABLE_NAME ??
          process.env.FormAnswersTableName,
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
    }

    // Calculate totals (add all columns together if they are numbers)
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

  // Begin batching by groups of 25
  const batchArrayFormAnswers = [];
  const batchSizeFA = 25;
  for (let i = 0; i < countsToWrite.length; i += batchSizeFA) {
    batchArrayFormAnswers.push(countsToWrite.slice(i, i + batchSizeFA));
  }

  // Get tableName
  const formAnswersTableName =
    process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName;

  // Loop through batches and write to DB
  for (let i in batchArrayFormAnswers) {
    const batchRequest = {
      RequestItems: {
        [formAnswersTableName]: batchArrayFormAnswers[i],
      },
    };

    // Process this batch
    const stuff = await batchWriteAll({ batch: batchRequest, noOfRetries: 0 });
    console.log("zzzStuff", stuff);
  }

  return {
    status: 200,
    message: "Enrollment Data successfully updated",
  };
});
