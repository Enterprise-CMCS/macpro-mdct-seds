import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faPrint } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@trussworks/react-uswds";
import { renderToString } from "react-dom/server";
import { jsPDF } from "jspdf";
import React from "react";
import { connect } from "react-redux";
import "react-tabs/style/react-tabs.css";
import SummaryTab from "../SummaryTab/SummaryTab";
import PropTypes from "prop-types";
import QuestionComponent from "../Question/Question";

import "./PrintPDF.scss";
import { Link } from "react-router-dom";
const PrintPDF = ({
  tabDetails,
  questions,
  answers,
  currentTabs,
  quarter,
  form,
  year,
  stateName
}) => {
  const handlePrint = async (event, filename) => {
    event.preventDefault();
    window.print();
  };
  return (
    <>
      <div row className="form-header upper-form-nav">
        <div className="breadcrumbs">
          <Link to="/">
            {" "}
            Enrollment Data Home {">"}
            {"   "}
          </Link>
          <Link to={`/forms/${stateName}/${year}/${quarter}`}>
            {`${stateName} Q${quarter} ${year} > `}
          </Link>
          <Link to={`/forms/${stateName}/${year}/${quarter}/${form}`}>
            {" "}
            {` Form ${form}`}{" "}
          </Link>
        </div>
      </div>
      <Button
        className="margin-left-3 action-button"
        primary="true"
        onClick={e =>
          handlePrint(
            e,
            `${stateName}_${year}_${quarter}_${form}_${new Date()
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
  notApplicable: PropTypes.bool.isRequired,
  statusId: PropTypes.number.isRequired,
  form: PropTypes.string.isRequired,
  stateName: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  quarter: PropTypes.number.isRequired
};

const mapState = state => ({
  currentTabs: state.currentForm.tabs,
  tabDetails: state.global.age_ranges,
  questions: state.currentForm.questions,
  answers: state.currentForm.answers,
  notApplicable: state.currentForm.statusData.not_applicable || false,
  statusId: state.currentForm.statusData.status_id || "",
  year: state.currentForm.statusData.year,
  form: state.currentForm.statusData.form,
  stateName: state.currentForm.statusData.state_id,
  quarter: state.currentForm.statusData.quarter
});

export default connect(mapState)(PrintPDF);

// HOW TO SOLVE ROUTE PROBLEM

// HOW TO STYLE PRINT VIEW
