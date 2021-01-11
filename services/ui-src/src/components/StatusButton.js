import React from "react";
import { Button } from "@trussworks/react-uswds";

const StatusButton = ({ type = "inprogress" }) => {
  let classValue = "status-inprogress";
  let buttonValue = "In Progress";

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
  }

  return (
    <Button type="button" className={"status " + classValue}>
      {buttonValue}
    </Button>
  );
};

export default StatusButton;
