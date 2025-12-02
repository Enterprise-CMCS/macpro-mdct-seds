import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Grid, GridContainer, Button } from "@trussworks/react-uswds";
import { Link } from "react-router-dom";
import { dateFormatter } from "../../utility-functions/sortingFunctions";

// FontAwesome / Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave } from "@fortawesome/free-solid-svg-icons";
import { getUserInfo } from "../../utility-functions/userFunctions";
import { useStore } from "../../store/store";

const FormFooter = ({ state, year, quarter }) => {
  const lastModified = useStore(state => state.statusData.last_modified);
  const saveForm = useStore(state => state.saveForm);
  const [saveDisabled, setSaveDisabled] = useState(false);
  const handleClick = () => {
    saveForm();
  };

  const determineUserRole = async () => {
    const currentUser = await getUserInfo();

    if (
      currentUser.Items &&
      (currentUser.Items[0].role === "admin" ||
        currentUser.Items[0].role === "business")
    ) {
      setSaveDisabled(true);
    }
  };

  // FALSE = the form APPLIES TO THIS STATE (0)
  // TRUE = the form is NOT APPLICABLE (1)

  useEffect(() => {
    determineUserRole().then();
  }, []);

  const quarterPath = `/forms/${state}/${year}/${quarter}`;
  return (
    <div className="formfooter" data-testid="FormFooter">
      <GridContainer>
        <Grid row>
          <Grid col={6} className="form-nav">
            <Link to={quarterPath}>
              {" "}
              <FontAwesomeIcon icon={faArrowLeft} /> Back to{" "}
              {`Q${quarter} ${year}`}
            </Link>
          </Grid>

          <Grid col={6} className="form-actions">
            <Grid row>
              {lastModified ? (
                <Grid col={9} data-testid="lastModified">
                  {" "}
                  Last saved: {dateFormatter(lastModified)}{" "}
                </Grid>
              ) : null}
              <Grid col={3}>
                {" "}
                <Button
                  primary="true"
                  onClick={() => handleClick()}
                  data-testid="saveButton"
                  disabled={saveDisabled}
                >
                  Save{" "}
                  <FontAwesomeIcon icon={faSave} className="margin-left-2" />
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </GridContainer>
    </div>
  );
};

FormFooter.propTypes = {
  state: PropTypes.string.isRequired,
  year: PropTypes.string.isRequired,
  quarter: PropTypes.string.isRequired,
};

export default FormFooter;
