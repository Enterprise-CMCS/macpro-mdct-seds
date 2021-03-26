import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Searchable from "react-searchable-dropdown";
import { TextField, Button } from "@cmsgov/design-system-core";
import MultiSelect from "react-multi-select-component";
import { Grid, GridContainer } from "@trussworks/react-uswds";
import { createUser } from "../../libs/api";
import { Link } from "react-router-dom";

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

    const response = await createUser(data);
    window.alert(response);
    window.location.reload(false);
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
      <div className="user-add react-transition rotate-in">
        <GridContainer className="container">
          <Grid row>
            <Grid col={12}>
              <h1>Add User</h1>
              <p>
                To add a state user, enter their EUA Id, select their state, and
                click Add User.
              </p>
              <p className="note">
                Note: Users will not show up in the{" "}
                <Link to="/users">User List</Link> until they have logged in.
              </p>
              {error && (
                <p className="error" id="Error">
                  You must enter an EUA Id, and select a role and state(s).
                </p>
              )}
              <div>
                <div className="eua-id">
                  <TextField
                    label="EUA Id:"
                    onBlur={e => setUserId(e.target.value)}
                    className=""
                    name="eua-id"
                    required={true}
                  />
                </div>
                <div className="role">
                  Role:
                  <br />
                  <Searchable
                    options={roles}
                    placeholder="Select a Role"
                    onSelect={setRoleOnSelect}
                    required={true}
                  />
                </div>
                <div>
                  {role === "state" ? (
                    <>
                      State:
                      <br />
                      <Searchable
                        options={stateList}
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
                    </>
                  ) : null}
                  {role !== "state" && role !== null ? (
                    <>
                      States:
                      <br />
                      <MultiSelect
                        options={stateList}
                        value={stateId ? stateId : []}
                        required
                        onChange={setStatesFromSelect}
                        labelledBy={"Select States"}
                        multiple={false}
                      />
                    </>
                  ) : null}
                </div>
                <br />
                <Button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => createThisUser()}
                >
                  Add User
                </Button>
              </div>
            </Grid>
          </Grid>
        </GridContainer>
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
