import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Grid, GridContainer, Button } from "@trussworks/react-uswds";
import { Link } from "@trussworks/react-uswds";
import { saveForm } from "../../store/actions/saveForm";
import { Auth } from "aws-amplify";

// FontAwesome / Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const FormFooter = ({ state, year, quarter, lastModified }) => {
  const [username, setUsername] = useState();

  useEffect(() => {
    const loadUserData = async () => {
      const AuthUserInfo = await Auth.currentAuthenticatedUser();
      setUsername(AuthUserInfo.username);
    };

    loadUserData();
  });

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
              <Grid col={6}> Last saved: {lastModified} </Grid>
              <Grid col={6}>
                {" "}
                <Button className="hollow" onClick={saveForm(username)}>
                  Save
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
  lastModified: PropTypes.string,
  saveForm: PropTypes.func.isRequired
};

const mapDispatchToProps = {
  saveForm
};

export default connect(null, mapDispatchToProps)(FormFooter);
