import React, { useEffect, useState } from "react";
import { Button, Card } from "@trussworks/react-uswds";
import DataTable from "react-data-table-component";
import { faFilePdf, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getStateForms, obtainUserByEmail } from "../../libs/api.js";
import { Link, useParams } from "react-router-dom";
import Preloader from "../Preloader/Preloader";
import { Auth } from "aws-amplify";
import { onError } from "../../libs/errorLib";
import Unauthorized from "../Unauthorized/Unauthorized";

const Quarterly = () => {
  // Determine values based on URI
  const { state, year, quarter } = useParams();
  const [stateFormsList, setStateFormsList] = useState();
  const [hasAccess, setHasAccess] = useState();

  // Build Title from URI
  const title = `Q${quarter} ${year} Reports`;

  useEffect(() => {
    async function fetchData() {
      // Get user information
      let currentUserInfo;

      try {
        // Get user information
        const AuthUserInfo = (await Auth.currentSession()).getIdToken();
        currentUserInfo = await obtainUserByEmail({
          email: AuthUserInfo.payload.email
        });
      } catch (e) {
        onError(e);
      }

      let userStates = currentUserInfo ? currentUserInfo.Items[0].states : [];

      if (userStates.includes(state)) {
        const data = await getStateForms(state, year, quarter);
        console.log("zzzData", data);
        setStateFormsList(data);
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    }

    fetchData();
  }, [state, year, quarter]);
  // Translate form name from redux into url value
  const getFormSegment = formName => {
    let urlSegment;
    if (formName !== "") {
      urlSegment = formName.replace(".", "-");
    } else {
      urlSegment = false;
    }
    return urlSegment;
  };

  // Build Columns for data table
  const columns = [
    {
      name: "Form",
      selector: "form",
      sortable: true,
      cell: function generateFormLink(e) {
        return (
          <Link
            to={`/forms/${state}/${year}/${quarter}/${getFormSegment(e.form)}`}
          >
            {e.form}
          </Link>
        );
      }
    },
    {
      name: "Name",
      selector: "form_name",
      sortable: true,
      wrap: true,
      cell: function setFormName(e) {
        return (
          <p style={{ wordWrap: "break-word", maxWidth: "200px" }}>
            {e.form_name}
          </p>
        );
      }
    },
    {
      name: "Status",
      selector: "status",
      sortable: true,
      cell: function setStatus(e) {
        return (
          <div className="status-wrapper">
            <Button
              style={{
                outline: "none",
                cursor: "pointer"
              }}
              type="button"
              className={`usa-button status status-${e.status_code}`}
            >
              {e.status}
            </Button>
          </div>
        );
      }
    },

    {
      name: "Last Updated",
      selector: "last_modified",
      sortable: true
    },
    {
      name: "Print",
      sortable: false,
      cell: function getPrintLink(row) {
        const formId = getFormSegment(row.form);
        return (
          <Link
            to={`/forms/${state}/${year}/${quarter}/${formId}/print`}
            className="font-heading-2xl padding-left-5"
          >
            <FontAwesomeIcon icon={faFilePdf} />
          </Link>
        );
      }
    }
  ];

  return (
    <div className="page-quarterly react-transition fade-in">
      <div className="breadcrumbs">
        <Link to="/">Enrollment Data Home</Link> &gt;{" "}
        {`${state} Q${quarter} ${year}`}
      </div>
      <h1 className="page-header">{title}</h1>
      <div className="quarterly-report-listing">
        {hasAccess ? (
          <Card>
            {stateFormsList ? (
              <DataTable
                className="grid-display-table react-transition fade-in"
                sortIcon={
                  <FontAwesomeIcon
                    icon={faArrowDown}
                    className="margin-left-2"
                  />
                }
                highlightOnHover
                title={
                  <p style={{ fontSize: "18px", fontWeight: "600" }}>
                    Start, complete, and print this quarter's CHIP Enrollment
                    Data Reports.
                  </p>
                }
                selectableRows={false}
                responsive={true}
                columns={columns}
                data={stateFormsList}
              />
            ) : (
              <Preloader />
            )}
          </Card>
        ) : (
          <Unauthorized />
        )}
      </div>
    </div>
  );
};

export default Quarterly;
