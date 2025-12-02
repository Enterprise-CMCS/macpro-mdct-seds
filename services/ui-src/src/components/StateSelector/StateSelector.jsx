import React, { useState, useEffect } from "react";
import { Button } from "@trussworks/react-uswds";
import Dropdown from "react-dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons/faUserCheck";
import { updateUser } from "../../libs/api";
import { useHistory } from "react-router-dom";
import { stateSelectOptions } from "../../lookups/states";
import { useStore } from "../../store/store";

const StateSelector = () => {
  const user = useStore(state => state.user);
  const history = useHistory();
  const [selectedState, setSelectedState] = useState("");

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
            <a href="mailto:mdct_help@cms.hhs.gov">MDCT_Help@cms.hhs.gov</a>
          </p>
        </>
      ) : (
        <>
          <h1>This account is not associated with any states</h1>

          <h3>Please select your state below:</h3>

          <Dropdown
            options={stateSelectOptions}
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
              data-testid="saveUpdatedUser"
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

export default StateSelector;
