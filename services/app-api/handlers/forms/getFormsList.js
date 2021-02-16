import handler from "./../../libs/handler-lib";
import dynamoDb from "./../../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    // If this invokation is a prewarm, do nothing and return.
    console.log("EVVVVEEEEENNNNTTTTT",event);
    if (event.source == "serverless-plugin-warmup") {
        console.log("Warmed up!");
        return null;
    }

    const payload = JSON.parse(event.body);

    const params = {
        TableName: 'local-state-forms',
        Select: 'ALL_ATTRIBUTES',
        ExpressionAttributeNames:{
            "#theYear": "year"
        },
        ExpressionAttributeValues: {
            ":stateId": event.pathParameters["stateId"],
            ":specifiedYear": parseInt(event.pathParameters["specifiedYear"]),
            ":quarter": parseInt(event.pathParameters["quarter"]),
        },
        FilterExpression: 'state_id = :stateId and quarter = :quarter and #theYear = :specifiedYear',
    };
    console.log("PARAMMMMMMMMMSSSSSS", params)
     const result = await dynamoDb.scan(params);
     console.log("resultttttttttttttttttttttttttt",result);
     if(!result){
         throw new Error("No state form list found");
     }
    // Return the matching list of items in response body
    return result.Items;
});
