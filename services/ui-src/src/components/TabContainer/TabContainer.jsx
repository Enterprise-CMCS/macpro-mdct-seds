import React, { useState, useEffect } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import CertificationTab from "../CertificationTab/CertificationTab";
import SummaryTab from "../SummaryTab/SummaryTab";
import PropTypes from "prop-types";
import QuestionComponent from "../Question/Question";
import "./TabContainer.scss";
import { getUserInfo } from "../../utility-functions/userFunctions";
import { isFinalCertified, isNotRequired } from "../../utility-functions/formStatus";
import { getAgeRangeDetails } from "lookups/ageRanges";
import { useStore } from "../../store/store";

const TabContainer = ({ quarter }) => {
  const questions = useStore(state => state.questions);
  const answers = useStore(state => state.answers);
  const currentTabs = useStore(state => state.tabs);
  const statusData = useStore(state => state.statusData);
  const [disabledStatus, setDisabledStatus] = useState();

  useEffect(() => {
    const establishStatus = async () => {
      let userRole;
      let statusBoolean = false;

      let existingUser = await getUserInfo();

      const userdata = existingUser["Items"];
      userdata.map(async userInfo => {
        userRole = userInfo.role;
      });
      if (
        isFinalCertified(statusData) ||
        isNotRequired(statusData) ||
        userRole === "admin" ||
        userRole === "business"
      ) {
        statusBoolean = true;
      }
      setDisabledStatus(statusBoolean);
    };
    establishStatus();
  }, [statusData]);

  return (
    <Tabs className="tab-container-main">
      <TabList>
        {currentTabs.map((tab, idx) => {
          const ageRangeName = getAgeRangeDetails(tab)?.name;
          const tabLabel = ageRangeName
            // Default to dynamic label. Example: "1234" -> "Ages 12 - 34"
            ?? `Ages ${tab.slice(0, 2)} - ${tab.slice(-2)}`;
          return <Tab key={idx}>{tabLabel}</Tab>;
        })}
        <Tab>Summary</Tab>
        <Tab>Certification</Tab>
      </TabList>

      {currentTabs.map((tab, idx) => {
        // Filter out just the answer objects that belong in this tab
        const tabAnswers = answers.filter(element => element.rangeId === tab);
        
        const ageRangeDescription = getAgeRangeDetails(tab)?.description;
        return (
          <TabPanel key={idx}>
            {ageRangeDescription ? (
              <div className="age-range-description padding-y-2">
                <h3>{ageRangeDescription}:</h3>
              </div>
            ) : null}

            {questions.map((singleQuestion, idx) => {
              // Extract the ID from each question and find its corresponding answer object
              const questionID = singleQuestion.question;
              const questionAnswer = tabAnswers.find(
                element => element.question === questionID
              );

              let returnComponent = "";
              let activeContextData = false;
              let tempContextData = {};

              if (singleQuestion.context_data) {
                tempContextData =
                  singleQuestion.context_data.show_if_quarter_in;
                activeContextData = true;
              }
              //Conditional display only works with single quarters and equals (so far)
              if (
                activeContextData === false ||
                (activeContextData && tempContextData.includes(quarter))
              ) {
                returnComponent = (
                  <QuestionComponent
                    key={idx}
                    rangeID={tab}
                    questionData={singleQuestion}
                    answerData={questionAnswer}
                    disabled={disabledStatus}
                  />
                );
              }
              return returnComponent;
            })}
          </TabPanel>
        );
      })}

      <TabPanel>
        <SummaryTab />
      </TabPanel>
      <TabPanel>
        <CertificationTab />
      </TabPanel>
    </Tabs>
  );
};

TabContainer.propTypes = {
  quarter: PropTypes.string.isRequired,
};

export default TabContainer;
