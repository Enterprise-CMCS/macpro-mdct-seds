import React from "react";
import PropTypes from "prop-types";
import { Button } from "@cmsgov/design-system";
import { Link } from "react-router";
import { dateFormatter } from "../../utility-functions/sortingFunctions";
import { useStore } from "../../store/store";

const FormFooter = ({ state, year, quarter }) => {
  const userRole = useStore((state) => state.user.role);
  const lastModified = useStore((state) => state.statusData.last_modified);
  const saveForm = useStore((state) => state.saveForm);
  const quarterPath = `/forms/${state}/${year}/${quarter}`;

  return (
    <div data-testid="FormFooter" className="form-footer">
      <div>
        <Link to={quarterPath}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            width={16}
            height={16}
            aria-hidden="true"
            className="icon arrow-left-icon"
          >
            <use href="/img/fa-icons/arrow-left.svg#arrow-left" />
          </svg>
          Back to {`Q${quarter} ${year}`}
        </Link>
      </div>

      <div className="flex-row">
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
            Save
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              width={16}
              height={16}
              aria-hidden="true"
              className="icon save-icon"
            >
              <use href="/img/fa-icons/save.svg#save" />
            </svg>
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
