import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import { Button, Grid, GridContainer } from "@trussworks/react-uswds";
import { TextField } from "@cmsgov/design-system-core";
import MultiSelect from "react-multi-select-component";
import PropTypes from "prop-types";
import Searchable from "react-searchable-dropdown";
import { getUser, updateUser } from "../../libs/api";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";

/**
 * View/edit a single user with options
 *
 * @constructor
 */

const UserEdit = ({ stateList }) => {
  // Get params from url
  let { id } = useParams();

  // Set up local state
  const [user, setUser] = useState();
  const [role, setRole] = useState();
  const [isActive, setIsActive] = useState();

  const [selectedStates, setSelectedStates] = useState([]);
  /* eslint-disable no-unused-vars */
  const [statesToSend, setStatesToSend] = useState([]);
  // Get User data
  const loadUserData = async () => {
    // Retrive user data from datastore
    const getUserData = { userId: id };
    const data = await getUser(getUserData);
    setUser(data);
    setRole(data.role);

    // Sort states alphabetically
    const theStates = data.states.sort();

    // Set states to array of objects
    if (data.role !== "state") {
      setSelectedStates(
        theStates.map(e => {
          let stateName;
          // Get full state name from redux
          for (const state in stateList) {
            if (stateList[state].value === e) {
              stateName = stateList[state].label;
            }
          }
          return { label: stateName, value: e };
        })
      );
    } else {
      for (let x in data) {
        for (const state in stateList) {
          let index = data[x];
          if (stateList[state].value === index[0]) {
            setSelectedStates({
              label: stateList[state].label,
              value: stateList[state].value
            });
          }
        }
      }
    }
    return data;
  };

  useEffect(() => {
    loadUserData();
    // eslint-disable-next-line
  }, []);

  // Save selections for local use and API use
  const setStatesFromArray = (option, simple = false) => {
    // Save for API use
    let states = "";
    if (option) {
      if (simple) {
        states = option.join("-");
      } else {
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
      }
    }
    if (!states) {
      states = "null";
    }
    setStatesToSend(states);
  };

  const roles = [
    { value: "admin", label: "Admin User" },
    { value: "business", label: "Business User" },
    { value: "state", label: "State User" }
  ];

  const statuses = [
    { value: true, label: "Active" },
    { value: false, label: "Inactive" }
  ];

  // Update user object
  const updateLocalUser = (e, field) => {
    let tempUser = { ...user };
    let response;

    if (field === "states") {
      setSelectedStates(e);
      // If from multiselect, else single selection
      if (Array.isArray(e)) {
        let payload = [];
        e.forEach(i => {
          payload.push(i.value);
        });
        payload.sort();
        response = payload;
        // Format for URI use
        setStatesFromArray(e);
      } else {
        if (!e.value) {
          e.value = "null";
        }
        setStatesToSend([...statesToSend, e.value]);
        response = [e.value];
      }

      // Write to local state
    } else if (field === "role") {
      // Save to local state
      setRole(e.value);
      setStatesToSend("null");
      setSelectedStates();
      // Update user
      response = e.value;
    } else if (field === "isActive") {
      response = e.value;
      if (e.value) {
        setIsActive("True");
      } else {
        setIsActive("False");
      }
    } else {
      response = e.target.value;
    }
    tempUser[field] = response;
    setUser(tempUser);
  };

  const getStatus = status => {
    if (status) {
      return true;
    }
    return false;
  };

  const updateUserStore = async data => {
    await updateUser(data).then(() => {
      alert(`User with username: "${data.username}" has been updated`);
    });
  };

  return (
    <div className="edit-user ds-l-col--6">
      <GridContainer className="container">
        <Grid col={4}>
          <a href="/users">&laquo; Back to User List</a>
          <h1>Edit User</h1>
          {user ? (
            <>
              <div className="textfield">
                <TextField
                  value={user.username}
                  type="text"
                  label="Username"
                  onChange={e => updateLocalUser(e, "username")}
                  disabled={true}
                  name="username"
                />
              </div>
              <div className="textfield">
                <TextField
                  value={user.firstName}
                  type="text"
                  label="First Name"
                  onChange={e => updateLocalUser(e, "firstName")}
                  disabled={true}
                  name="firstName"
                />
              </div>
              <div className="textfield">
                <TextField
                  value={user.lastName}
                  type="text"
                  label="Last Name"
                  onChange={e => updateLocalUser(e, "lastName")}
                  disabled={true}
                  name="lastName"
                />
              </div>
              <div className="textfield">
                <TextField
                  value={user.email}
                  type="text"
                  label="Email"
                  onChange={e => updateLocalUser(e, "email")}
                  disabled={true}
                  name="email"
                />
              </div>
              <div className="dropdown">
                <>
                  <label className="ds-c-label">Role</label>
                  <Searchable
                    options={roles}
                    placeholder="Select a Role"
                    onSelect={e => updateLocalUser(e, "role")}
                    value={role ? role : user.role}
                  />
                </>
              </div>
              <div className="dropdown">
                {role === "state" ? (
                  <>
                    <label className="ds-c-label">State</label>
                    <Dropdown
                      options={stateList}
                      onChange={e => updateLocalUser(e, "states")}
                      value={selectedStates ? selectedStates : []}
                      placeholder="Select an state"
                      autosize={false}
                    />
                  </>
                ) : null}
                {role !== "state" && role !== null ? (
                  <>
                    <label className="ds-c-label">State</label>
                    <MultiSelect
                      options={stateList}
                      value={selectedStates ? selectedStates : []}
                      onChange={e => updateLocalUser(e, "states")}
                      labelledBy={"Select States"}
                      multiple={false}
                    />
                  </>
                ) : null}
              </div>
              <div className="dropdown">
                <>
                  <label className="ds-c-label">Status</label>
                  <Searchable
                    options={statuses}
                    multiple={false}
                    placeholder="Select a Status"
                    onSelect={e => updateLocalUser(e, "isActive")}
                    value={isActive ? isActive : getStatus(user.isActive)}
                  />
                </>
              </div>
              <div className="textfield">
                <TextField
                  value={user.dateJoined}
                  type="text"
                  label="Registration Date"
                  disabled={true}
                  name="registration date"
                />
              </div>
              <div className="textfield">
                <TextField
                  value={user.lastLogin}
                  type="text"
                  label="Last Login"
                  disabled={true}
                  name="last login"
                />
              </div>
              <br />
              <Button
                type="button"
                className="btn btn-primary"
                onClick={async () => {
                  await updateUserStore(user);
                }}
              >
                Update User
              </Button>
            </>
          ) : (
            `Cannot find user with id ${id}`
          )}
        </Grid>
      </GridContainer>
    </div>
  );
};

UserEdit.propTypes = {
  stateList: PropTypes.array.isRequired
};

const mapStateToProps = state => ({
  stateList: state.global.states.map(element => {
    return { label: element.state_name, value: element.state_id };
  })
});

export default connect(mapStateToProps)(UserEdit);
