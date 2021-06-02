import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faPrint } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@trussworks/react-uswds";
import { renderToString } from "react-dom/server";
import { jsPDF } from "jspdf";
import React, { useEffect } from "react";
import { connect } from "react-redux";
import "react-tabs/style/react-tabs.css";
import SummaryTab from "../SummaryTab/SummaryTab";
import PropTypes from "prop-types";
import QuestionComponent from "../Question/Question";
import { getFormData } from "../../store/reducers/singleForm/singleForm";

import "./PrintPDF.scss";
import { NavLink, useParams } from "react-router-dom";

const PrintPDF = ({
  tabDetails,
  questions,
  answers,
  currentTabs,
  getForm,
  statusId,
  statusTypes
}) => {
  const { state, year, quarter, formName } = useParams();

  // format URL parameters to compensate for human error:  /forms/AL/2021/01/21E === forms/al/2021/1/21e
  const formattedStateName = state.toUpperCase();
  const quarterInt = Number.parseInt(quarter).toString();
  const form = formName.toUpperCase().replace("-", ".");

  useEffect(() => {
    const fetchData = async () => {
      await getForm(formattedStateName, year, quarterInt, form);
    };
    fetchData();
  }, [getForm, formattedStateName, year, quarterInt, form]);

  const handlePrint = async (event, filename) => {
    event.preventDefault();
    window.print();
  };

  const findStatus = id => {
    let foundStatus = statusTypes.find(element => element.status_id === id);
    let textStatus = foundStatus ? foundStatus.status : "N/A";
    return textStatus;
  };
  return (
    <>
      <div row className="form-header upper-form-nav">
        <div className="breadcrumbs">
          <NavLink className="breadcrumb" to="/">
            {" "}
            Enrollment Data Home {">"}
            {"   "}
          </NavLink>
          <NavLink
            className="breadcrumb"
            to={`/forms/${formattedStateName}/${year}/${quarter}`}
          >
            {`${formattedStateName} Q${quarter} ${year} > `}
          </NavLink>
          <NavLink
            className="breadcrumb"
            to={`/forms/${formattedStateName}/${year}/${quarter}/${form}`}
          >
            {" "}
            {` Form ${form}`}{" "}
          </NavLink>
        </div>
      </div>
      <h2 className="form-status"> {`FORM STATUS: ${findStatus(statusId)}`}</h2>
      <Button
        className="margin-left-5 action-button print-button"
        primary="true"
        onClick={e =>
          handlePrint(
            e,
            `${formattedStateName}_${year}_${quarter}_${form}_${new Date()
              .toISOString()
              .substring(0, 10)}.pdf`
          )
        }
      >
        Print
        <FontAwesomeIcon icon={faPrint} className="margin-left-2" />
      </Button>

      <div id="TheDiv" className="tab-container-main padding-x-5 testClass">
        {currentTabs.map((tab, idx) => {
          // Filter out just the answer objects that belong in this tab
          const tabAnswers = answers.filter(element => element.rangeId === tab);

          const ageRangeDetails = tabDetails.find(
            element => tab === element.rangeId
          );
          return (
            <>
              {ageRangeDetails ? (
                <div className="age-range-description padding-y-2">
                  <h3>{ageRangeDetails.ageDescription}:</h3>
                </div>
              ) : null}
              {questions.map((singleQuestion, idx) => {
                // Extract the ID from each question and find its corresponding answer object
                const questionID = singleQuestion.question;
                const questionAnswer = tabAnswers.find(
                  element => element.question === questionID
                );

                let returnComponent = "";
                let tempContextData = {};
                if (singleQuestion.context_data) {
                  tempContextData =
                    singleQuestion.context_data.show_if_quarter_in;
                }
                // below is just in case the context_data does not exist for the question
                else {
                  tempContextData = quarter;
                }

                if (tempContextData === quarter) {
                  returnComponent = (
                    <QuestionComponent
                      key={idx}
                      rangeID={tab}
                      questionData={singleQuestion}
                      answerData={questionAnswer}
                      disabled={true}
                    />
                  );
                }
                return returnComponent;
              })}
            </>
          );
        })}

        <SummaryTab />
      </div>
    </>
  );
};

PrintPDF.propTypes = {
  currentTabs: PropTypes.array.isRequired,
  tabDetails: PropTypes.array.isRequired,
  questions: PropTypes.array.isRequired,
  answers: PropTypes.array.isRequired,
  statusId: PropTypes.number.isRequired,
  form: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired
};

const mapState = state => ({
  currentTabs: state.currentForm.tabs,
  tabDetails: state.global.age_ranges,
  questions: state.currentForm.questions,
  answers: state.currentForm.answers,
  statusId: state.currentForm.statusData.status_id || "",
  statusTypes: state.global.status
});

const mapDispatch = {
  getForm: getFormData ?? {}
};

export default connect(mapState, mapDispatch)(PrintPDF);

// HOW TO STYLE PRINT VIEW

// FINGER STRINGS:
// Cant confirm save because the form isnt currently editable
