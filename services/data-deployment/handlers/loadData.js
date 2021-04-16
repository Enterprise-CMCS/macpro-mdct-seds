// The script loads json data into Dynamodb tables
//
//var fs = require("fs");
//
var AWS = require("aws-sdk");
var s3 = new AWS.S3();

AWS.config.update({ region: "us-east-1" });

//construct getParam
var getParams = {
  Bucket: "seds-s3bucket-data",
  Key: "a.json",
};

//Fetch data from aws s3
s3.getObject(getParams, function (err, data) {
  if (err) {
    console.log(err);
  } else {
    var testData = JSON.parse(data.Body.toString());
    var documentClient = new AWS.DynamoDB.DocumentClient();
    console.log("Loading data into DynamoDB");
    console.log(testData);
    //var testData = JSON.parse(fs.readFileSync('au.json', 'utf8'));
    testData.forEach(function (rec) {
      var params = {
        TableName: "testLoad",
        Item: {
          userId: rec.userId,
          password: rec.password,
          username: rec.username,
          firstName: rec.firstName,
          lastName: rec.lastName,
          email: rec.email,
          isActive: rec.isActive,
          role: rec.role,
          states: rec.states,
          dateJoined: rec.dateJoined,
          lastLogin: rec.lastLogin,
        },
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
