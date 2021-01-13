import React from "react";
import { Button } from "@trussworks/react-uswds";

const StatusButton = ({ type = "inprogress" }) => {
  let classValue;
  let buttonValue;

  switch (type) {
    case "complete":
      classValue = "status-complete";
      buttonValue = "Complete";
      break;
    case "final":
      classValue = "status-final";
      buttonValue = "Final Data Submitted";
      break;
    case "notstarted":
      classValue = "status-notstarted";
      buttonValue = "Not Started";
      break;
    case "provisional":
      classValue = "status-provisional";
      buttonValue = "Provisional Data Submitted";
      break;
    default:
      classValue = "status-inprogress";
      buttonValue = "In Progress";
      break;
  }

  return (
    <Button type="button" className={"status " + classValue}>
      {buttonValue}
    </Button>
  );
};

export default StatusButton;
