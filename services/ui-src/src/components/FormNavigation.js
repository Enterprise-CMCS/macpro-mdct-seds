import React, { useState, useEffect } from "react";
import { Button } from "@trussworks/react-uswds";
import { useHistory, withRouter } from "react-router-dom";

// FontAwesome / Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

const FormNavigation = ({ quarterData, history }) => {
  return (
    <div>
      <Button
        className="form-nav"
        onClick={() => {
          history.push("/example");
          // PLACE HOLDER FOR CURRENT QUARTER && YEAR
        }}
      >
        {" "}
        <FontAwesomeIcon icon={faArrowLeft} /> Back to {quarterData}
      </Button>
    </div>
  );
};

export default withRouter(FormNavigation);
