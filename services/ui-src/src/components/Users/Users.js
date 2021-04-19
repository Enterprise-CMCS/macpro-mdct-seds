// *** GLOBAL (i.e., React, hooks, etc)
import React, { useState, useEffect, isValidElement } from "react";
import { Link, useHistory } from "react-router-dom";
import { renderToString } from "react-dom/server";

// *** 3rd party functional dependencies
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";

// *** 3rd party component dependencies
// * trussworks
import { Button, Card } from "@trussworks/react-uswds";

// * react-data-table-component
import DataTable from "react-data-table-component";
import DataTableExtensions from "react-data-table-component-extensions";

// * icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faUserPlus,
  faFileExcel,
  faUserAltSlash,
  faUserCheck,
  faFilePdf
} from "@fortawesome/free-solid-svg-icons";

import Preloader from "../Preloader/Preloader";

// *** API / data / etc
import {
  listUsers,
  activateDeactivateUser,
  exportToExcel
} from "../../libs/api";

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
  const history = useHistory();

  const loadUserData = async () => {
    setUsers(await listUsers());
  };

  const handleExport = async (
    format,
    fileName,
    pdfContent = null,
    pdfContentType = "react-component"
  ) => {
    let buffer, blob, pdf, pdfToExport;

    switch (format) {
      case "excel":
        buffer = await exportToExcel();
        // *** lambdas will convert buffer to Int32Array
        // *** we are going to instantiate Uint8Array (binary) buffer
        // *** to avoid having to care about MIME type of file we're saving
        buffer = new Uint8Array(buffer.data).buffer;

        // *** save file as blob
        blob = new Blob([buffer]);
        saveAs(blob, fileName);
        break;

      case "pdf":
        // *** if element is react, do additional processing
        if (pdfContentType === "react-component") {
          pdfToExport = renderToString(pdfContent);
        }

        // *** otherwise, pipe in raw html
        else {
          pdfToExport = pdfContent;
        }

        pdf = new jsPDF({
          unit: "px",
          format: "a4",
          userUnit: "px",
          orientation: "landscape"
        });

        pdf
          .html(pdfToExport, {
            html2canvas: { scale: 0.33 }
          })
          .then(() => {
            pdf.save(fileName);
          });
        break;

      default:
        // *** no default behavior currently specified
        break;
    }
  };

  useEffect(() => {
    async function fetchData() {
      await loadUserData();
    }
    fetchData().then();
  }, []);
  ƒ;

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
    <div className="user-profiles react-transition fade-in" data-testid="Users">
      <h1 className="page-header">Users</h1>
      <div className="page-subheader">
        <Button
          onClick={() => handleAddNewUser()}
          className="action-button"
          primary="true"
        >
          Add New User
          <FontAwesomeIcon icon={faUserPlus} className="margin-left-2" />
        </Button>
        <Button
          className="margin-left-3 action-button"
          primary="true"
          onClick={async () => await handleExport("excel", "test_one.xlsx")}
        >
          Excel
          <FontAwesomeIcon icon={faFileExcel} className="margin-left-2" />
        </Button>

        <Button
          className="margin-left-3 action-button"
          primary="true"
          onClick={async () =>
            await handleExport(
              "pdf",
              "test_one.pdf",
              document.getElementsByClassName("grid-display-table")[0],
              "html"
            )
          }
        >
          PDF
          <FontAwesomeIcon icon={faFilePdf} className="margin-left-2" />
        </Button>
      </div>
      <Card>
        {tableData ? (
          <DataTableExtensions {...tableData} export={false} print={false}>
            <DataTable
              defaultSortField="username"
              sortIcon={
                <FontAwesomeIcon icon={faArrowDown} className="margin-left-2" />
              }
              highlightOnHover={true}
              selectableRows={false}
              responsive={true}
              striped={true}
              className="grid-display-table react-transition fade-in"
            />
          </DataTableExtensions>
        ) : (
          <Preloader />
        )}
      </Card>
    </div>
  );
};

export default Users;
