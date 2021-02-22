import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import DataTableExtensions from "react-data-table-component-extensions";
import Card from "@material-ui/core/Card";
import "react-data-table-component-extensions/dist/index.css";
import SortIcon from "@material-ui/icons/ArrowDownward";
import { listUsers, activationUsers } from "../../libs/api";
import { Grid } from "@trussworks/react-uswds";
/**
 * Display all users with options
 *
 *
 * @constructor
 */

const Users = () => {
  // const dispatch = useDispatch();
  const [users, setUsers] = useState();

  const loadUserData = async () => {
    const data = await listUsers();
    setUsers(data);
    return data;
  };

  useEffect(() => {
    async function fetchData() {
      await loadUserData();
    }
    fetchData();
  }, []);

  const deactivateUser = async e => {
    const confirm = window.confirm(
      `Are you sure you want to deactivate user ${e.username}`
    );
    if (confirm) {
      const deactivateData = { isActive: false, userId: e.userId };
      await activationUsers(deactivateData).then(async () => {
        await loadUserData();
      });
    }
  };

  const activateUser = async e => {
    const confirm = window.confirm(
      `Are you sure you want to activate user ${e.username}`
    );
    if (confirm) {
      const activateData = { isActive: true, userId: e.userId };
      await activationUsers(activateData).then(async () => {
        await loadUserData();
      });
    }
  };

  let tableData = false;

  if (users) {
    // Build column structure for react-data-tables
    const columns = [
      {
        name: "Username",
        selector: "username",
        sortable: true,
        cell: function editUser(e) {
          return (
            <span>
              <a href={`/users/${e.userId}`}>{e.username}</a>
            </span>
          );
        }
      },
      {
        name: "First Name",
        selector: "firstName",
        sortable: true
      },
      {
        name: "Last Name",
        selector: "lastName",
        sortable: true
      },
      {
        name: "Email",
        selector: "email",
        sortable: true,
        cell: function modifyEmail(e) {
          return (
            <span>
              <a href={`mailto:${e.email}`}>{e.email}</a>
            </span>
          );
        }
      },
      {
        name: "Role",
        selector: "role",
        sortable: true,
        cell: function Role(r) {
          if (r) {
            return r.role;
          } else {
            return "";
          }
        }
      },
      {
        name: "Joined",
        selector: "dateJoined",
        sortable: true,
        cell: function convertDate(s) {
          return s.dateJoined
            ? new Date(s.dateJoined).toLocaleDateString("en-US")
            : null;
        }
      },
      {
        name: "Last Active",
        selector: "lastLogin",
        sortable: true,
        cell: function convertDate(s) {
          return s.lastLogin
            ? new Date(s.lastLogin).toLocaleDateString("en-US")
            : null;
        }
      },
      {
        name: "States",
        selector: "state_codes",
        sortable: true,
        cell: function modifyStateCodes(s) {
          return s.states ? (
            <span>{s.states.split("-").sort().join(", ")}</span>
          ) : null;
        }
      },
      {
        name: "Status",
        selector: "isActive",
        sortable: true,
        cell: function modifyIsActive(s) {
          return (
            <span>
              {s.isActive ? (
                <button
                  className="btn btn-primary"
                  onClick={() => deactivateUser(s)}
                >
                  Deactivate
                </button>
              ) : (
                <button
                  className="btn btn-secondary"
                  onClick={() => activateUser(s)}
                >
                  Activate
                </button>
              )}
            </span>
          );
        }
      }
    ];

    tableData = {
      columns,
      data: users,
      exportHeaders: true
    };
  }

  return (
    <div className="user-profiles">
      <Grid className="container">
        <h1>Users</h1>
        <a href="/users/add">Add new user</a>
        <Card>
          {tableData ? (
            <DataTableExtensions {...tableData}>
              <DataTable
                title="Users"
                defaultSortField="username"
                sortIcon={<SortIcon />}
                highlightOnHover
                selectableRows={false}
                responsive={true}
              />
            </DataTableExtensions>
          ) : null}
        </Card>
      </Grid>
    </div>
  );
};

export default Users;
