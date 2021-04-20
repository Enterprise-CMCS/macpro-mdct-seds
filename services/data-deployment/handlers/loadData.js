// The script loads json data into Dynamodb tables
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

AWS.config.update({ region: "us-east-1" });

itemUpsert = (bucketName, tableName) => {
  const fileName = tableName + ".json";
  const getParams = { Key: fileName, Bucket: bucketName };

  console.log(getParams);

  //Fetch data from aws s3
  s3.getObject(getParams, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const itemData = JSON.parse(data.Body.toString());
      const documentClient = new AWS.DynamoDB.DocumentClient();

      console.log("Loading data into DynamoDB");
      console.log(itemData);

      itemData.forEach((record) => {
        const params = {
          TableName: tableName,
          Item: record,
        };
        documentClient.put(params, (err, data) => {
          if (err) {
            console.error("Can't add item !");
          } else {
            console.log("Succeeded adding an item");
          }
        });
      });
    }
  });
};

const bucket = "seds-s3bucket-data";
// Call function to insert items in Dynamodb tables
itemUpsert(bucket, "testLoad");
itemUpsert(bucket, "testLoad2");
