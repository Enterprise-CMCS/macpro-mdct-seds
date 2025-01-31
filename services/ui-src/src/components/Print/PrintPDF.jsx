import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@trussworks/react-uswds";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import "react-tabs/style/react-tabs.css";
import PropTypes from "prop-types";
import QuestionComponent from "../Question/Question";
import { getFormData } from "../../store/reducers/singleForm/singleForm";
import "./PrintPDF.scss";
import { NavLink, useParams } from "react-router-dom";
import Unauthorized from "../Unauthorized/Unauthorized";
import { getUserInfo } from "../../utility-functions/userFunctions";

const PrintPDF = ({
  tabDetails,
  questions,
  answers,
  currentTabs,
  getForm,
  statusData
}) => {
  const [loading, setLoading] = useState(true);

  const { state, year, quarter, formName } = useParams();
  const [hasAccess, setHasAccess] = React.useState("");

  // format URL parameters to compensate for human error:  /forms/AL/2021/01/21E === forms/al/2021/1/21e
  const formattedStateName = state.toUpperCase();
  const quarterInt = Number.parseInt(quarter).toString();
  const form = formName.toUpperCase().replace("-", ".");

  useEffect(() => {
    const fetchData = async () => {
      // Get user information
      const currentUserInfo = await getUserInfo();

      let userStates = currentUserInfo ? currentUserInfo.Items[0].states : [];

      if (
        userStates.includes(state) ||
        currentUserInfo.Items[0].role === "admin"
      ) {
        await getForm(formattedStateName, year, quarterInt, form);
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
      setLoading(false);
    };

    fetchData();
  }, [getForm, formattedStateName, year, quarterInt, form, state]);

  const handlePrint = async event => {
    event.preventDefault();
    window.print();
  };

  return (
    <div className="print-page padding-x-5 ">
      {loading ? (
        <div className="loader">
          <div className="loader-content">
            <div className="loader-icon"></div>Generating print view
            <br /> Please Wait...
          </div>
        </div>
      ) : null}
      {hasAccess === true ? (
        <>
          <div className="form-header upper-form-nav">
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

          <Button
            className="margin-left-5 action-button print-button"
            primary="true"
            onClick={e => handlePrint(e)}
          >
            Print / PDF
            <FontAwesomeIcon icon={faPrint} className="margin-left-2" />
          </Button>

          <h2 className="form-name">{`Form ${form} | ${formattedStateName} | ${year} | Quarter ${quarter}`}</h2>

          <div id="TheDiv" className="tab-container-main testClass">
            {currentTabs.map((tab, tabIndex) => {
              // Filter out just the answer objects that belong in this tab
              const tabAnswers = answers.filter(
                element => element.rangeId === tab
              );

              const ageRangeDetails = tabDetails.find(
                element => tab === element.rangeId
              );
              return (
                <React.Fragment key={tabIndex}>
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

                    if (parseInt(tempContextData) === parseInt(quarter)) {
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
                </React.Fragment>
              );
            })}
            <div className="summary-notes">
              <strong className="summary-label">
                Add any notes here to accompany the form submission:
              </strong>
              <div className="summary-text">
                {!null || statusData.state_comments[0].entry.length ? (
                  <div>{`${statusData.state_comments[0].entry}`}</div>
                ) : null}
              </div>
            </div>
            <h2 className="form-name">{`Form ${form} | ${formattedStateName} | ${year} | Quarter ${quarter}`}</h2>
          </div>
        </>
      ) : null}

      {hasAccess === false ? <Unauthorized /> : null}
    </div>
  );
};

PrintPDF.propTypes = {
  currentTabs: PropTypes.array.isRequired,
  tabDetails: PropTypes.array.isRequired,
  questions: PropTypes.array.isRequired,
  answers: PropTypes.array.isRequired,
  getForm: PropTypes.func.isRequired,
  statusData: PropTypes.object.isRequired
};

const mapState = state => ({
  currentTabs: state.currentForm.tabs,
  tabDetails: state.global.age_ranges,
  questions: state.currentForm.questions,
  answers: state.currentForm.answers,
  statusData: state.currentForm.statusData
});

const mapDispatch = {
  getForm: getFormData ?? {}
};

export default connect(mapState, mapDispatch)(PrintPDF);
