import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Accordion, Button, Alert } from "@trussworks/react-uswds";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Dropdown from "react-dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons/faUserCheck";
import {
  obtainUserByEmail,
  obtainAvailableForms,
  getUserById,
  updateUser
} from "../../libs/api";

import { Auth } from "aws-amplify";

const HomeState = ({ stateList }) => {
  // Set up local state
  const [state, setState] = useState();
  const [formData, setFormData] = useState();

  const [user, setUser] = useState();
  const [selectedState, setSelectedState] = useState("");
  const [saveAlert, setSaveAlert] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [accordionItems, setAccordionItems] = useState([]);

  // Get User data
  const loadUserData = async () => {
    // Get user data via email from amplify
    const AuthUserInfo = await Auth.currentAuthenticatedUser();

    let email;

    console.log(AuthUserInfo);

    if (AuthUserInfo.attributes && AuthUserInfo.attributes.email) {
      email = AuthUserInfo.attributes.email;
    } else {
      email = AuthUserInfo.signInUserSession.idToken.payload.email;
    }

    console.log("Retrieved email: -----");
    console.log(email);

    const currentUserInfo = await obtainUserByEmail({
      email: email
    });

    // Save to local state
    setState(currentUserInfo.Items[0].states[0]);
    setUser(currentUserInfo.Items[0]);

    let forms = [];
    try {
      // Get list of all state forms
      forms = await obtainAvailableForms({
        stateId: currentUserInfo.Items[0].states[0]
      });
      setSaveAlert(true);
      // After 5 seconds, remove the alert
      setTimeout(() => {
        setSaveAlert(false);
      }, 5000);
    } catch (error) {
      console.log("ERROR OBTAINING AVAILABLE FORMS \n\n\n", error);
      setSaveFailed(true);
      // After 5 seconds, remove the alert
      setTimeout(() => {
        setSaveFailed(false);
      }, 5000);
    }
    // Sort forms descending by year and then quarter
    forms.sort(function (a, b) {
      if (a.year === b.year) {
        return a.quarter - b.quarter;
      } else if (a.year < b.year) {
        return 1;
      } else if (a.year > b.year) {
        return -1;
      }
      return false;
    });

    setFormData(forms);
  };

  useEffect(() => {
    loadUserData().then(createAccordion()).then();
  }, []);

  const createAccordion = () => {
    // Create an array of unique years
    let uniqueYears;
    if (formData) {
      uniqueYears = Array.from(new Set(formData.map(a => a.year))).map(year => {
        return formData.find(a => a.year === year);
      });
    }

    let tempAccordion = [];

    // Loop through years to build quarters
    for (const year in uniqueYears) {
      let quarters = [];

      // Loop through all formData and get quarters if year matches
      for (const form in formData) {
        // If years match, add quarter to array
        if (formData[form].year === uniqueYears[year].year) {
          quarters.push(formData[form]);
        }
      }

      // Remove duplicate quarters
      let uniqueQuarters;
      if (quarters) {
        uniqueQuarters = Array.from(new Set(quarters.map(a => a.quarter))).map(
          quarter => {
            return quarters.find(a => a.quarter === quarter);
          }
        );
      }

      // Build output for each accordion item
      let quartersOutput = (
        <ul className="quarterly-items">
          {uniqueQuarters.map(element => {
            return (
              <li key={`${element.quarter}`}>
                <Link
                  to={`/forms/${state}/${uniqueYears[year].year}/${element.quarter}`}
                >
                  Quarter {`${element.quarter}`}
                </Link>
              </li>
            );
          })}
        </ul>
      );

      // If current year, set expanded to true
      let expanded = false;
      let currentDate = new Date();
      if (uniqueYears[year].year === currentDate.getFullYear()) {
        expanded = true;
      }

      // Build single item
      let item = {
        id: uniqueYears[year].year,
        description: "Quarters for " + uniqueYears[year].year,
        title: uniqueYears[year].year,
        content: quartersOutput,
        expanded: expanded
      };

      tempAccordion.push(item);
    }
    setAccordionItems(tempAccordion);
  };

  const addUserState = event => {
    // Update state for dropdown
    setSelectedState(event);

    // Update user data to save
    let tempUser = { ...user, states: event.value };
    setUser(tempUser);
  };

  const saveUpdatedUser = async data => {
    if (
      selectedState !== null &&
      selectedState !== undefined &&
      selectedState !== ""
    ) {
      const confirm = window.confirm(
        `You have selected ${selectedState.label}, is this correct?`
      );

      if (confirm) {
        await updateUser(data).then(() => {
          loadUserData().then(createAccordion()).then();
        });
      } else {
        return;
      }
    } else {
      alert(`Please select a state`);
    }
  };

  return (
    <div className="page-home-state">
      {saveAlert ? (
        <Alert type="success" heading="Update success:">
          {`State user "${user.username}" has been assigned to ${selectedState.label}`}
        </Alert>
      ) : null}

      {saveFailed ? (
        <Alert type="error" heading="Update failed:">
          {`There was an error assigning ${user.username} to a state`}
        </Alert>
      ) : null}

      {accordionItems.length !== 0 ? (
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
        <>
          <h1>This account is not associated with any states</h1>

          <h3>Please select your state below:</h3>

          <Dropdown
            options={stateList}
            onChange={event => addUserState(event)}
            value={selectedState ? selectedState : ""}
            placeholder="Select a state"
            autosize={false}
            className="state-select-list"
          />
          <div className="action-buttons">
            <Button
              type="button"
              className="form-button"
              onClick={async () => {
                await saveUpdatedUser(user);
              }}
            >
              Update User
              <FontAwesomeIcon icon={faUserCheck} className="margin-left-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

HomeState.propTypes = {
  stateList: PropTypes.array.isRequired
};

const mapStateToProps = state => ({
  stateList: state.global.states.map(element => {
    return { label: element.state_name, value: element.state_id };
  })
});

export default connect(mapStateToProps)(HomeState);

//OBJECT FROM obtainUserByEmail {
//   "firstName": "Alexis",
//   "lastLogin": "2021-02-22T15:28:50.919Z",
//   "lastName": "Woodbury",
//   "password": "",
//   "role": "state",
//   "dateJoined": "2021-02-22T15:20:59.081Z",
//   "isSuperUser": true,
//   "isActive": true,
//   "userId": "0",
//   "email": "awoodbury@collabralink.com",
//   "states": "AK",
//   "username": "WAQF"
// }

// OBJECT FROM getUserById ??

// FORM SUB:
// let forms = [];
// try {
//   // Get list of all state forms
//   forms = await obtainAvailableForms({
//     stateId: currentUserInfo.Items[0].states[0]
//   });
//   setSaveAlert(true);
//   // After 5 seconds, remove the alert
//   setTimeout(() => {
//     setSaveAlert(false);
//   }, 5000);
// } catch (error) {
//   console.log("ERROR OBTAINING AVAILABLE FORMS \n\n\n", error);
//   setSaveFailed(true);
//   // After 5 seconds, remove the alert
//   setTimeout(() => {
//     setSaveFailed(false);
//   }, 5000);
// }
