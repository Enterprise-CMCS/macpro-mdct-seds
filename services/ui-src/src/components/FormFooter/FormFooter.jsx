import React from "react";
import PropTypes from "prop-types";
import { Button } from "@cmsgov/design-system";
import { Link } from "react-router-dom";
import { dateFormatter } from "../../utility-functions/sortingFunctions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave } from "@fortawesome/free-solid-svg-icons";
import { useStore } from "../../store/store";

const FormFooter = ({ state, year, quarter }) => {
  const userRole = useStore((state) => state.user.role);
  const lastModified = useStore((state) => state.statusData.last_modified);
  const saveForm = useStore((state) => state.saveForm);
  const quarterPath = `/forms/${state}/${year}/${quarter}`;

  return (
    <div data-testid="FormFooter" className="row">
      <div className="form-nav">
        <Link to={quarterPath}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to {`Q${quarter} ${year}`}
        </Link>
      </div>

      <div className="row">
        {lastModified ? (
          <div data-testid="lastModified">
            {" "}
            Last saved: {dateFormatter(lastModified)}{" "}
          </div>
        ) : null}
        <div>
          <Button
            variation="solid"
            onClick={saveForm}
            data-testid="saveButton"
            disabled={userRole !== "state"}
          >
            Save <FontAwesomeIcon icon={faSave} />
          </Button>
        </div>
      </div>
    </div>
  );
};

FormFooter.propTypes = {
  state: PropTypes.string.isRequired,
  year: PropTypes.string.isRequired,
  quarter: PropTypes.string.isRequired,
};

export default FormFooter;
