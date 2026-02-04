import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@cmsgov/design-system";
import React, { useEffect, useState } from "react";
import "react-tabs/style/react-tabs.css";
import QuestionComponent from "../Question/Question";
import { NavLink, useParams } from "react-router-dom";
import Unauthorized from "../Unauthorized/Unauthorized";
import { getAgeRangeDetails } from "../../lookups/ageRanges";
import { useStore } from "../../store/store";
import { canViewStateData } from "../../utility-functions/permissions";

const PrintPDF = () => {
  const user = useStore((state) => state.user);
  const questions = useStore((state) => state.questions);
  const answers = useStore((state) => state.answers);
  const currentTabs = useStore((state) => state.tabs);
  const statusData = useStore((state) => state.statusData);
  const getForm = useStore((state) => state.loadForm);

  const [loading, setLoading] = useState(true);

  const { state, year, quarter, formName } = useParams();
  const [hasAccess, setHasAccess] = React.useState(false);

  // format URL parameters to compensate for human error:  /forms/AL/2021/01/21E === forms/al/2021/1/21e
  const formattedStateName = state.toUpperCase();
  const quarterInt = Number.parseInt(quarter).toString();
  const form = formName.toUpperCase().replace("-", ".");

  useEffect(() => {
    const fetchData = async () => {
      if (canViewStateData(user, state)) {
        await getForm(formattedStateName, year, quarterInt, form);
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
      setLoading(false);
    };

    fetchData();
  }, [getForm, formattedStateName, year, quarterInt, form, state]);

  const handlePrint = async (event) => {
    event.preventDefault();
    window.print();
  };

  return (
    <div className="flex-col-gap-1">
      {loading ? (
        <div>
          <div>
            <div></div>Generating print view
            <br /> Please Wait...
          </div>
        </div>
      ) : null}
      {hasAccess === true ? (
        <>
          <div>
            <div className="breadcrumbs">
              <NavLink to="/">
                {" "}
                Enrollment Data Home {">"}
                {"   "}
              </NavLink>
              <NavLink to={`/forms/${formattedStateName}/${year}/${quarter}`}>
                {`${formattedStateName} Q${quarter} ${year} > `}
              </NavLink>
              <NavLink
                to={`/forms/${formattedStateName}/${year}/${quarter}/${form}`}
              >
                {" "}
                {` Form ${form}`}{" "}
              </NavLink>
            </div>
          </div>

          <Button variation="solid" onClick={(e) => handlePrint(e)}>
            Print / PDF
            <FontAwesomeIcon icon={faPrint} />
          </Button>

          <h2>{`Form ${form} | ${formattedStateName} | ${year} | Quarter ${quarter}`}</h2>

          <div id="TheDiv" className="flex-col-gap-1">
            {currentTabs.map((tab, tabIndex) => {
              // Filter out just the answer objects that belong in this tab
              const tabAnswers = answers.filter(
                (element) => element.rangeId === tab
              );

              const ageRangeDescription = getAgeRangeDetails(tab)?.description;
              return (
                <React.Fragment key={tabIndex}>
                  {ageRangeDescription ? (
                    <div className="padding-1">
                      <h3>{ageRangeDescription}:</h3>
                    </div>
                  ) : null}
                  {questions.map((singleQuestion, idx) => {
                    // Extract the ID from each question and find its corresponding answer object
                    const questionID = singleQuestion.question;
                    const questionAnswer = tabAnswers.find(
                      (element) => element.question === questionID
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
            <div className="flex-col-gap-1 summary-notes">
              <strong>
                Add any notes here to accompany the form submission:
              </strong>
              <div className="summary-text">
                {!null || statusData.state_comments[0].entry.length ? (
                  <div>{`${statusData.state_comments[0].entry}`}</div>
                ) : null}
              </div>
            </div>
            <h2>{`Form ${form} | ${formattedStateName} | ${year} | Quarter ${quarter}`}</h2>
          </div>
        </>
      ) : null}

      {hasAccess === false ? <Unauthorized /> : null}
    </div>
  );
};

export default PrintPDF;
