import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  // If this invocation is a prewarm, do nothing and return.
  if (event.source === "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

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

  const commitResponse = commitTotalsToDB(generatedTotals.countsToWrite);
  if (commitResponse.status === 404) {
    return commitResponse;
  }

  return {
    status: 200,
    message: `Generated Totals Successfully`,
  };
});

const getStateForms = async (forms) => {
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
    TableName:
      process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: { ...expressionAttributeValues },
    FilterExpression: filterExpression,
    ConsistentRead: true,
  };

  const stateFormsResult = await dynamoDb.scan(params);

  if (stateFormsResult.Items === 0) {
    return {
      status: 404,
      message: "Could not find any matching state forms",
    };
  }
  return {
    status: 200,
    message: `Get State Forms Called and Returned Forms Successfully`,
    entries: stateFormsResult.Items,
  };
};

const generateTotals = async (stateForms, ageRange) => {
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
      let questionResultLength = questionResult.Items.length;
      for (let k = 0; k < questionResultLength; k++) {
        questionAccumulator.push(questionResult.Items[k].rows);
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
      PutRequest: {
        Item: {
          ...stateForms[i],
          enrollmentCounts: countObject,
        },
      },
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
};

const commitTotalsToDB = async (putRequests) => {
  const failureList = [];
  const retryFailLimit = 5;

  // Batch write all items, rerun if any UnprocessedItems are returned and it's under the retry limit
  const batchWriteAll = async (tryRetryBatch) => {
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

  // Begin batching by groups of 25
  const batchArrayFormAnswers = [];
  const batchSizeFA = 25;
  for (let i = 0; i < putRequests.length; i += batchSizeFA) {
    batchArrayFormAnswers.push(putRequests.slice(i, i + batchSizeFA));
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
    await batchWriteAll({ batch: batchRequest, noOfRetries: 0 });
  }

  if (failureList.length > 0) {
    return {
      status: 500,
      message: `Failed to write all entries to database.`,
    };
  }
  return {
    status: 200,
    message: `Totals Updated Successfully`,
  };
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
