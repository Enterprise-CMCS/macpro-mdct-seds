import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Grid, GridContainer } from "@trussworks/react-uswds";
import TabContainer from "../components/layout/TabContainer";
import { withRouter, useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { getFormData } from "../store/reducers/singleForm";
import FormHeader from "./FormHeader";
import FormFooter from "./FormFooter";

const FormPage = ({ getForm, disabled, statusData }) => {
  const { last_modified } = statusData;

  // Extract state, year, quarter and formName from URL segments
  const { state, year, quarter, formName } = useParams();

  // format URL parameters to compensate for human error:  /forms/AL/2021/01/21E === forms/al/2021/1/21e
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
        <FormFooter
          state={formattedStateName}
          year={year}
          quarter={quarterInt}
          lastModified={last_modified}
        />
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

//TODO ALEXIS:
// REMOVE REDUX
