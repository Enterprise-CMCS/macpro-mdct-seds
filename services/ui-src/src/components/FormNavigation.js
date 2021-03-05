import React from "react";
import { withRouter, Link } from "react-router-dom";

// FontAwesome / Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const FormNavigation = ({ state, year, quarter, history }) => {
  const quarterPath = `/forms/${state}/${year}/${quarter}`;

  return (
    <div>
      <Link className="form-nav" to={quarterPath}>
        {" "}
        <FontAwesomeIcon icon={faArrowLeft} /> Back to {`Q${quarter} ${year}`}
      </Link>
    </div>
  );
};

export default withRouter(FormNavigation);
