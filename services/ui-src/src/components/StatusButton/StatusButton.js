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
    case "provisional":
      classValue = "status-provisional";
      buttonValue = "Provisional Data Submitted";
      break;
    case "notapplicable":
      classValue = "status-notapplicable";
      buttonValue = "Not Applicable";

      break;
    default:
      classValue = "status-inprogress";
      buttonValue = "In Progress";
      break;
  }

  return (
    <Button
      type="button"
      className={"status " + classValue}
      data-testid="StatusButton"
    >
      {buttonValue}
    </Button>
  );
};

export default StatusButton;
