import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Dropdown from "react-dropdown";
import { obtainAvailableForms } from "../../libs/api";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  compileStatesForDropdown,
  compileSimpleArrayStates,
  buildSortedAccordionByYearQuarter
} from "../../utility-functions/sortingFunctions";
import { Accordion } from "@trussworks/react-uswds";
import "./HomeAdmin.scss";
import { getUserInfo } from "../../utility-functions/userFunctions";

const HomeAdmin = ({ stateList, user }) => {
  const [selectedState, setSelectedState] = useState();
  const [availableStates, setAvailableStates] = useState([]);
  const [stateError, setStateError] = useState(true);
  const [accordionItems, setAccordionItems] = useState("");

  let history = useHistory();

  useEffect(() => {
    const onLoad = async () => {
      let currentUserInfo = await getUserInfo();

      if (currentUserInfo["Items"]) {
        let userStates = currentUserInfo["Items"][0].states;
        let selectedStates = false;

        // If using all states, create a simple array of states for use in compileStatesForDropdown
        if (user.role === "admin") {
          userStates = compileSimpleArrayStates(stateList);
        }

        if (userStates && userStates !== "null" && userStates.length > 0) {
          // Convert simple array into array of objects for dropdown
          selectedStates = compileStatesForDropdown(stateList, userStates);
          // Remove default error
          setStateError(false);
        }

        // Redirect to register-state if business user with no states
        if (!selectedStates) {
          history.push("/register-state");
        } else {
          selectedStates.sort((a, b) => {
            let stateA = a.label.toUpperCase();
            let stateB = b.label.toUpperCase();
            return stateA < stateB ? -1 : stateA > stateB ? 1 : 0;
          });
        }

        setAvailableStates(selectedStates);
      }
    };

    onLoad().then();
    /* eslint-disable */
  }, []);

  const updateUsState = async e => {
    setSelectedState(e.value);

    // Get list of all state forms
    let forms;
    try {
      forms = await obtainAvailableForms({
        stateId: e.value
      });
    } catch (e) {
      forms = [];
    }

    // Build Accordion items and set to local state
    setAccordionItems(buildSortedAccordionByYearQuarter(forms, e.value));
  };

  let role = user.role;
  return (
    <div className="HomeAdmin" data-testid="HomeAdmin">
      {role === "admin" ? (
        <div>
          <h1 className="page-header">Home Admin User Page</h1>
          <div className="list-display-container">
            <ul>
              <li className="user-view-edit">
                <Link to="/users" className="text-bold">
                  View / Edit Users
                </Link>
              </li>
              <li className="form-templates">
                <Link to="/form-templates" className="text-bold">
                  Add/Edit Form Templates
                </Link>
              </li>
              <li className="generate-forms">
                <Link to="/generate-forms" className="text-bold">
                  Generate Quarterly Forms
                </Link>
              </li>
              <li className="generate-counts">
                <Link to="/generate-counts" className="text-bold">
                  Generate Total Enrollment Counts
                </Link>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <h1 className="page-header">Home Business User Page</h1>
      )}
      <div className="state-coreset-container margin-bottom-2">
        <div className="state-selector">
          <h3>Select Your State</h3>
          {stateError ? (
            <>
              <p>This account is not associated with any states.</p>
              <p>
                If you feel this is an error, please contact the helpdesk{" "}
                <a href="mailto:mdct_help@cms.hhs.gov">MDCT_Help@cms.hhs.gov</a>
              </p>
            </>
          ) : (
            <Dropdown
              options={availableStates}
              onChange={e => updateUsState(e)}
              value={selectedState ? selectedState : ""}
              placeholder="Select a state"
              autosize={false}
              className="state-select-list"
            />
          )}
        </div>

        <div className="year-coreset-selector">
          {accordionItems && accordionItems.length !== 0 ? (
            <>
              <p className="instructions">
                Welcome to SEDS! Please select a Federal Fiscal Year and quarter
                below to view available reports.
              </p>

              <div className="quarterly-report-list">
                <Accordion bordered={true} items={accordionItems} />
              </div>
            </>
          ) : (
            accordionItems !== "" &&
            "There are no forms available for the selected state"
          )}
        </div>
      </div>
    </div>
  );
};

HomeAdmin.propTypes = {
  stateList: PropTypes.array.isRequired
};

const mapStateToProps = state => ({
  stateList: state.global.states.map(element => {
    return { label: element.state_name, value: element.state_id };
  })
});

export default connect(mapStateToProps)(HomeAdmin);
