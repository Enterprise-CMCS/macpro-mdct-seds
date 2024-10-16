import React, { useEffect, useState } from "react";
import { Button, Card } from "@trussworks/react-uswds";
import DataTable from "react-data-table-component";
import { faFilePdf, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useParams } from "react-router-dom";
import Preloader from "../Preloader/Preloader";
import Unauthorized from "../Unauthorized/Unauthorized";
import { dateFormatter } from "../../utility-functions/sortingFunctions";
import { getUserInfo } from "../../utility-functions/userFunctions";
import { recursiveGetStateForms } from "../../utility-functions/dbFunctions";

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
      const currentUserInfo = await getUserInfo();

      let userStates = currentUserInfo ? currentUserInfo.Items[0].states : [];

      if (
        userStates.includes(state) ||
        currentUserInfo.Items[0].role === "admin"
      ) {
        let data = await recursiveGetStateForms({ state, year, quarter });
        // Filter 64.ECI out on the user side, as it is an unused form and renders improperly
        data = data.filter(i => i.form !== "64.ECI");
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
      sortable: true,
      selector: function setDate(row) {
        return `${dateFormatter(row.last_modified)}`;
      }
    },
    {
      name: "Print",
      sortable: false,
      cell: function getPrintLink(row) {
        const formId = getFormSegment(row.form);
        return (
          <Link
            to={`/print/${state}/${year}/${quarter}/${formId}`}
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
        {hasAccess === true ? (
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
        ) : null}

        {hasAccess === false ? <Unauthorized /> : null}
      </div>
    </div>
  );
};

export default Quarterly;
