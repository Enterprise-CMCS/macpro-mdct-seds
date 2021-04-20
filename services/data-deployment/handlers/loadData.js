// The script loads json data into Dynamodb tables
var AWS = require("aws-sdk");
var s3 = new AWS.S3();

AWS.config.update({ region: "us-east-1" });

function item_Upsert(bucketName, tableName) {
  let fileName = tableName + ".json";
  let getParams = { Key: fileName, Bucket: bucketName };

  console.log(getParams);

  //Fetch data from aws s3
  s3.getObject(getParams, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      var itemData = JSON.parse(data.Body.toString());
      var documentClient = new AWS.DynamoDB.DocumentClient();

      console.log("Loading data into DynamoDB");
      console.log(itemData);

      itemData.forEach(function (record) {
        var params = {
          TableName: tableName,
          Item: record,
        };
        documentClient.put(params, function (err, data) {
          if (err) {
            console.error("Can't add item !");
          } else {
            console.log("Succeeded adding an item");
          }
        });
      });
    }
  });
  return;
}

let bucket = "seds-s3bucket-data";
// Call function to insert items in Dynamodb tables
item_Upsert(bucket, "testLoad");
item_Upsert(bucket, "testLoad2");
