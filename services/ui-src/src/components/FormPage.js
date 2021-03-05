import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Button, Grid, GridContainer } from "@trussworks/react-uswds";
import TabContainer from "../components/layout/TabContainer";
import FormNavigation from "./FormNavigation";
import { withRouter, useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { getFormData } from "../store/reducers/singleForm";
import FormHeader from "./FormHeader";

const FormPage = ({ getForm, disabled, statusData }) => {
  const { last_modified } = statusData;
  const { state, year, quarter, formName } = useParams();

  // format URL parameters
  const formattedStateName = state.toUpperCase();
  const quarterInt = Number.parseInt(quarter).toString();
  const formattedFormName = formName.toUpperCase();

  // Call the API and set questions, answers and status data in redux based on URL parameters
  useEffect(() => {
    getForm(formattedStateName, year, quarterInt, formattedFormName);
  }, []);

  return (
    <>
      <GridContainer className="form-header">
        <FormHeader
          quarter={quarterInt}
          form={formattedFormName}
          year={year}
          state={formattedStateName}
        />
      </GridContainer>

      <GridContainer>
        <div className="tab-container">
          <TabContainer />
        </div>
      </GridContainer>

      <GridContainer className="form-footer">
        <Grid row>
          <Grid col={6}>
            <FormNavigation
              state={formattedStateName}
              year={year}
              quarter={quarterInt}
            />
          </Grid>
          <Grid col={6}>
            <Grid row>
              <div className="form-actions">
                <p> Last saved: {last_modified} </p>
                <Button className="hollow">Save</Button>
              </div>
            </Grid>
          </Grid>
        </Grid>
      </GridContainer>
    </>
  );
};

FormPage.propTypes = {
  disabled: PropTypes.bool.isRequired,
  statusData: PropTypes.object.isRequired,
  getForm: PropTypes.func.isRequired
};

const mapState = state => ({
  disabled:
    state.currentForm.statusData.not_applicable ||
    state.currentForm.statusData.status === "final",
  statusData: state.currentForm.statusData
});

const mapDispatch = {
  getForm: getFormData ?? {}
};

export default connect(mapState, mapDispatch)(withRouter(FormPage));

// consider where "isActive" property should be read to disable the entire page
// how will question answers be connected?? how are we keeping track of answer entry??

// big 3 for tonight:
// (B) question IDs to answers
// answers in redux need to be sorted by tabs (age range)
