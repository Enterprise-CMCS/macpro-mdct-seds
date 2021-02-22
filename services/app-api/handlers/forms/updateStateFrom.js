import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";


export const main = handler(async (event, context) => {
    // If this invokation is a prewarm, do nothing and return.
    if (event.source == "serverless-plugin-warmup") {
      console.log("Warmed up!");
      return null;
    }
    var params = {
        TableName: "local-state-forms",
        Key: { // The primary key of the item (a map of attribute name to AttributeValue)
            'state_form': "PA-2021-1-21E",//(string | number | boolean | null | Binary)
            'state_form': "MD-2021-1-21E",
            'state_form': "AL-2021-1-21E" 
        },
        UpdateExpression: "SET form_name = :form_name" , 
        ExpressionAttributeValues: { // a map of substitutions for all attribute values
            ":form_name": "Number of CHIP Children Served, SCHIP",
        },
        ReturnValues: "ALL_NEW",
    };
    dynamoDb.update(params, function(err, data) {
        if (err) throw err; // an error occurred
        else return data; // successful response
    });
  
});