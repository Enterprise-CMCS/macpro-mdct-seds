import React, { useEffect, useState } from "react";
import { Button, Grid, GridContainer } from "@trussworks/react-uswds";
import DataTable from "react-data-table-component";
import SortIcon from "@material-ui/icons/ArrowDownward";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getStateForms } from "../../src/libs/api.js";

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
      setStateFormsList(data);
    }
    fetchData();
  }, []);
  // Translate form name from redux into url value
  const getFormSegment = formName => {
    let urlSegment;
    switch (formName) {
      case "64-ec":
        urlSegment = "64ec";
        break;
      case "64-eci":
        urlSegment = "64eci";
        break;
      case "64-21e":
        urlSegment = "64-21e";
        break;
      case "64-21ei":
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
      selector: "form", // Not sure what this should be displaying
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
            <Button
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
        // console.log(row);
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
              data={stateFormsList}
              customStyles={customStyles}
            />
          </div>
        </Grid>
      </Grid>
    </GridContainer>
  );
};

export default Quarterly;
