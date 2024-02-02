import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Searchable from "react-searchable-dropdown";
import MultiSelect from "react-multi-select-component";
import { adminCreateUser } from "../../libs/api";
import { Table, Button, TextInput } from "@trussworks/react-uswds";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons/faUserPlus";

import "./AddUser.scss";

const AddUser = ({ currentUser, stateList }) => {
  const [userId, setUserId] = useState();
  const [stateId, setStateId] = useState([]);
  /* eslint-disable no-unused-vars */
  const [statesToSend, setStatesToSend] = useState();
  const [role, setRole] = useState(null);
  const [error, setError] = useState(false);

  const roles = [
    { value: "admin", label: "Admin User" },
    { value: "business", label: "Business User" },
    { value: "state", label: "State User" }
  ];

  async function createThisUser() {
    const data = {
      username: userId,
      role: role,
      states: statesToSend
    };

    const response = await adminCreateUser(data);
    window.alert(response);
  }

  // Save selections for local use and API use
  const setStatesFromSelect = option => {
    // Save for multiselect use
    setStateId(option);

    let newStates = [];
    if (Array.isArray(option)) {
      // Simplify array for saving to DB
      for (const state in option) {
        newStates.push(option[state].value);
      }
    } else {
      if (option.value) {
        newStates = [option.value];
      }
    }

    setStatesToSend(newStates);
  };

  const setRoleOnSelect = option => {
    setRole(option.value);

    // Clear States to prevent user error
    setStateId(null);
  };

  return (
    <>
      <div className="react-transition fade-in" data-testid="AddUser">
        <h1 className="page-header">Add User</h1>
        <div className="addUserMain padding-left-9">
          <p>
            To add a <b>state user</b>, enter their EUA Id, select their state,
            and click Add User.
          </p>
          <p className="note">
            <b className="margin-right-3 text-secondary-dark">Note:</b> Users
            will not show up in the{" "}
            <Link to="/users" className="userList text-bold margin-x-2">
              User List
            </Link>{" "}
            until they have logged in.
          </p>
          {error && (
            <p className="error" id="Error">
              You must enter an EUA Id, and select a role and state(s).
            </p>
          )}
          <div className="euaID center-content margin-top-5">
            <Table>
              <tbody>
                <tr>
                  <th>EUA ID:</th>
                  <td>
                    <TextInput
                      onBlur={e => setUserId(e.target.value)}
                      className="eua-ID form-input"
                      name="eua-id"
                      required={true}
                    />
                  </td>
                </tr>
                <tr>
                  <th>Role</th>
                  <td>
                    <Searchable
                      options={roles}
                      placeholder="Select a Role"
                      onSelect={setRoleOnSelect}
                      required={true}
                      className="selectRole form-input"
                    />
                  </td>
                </tr>

                {role === "state" ? (
                  <tr>
                    <th>State:</th>
                    <td>
                      <Searchable
                        options={stateList}
                        className="selectState form-input"
                        multiple={true}
                        placeholder="Select a State"
                        required
                        onSelect={option => {
                          // Set for searchable use
                          setStateId(option);
                          // Set for sending to API
                          setStatesToSend([option.value]);
                        }}
                      />
                    </td>
                  </tr>
                ) : null}
                {role !== "state" && role !== null ? (
                  <tr>
                    <th>States:</th>
                    <td>
                      <MultiSelect
                        options={stateList}
                        className="selectState form-input"
                        value={stateId ? stateId : []}
                        required
                        onChange={setStatesFromSelect}
                        labelledBy={"Select States"}
                        multiple={false}
                      />
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </Table>

            <div className="action-buttons">
              <Button
                type="button"
                className="createUser form-button"
                onClick={() => createThisUser()}
              >
                Add User
                <FontAwesomeIcon icon={faUserPlus} className="margin-left-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

AddUser.propTypes = {
  stateList: PropTypes.array.isRequired
};

const mapStateToProps = state => ({
  stateList: state.global.states.map(element => {
    return { label: element.state_name, value: element.state_id };
  })
});

export default connect(mapStateToProps)(AddUser);
