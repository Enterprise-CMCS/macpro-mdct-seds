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
  const [state, setState] = useState([]);
  const [user, setUser] = useState();
  const [selectedState, setSelectedState] = useState("");

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
      setState(currentUserInfo["Items"][0].states[0]);
      setUser(currentUserInfo["Items"][0]);
    }
  };

  useEffect(() => {
    (async () => {
      await loadUserData().then();
    })();
  }, []);

  const addUserState = event => {
    setSelectedState(event);
    setUser({ ...user, states: [event.value] });
  };

  const saveUpdatedUser = async () => {
    if (
      selectedState !== null &&
      selectedState !== undefined &&
      selectedState !== ""
    ) {
      const confirm = window.confirm(
        `You have selected ${selectedState.label}, is this correct?`
      );

      if (confirm) {
        try {
          await updateUser(user);
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
      {user && state && user.states.length > 0 && user.states !== "null" ? (
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
