import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Button, Grid, GridContainer } from "@trussworks/react-uswds";
import TabContainer from "../components/layout/TabContainer";
import FormNavigation from "./FormNavigation";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { getFormData } from "../store/reducers/singleForm";

const FormPage = ({ getForm, disabled }) => {
  // Determine values based on URI
  // const url = location.pathname.split("/");
  let url = ["", "forms", "AL", "2021", "01", "21E"];
  const [, , state, year, quarter, formName] = url;

  // strip leading zeros
  const quarterInt = Number.parseInt(quarter).toString();

  // Fetch quarter statuses and set them in redux store
  useEffect(() => {
    getForm(state, year, quarter, formName);
  }, []);

  return (
    <>
      <GridContainer>
        <h4>
          Enrollment Data Home {">"} Q{quarterInt} {year} {">"} Form {formName}
        </h4>
        <p>FORM {formName}</p>
        <hr class="solid" />
        <h2>Number of CHIP Children Served, Separate Child Health Program</h2>

        <Grid row className="program-code-bar">
          <Grid col={6}>
            <b>State: </b> <br />
            {` ${state}`}
          </Grid>
          <Grid col={6}>
            <b>Quarter: </b> <br />
            {` ${quarterInt}/${year}`}
          </Grid>
        </Grid>
      </GridContainer>

      <GridContainer>
        <div className="tab-container">
          <TabContainer />
        </div>
      </GridContainer>

      <GridContainer className="form-footer">
        <Grid row>
          <Grid col={6}>
            <FormNavigation state={state} year={year} quarter={quarterInt} />
          </Grid>
          <Grid col={6}>
            <Grid row>
              <div className="form-actions">
                <p> Last saved: {new Date().toDateString()} </p>
                <Button className="hollow">Save</Button>
              </div>
            </Grid>
          </Grid>
        </Grid>
      </GridContainer>
    </>
  );
};

// FormPage.propTypes = {
//   tabs: PropTypes.array.isRequired
// };

const mapState = state => ({
  disabled:
    state.currentForm.notApplicable || state.currentForm.status === "final",
  questions: state.currentForm.questions,
  answers: state.currentForm.answers
});

const mapDispatch = {
  getForm: getFormData ?? {}
};

export default connect(mapState, mapDispatch)(withRouter(FormPage));

// consider where "isActive" property should be read to disable the entire page
// how will question answers be connected?? how are we keeping track of answer entry??

// All classnames get SASS or they get deleted
// Add question & answer endpoints to redux
// MUST BE DISABLED WITH SPECIFIC STATUS

// big 3 for tonight:
// connect 3 apis to redux
// make form disable-able
// question IDs to answers
// router/URL??? take from quarterly

// NOT TONGIHT:
// Where is the "does not apply" meant to be put? it would be nice to remove it from the not found page
// Add "disabled" boolean property to TextInput fields in GridWithTotals

// QUESTIONS:
// In forms list API-- why do we have "status" AND "not_applicable" when "Not Required" is a type of status? which should we keep?
// I need clarity on the statuses because the values in the table are not the same as the ones in the JSON

// CONNECTING TO REDUX:
// make a function that calls the single form api
// put data call into current form
// connect to component
// FIX EXERY INSTANCE of currentForm. (anything)
