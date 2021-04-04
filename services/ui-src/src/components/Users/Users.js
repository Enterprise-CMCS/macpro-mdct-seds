import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import DataTableExtensions from "react-data-table-component-extensions";
import "react-data-table-component-extensions/dist/index.css";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { listUsers, activateDeactivateUser } from "../../libs/api";
import { Grid, Button, Card } from "@trussworks/react-uswds";
import { Link, useHistory } from "react-router-dom";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons/faUserPlus";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons/faFileExcel";
import { faUserAltSlash } from "@fortawesome/free-solid-svg-icons/faUserAltSlash";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons/faUserCheck";

import "./Users.scss";

import { exportToExcel } from "../../libs/api";
import { saveAs } from "file-saver";

/**
 * Display all Users with options
 *
 *
 * @constructor
 */

const Users = () => {
  // const dispatch = useDispatch();
  const [users, setUsers] = useState();
  const history = useHistory();

  const loadUserData = async () => {
    setUsers(await listUsers());
  };

  const handleExport = async format => {
    let buffer, blob, fileName;

    switch (format) {
      case "excel":
        buffer = await exportToExcel();
        // *** lambdas will convert buffer to Int32Array
        // *** we are going to instantiate Uint8Array (binary) buffer
        // *** to avoid having to care about MIME type of file we're saving
        buffer = new Uint8Array(buffer.data).buffer;
        fileName = "test.xlsx";
        break;
      default:
        break;
    }
    // *** save file as blob
    blob = new Blob([buffer]);
    saveAs(blob, fileName);
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

  const deactivateUser = async user => {
    const confirm = window.confirm(
      `Are you sure you want to deactivate user ${user.username}`
    );
    if (confirm) {
      const deactivateData = { isActive: false, userId: user.userId };
      await activateDeactivateUser(deactivateData).then(async () => {
        await loadUserData();
      });
    }
  };

  const activateUser = async user => {
    const confirm = window.confirm(
      `Are you sure you want to activate user ${user.username}`
    );
    if (confirm) {
      const activateData = { isActive: true, userId: user.userId };
      await activateDeactivateUser(activateData).then(async () => {
        await loadUserData();
      });
    }
  };

  let tableData = false;

  if (users) {
    const columns = [
      {
        name: "Username",
        selector: "username",
        sortable: true,
        cell: user => {
          return (
            <span>
              <Link to={`/users/${user.userId}/edit`}>{user.username}</Link>
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
        cell: user => {
          return (
            <span>
              <a href={`mailto:${user.email}`}>{user.email}</a>
            </span>
          );
        }
      },
      {
        name: "Role",
        selector: "role",
        sortable: true,
        cell: user => {
          return user.role ? user.role : null;
        }
      },
      {
        name: "Joined",
        selector: "dateJoined",
        sortable: true,
        cell: user => {
          return user.dateJoined
            ? new Date(user.dateJoined).toLocaleDateString("en-US")
            : null;
        }
      },
      {
        name: "Last Active",
        selector: "lastLogin",
        sortable: true,
        cell: user => {
          return user.lastLogin
            ? new Date(user.lastLogin).toLocaleDateString("en-US")
            : null;
        }
      },
      {
        name: "States",
        selector: "state_codes",
        sortable: true,
        cell: user => {
          return user.states ? (
            <span>{user.states.sort().join(", ")}</span>
          ) : null;
        }
      },
      {
        name: "Status",
        selector: "isActive",
        sortable: true,
        cell: user => {
          return (
            <span>
              {user.isActive ? (
                <Button
                  className="row-action-button"
                  secondary={true}
                  onClick={() => deactivateUser(user)}
                >
                  Deactivate
                  <FontAwesomeIcon
                    icon={faUserAltSlash}
                    className="margin-left-2"
                  />
                </Button>
              ) : (
                <Button
                  className="row-action-button"
                  onClick={() => activateUser(user)}
                >
                  Activate
                  <FontAwesomeIcon
                    icon={faUserCheck}
                    className="margin-left-2"
                  />
                </Button>
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
    <div className="user-profiles react-transition fade-in">
      <Grid>
        <h1 className="page-header">Users</h1>
        <div className="page-subheader">
          <Button
            onClick={() => handleAddNewUser()}
            className="action-button"
            outline={true}
          >
            Add New User
            <FontAwesomeIcon icon={faUserPlus} className="margin-left-2" />
          </Button>
          <Button
            className="margin-left-5 action-button"
            outline={true}
            onClick={async () => await handleExport("excel")}
          >
            Excel{" "}
            <FontAwesomeIcon icon={faFileExcel} className="margin-left-2" />
          </Button>
        </div>
        <Card>
          {tableData ? (
            <DataTableExtensions {...tableData} export={false} print={false}>
              <DataTable
                title=""
                defaultSortField="username"
                sortIcon={
                  <>
                    <FontAwesomeIcon
                      icon={faArrowDown}
                      className="margin-left-2"
                    />
                  </>
                }
                highlightOnHover={true}
                selectableRows={false}
                responsive={true}
                striped={true}
                className="grid-display-table react-transition fade-in"
              />
            </DataTableExtensions>
          ) : (
            <div className="padding-y-9">
              <p className="center-content">
                <img
                  src="preloaders/gears.gif"
                  alt="Loading..."
                  title="Loading"
                />
              </p>
              <p className="center-content">
                <img
                  src="preloaders/loading_text.gif"
                  alt="Loading..."
                  title="Loading"
                />
              </p>
            </div>
          )}
        </Card>
      </Grid>
    </div>
  );
};

export default Users;
