import handler from "../../../libs/handler-lib";
//import dynamoDb from "../../../libs/dynamodb-lib";

import { create } from "pdf-creator-node";

export const main = handler(async (event, context) => {
  if (event.source === "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  console.log("generating pdf");
  const options = {
    format: "A3",
    orientation: "portrait",
    border: "10mm",
  };

  const users = [
    {
      name: "Shyam",
      age: "26",
    },
    {
      name: "Navjot",
      age: "26",
    },
    {
      name: "Vitthal",
      age: "26",
    },
  ];

  const html = "<h1>this is a sample</h1>";
  const document = {
    html: html,
    data: {
      users: users,
    },
    path: "./output.pdf",
    phantomPath: "./node_modules/phantomjs-prebuilt/bin/phantomjs",
    type: "buffer", // "stream" || "buffer" || "" ("" defaults to pdf)
  };

  create(document, options)
    .then((res) => {
      console.log(res);
    })
    .catch((error) => {
      console.error(error);
    });

  return null;
});

// ** individual functions
// const wait = (ms) => new Promise((r) => setTimeout(r, ms));
