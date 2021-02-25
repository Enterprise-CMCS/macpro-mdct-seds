import React, { useEffect, useState } from "react";
import { Button, Grid, GridContainer } from "@trussworks/react-uswds";
import DataTable from "react-data-table-component";
import SortIcon from "@material-ui/icons/ArrowDownward";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getStateForms } from "../../src/libs/api.js";
import Card from "@material-ui/core/Card";

const Quarterly = () => {
  // Determine values based on URI
  let url = window.location.pathname.split("/");
  const state = url[2];
  const year = url[3];
  const quarter = url[4];
  const [stateFormsList, setStateFormsList] = useState();

  // Build Title from URI
  const title = `Q${quarter} ${year} Reports`;

  useEffect(() => {
    async function fetchData() {
      const data = await getStateForms(state, year, quarter);
      console.log(data);
      setStateFormsList(data);
    }
    fetchData();
  }, [state, year, quarter]);
  // Translate form name from redux into url value
  const getFormSegment = formName => {
    let urlSegment;
    switch (formName) {
      case "GRE":
        urlSegment = "gre";
        break;
      case "64.EC":
        urlSegment = "64ec";
        break;
      case "64.ECI":
        urlSegment = "64eci";
        break;
      case "64.21E":
        urlSegment = "64-21e";
        break;
      case "64.21EI":
        urlSegment = "64-21ei";
        break;
      case "21E": // may need to update all of the case statements
        urlSegment = "21e";
        break;
      default:
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
          <a
            href={`/forms/${state}/${year}/${quarter}/${getFormSegment(
              e.form
            )}`}
          >
            {e.form}
          </a>
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
                margin: "15px 0 15px -55px",
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
          <a href={`/forms/${state}/${year}/${quarter}/${formId}/print`}>
            <FontAwesomeIcon icon={faFilePdf} />
          </a>
        );
      }
    }
  ];

  // Custom styles for data table
  const customStyles = {
    headRow: {
      style: {
        textTransform: "uppercase",
        fontWeight: "600"
      }
    },
    headCells: {
      style: {
        "&:last-of-type": {
          // Print
          fontWeight: "600",
          maxWidth: "120px"
        },
        "&:first-of-type": {
          // Form
          fontWeight: "600",
          maxWidth: "120px"
        },
        "&:nth-of-type(2n)": {
          // FormName
          fontWeight: "600",
          maxWidth: "400px"
        },
        "&:nth-of-type(3n)": {
          // Status
          fontWeight: "600",
          maxWidth: "180px"
        },
        "&:nth-of-type(4n)": {
          //Last Updated
          fontWeight: "600",
          maxWidth: "140px"
        }
      }
    },
    cells: {
      style: {
        "&:last-of-type": {
          fontSize: "2.2rem",
          maxWidth: "120px"
        },
        "&:first-of-type": {
          maxWidth: "120px"
        },
        "&:nth-of-type(2n)": {
          maxWidth: "400px"
        },
        "&:nth-of-type(3n)": {
          maxWidth: "180px",
          pointerType: "default"
        },
        "&:nth-of-type(4n)": {
          maxWidth: "140px",
          minWidth: "140px"
        }
      }
    }
  };
  console.log(stateFormsList);
  return (
    <GridContainer className="page-quarterly container">
      <Grid row>
        <Grid col={12}>
          <div className="breadcrumbs">
            <a href="/">Enrollment Data Home</a> &gt;{" "}
            {`${state} Q${quarter} ${year}`}
          </div>
        </Grid>
      </Grid>
      <Grid row>
        <Grid col={12}>
          <h2>{title}</h2>
          <div className="quarterly-report-listing">
            <Card>
              {stateFormsList ? (
                <DataTable
                  sortIcon={<SortIcon />}
                  highlightOnHover
                  title={
                    <p style={{ fontSize: "14px", fontWeight: "600" }}>
                      Start, complete, and print this quarter's CHIP Enrollment
                      Data Reports.
                    </p>
                  }
                  selectableRows={false}
                  responsive={true}
                  columns={columns}
                  data={stateFormsList}
                  customStyles={customStyles}
                />
              ) : null}
            </Card>
          </div>
        </Grid>
      </Grid>
    </GridContainer>
  );
};

export default Quarterly;
