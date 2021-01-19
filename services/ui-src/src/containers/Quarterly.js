import React from "react";
import { Grid, GridContainer } from "@trussworks/react-uswds";
import DataTable from "react-data-table-component";
import SortIcon from "@material-ui/icons/ArrowDownward";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Quarterly = () => {
  // Determine values based on URI
  let url = window.location.pathname.split("/");
  const state = url[2];
  const year = url[3];
  const quarter = url[4];

  // Build Title from URI
  const title = `Q${quarter} ${year} Reports`;

  // Translate form name from redux into url value
  const getFormSegment = formName => {
    let urlSegment;
    switch (formName) {
      case "Form 64-EC":
        urlSegment = "64ec";
        break;
      case "Form 64-ECI":
        urlSegment = "64eci";
        break;
      case "Form 64-21E":
        urlSegment = "64-21e";
        break;
      case "Form 64-21EI":
        urlSegment = "64-21ei";
        break;
      case "Form 21E":
        urlSegment = "21e";
        break;
      default:
        urlSegment = false;
    }
    return urlSegment;
  };

  // TODO: Pull data from API endpoint
  const data = [
    {
      form: "Form 64-EC",
      name: "Number of Children Served in Medicaid Program",
      status: "Complete",
      status_code: "complete",
      last_updated: "10/12/2020"
    },
    {
      form: "Form 64-ECI",
      name: "Informational Number of Children Served in Medicaid Program",
      status: "Provisional Data Submitted",
      status_code: "provisional",
      last_updated: "11/14/2020"
    },
    {
      form: "Form 64-21E",
      name: "Informational Number of Children Served in Medicaid Program",
      status: "Final Data Submitted",
      status_code: "final",
      last_updated: "08/15/2020"
    },
    {
      form: "Form 64-21EI",
      name:
        "Informational Number of Children Served in Medicaid Expansion Program",
      status: "Not Started",
      status_code: "not_started",
      last_updated: ""
    },
    {
      form: "Form 21E",
      name: "Number of Children Served in Medicaid Program",
      status: "In Progress",
      status_code: "in_progress",
      last_updated: "09/28/2020"
    }
  ];

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
      selector: "name",
      sortable: true,
      wrap: true
    },
    {
      name: "Status",
      selector: "status",
      sortable: true,
      cell: function setStatus(e) {
        return (
          <div className="status-wrapper">
            <button
              type="button"
              className={`usa-button status status-${e.status_code}`}
            >
              {e.status}
            </button>
          </div>
        );
      }
    },

    {
      name: "Last Updated",
      selector: "last_updated",
      sortable: true
    },
    {
      name: "Print",
      sortable: false,
      cell: function getPrintLink(row) {
        console.log(row);
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
        textTransform: "uppercase"
      }
    },
    headCells: {
      style: {
        "&:last-of-type": {
          maxWidth: "120px"
        },
        "&:first-of-type": {
          maxWidth: "120px"
        },
        "&:nth-of-type(3n)": {
          maxWidth: "180px"
        },
        "&:nth-of-type(4n)": {
          maxWidth: "140px",
          minWidth: "140px"
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

  return (
    <GridContainer className="page-quarterly container">
      <Grid row>
        <Grid col={12}>
          <div className="breadcrumbs">
            <a href="/">Enrollment Data Home</a> > {`Q${quarter} ${year}`}
          </div>
        </Grid>
      </Grid>
      <Grid row>
        <Grid col={12}>
          <h2>{title}</h2>
          <p>
            Start, complete, and print this quarter's CHIP Enrollment Data
            Reports.
          </p>
          <div className="quarterly-report-listing">
            <DataTable
              sortIcon={<SortIcon />}
              highlightOnHover
              selectableRows={false}
              responsive={true}
              columns={columns}
              data={data}
              customStyles={customStyles}
            />
          </div>
        </Grid>
      </Grid>
    </GridContainer>
  );
};

export default Quarterly;
