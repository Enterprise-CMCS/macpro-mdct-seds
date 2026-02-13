import React, { useEffect, useState } from "react";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useParams } from "react-router-dom";
import Preloader from "../Preloader/Preloader";
import Unauthorized from "../Unauthorized/Unauthorized";
import { listFormsForQuarter } from "../../libs/api";
import { getStatusDisplay } from "../../utility-functions/formStatus";
import { dateFormatter } from "../../utility-functions/sortingFunctions";
import { useStore } from "../../store/store";
import { canViewStateData } from "../../utility-functions/permissions";

const Quarterly = () => {
  const user = useStore((state) => state.user);
  const { state, year, quarter } = useParams();
  const [stateFormsList, setStateFormsList] = useState();
  const [hasAccess, setHasAccess] = useState();

  // Build Title from URI
  const title = `Q${quarter} ${year} Reports`;
  useEffect(() => {
    async function fetchData() {
      if (canViewStateData(user, state)) {
        const params = {
          state,
          year: parseInt(year),
          quarter: parseInt(quarter),
        };
        let forms = await listFormsForQuarter(params);

        // Filter 64.ECI out on the user side, as it is an unused form and renders improperly
        forms = forms.filter((i) => i.form !== "64.ECI");

        setStateFormsList(forms);
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    }

    fetchData();
  }, [state, year, quarter]);

  // Translate form name into url value
  const getFormSegment = (form) => form.form?.replace(".", "-");

  return (
    <div className="flex-col-gap-1">
      <div className="breadcrumbs">
        <Link to="/">Enrollment Data Home</Link> &gt;{" "}
        {`${state} Q${quarter} ${year}`}
      </div>
      <h1>{title}</h1>
      <div>
        {hasAccess === true ? (
          <div>
            {stateFormsList ? (
              <table>
                <caption>
                  Start, complete, and print this quarter's CHIP Enrollment Data
                  Reports.
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
                          to={`/forms/${state}/${year}/${quarter}/${getFormSegment(
                            form
                          )}`}
                        >
                          {form.form}
                        </Link>
                      </td>
                      <td>
                        <p>{form.form_name}</p>
                      </td>
                      <td>
                        <div className="pill">{getStatusDisplay(form)}</div>
                      </td>
                      <td>{dateFormatter(form.last_modified)}</td>
                      <td>
                        <Link
                          to={`/print/${state}/${year}/${quarter}/${getFormSegment(
                            form
                          )}`}
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
          </div>
        ) : null}

        {hasAccess === false ? <Unauthorized /> : null}
      </div>
    </div>
  );
};

export default Quarterly;
