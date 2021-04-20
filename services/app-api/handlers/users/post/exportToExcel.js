import handler from "../../../libs/handler-lib";
//import dynamoDb from "../../../libs/dynamodb-lib";
import { Workbook } from "exceljs";

export const main = handler(async (event, context) => {
  // if this invocation is a pre-warm, do nothing and return
  if (event.source === "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  // *** create workbook
  const workbook = new Workbook();

  // *** add worksheet
  const worksheet = workbook.addWorksheet("test worksheet");

  const titleRow = worksheet.addRow(["Test title"]);
  titleRow.font = { name: "Calibri", family: 2, size: 16, bold: true };

  return await workbook.xlsx.writeBuffer();
});

// ** individual functions
