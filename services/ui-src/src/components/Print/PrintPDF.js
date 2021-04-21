import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@trussworks/react-uswds";
import { renderToString } from "react-dom/server";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import CertificationTab from "../CertificationTab/CertificationTab";
import SummaryTab from "../SummaryTab/SummaryTab";
import PropTypes from "prop-types";
import QuestionComponent from "../Question/Question";

//import "./PrintPDF.scss";
const PrintPDF = ({ tabDetails, questions, answers, currentTabs, quarter }) => {

  useEffect(() => {}, []);

  const handleExport = async (
    format,
    fileName,
    pdfContent = null,
    pdfContentType = "react-component"
  ) => {
    let buffer, blob, pdf, pdfToExport;


        // *** do additional processing depending on content type
        switch (pdfContentType) {
          // *** if element is a react component, render it to html string
          case "react-component":
            pdfToExport = renderToString(pdfContent);
            break;

          // *** for content to be extracted from html selectors ...
          case "html-selector":
            // * ... temporarily add class to DOM prior to initiating render to pdf
            // * this will enable overrides from scss
            //document.querySelector(pdfContent).classList.add("export-to-pdf");

            // * store content to render to pdf
            pdfToExport = document.querySelector(pdfContent);

            // * remove temporarily added class from DOM
            // setTimeout(() => {
            //   document
            //     .querySelector(pdfContent)
            //     //.classList.remove("export-to-pdf");
            // }, 1000);

            break;

          case "html":
            pdfToExport = pdfContent;
            break;

          default:
            // *** no default behavior is currently specified
            break;
        }

        // *** initiate pdf render
        pdf = new jsPDF({
          unit: "px",
          format: "a4",
          userUnit: "px",
          orientation: "landscape",
          textColor: "black",
          drawColor:"black"
        });


      setTimeout(() => {
          pdf
              .html(pdfToExport, {
                  html2canvas: { scale: 0.25 }
              })
              .then(() => {
                  pdf.save(fileName);
              });
      }, 10000);



  };

  return (
    <div className="tab-container-main padding-x-5 testClass" >
      <Button
          className="margin-left-3 action-button"
          primary="true"
          onClick={async () =>
              await handleExport(
                  "pdf",
                  "test_one.pdf",
                  ".testClass",
                  "html-selector"
              )
          }
      >
        Print
        <FontAwesomeIcon icon={faFilePdf} className="margin-left-2" />
      </Button>
      {console.log("answers",answers)}
      {currentTabs.map((tab, idx) => {
        // Filter out just the answer objects that belong in this tab
        const tabAnswers = answers.filter(element => element.rangeId === tab);
        const tempQuestion = tabAnswers[0]
        quarter = tempQuestion.answer_entry.split("-")[2]

        const ageRangeDetails = tabDetails.find(
          element => tab === element.range_id
        );
        return (
          <>

            {ageRangeDetails ? (
              <div className="age-range-description padding-y-2">
                <h3>{ageRangeDetails.age_description}:</h3>
              </div>
            ) : null}
            {console.log("questions",questions)}
            {questions.map((singleQuestion, idx) => {
              // Extract the ID from each question and find its corresponding answer object
              const questionID = singleQuestion.question;
              const questionAnswer = tabAnswers.find(
                element => element.question === questionID
              );

              let returnComponent = "";
              let tempContextData = {};

              console.log("singleQuestion",singleQuestion)
              if (singleQuestion.context_data) {
                tempContextData =
                  singleQuestion.context_data.show_if_quarter_in;
              }
              // below is just in case the context_data does not exist for the question
              else{
                  tempContextData = quarter
              }

              if (tempContextData === quarter) {
                returnComponent = (
                  <QuestionComponent
                    key={idx}
                    rangeID={tab}
                    questionData={singleQuestion}
                    answerData={questionAnswer}
                  />
                );
              }
              return returnComponent;
            })}
          </>
        );
      })}

      <SummaryTab />

      <CertificationTab />
    </div>
  );
};

PrintPDF.propTypes = {
  currentTabs: PropTypes.array.isRequired,
  tabDetails: PropTypes.array.isRequired,
  questions: PropTypes.array.isRequired,
  answers: PropTypes.array.isRequired,
  notApplicable: PropTypes.bool.isRequired,
  statusId: PropTypes.number.isRequired
};

const mapState = state => ({
  currentTabs: state.currentForm.tabs,
  tabDetails: state.global.age_ranges,
  questions: state.currentForm.questions,
  answers: state.currentForm.answers,
  notApplicable: state.currentForm.statusData.not_applicable || false,
  statusId: state.currentForm.statusData.status_id || ""
});

export default connect(mapState)(PrintPDF);
