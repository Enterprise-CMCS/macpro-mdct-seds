import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// *** 3rd party and other functional dependencies
import { handleExport } from "../../utility-functions/exportFunctions";

// *** 3rd party component dependencies
import { Button } from "@cmsgov/design-system";

// * icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFilePdf } from "@fortawesome/free-solid-svg-icons";

import Preloader from "../Preloader/Preloader";

// *** API / data / etc
import { listUsers } from "../../libs/api";

const Users = () => {
  const [users, setUsers] = useState();

  const loadUserData = async () => {
    const userList = await listUsers();
    userList?.sort((a, b) => a.username?.localeCompare(b.username));
    setUsers(userList);
  };

  useEffect(() => {
    async function fetchData() {
      await loadUserData();
    }
    fetchData().then();
  }, []);

  return (
    <div className="user-profiles col-gap-1-half" data-testid="users">
      <h1>Users</h1>
      <div className="row-gap-1">
        <Button
          variation="solid"
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
                { name: "State", selector: "state" },
              ],
              data: users,
            })
          }
        >
          CSV
          <FontAwesomeIcon icon={faFileCsv} />
        </Button>

        <Button
          variation="solid"
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
          <FontAwesomeIcon icon={faFilePdf} />
        </Button>
      </div>
      <div>
        {users?.length ? (
          <table>
            <thead>
              <tr>
                <th scope="col">Username</th>
                <th scope="col">First Name</th>
                <th scope="col">Last Name</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Registration Date</th>
                <th scope="col">Last Login</th>
                <th scope="col">State</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
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
                  <td>{user.state ?? ""}</td>
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
