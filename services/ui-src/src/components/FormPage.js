import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Grid, GridContainer } from "@trussworks/react-uswds";
import TabContainer from "../components/layout/TabContainer";

const FormPage = ({ programCode, stateID, quarter }) => {
  return (
    <>
      <h4>
        Enrollment Data Home {">"} Q4 2020 {">"} Form 21E
      </h4>
      <p>FORM 21E</p>
      <hr class="solid" />
      <div className="program-code-bar">
        <p>Program Code: {`${programCode}`}</p>
        <p>State: {`${stateID}`}</p>
        <p>Quarter: {`${quarter}`}</p>
      </div>
      <div className="tab-container">
        <TabContainer />
      </div>
    </>
  );
};

// FormPage.propTypes = {
//   tabs: PropTypes.array.isRequired
// };

const mapState = state => ({
  programCode: state.currentForm.program_code,
  stateID: state.currentForm.state_id,
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
// add form name to subheader bar
// make div for tab container to go in
// add tab container
// add button bar at the bottom (back, save, submit)
// just outside of the tab container area should be the heading "Number of CHIP Children Served, Separate Child Health Program"
// just outside of the tab container area should be the form description
// just outside of the tab container area should be program code, state and quarter
// make a question component that houses the table component- WITH question text
// consider where "isActive" property should be read to disable the entire page

// REDUX: does the App provider need to change locations to supply this page with all that it needs?

// LIST OF MISSING/DUMMY DATA:
// These things are currently being populated with dummy data but will need to be implemented eventually

// ASKS:
// Where is the "does not apply" meant to be put? it would be nice to remove it from the not found page
// Is there a ticket for implementing the summary tab functionality?
