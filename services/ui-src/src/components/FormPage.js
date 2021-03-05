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
    state.currentForm.statusData.not_applicable ||
    state.currentForm.statusData.status === "final",
  questions: state.currentForm.questions,
  answers: state.currentForm.answers
});

const mapDispatch = {
  getForm: getFormData ?? {}
};

export default connect(mapState, mapDispatch)(withRouter(FormPage));

// consider where "isActive" property should be read to disable the entire page
// how will question answers be connected?? how are we keeping track of answer entry??

// big 3 for tonight:
// XXX connect 3 apis to redux
// question IDs to answers
// router/URL??? take from quarterly

// NOT TONGIHT:
// Where is the "does not apply" meant to be put? it would be nice to remove it from the not found page
// Add "disabled" boolean property to TextInput fields in GridWithTotals
// undo redux connection to quarterly component (there is no parent child relationship, whoops)
// put files in appropriate folders
// General cleanup, remove console logs and unnecessary comments
// All classnames get SASS or they get deleted
// answers in redux need to be sorted by tabs (age range)

// QUESTIONS:
// In forms list API-- why do we have "status" AND "not_applicable" when "Not Required" is a type of status? which should we keep?
// I need clarity on the statuses because the values in the table are not the same as the ones in the JSON
// error in forms endpoint-- two forms have form_id of 3 ,64.EC should be id 2
// CONFIRM: for a given state/year/quarter will there ever be duplicate forms?
// There should be a little ticket for populating redux with age ranges (especcially because that is now a mutable element)
