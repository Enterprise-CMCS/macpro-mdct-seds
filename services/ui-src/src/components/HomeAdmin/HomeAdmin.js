import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Dropdown from "react-dropdown";
import { Auth } from "aws-amplify";
import { obtainUserByEmail } from "../../libs/api";
import { onError } from "../../libs/errorLib";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  compileStatesForDropdown,
  compileSimpleArrayStates
} from "../../utility-functions/sortingFunctions";

const HomeAdmin = ({ stateList }) => {
  const [selectedState, setSelectedState] = useState();
  const [availableStates, setAvailableStates] = useState([]);
  const [stateError, setStateError] = useState(true);

  useEffect(() => {
    const onLoad = async () => {
      let currentUserInfo;
      try {
        // Get user information
        const AuthUserInfo = await Auth.currentAuthenticatedUser();
        currentUserInfo = await obtainUserByEmail({
          email: AuthUserInfo.attributes.email
        });
      } catch (e) {
        onError(e);
      }

      if (currentUserInfo["Items"]) {
        const userRole = currentUserInfo["Items"][0].role;
        let userStates = currentUserInfo["Items"][0].states;
        let selectedStates;

        if (userRole === "admin") {
          userStates = compileSimpleArrayStates(stateList);
        }

        if (userStates && userStates !== "null") {
          // Convert simple array into array of objects for dropdown
          selectedStates = compileStatesForDropdown(stateList, userStates);
          // Remove default error
          setStateError(false);
        }

        setAvailableStates(selectedStates);
      }
    };

    onLoad();
  }, [stateList]);

  const updateUsState = e => {
    setSelectedState(e.value);
    // Call for list of years/coresets here
  };

  return (
    <div className="HomeAdmin" data-testid="HomeAdmin">
      <h1 className="page-header">Home Admin User Page</h1>
      <div className="padding-left-9 margin-left-9 list-display-container">
        <ul>
          <li className="user-view-edit">
            <Link to="/users" className="text-bold">
              View / Edit Users
            </Link>
          </li>
          <li className="user-add">
            <Link to="/users/add" className="text-bold">
              Create User
            </Link>
          </li>
        </ul>
      </div>
      <div className="state-coreset-container">
        <div className="state-selector">
          <h3>Select Your State</h3>
          {stateError ? (
            <>
              <p>This account is not associated with any states.</p>
              <p>
                If you feel this is an error, please contact the helpdesk{" "}
                <a href="mailto:sedshelp@cms.hhs.gov">SEDSHelp@cms.hhs.gov</a>
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
          <h1>Here is where the coresets should show</h1>
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
