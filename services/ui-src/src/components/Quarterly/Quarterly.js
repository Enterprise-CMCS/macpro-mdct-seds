import React, { useEffect } from "react";
import { Button, Grid, GridContainer } from "@trussworks/react-uswds";
import DataTable from "react-data-table-component";
import SortIcon from "@material-ui/icons/ArrowDownward";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getStateForms } from "../../libs/api.js";
import Card from "@material-ui/core/Card";
import { Link } from "react-router-dom";

const Quarterly = () => {
  // Determine values based on URI
  let url = window.location.hash.split("/");
  const state = url[2];
  const year = url[3];
  const quarter = url[4];
  const [stateFormsList, setStateFormsList] = React.useState();

  // Build Title from URI
  const title = `Q${quarter} ${year} Reports`;

  useEffect(() => {
      async function fetchData() {
        const data = await getStateForms(state, year, quarter);
        setStateFormsList(data);
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
          <Link to={`/forms/${state}/${year}/${quarter}/${formId}/print`}>
            <FontAwesomeIcon icon={faFilePdf} />
          </Link>
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
  const tempData = [
    {
      "status_date": "01-15-2021",
      "year": 2021,
      "state_comments": [
        {
          "type": "text_multiline",
          "entry": null
        }
      ],
      "form_id": "5",
      "last_modified_by": "seed",
      "created_by": "seed",
      "validation_percent": 0.03,
      "form": "GRE",
      "program_code": "AL",
      "state_form": "AL-2021-1-GRE",
      "state_id": "AL",
      "not_applicable": false,
      "created_date": "01-15-2021",
      "form_name": "Gender, Race & Ethnicity",
      "last_modified": "01-15-2021",
      "quarter": 1,
      "status": "Not Started"
    },
    {
      "status_date": "03-02-2021",
      "year": 2021,
      "state_comments": [
        {
          "type": "text_multiline",
          "entry": null
        }
      ],
      "form_id": "6",
      "last_modified_by": "seed",
      "created_by": "seed",
      "validation_percent": 0.03,
      "form": "21PW",
      "program_code": "AL",
      "state_form": "AL-2021-1-21PW",
      "state_id": "AL",
      "not_applicable": false,
      "created_date": "03-02-2021",
      "form_name": "Number of Pregnant Women Served",
      "last_modified": "03-02-2021",
      "quarter": 1,
      "status": "Not Started"
    },
    {
      "status_date": "01-15-2021",
      "year": 2021,
      "state_comments": [
        {
          "type": "text_multiline",
          "entry": null
        }
      ],
      "form_id": "3",
      "last_modified_by": "seed",
      "created_by": "seed",
      "validation_percent": 0.03,
      "form": "64.21E",
      "program_code": "AL",
      "state_form": "AL-2021-1-64.21E",
      "state_id": "AL",
      "not_applicable": false,
      "created_date": "01-15-2021",
      "form_name": "Number of Children Served in Medicaid Expansion Program",
      "last_modified": "01-15-2021",
      "quarter": 1,
      "status": "Not Started"
    },
    {
      "status_date": "01-15-2021",
      "year": 2021,
      "state_comments": [
        {
          "type": "text_multiline",
          "entry": null
        }
      ],
      "form_id": "1",
      "last_modified_by": "seed",
      "created_by": "seed",
      "validation_percent": 0.03,
      "form": "21E",
      "program_code": "AL",
      "state_form": "AL-2021-1-21E",
      "state_id": "AL",
      "not_applicable": false,
      "created_date": "01-15-2021",
      "form_name": "Number of Children Served in Separate CHIP Program",
      "last_modified": "01-15-2021",
      "quarter": 1,
      "status": "Not Started"
    },
    {
      "status_date": "01-15-2021",
      "year": 2021,
      "state_comments": [
        {
          "type": "text_multiline",
          "entry": null
        }
      ],
      "form_id": "2",
      "last_modified_by": "seed",
      "created_by": "seed",
      "validation_percent": 0.03,
      "form": "64.EC",
      "program_code": "AL",
      "state_form": "AL-2021-1-64.EC",
      "state_id": "AL",
      "not_applicable": false,
      "created_date": "01-15-2021",
      "form_name": "Number of Children Served in Medicaid Program",
      "last_modified": "01-15-2021",
      "quarter": 1,
      "status": "Not Started"
    }
  ];

  return (
    <GridContainer className="page-quarterly container">
      <Grid row>
        <Grid col={12}>
          <div className="breadcrumbs">
            <Link to="/">Enrollment Data Home</Link> &gt;{" "}
            {`${state} Q${quarter} ${year}`}
          </div>
        </Grid>
      </Grid>
      <Grid row>
        <Grid col={12}>
          <h2>{title}</h2>
          <div className="quarterly-report-listing">
            <Card>
              {tempData ? (
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
