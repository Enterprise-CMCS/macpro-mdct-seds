// *** GLOBAL (i.e., React, hooks, etc)
import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";

// *** 3rd party and other functional dependencies
import { handleExport } from "../../utility-functions/exportFunctions";

// *** 3rd party component dependencies
// * trussworks
import { Button } from "@trussworks/react-uswds";

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

const Users = () => {
  const [users, setUsers] = useState();
  const history = useHistory();

  const loadUserData = async () => {
    const userList = await listUsers();
    if (userList) {
      userList.sort((a, b) => a.username?.localeCompare(b.username));
      for (let user of userList) {
        // Sometimes user.states is a string instead of an array.
        // TODO: Perform a migration to fix that. Should always be an array.
        if (Array.isArray(user.states)) {
          user.states.sort();
        }
      }
    }
    setUsers(userList);
  };

  useEffect(() => {
    async function fetchData() {
      await loadUserData();
    }
    fetchData().then();
  }, []);

  return (
    <div className="user-profiles" data-testid="users">
      <h1 className="page-header">Users</h1>
      <div className="page-subheader exclude-from-pdf">
        <Button
          className="margin-left-3 action-button"
          primary="true"
          onClick={() =>
            handleExport("csv", "MDCT Users Export.csv", {
              columns: [
                { name: "Username", selector: "username" },
                { name: "First Name", selector: "firstName" },
                { name: "Last Name", selector: "lastName" },
                { name: "Email", selector: "email" },
                { name: "Role", selector: "role" },
                { name: "Registration Date", selector: "dateJoined" },
                { name: "Last Login", selector: "lastLogin" },
                { name: "States", selector: "states" }
              ],
              data: users
            })
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
      <div>
        {users?.length ? (
          <table className="user-list">
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
              {users.map(user => (
                <tr key={user.userId}>
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
                      new Date(user.dateJoined).toLocaleDateString("en-US")}
                  </td>
                  <td>
                    {user.lastLogin &&
                      new Date(user.lastLogin).toLocaleDateString("en-US")}
                  </td>
                  <td>{Array.isArray(user.states) ? user.states.join(", ") : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Preloader />
        )}
      </div>
    </div>
  );
};

export default Users;
