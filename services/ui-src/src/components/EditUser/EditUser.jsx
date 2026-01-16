import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Table, TextField } from "@cmsgov/design-system";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons/faUserCheck";
import { getUserById, updateUser } from "../../libs/api";
import { stateSelectOptions } from "../../lookups/states";

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
      <Link to="/users" className="text-bold">
        &laquo; Back to User List
      </Link>
      <h1>Edit User</h1>
      {user ? (
        <div>
          <Table>
            <tbody>
              <tr>
                <th>Username</th>
                <td>
                  <TextField
                    value={user.username}
                    disabled={true}
                    name="username"
                  />
                </td>
              </tr>
              <tr>
                <th>First Name</th>
                <td>
                  <TextField
                    value={user.firstName}
                    disabled={true}
                    name="firstName"
                  />
                </td>
              </tr>
              <tr>
                <th>Last Name</th>
                <td>
                  <TextField
                    value={user.lastName}
                    disabled={true}
                    name="lastName"
                  />
                </td>
              </tr>
              <tr>
                <th>Email</th>
                <td>
                  <TextField value={user.email} disabled={true} name="email" />
                </td>
              </tr>
              <tr>
                <th>
                  <label htmlFor="role-select">Role</label>
                </th>
                <td>
                  <select
                    id="role-select"
                    value={role}
                    onChange={(evt) => setRole(evt.target.value)}
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
                    <label htmlFor="state-select">State</label>
                  </th>
                  <td>
                    <select
                      id="state-select"
                      value={state}
                      onChange={(evt) => setState(evt.target.value)}
                    >
                      <option value>- Select a State -</option>
                      {stateSelectOptions.map(({ label, value }) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
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
          <div>
            <Button type="button" variation="solid" onClick={handleUpdateClick}>
              Update User
              <FontAwesomeIcon icon={faUserCheck} />
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
