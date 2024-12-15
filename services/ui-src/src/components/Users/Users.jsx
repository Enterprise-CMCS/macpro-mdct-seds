// *** GLOBAL (i.e., React, hooks, etc)
import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";

// *** 3rd party and other functional dependencies
import { handleExport } from "../../utility-functions/exportFunctions";

// *** 3rd party component dependencies
// * trussworks
import { Button, Card } from "@trussworks/react-uswds";

// * icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faFileCsv,
  faFilePdf
} from "@fortawesome/free-solid-svg-icons";

import Preloader from "../Preloader/Preloader";

// *** API / data / etc
import { listUsers } from "../../libs/api";

// *** styles
import "./Users.scss";

/**
 * Display all Users with options
 *
 *
 * @constructor
 */

const Users = () => {
  // const dispatch = useDispatch();
  const [users, setUsers] = useState();
  const [filteredUsers, setFilteredUsers] = useState([]);
  const history = useHistory();

  const loadUserData = async () => {
    const userList = await listUsers();
    setFilteredUsers(userList);
    setUsers(userList);
  };

  useEffect(() => {
    async function fetchData() {
      await loadUserData();
    }
    fetchData().then();
  }, []);

  const handleAddNewUser = () => {
    history.push("/users/add");
  };

  const handleSearchInputChange = (evt) => {
    const searchText = evt.target.value;
    if (!searchText) {
      setFilteredUsers(users);
      return;
    }
    const filteredList = users
      .filter(u => [u.username, u.firstName, u.lastName, u.email, u.role, u.states.join(", ")]
        .some(text => text.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())));
    setFilteredUsers(filteredList);
  }

  let tableData = false;

  return (
    <div className="user-profiles react-transition fade-in" data-testid="users">
      <h1 className="page-header">Users</h1>
      <div className="page-subheader exclude-from-pdf">
        <Button
          onClick={() => handleAddNewUser()}
          className="action-button"
          primary="true"
          data-testid="handleAddNewUser"
        >
          Add New User
          <FontAwesomeIcon icon={faUserPlus} className="margin-left-2" />
        </Button>
        <Button
          className="margin-left-3 action-button"
          primary="true"
          onClick={() =>
            handleExport("csv", "MDCT Users Export.csv", tableData)
          }
        >
          CSV
          <FontAwesomeIcon icon={faFileCsv} className="margin-left-2" />
        </Button>

        <Button
          className="margin-left-3 action-button"
          primary="true"
          onClick={async () =>
            await handleExport(
              "pdf",
              "MDCT Users Export.pdf",
              ".user-profiles",
              "html-selector"
            )
          }
        >
          PDF
          <FontAwesomeIcon icon={faFilePdf} className="margin-left-2" />
        </Button>
      </div>
      <Card>
        {users && users.length ? (
          <>
            <div>
              <div className="filter-controls exclude-from-pdf">
                <form className="usa-search" role="search"
                    onSubmit={(evt) => evt.preventDefault()}
                >
                  <label className="usa-sr-only" htmlFor="search-field">Search</label>
                  <input
                    className="usa-input"
                    id="search-field"
                    type="search"
                    name="search"
                    onChange={handleSearchInputChange}
                  />
                  <button
                    className="usa-button"
                    type="submit"
                  >
                    Search
                  </button>
                </form>
              </div>
            </div>
            <table className="exclude-from-pdf">
              <thead>
                <tr>
                  <th scope="col">Username</th>
                  <th scope="col">First Name</th>
                  <th scope="col">Last Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Registration Date</th>
                  <th scope="col">Last Login</th>
                  <th scope="col">States</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.username}>
                    <td>
                      <Link to={`/users/${user.userId}/edit`}>
                        {user.username}
                      </Link>
                    </td>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>
                      <a href={`mailto:${user.email}`}>{user.email}</a>
                    </td>
                    <td>{user.role}</td>
                    <td>
                      {user.dateJoined &&
                        new Date(user.dateJoined).toLocaleDateString("en-US")
                      }
                    </td>
                    <td>
                      {user.lastLogin &&
                        new Date(user.lastLogin).toLocaleDateString("en-US")
                      }
                    </td>
                    <td>{user.states?.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <Preloader />
        )}
      </Card>
    </div>
  );
};

export default Users;
