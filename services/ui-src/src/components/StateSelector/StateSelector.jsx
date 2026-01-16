import React, { useState } from "react";
import { Button } from "@cmsgov/design-system";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons/faUserCheck";
import { updateUser } from "../../libs/api";
import { useHistory } from "react-router-dom";
import { getStateName, stateSelectOptions } from "../../lookups/states";
import { useStore } from "../../store/store";

const StateSelector = () => {
  const user = useStore((state) => state.user);
  const loadUser = useStore((state) => state.loadUser);
  const history = useHistory();
  const [selectedState, setSelectedState] = useState();

  const saveUpdatedUser = async () => {
    if (selectedState) {
      const confirm = window.confirm(
        `You have selected ${getStateName(selectedState)}, is this correct?`
      );

      if (confirm) {
        try {
          let userToPass = user;
          userToPass.state = selectedState;
          // Send data to API
          await updateUser(userToPass);
          // Re-fetch from API
          await loadUser();
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
      {user?.state ? (
        <>
          <h2>
            {" "}
            {`This account has already been associated with a state: ${user.state}`}
          </h2>
          <p>
            If you feel this is an error, please contact the helpdesk{" "}
            <a href="mailto:mdct_help@cms.hhs.gov">MDCT_Help@cms.hhs.gov</a>
          </p>
        </>
      ) : user?.role === "admin" || user?.role === "business" ? (
        <>
          <h2>This account does not need to select a state</h2>
          <p>
            {user.role[0].toUpperCase() + user.role.slice(1)} users have access
            to all states' form data.
          </p>
        </>
      ) : (
        <>
          <h1>This account is not associated with any states</h1>

          <label className="usa-label" htmlFor="state-select">
            Please select your state:
          </label>
          <select
            className="usa-select"
            id="state-select"
            value={selectedState}
            onChange={(evt) => setSelectedState(evt.target.value)}
          >
            <option value>- Select a State -</option>
            {stateSelectOptions.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Button
            style={{ marginTop: "0.5rem" }}
            variation="solid"
            className="form-button"
            data-testid="saveUpdatedUser"
            onClick={() => {
              saveUpdatedUser();
            }}
          >
            Update User
            <FontAwesomeIcon icon={faUserCheck} className="margin-left-2" />
          </Button>
        </>
      )}
    </div>
  );
};

export default StateSelector;
