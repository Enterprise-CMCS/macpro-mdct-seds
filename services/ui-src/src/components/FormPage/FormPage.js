import React, { useEffect } from "react";
import { connect } from "react-redux";
import { GridContainer } from "@trussworks/react-uswds";
import TabContainer from "../TabContainer/TabContainer";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { getFormData } from "../../store/reducers/singleForm/singleForm";
import FormHeader from "../FormHeader/FormHeader";
import FormFooter from "../FormFooter/FormFooter";
import NotApplicable from "../NotApplicable/NotApplicable";
import "./FormPage.scss";

const FormPage = ({ getForm, statusData }) => {
  const { last_modified } = statusData;

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
    <>
      <GridContainer className="form-header" data-testid="FormPage">
        <FormHeader
          quarter={quarterInt}
          form={formattedFormName}
          year={year}
          state={formattedStateName}
        />
        <NotApplicable />
      </GridContainer>

      <GridContainer>
        <div className="tab-container">
          <TabContainer quarter={quarter} />
        </div>
      </GridContainer>

      <GridContainer className="form-footer">
        <FormFooter
          state={formattedStateName}
          year={year}
          quarter={quarterInt}
          lastModified={last_modified}
        />
      </GridContainer>
    </>
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
