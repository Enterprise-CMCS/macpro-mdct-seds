import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Button } from "@trussworks/react-uswds";
import PropTypes from "prop-types";
import Dropdown from "react-dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons/faUserCheck";
import { obtainUserByEmail, updateUser } from "../../libs/api";
import { useHistory } from "react-router-dom";
import { Auth } from "aws-amplify";
import { onError } from "../../libs/errorLib";

const StateSelector = ({ stateList }) => {
  let history = useHistory();

  // Set up local state
  const [user, setUser] = useState();
  const [selectedState, setSelectedState] = useState("");

  // Sort stateList
  stateList.sort((a, b) => (a.value > b.value ? 1 : -1));

  // Get User data
  const loadUserData = async () => {
    let currentUserInfo;

    try {
      // Get user information
      const AuthUserInfo = (await Auth.currentSession()).getIdToken();
      currentUserInfo = await obtainUserByEmail({
        email: AuthUserInfo.payload.email
      });
    } catch (e) {
      onError(e);
    }
    // Save to local state
    if (currentUserInfo["Items"]) {
      setUser(currentUserInfo["Items"][0]);
    }
  };

  useEffect(() => {
    (async () => {
      await loadUserData();
    })();
  }, []);

  const addUserState = event => {
    setSelectedState(event);
  };

  const saveUpdatedUser = async () => {
    if (selectedState) {
      const confirm = window.confirm(
        `You have selected ${selectedState.label}, is this correct?`
      );

      if (confirm) {
        try {
          let userToPass = user;
          userToPass.states = [selectedState.value];
          await updateUser(userToPass);
          history.push("/");
        } catch (error) {
          console.log("Error in state selector:", error);
        }
      } else {
        return;
      }
    } else {
      alert(`Please select a state`);
    }
  };

  return (
    <div className="page-state-selector">
      {user &&
      user.states &&
      user.states.length > 0 &&
      user.states !== "null" ? (
        <>
          <h2>
            {" "}
            {`This account has already been associated with a state: ${user.states[0]}`}
          </h2>
          <p>
            If you feel this is an error, please contact the helpdesk{" "}
            <a href="mailto:mdcthelp@cms.hhs.gov">MDCTHelp@cms.hhs.gov</a>
          </p>
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
              onClick={() => {
                saveUpdatedUser();
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
