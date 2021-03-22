import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import DataTableExtensions from "react-data-table-component-extensions";
import Card from "@material-ui/core/Card";
import "react-data-table-component-extensions/dist/index.css";
import SortIcon from "@material-ui/icons/ArrowDownward";
import { listUsers, activateDeactivateUser } from "../../libs/api";
import { Grid } from "@trussworks/react-uswds";
import { Link } from "react-router-dom";

import { exportToExcel } from "../../libs/api";
import { saveAs } from "file-saver";

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

  const deactivateUser = async e => {
    const confirm = window.confirm(
      `Are you sure you want to deactivate user ${e.username}`
    );
    if (confirm) {
      const deactivateData = { isActive: false, userId: e.userId };
      await activateDeactivateUser(deactivateData).then(async () => {
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
      await activateDeactivateUser(activateData).then(async () => {
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
        cell: e => {
          return (
            <span>
              <Link to={`/users/${e.userId}/edit`}>{e.username}</Link>
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
        cell: e => {
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
        cell: r => {
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
        cell: s => {
          return s.dateJoined
            ? new Date(s.dateJoined).toLocaleDateString("en-US")
            : null;
        }
      },
      {
        name: "Last Active",
        selector: "lastLogin",
        sortable: true,
        cell: s => {
          return s.lastLogin
            ? new Date(s.lastLogin).toLocaleDateString("en-US")
            : null;
        }
      },
      {
        name: "States",
        selector: "state_codes",
        sortable: true,
        cell: s => {
          return s.states ? <span>{s.states.sort().join(", ")}</span> : null;
        }
      },
      {
        name: "Status",
        selector: "isActive",
        sortable: true,
        cell: s => {
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

  const customStyles = {
    rows: {
      style: {
        minHeight: "72px" // override the row height
      }
    },
    headCells: {
      style: {
        backgroundColor: "#205493",
        color: "#fff",
        fontWeight: "bold",
        border: "solid 1px #fff",
        textAlign: "center",
        "&:focus": {
          outline: "none",
          color: "#fff"
        },
        "&:hover:not(:focus)": {
          color: "#fff"
        }
      },
      activeSortStyle: {
        color: "#fff",
        textAlign: "center",
        "&:focus": {
          outline: "none",
          color: "#fff"
        },
        "&:hover:not(:focus)": {
          color: "#fff"
        }
      }
    },
    cells: {
      style: {
        paddingLeft: "8px", // override the cell padding for data cells
        paddingRight: "8px",
        border: "ridge 1px"
      }
    }
  };

  return (
    <div className="user-profiles react-transition scale-in">
      <Grid className="container">
        <h1>Users</h1>
        <Link to="/users/add">Add new user</Link>
        <button
          className="margin-left-5 usa-button usa-button--secondary text-normal"
          onClick={async () => await handleExport("excel")}
        >
          Excel
        </button>
        <Card>
          {tableData ? (
            <DataTableExtensions {...tableData} export={false} print={false}>
              <DataTable
                title=""
                defaultSortField="username"
                sortIcon={<SortIcon />}
                highlightOnHover={true}
                selectableRows={false}
                responsive={true}
                customStyles={customStyles}
                striped={true}
              />
            </DataTableExtensions>
          ) : null}
        </Card>
      </Grid>
    </div>
  );
};

export default Users;
