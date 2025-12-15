import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { MultiSelect } from "react-multi-select-component";
import Searchable from "react-searchable-dropdown";
import Dropdown from "react-dropdown";
import { Table, TextInput, Button } from "@trussworks/react-uswds";
import "react-dropdown/style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons/faUserCheck";
import { getUserById, updateUser } from "../../libs/api";
import { getStateName, stateSelectOptions } from "../../lookups/states";
import "./EditUser.scss";

/**
 * View/edit a single user with options
 *
 * @constructor
 */

const EditUser = () => {
  // Get params from url
  let { id } = useParams();

  // Set up local state
  const [username, setUsername] = useState();
  const [user, setUser] = useState();
  const [role, setRole] = useState();
  const [selectedState, setSelectedState] = useState();

  // Get User data
  const loadUserData = async () => {
    // Retrieve user data from datastore
    const getUserData = { userId: id };

    const response = await getUserById(getUserData);
    const user = response.data;
    if (response.status === "success") {
      setUser(user);
      setRole(user.role);
      setUsername(user.username);
      if (user.role === "state" && user.state) {
        setSelectedState({ label: getStateName(user.state), value: user.state });
      }
    }
    return user;
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

  const updateLocalState = (e) => {
    setSelectedState(e);
    setUser({
      ...user,
      state: e.value || undefined
    });
  };

  // Update user object
  const updateLocalUser = (e, field) => {
    let tempUser = { ...user };
    let response;

    if (field === "role") {
      // Save to local state
      setRole(e.value);
      setSelectedState(undefined);
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
    data.state = selectedState?.value ?? undefined;
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
                        options={stateSelectOptions}
                        onChange={updateLocalState}
                        value={selectedState ?? ""}
                        placeholder="Select a state"
                        autosize={false}
                        className="state-select-list"
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

export default EditUser;
