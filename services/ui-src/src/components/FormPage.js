import React, { useState, useEffect } from "react";
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

  // format URL segments
  const formattedStateName = state.toUpperCase();
  const quarterInt = Number.parseInt(quarter).toString();
  const formattedFormName = formName.toUpperCase();

  // Call the API and set questions, answers and status data in redux based on URL params
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

// FormPage.propTypes = {
//   tabs: PropTypes.array.isRequired
// };

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
// XXX connect 3 apis to redux
// (A) router/URL??? take from quarterly
// (B) question IDs to answers
// put description back in and email Jenna

// NOT TONGIHT:
// Where is the "does not apply" meant to be put? it would be nice to remove it from the not found page
// Add "disabled" boolean property to TextInput fields in GridWithTotals
// undo redux connection to quarterly component (there is no parent child relationship, whoops)
// put files in appropriate folders
// General cleanup, remove console logs and unnecessary comments
// All classnames get SASS or they get deleted
// answers in redux need to be sorted by tabs (age range)
// the URL is case sensitive

// QUESTIONS:
// In forms list API-- why do we have "status" AND "not_applicable" when "Not Required" is a type of status? which should we keep?
// I need clarity on the statuses because the values in the table are not the same as the ones in the JSON
// error in forms endpoint-- two forms have form_id of 3 ,64.EC should be id 2
// CONFIRM: for a given state/year/quarter will there ever be duplicate forms?
// There should be a little ticket for populating redux with age ranges (especcially because that is now a mutable element)
