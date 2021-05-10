import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Button } from "@trussworks/react-uswds";
import PropTypes from "prop-types";
import Dropdown from "react-dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons/faUserCheck";
import { obtainUserByEmail, updateUser } from "../../libs/api";

import { Auth } from "aws-amplify";

const StateSelector = ({ stateList }) => {
  // Set up local state
  const [state, setState] = useState();

  const [user, setUser] = useState();
  const [selectedState, setSelectedState] = useState("");

  // Get User data
  const loadUserData = async () => {
    // Get user data via email from amplify
    const AuthUserInfo = await Auth.currentAuthenticatedUser();

    let email;
    if (AuthUserInfo.attributes && AuthUserInfo.attributes.email) {
      email = AuthUserInfo.attributes.email;
    } else {
      email = AuthUserInfo.signInUserSession.idToken.payload.email;
    }

    console.log("Retrieved email: ----- \n\n\n\n", email);

    const currentUserInfo = await obtainUserByEmail({
      email: email
    });

    // Save to local state
    setState(currentUserInfo.Items[0].states[0]);
    setUser(currentUserInfo.Items[0]);
  };

  useEffect(() => {
    loadUserData().then();
  }, []);

  const addUserState = event => {
    // Update state for dropdown
    setSelectedState(event);

    // Update user data to save
    let tempUser = { ...user, states: [event.value] };
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
          loadUserData().then();
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
      {user && state && user.states.length > 0 && user.states !== "null" ? (
        <h2> You have a state already</h2>
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

StateSelector.propTypes = {
  stateList: PropTypes.array.isRequired
};

const mapStateToProps = state => ({
  stateList: state.global.states.map(element => {
    return { label: element.state_name, value: element.state_id };
  })
});

export default connect(mapStateToProps)(StateSelector);

// TAKE INTO ACCOUNT STATES WITH NO FORMS

// TODO:
// New component, use redirect component to take users to it and back to the homestate
