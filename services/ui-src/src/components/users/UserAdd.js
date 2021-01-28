import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
// import axios from "../../authenticatedAxios";
import Searchable from "react-searchable-dropdown";
import { TextField, Button } from "@cmsgov/design-system-core";
import MultiSelect from "react-multi-select-component";
import { Grid, GridContainer } from "@trussworks/react-uswds";

/**
 * Add a new record to carts_api_rolefromusername & carts_api_statesfromusername so that the user
 * can become a state, business, or admin.
 *
 * @param {object} currentUser
 * @param {Array} stateList
 */

const AddUser = ({ currentUser, stateList }) => {
  const addUser = async (stateId, userId, role) => {
    if (stateId !== undefined && userId !== "") {
      // const xhrURL = [
      //   window.env.API_POSTGRES_URL,
      //   `/api/v1/adduser/${userId}/${statesToSend}/${role}`
      // ].join("");
      // eslint-disable-next-line
      // await axios.get(xhrURL).then(function (result2) {
      //   window.alert(result2.data.toString());
      //   window.location.reload(false);
      // });
    } else {
      setError(true);
    }
  };

  const roles = [
    { value: "admin", label: "Admin User" },
    { value: "business", label: "Business User" },
    { value: "state", label: "State User" }
  ];

  const [userId, setUserId] = useState();
  const [stateId, setStateId] = useState();
  /* eslint-disable no-unused-vars */
  const [statesToSend, setStatesToSend] = useState();
  const [role, setRole] = useState(null);
  const [error, setError] = useState(false);

  // Save selections for local use and API use
  const setStatesFromSelect = option => {
    // Save for multiselect use
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

  const authorized = (
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
                        value={stateId}
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
                  class="ds-c-button ds-c-button--primary"
                  onClick={() => addUser(stateId, userId, role)}
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
  // const unauthorized = (
  //   <GridContainer className="container">
  //     <Grid row>
  //       <Grid col={12}>
  //         <p>You do not have access to this functionality.</p>
  //       </Grid>
  //     </Grid>
  //   </GridContainer>
  // );

  const userRole = currentUser.role;
  // return userRole === "admin_user" ? authorized : unauthorized;
  return userRole === "admin_user" ? authorized : authorized;
};

AddUser.propTypes = {
  currentUser: PropTypes.object.isRequired,
  stateList: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  // currentUser: state.stateUser.currentUser,
  currentUser: {
    user_id: 1,
    password: "",
    is_superuser: true,
    username: "A1LX",
    first_name: "Andrew",
    last_name: "Adcock",
    email: "aadcock@collabralink.com",
    is_active: true,
    date_joined: "01/22/2021",
    last_login: "01/22/2021",
    states: ["DC", "MD"],
    role: "state"
  },
  // stateList: state.allStatesData.map(element => {
  //   return { label: element.name, value: element.code };
  // })
  stateList: [
    { label: "Alabama", value: "AL" },
    { label: "Maryland", value: "MD" }
  ]
});

export default connect(mapStateToProps)(AddUser);
