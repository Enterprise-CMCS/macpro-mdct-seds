import handler from "../libs/handler-lib";
//import dynamoDb from "../libs/dynamodb-lib";
import { Workbook } from "exceljs";
import { getCurrentUserInfo } from "../auth/cognito-auth";
import { authorizeAnyUser } from "../auth/authConditions";

export const main = handler(async (event, context) => {
  if (event.source === "serverless-plugin-warmup") return null;

  await authorizeAnyUser(event);

  let content = JSON.parse(event.body);

  // *** get information about user creating the export
  const currentUserInfo = await getCurrentUserInfo(event);
  const workbook = generateWorkbook(currentUserInfo.data, content);

  return await workbook.xlsx.writeBuffer();
});

// ** individual functions
const generateWorkbook = (currentUserInfo, content) => {
  // *** create workbook
  const workbook = new Workbook();
  workbook.creator = `${currentUserInfo.firstName} ${currentUserInfo.lastName}`;
  workbook.lastModifiedBy = `${currentUserInfo.firstName} ${currentUserInfo.lastName}`;
  workbook.created = new Date();
  workbook.modified = new Date();

  // *** specify worksheet settings
  const worksheetSettings = {
    // ** color the tab
    properties: {
      tabColor: {
        argb: `950000`,
      },
    },
    // ** freeze first row and first column
    views: [
      {
        state: "frozen",
        xSplit: 1,
        ySplit: 1,
      },
    ],
    // ** set the page up to be printed landscape by default
    pageSetup: {
      paperSize: 9,
      orientation: "landscape",
    },
    // ** display page numbers for both odd and even pages in the middle of page footer
    headerFooter: {
      oddFooter: "Page &P of &N",
      evenFooter: "Page &P of &N",
    },
  };

  // *** add worksheet
  const worksheet = workbook.addWorksheet(
    `MDCT Export ${new Date().toISOString().split("T")[0]} `,
    worksheetSettings
  );

  // *** arbitrarily set and empirically based
  const colWidth = 40;
  const headerRowHeight = 45;

  worksheet.getRow(1).height = headerRowHeight;

  // *** generate header content
  content.columns.forEach((column, index) => {
    // *** skip the column excluded from output
    if (
      column.excludeFromExcel !== undefined &&
      column.excludeFromExcel === true
    ) {
      return;
    }

    worksheet.getColumn(index + 1).header = column.name;
    worksheet.getColumn(index + 1).width = colWidth;
  });

  // *** set header row style
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    // ** font
    cell.font = {
      name: "Arial Black",
      family: 4,
      size: 18,
      color: { argb: "ffffff" },
      underline: false,
      bold: true,
      italic: false,
    };

    // ** background color
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "000080" },
    };

    // ** border
    cell.border = {
      top: {
        style: "double",
        color: {
          argb: "ffffff",
        },
      },
      left: {
        style: "double",
        color: {
          argb: "ffffff",
        },
      },
      bottom: {
        style: "double",
        color: {
          argb: "ffffff",
        },
      },
      right: {
        style: "double",
        color: {
          argb: "ffffff",
        },
      },
    };

    // ** alignment
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
    };
  });

  // *** generate body content
  content.data.forEach((row, rowIndex) => {
    content.columns.forEach((column, columnIndex) => {
      if (
        column.excludeFromExcel !== undefined &&
        column.excludeFromExcel === true
      ) {
        return;
      }
      worksheet.getRow(rowIndex + 2).getCell(columnIndex + 1).value = row[
        column.selector
      ]?.toString();
    });
    worksheet.getRow(rowIndex + 2).font = {
      name: "Arial",
      size: 14,
    };
  });

  return workbook;
};
