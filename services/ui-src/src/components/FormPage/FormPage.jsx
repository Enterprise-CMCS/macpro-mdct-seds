import React, { useEffect } from "react";
import { Alert } from "@trussworks/react-uswds";
import TabContainer from "../TabContainer/TabContainer";
import { useParams, useHistory } from "react-router-dom";
import FormHeader from "../FormHeader/FormHeader";
import FormFooter from "../FormFooter/FormFooter";
import NotApplicable from "../NotApplicable/NotApplicable";
import "./FormPage.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@trussworks/react-uswds";
import Unauthorized from "../Unauthorized/Unauthorized";
import FormLoadError from "../FormLoadError/FormLoadError";
import { getUserInfo } from "../../utility-functions/userFunctions";
import { useStore } from "../../store/store";

const FormPage = () => {
  const statusData = useStore(state => state.statusData);
  const loadError = useStore(state => state.loadError);
  const getForm = useStore(state => state.loadForm);

  let history = useHistory();

  const [saveAlert, setSaveAlert] = React.useState(false);
  const [hasAccess, setHasAccess] = React.useState("");
  const { last_modified, save_error } = statusData;

  // Extract state, year, quarter and formName from URL segments
  const { state, year, quarter, formName } = useParams();

  // format URL parameters to compensate for human error:  /forms/AL/2021/01/21E === forms/al/2021/1/21e
  const formattedStateName = state.toUpperCase();
  const quarterInt = Number.parseInt(quarter).toString();
  const formattedFormName = formName.toUpperCase().replace("-", ".");

  const redirectToPDF = async () => {
    if (
      window.confirm(
        "You may have unsaved changes. If unsure, click cancel and save the form before proceeding"
      )
    ) {
      history.push(`/print/${state}/${year}/${quarter}/${formName}`);
    }
  };
  // Call the API and set questions, answers and status data in the store based on URL parameters
  useEffect(() => {
    const fetchData = async () => {
      // Get user information
      const currentUserInfo = await getUserInfo();

      let userStates = currentUserInfo ? currentUserInfo.Items[0].states : [];

      if (
        userStates.includes(state) ||
        currentUserInfo.Items[0].role === "admin"
      ) {
        await getForm(formattedStateName, year, quarterInt, formattedFormName);
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    };
    fetchData();
  }, [formattedStateName, year, quarterInt, formattedFormName, state]);

  useEffect(() => {
    // Get current time
    const currentTime = new Date().getTime();

    // Get last modified and add 10 seconds (same as setTimeout)
    let lastModifiedAsDate = new Date(last_modified);
    lastModifiedAsDate.setSeconds(lastModifiedAsDate.getSeconds() + 10);
    lastModifiedAsDate = lastModifiedAsDate.getTime();

    // If current time is before lastModified set alert to true, else false
    if (currentTime < lastModifiedAsDate) {
      setSaveAlert(true);

      // After 10 seconds, remove the alert
      setTimeout(() => {
        setSaveAlert(false);
      }, 10000);
    } else {
      setSaveAlert(false);
    }
  }, [last_modified]);
  return (
    <div data-testid="FormPage" className="formPage">
      {save_error ? (
        <div className="save-error">
          <Alert type="error" heading="Save Error:" headingLevel="h1">
            A problem occurred while saving. Please save again. If the problem
            persists, contact{" "}
            <a
              href="mailto:mdct_help@cms.hhs.gov"
              rel="noopener noreferrer"
              target="_blank"
            >
              MDCT_Help@cms.hhs.gov
            </a>
          </Alert>
        </div>
      ) : saveAlert ? (
        <div className="save-success">
          <Alert type="success" heading="Save success:" headingLevel="h1">
            Form {formName} has been successfully saved.
          </Alert>
        </div>
      ) : null}
      {hasAccess === true && !loadError ? (
        <>
          <div className="margin-bottom-3">
            <FormHeader
              quarter={quarterInt}
              form={formattedFormName}
              year={year}
              state={formattedStateName}
            />
          </div>
          <Button
            className="action-button"
            primary="true"
            onClick={redirectToPDF}
          >
            Print view / PDF
            <FontAwesomeIcon icon={faFilePdf} className="margin-left-2" />
          </Button>
          <NotApplicable />
          <div className="tab-container margin-y-3">
            <TabContainer quarter={quarter} />
          </div>

          <div className="margin-top-2" data-testid="form-footer">
            <FormFooter
              state={formattedStateName}
              year={year}
              quarter={quarterInt}
              lastModified={last_modified}
            />
          </div>
        </>
      ) : null}
      {hasAccess === false ? <Unauthorized /> : null}
      {loadError ? (
        <>
          <div className="margin-bottom-3">
            <FormHeader
              quarter={quarterInt}
              form={formattedFormName}
              year={year}
              state={formattedStateName}
            />
          </div>
          <FormLoadError />
        </>
      ) : null}
    </div>
  );
};

export default FormPage;
