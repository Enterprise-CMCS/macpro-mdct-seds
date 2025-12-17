import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Table, TextInput, Button } from "@trussworks/react-uswds";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons/faUserCheck";
import { getUserById, updateUser } from "../../libs/api";
import { stateSelectOptions } from "../../lookups/states";
import "./EditUser.scss";

/**
 * Admin-only page for viewing & editing other users' permissions.
 *
 * Information such as the user's name and email come from Cognito
 * and cannot be edited here. Only the role and state fields can.
 */
const EditUser = () => {
  let { id } = useParams();
  const [user, setUser] = useState();
  const [role, setRole] = useState();
  const [state, setState] = useState();

  useEffect(() => {
    (async () => {
      const response = await getUserById({ userId: id });
      if (response.status === "success") {
        const user = response.data;
        setUser(user);
        setRole(user.role);
        setState(user.state);
      }
    })();
  }, []);

  const handleUpdateClick = async () => {
    const updatedUser = structuredClone(user);
    updatedUser.role = role;
    if (role === "state" && !!state) {
      updatedUser.state = state;
    } else {
      delete updatedUser.state;
    }

    await updateUser(updatedUser);
    setUser(updatedUser);
    alert(`User with username: "${updatedUser.username}" has been updated`);
    window.location.reload(false);
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
                    disabled={true}
                    name="email"
                    className="form-input"
                  />
                </td>
              </tr>
              <tr>
                <th>
                  <label className="usa-label" htmlFor="role-select">Role</label>
                </th>
                <td>
                  <select
                    className="usa-select"
                    id="role-select"
                    value={role}
                    onChange={evt => setRole(evt.target.value)}
                  >
                    <option value>- Select a Role -</option>
                    <option value="admin">Admin User</option>
                    <option value="business">Business User</option>
                    <option value="state">State User</option>
                  </select>
                </td>
              </tr>
              {role === "state" ? (
                <tr>
                  <th>
                    <label className="usa-label" htmlFor="state-select">State</label>
                  </th>
                  <td>
                    <select
                      className="usa-select"
                      id="state-select"
                      value={state}
                      onChange={evt => setState(evt.target.value)}
                    >
                      <option value>- Select a State -</option>
                      {stateSelectOptions.map(({ label, value }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
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
              onClick={handleUpdateClick}
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
