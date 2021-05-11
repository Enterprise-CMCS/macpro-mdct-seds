//
// This script backs-up Dynamodb tables for specific branch
// And removes backups older than retention period per ssm parameter
//
// The script accepts 2 environment variables: branch name and retention period
//
const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB({ region: "us-east-1" });

const backupDynamo = async () => {
  const params = {};
  var tableList = [];
  var i = 0;
  while (true) {
    const response = await ddb.listTables(params).promise();
    tableList = tableList.concat(response.TableNames);
    if (response.LastEvaluatedTableName === undefined) {
      break;
    } else {
      params.ExclusiveStartTableName = response.LastEvaluatedTableName;
    }
  }
  for (i = 0; i < tableList.length; i++) {
    if (tableList[i].includes(branchName)) {
      // Creates backup of tables for specific branch
      createBackup(tableList[i]);
      // Remove old backups
      deleteBackup(tableList[i]);
    }
  }
  return tableList;
};

const createBackup = async (tableName) => {
  try {
    const timestamp = new Date().toISOString().split("T")[0];
    const params = {
      TableName: tableName,
      BackupName: tableName + "_bkp-" + timestamp,
    };
    await ddb.createBackup(params, (err, data) => {
      if (err) console.log(err, err.stack); // an error occurred
      //else     console.log(data);           // successful backup
    });
  } catch (error) {
    console.error(error);
  }
};

const deleteBackup = async (tableName) => {
  var i = 0;

  // Check backup retention from ssm parameter, default is 14 days
  var days = parseInt(process.env.backupRetention);
  if (!days) days = 14;

  // Get upper bound date
  const upperDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  var params = {
    TableName: tableName,
    TimeRangeUpperBound: upperDate,
  };

  // Delete backups prior to upper date
  await ddb.listBackups(params, function (err, response) {
    if (err) console.log(err, err.stack);
    // an error occurred
    else {
      //console.log(response);           // successful response
      var backupCount = response["BackupSummaries"].length;
      for (i = 0; i < backupCount; i++) {
        console.log(
          "Deleting Backup Table:",
          response.BackupSummaries[i]["BackupName"]
        );
        console.log(
          "         Backup ARN  :",
          response.BackupSummaries[i]["BackupArn"]
        );
        console.log("---");
        const params = {
          BackupArn: response.BackupSummaries[i]["BackupArn"],
        };
        ddb.deleteBackup(params, (err, data) => {
          if (err) console.log(err, err.stack); // an error occurred
          //else     console.log(data);           // successfully deleted backup
        });
      }
    }
  });
};

// Get the branch name to backup data
exports.handler = async (event, context) => {
  const branchName = process.env.branchName;
  // Call function to backup Dynamodb tables
  await backupDynamo(branchName);
  console.log("Backup Completed!");
};
