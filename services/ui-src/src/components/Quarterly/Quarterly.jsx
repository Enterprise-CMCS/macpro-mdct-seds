import React, { useEffect, useState } from "react";
import { Button, Card } from "@trussworks/react-uswds";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
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

  // Translate form name into url value
  const getFormSegment = form => form.form?.replace(".", "-");

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
              <table>
                <caption>
                  Start, complete, and print this quarter's CHIP Enrollment
                  Data Reports.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Form</th>
                    <th scope="col">Name</th>
                    <th scope="col">Status</th>
                    <th scope="col">Last Updated</th>
                    <th scope="col">Print</th>
                  </tr>
                </thead>
                <tbody>
                  {stateFormsList.map((form) => (
                    <tr key={form.form}>
                      <td>
                        <Link
                          to={`/forms/${state}/${year}/${quarter}/${getFormSegment(form)}`}
                        >
                          {form.form}
                        </Link>
                      </td>
                      <td>
                        <p>
                          {form.form_name}
                        </p>
                      </td>
                      <td>
                        <div className="status-wrapper">
                          <Button
                            style={{
                              outline: "none",
                              cursor: "pointer"
                            }}
                            type="button"
                            className={`usa-button status status-${form.status_code}`}
                          >
                            {form.status}
                          </Button>
                        </div>
                      </td>
                      <td>
                        {dateFormatter(form.last_modified)}
                      </td>
                      <td>
                        <Link
                          to={`/print/${state}/${year}/${quarter}/${getFormSegment(form)}`}
                          className="font-heading-2xl padding-left-5"
                        >
                          <FontAwesomeIcon icon={faFilePdf} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
