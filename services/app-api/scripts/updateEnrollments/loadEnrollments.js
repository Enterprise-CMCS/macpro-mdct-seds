const AWS = require("aws-sdk");
const fs = require("fs");

AWS.config.update({
  region: "us-east-1",
  endpoint: "dynamodb.us-east-1.amazonaws.com",
  // accessKeyId: "", YOU NEED THESE IN THE CONSOLE
  // secretAccessKey: "" YOU NEED THESE IN THE CONSOLE
});

const client = new AWS.DynamoDB.DocumentClient(AWS.config);
const scan = (params) => client.scan(params).promise();
const update = (params) => client.update(params).promise();
const stage = process.argv[2];
const tables = {
  stateForm: `${stage}-state-forms`,
  formAnswers: `${stage}-form-answers`,
};

const scanTable = async (params) => {
  const recursiveScanItems = [];
  const recursiveScan = async (params) => {
    // Get initial scan (up to 1MB)
    const result = await scan(params);

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
  return await recursiveScan(params);
};

const getStateForms = async () => {
  return await scanTable({
    TableName: tables.stateForm, //"local-form-answers", /////update table name here
    FilterExpression:
      "contains(#form, :form) AND #quarter = :quarter AND #year = :year",
    ExpressionAttributeNames: {
      "#form": "form",
      "#quarter": "quarter",
      "#year": "year",
    },
    ExpressionAttributeValues: {
      ":form": "21E",
      ":quarter": 4,
      ":year": 2021,
    },
  });
};

const getAnswersByForm = async (stateForm) => {
  const question = `${stateForm.year}-${stateForm.form}-07`;
  return await scanTable({
    TableName: tables.formAnswers,
    FilterExpression: "#state_form = :stateForm AND #question = :question",
    ExpressionAttributeNames: {
      "#state_form": "state_form",
      "#question": "question",
    },
    ExpressionAttributeValues: {
      ":stateForm": stateForm.state_form,
      ":question": question,
    },
  });
};

const collectEnrollments = (answer) => {
  let enrollment;
  let enrollmentSum = 0;
  const rows = answer.rows;
  for (const r in rows) {
    // Add all numeric col#'s together
    enrollment = Object.keys(rows[r]).reduce(
      (sum, key) => sum + (parseFloat(rows[r][key]) || 0),
      0
    );
    enrollmentSum += enrollment;
    log(`        Enrollments for row - ${r}: ${enrollment}`);
  }
  log(
    `       Enrollments for Answer: ${answer.answer_entry}: ${enrollmentSum}`
  );
  return enrollmentSum;
};

const log = (message) => {
  console.log(message);
  // append data to the log file
  fs.appendFileSync("enrollments.log", message + "\n", (err) => {
    if (err) {
      throw err;
    }
  });
};

// IIFE to run the process
(async () => {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

  log("***********************************************************");
  log(`Enrollment update job ran at - ${date} - ${time}`);
  log("***********************************************************");
  log("                                                           ");

  const allStateForms = await getStateForms();
  log(`allStateFormslength: ${allStateForms.length}`);
  for (const stateForm of allStateForms) {
    const answers = await getAnswersByForm(stateForm);
    log(
      `    Number of answers for : ${stateForm.state_form} : ${answers.length}`
    );
    let totalEnrollment = 0;
    for (const answer of answers) {
      const tempEnrollment = collectEnrollments(answer);
      totalEnrollment += !Number.isNaN(tempEnrollment)
        ? parseInt(tempEnrollment)
        : 0;
    }
    log(` Total enrolmments for ${stateForm.state_form}: ${totalEnrollment}`);

    // Find enrollment type
    const enrollmentType = stateForm.form === "21E" ? "separate" : "expansion";
    const enrollmentCounts = {
      type: enrollmentType,
      year: stateForm.year,
      count: totalEnrollment,
    };
    const updateParams = {
      TableName: tables.stateForm,
      Key: {
        state_form: stateForm.state_form,
      },
      UpdateExpression: "set #enrollmentCounts = :enrollmentCounts",
      ExpressionAttributeNames: {
        "#enrollmentCounts": "enrollmentCounts",
      },
      ExpressionAttributeValues: {
        ":enrollmentCounts": enrollmentCounts,
      },
    };
    log(`<<<< Updating >>>>", ${JSON.stringify(stateForm.enrollmentCounts)}`);
    await update(updateParams);
    log("<<<< Update Successfull! >>>>");
    log("                               ");
  }
})();
