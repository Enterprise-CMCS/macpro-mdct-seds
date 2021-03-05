import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Button, Grid, GridContainer } from "@trussworks/react-uswds";
import TabContainer from "../components/layout/TabContainer";
import FormNavigation from "./FormNavigation";

const FormPage = ({ programCode, stateID, quarter }) => {
  return (
    <>
      <GridContainer>
        <h4>
          Enrollment Data Home {">"} Q4 2020 {">"} Form 21E
        </h4>
        <p>FORM 21E</p>
        <hr class="solid" />
        <h2>Number of CHIP Children Served, Separate Child Health Program</h2>

        <Grid row className="program-code-bar">
          <Grid col={4}>
            <b>Program Code:</b> <br />
            {` ${programCode}`}
          </Grid>
          <Grid col={4}>
            <b>State: </b> <br />
            {` ${stateID}`}
          </Grid>
          <Grid col={4}>
            <b>Quarter: </b> <br />
            {` ${quarter}`}
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
            <FormNavigation quarterData={"Q4 2020"} />
          </Grid>
          <Grid col={6}>
            <Grid row>
              <div className="form-actions">
                <p> Last saved: {new Date().toDateString()} </p>
                <Button className="hollow">Save</Button>
                <Button>Submit</Button>
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
  programCode: state.currentForm.program_code,
  stateID: state.currentForm.stateId,
  quarter: state.currentForm.quarter
});

export default connect(mapState)(FormPage);

// TODO:
// X copy base of page from examples.js
// consider what the URL should be
// inspect redux, is most of what is needed present
// connect to redux
// set up prop types
// add subheader bar with links to the top of the page with quarter & home
// X add form name to subheader bar
// make div for tab container to go in
// X add tab container
// X add button bar at the bottom (back, save, submit)
// X just outside of the tab container area should be the heading "Number of CHIP Children Served, Separate Child Health Program"
// X just outside of the tab container area should be the form description
// X just outside of the tab container area should be program code, state and quarter
// make a question component that houses the table component- WITH question text
// consider where "isActive" property should be read to disable the entire page
// center form footer
// how will question answers be connected?? how are we keeping track of answer entry??
// question numbers
// All classnames get SASS or they get deleted
// Add question & answer endpoints to redux

// REDUX: does the App provider need to change locations to supply this page with all that it needs?

// LIST OF MISSING/DUMMY DATA:
// These things are currently being populated with dummy data but will need to be implemented eventually

// ASKS:
// Where is the "does not apply" meant to be put? it would be nice to remove it from the not found page
// Is there a ticket for implementing the summary tab functionality?
