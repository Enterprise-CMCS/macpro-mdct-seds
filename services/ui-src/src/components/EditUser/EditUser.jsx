import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { MultiSelect } from "react-multi-select-component";
import PropTypes from "prop-types";
import Searchable from "react-searchable-dropdown";
import Dropdown from "react-dropdown";
import { Table, TextInput, Button } from "@trussworks/react-uswds";
import "react-dropdown/style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons/faUserCheck";

import { getUserById, updateUser } from "../../libs/api";

import "./EditUser.scss";

/**
 * View/edit a single user with options
 *
 * @constructor
 */

const EditUser = ({ stateList }) => {
  // Get params from url
  let { id } = useParams();

  // Set up local state
  const [username, setUsername] = useState();
  const [user, setUser] = useState();
  const [role, setRole] = useState();

  const [selectedStates, setSelectedStates] = useState([]);
  /* eslint-disable no-unused-vars */
  const [statesToSend, setStatesToSend] = useState([]);
  // Get User data
  const loadUserData = async () => {
    // Retrive user data from datastore
    const getUserData = { userId: id };

    const user = await getUserById(getUserData);
    if (user.status === "success") {
      setUser(user.data);
      setRole(user.data.role);
      setUsername(user.data.username);
    }
    // Sort states alphabetically and place in array
    let theStates = [];
    const userStates =
      user.data?.states && user.data.states !== "null" ? user.data.states : [];
    if (userStates) {
      theStates = userStates.sort();
    }

    // Set states to array of objects
    if (user.data?.role !== "state") {
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
      // Get user state, which will always be the first index.
      let userHomeState = user.data.states;
      // Loop through U.S. states to find a match and set to local state (storage)
      for (const state in stateList) {
        if (stateList[state].value === userHomeState[0]) {
          setSelectedStates({
            label: stateList[state].label,
            value: stateList[state].value
          });
        }
      }
    }
    return user.data;
  };

  useEffect(() => {
    loadUserData().then();
    // eslint-disable-next-line
  }, []);

  const roles = [
    { value: "admin", label: "Admin User" },
    { value: "business", label: "Business User" },
    { value: "state", label: "State User" }
  ];

  // Update user object
  const updateLocalUser = (e, field) => {
    let tempUser = { ...user };
    let response;

    if (field === "states") {
      setSelectedStates(e);
      // If from multiselect, else single selection
      if (Array.isArray(e)) {
        // Simplify array
        let newStates = [];
        for (const state in e) {
          newStates.push(e[state].value);
        }
        setStatesToSend(newStates);
      } else {
        if (!e.value) {
          e.value = null;
        }
        setStatesToSend([e.value]);
        response = e.value;
      }

      // Write to local state
    } else if (field === "role") {
      // Save to local state
      setRole(e.value);
      setStatesToSend(null);
      setSelectedStates();
      // Update user
      response = e.value;
    } else if (field === "username") {
      setUsername(e.target.value);
    } else {
      response = e.target.value;
    }
    tempUser[field] = response;
    setUser(tempUser);
  };

  const updateUserStore = async data => {
    // Set states from statesToSend (in proper format)
    data.states = statesToSend;
    data.username = username;

    console.log("updating data: ");
    console.log(data);

    await updateUser(data).then(() => {
      alert(`User with username: "${data.username}" has been updated`);
      window.location.reload(false);
    });
  };

  return (
    <div className="edit-user" data-testid="EditUser">
      <Link to="/users" className="userListLink text-bold">
        &laquo; Back to User List
      </Link>
      <h1 className="page-header">Edit User</h1>
      {user ? (
        <div className="center-content">
          <Table>
            <tbody>
              <tr className="userName">
                <th>Username</th>
                <td>
                  <TextInput
                    value={user.username}
                    type="text"
                    onChange={e => updateLocalUser(e, "username")}
                    disabled={true}
                    name="username"
                    className="form-input"
                  />
                </td>
              </tr>
              <tr>
                <th>First Name</th>
                <td>
                  <TextInput
                    value={user.firstName}
                    type="text"
                    onChange={e => updateLocalUser(e, "firstName")}
                    disabled={true}
                    name="firstName"
                    className="form-input"
                  />
                </td>
              </tr>
              <tr>
                <th>Last Name</th>
                <td>
                  <TextInput
                    value={user.lastName}
                    type="text"
                    onChange={e => updateLocalUser(e, "lastName")}
                    disabled={true}
                    name="lastName"
                    className="form-input"
                  />
                </td>
              </tr>
              <tr>
                <th>Email</th>
                <td>
                  <TextInput
                    value={user.email}
                    type="text"
                    onChange={e => updateLocalUser(e, "email")}
                    disabled={true}
                    name="email"
                    className="form-input"
                  />
                </td>
              </tr>
              <tr>
                <th>Role</th>
                <td>
                  <Searchable
                    options={roles}
                    placeholder="Select a Role"
                    onSelect={e => updateLocalUser(e, "role")}
                    value={role ? role : user.role}
                    className="form-input"
                  />
                </td>
              </tr>
              {role === "state" ? (
                <>
                  <tr>
                    <th>State</th>
                    <td>
                      <Dropdown
                        options={stateList}
                        onChange={e => updateLocalUser(e, "states")}
                        value={selectedStates ? selectedStates : ""}
                        placeholder="Select a state"
                        autosize={false}
                        className="state-select-list"
                      />
                    </td>
                  </tr>
                </>
              ) : null}
              {role !== "state" && role !== null ? (
                <>
                  <tr>
                    <th>State</th>
                    <td>
                      <MultiSelect
                        options={stateList}
                        value={selectedStates ? selectedStates : []}
                        onChange={e => updateLocalUser(e, "states")}
                        labelledBy={"Select States"}
                        multiple={false}
                      />
                    </td>
                  </tr>
                </>
              ) : null}
              <tr>
                <th>Registration Date</th>
                <td>{new Date(user.dateJoined).toLocaleDateString("en-US")}</td>
              </tr>
              <tr>
                <th>Last Login</th>
                <td>
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString("en-US")
                    : "No login yet"}
                </td>
              </tr>
            </tbody>
          </Table>
          <div className="action-buttons margin-top-4">
            <Button
              type="button"
              className="form-button"
              onClick={async () => {
                await updateUserStore(user);
              }}
            >
              Update User
              <FontAwesomeIcon icon={faUserCheck} className="margin-left-2" />
            </Button>
          </div>
        </div>
      ) : (
        `Cannot find user with id ${id}`
      )}
    </div>
  );
};

EditUser.propTypes = {
  stateList: PropTypes.array.isRequired
};

const mapStateToProps = state => ({
  stateList: state.global.states.map(element => {
    return { label: element.state_name, value: element.state_id };
  })
});

export default connect(mapStateToProps)(EditUser);
