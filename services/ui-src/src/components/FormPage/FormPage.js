import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Alert } from "@trussworks/react-uswds";
import TabContainer from "../TabContainer/TabContainer";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { getFormData } from "../../store/reducers/singleForm/singleForm";
import FormHeader from "../FormHeader/FormHeader";
import FormFooter from "../FormFooter/FormFooter";
import NotApplicable from "../NotApplicable/NotApplicable";
import "./FormPage.scss";

const FormPage = ({ getForm, statusData }) => {
  const { last_modified, save_error } = statusData;

  // Extract state, year, quarter and formName from URL segments
  const { state, year, quarter, formName } = useParams();

  // format URL parameters to compensate for human error:  /forms/AL/2021/01/21E === forms/al/2021/1/21e
  const formattedStateName = state.toUpperCase();
  const quarterInt = Number.parseInt(quarter).toString();
  const formattedFormName = formName.toUpperCase().replace("-", ".");

  // Call the API and set questions, answers and status data in redux based on URL parameters
  useEffect(() => {
    getForm(formattedStateName, year, quarterInt, formattedFormName);
  }, [getForm, formattedStateName, year, quarterInt, formattedFormName]);

  return (
    <div className="react-transition fade-in" data-testid="FormPage">
      {save_error ? (
        <div className="save-error">
          <Alert type="error" heading="Save Error:">
            A problem occurred while saving. Please save again. If the problem
            persists, contact{" "}
            <a
              href="mailto:sedshelp@cms.hhs.gov"
              rel="noopener noreferrer"
              target="_blank"
            >
              SEDSHELP@cms.hhs.gov
            </a>
          </Alert>
        </div>
      ) : null}
      <div className="margin-x-5 margin-bottom-3">
        <FormHeader
          quarter={quarterInt}
          form={formattedFormName}
          year={year}
          state={formattedStateName}
        />
      </div>
      <NotApplicable />
      <div className="tab-container margin-x-5 margin-y-3">
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
    </div>
  );
};

FormPage.propTypes = {
  statusData: PropTypes.object.isRequired,
  getForm: PropTypes.func.isRequired
};

const mapState = state => ({
  statusData: state.currentForm.statusData
});

const mapDispatch = {
  getForm: getFormData ?? {}
};

export default connect(mapState, mapDispatch)(FormPage);
