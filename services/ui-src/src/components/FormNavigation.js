import React, { useState, useEffect } from "react";
import { Button } from "@trussworks/react-uswds";
import { withRouter } from "react-router-dom";

// FontAwesome / Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

const FormNavigation = ({ state, year, quarter, history }) => {
  const quarterPath = `/forms/${state}/${year}/${quarter}`;

  return (
    <div>
      <Button
        className="form-nav"
        onClick={() => {
          history.push(quarterPath);
        }}
      >
        {" "}
        <FontAwesomeIcon icon={faArrowLeft} /> Back to {`Q${quarter} ${year}`}
      </Button>
    </div>
  );
};

export default withRouter(FormNavigation);

// Should navigating back to the quarter page trigger a save??
