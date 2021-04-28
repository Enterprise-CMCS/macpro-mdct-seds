import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  if (event.source === "serverless-plugin-warmup") return null;

  const data = JSON.parse(event.body);

  const tableName = data.tableName;

  clearRecords(tableName);
});

const clearRecords = () => {
  getRecords().then((data) => {
    data.Items.forEach((item) => {
      console.log("\n\nitem found: \n---------------\n");
      console.log(item);
      console.log("\n\n-------------");
      //deleteItem(item.Id).then();
    });
    clearRecords();
  });
};

const deleteItem = (id, tableName) => {
  const params = {
    TableName: `${tableName}`,
    Key: {
      Id: id,
    },
  };

  return new Promise((resolve, reject) => {
    dynamoDb.delete(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const getRecords = (tableName) => {
  const params = {
    TableName: `${tableName}`,
    Select: "ALL_ATTRIBUTES",
  };

  return new Promise((resolve, reject) => {
    dynamoDb.scan(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
