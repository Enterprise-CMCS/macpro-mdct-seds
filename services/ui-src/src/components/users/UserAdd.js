import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Searchable from "react-searchable-dropdown";
import { TextField, Button } from "@cmsgov/design-system-core";
import MultiSelect from "react-multi-select-component";
import { Grid, GridContainer } from "@trussworks/react-uswds";
import { createUser } from "../../libs/api";

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
    window.alert(response.data);
    window.location.reload(false);
  }

  // Save selections for local use and API use
  const setStatesFromSelect = option => {
    // Save for multiselect use
    console.log("zzzOption", option);
    setStateId(option);

    // Save for API use
    let states = "";

    let first_iteration = true;
    // Create hyphen separated string of state abbreviations
    option.forEach(item => {
      if (first_iteration) {
        states += item.value;
        first_iteration = false;
      } else {
        states += "-" + item.value;
      }
    });

    setStatesToSend(states);
  };

  const setRoleOnSelect = option => {
    setRole(option.value);

    // Clear States to prevent user error
    setStateId(null);
  };

  return (
    <>
      <div className="user-add">
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
                <a href="/users">User List</a> until they have logged in.
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
                    className="ds-c-field--small"
                    name="eua-id"
                  ></TextField>
                </div>
                <div className="role">
                  Role:
                  <br />
                  <Searchable
                    options={roles}
                    placeholder="Select a Role"
                    onSelect={setRoleOnSelect}
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
                        onSelect={option => {
                          // Set for searchable use
                          setStateId(option);
                          // Set for sending to API
                          setStatesToSend(option.value);
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
                  className="ds-c-button ds-c-button--primary"
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
  // stateList: state.allStatesData.map(element => {
  //   return { label: element.name, value: element.code };
  // })
  stateList: [
    { label: "Alabama", value: "AL" },
    { label: "Maryland", value: "MD" }
  ]
});

export default connect(mapStateToProps)(AddUser);
