import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@trussworks/react-uswds";
import { renderToString } from "react-dom/server";
import { jsPDF } from "jspdf";
import {html2canvas} from "html2canvas"
import { saveAs } from "file-saver";
import React, { useState, useEffect } from "react";
import {connect, Provider} from "react-redux";
import "react-tabs/style/react-tabs.css";
import CertificationTab from "../CertificationTab/CertificationTab";
import SummaryTab from "../SummaryTab/SummaryTab";
import PropTypes from "prop-types";
import QuestionComponent from "../Question/Question";
import store from "../../store/storeIndex";

import "./PrintPDF.scss";
import TabContainer from "../TabContainer/TabContainer";
const PrintPDF = ({ tabDetails, questions, answers, currentTabs, quarter }) => {

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
    // setTimeout(() => {// added timeout to avoid svg loading issue
        // *** initiate pdf render
        pdf = new jsPDF({
          unit: "px",
          format: "letter",
          userUnit: "px",
          orientation: "portrait",
          pageBreak: { mode: 'avoid-all', after: '.tempQuestionClass' }
        });



          pdf
              .html(pdfToExport, {
                  html2canvas: { scale: .25 }
              })
              .then(() => {

                  // pdf.autoTable({ html: '.usa-table' }) //supposed to help with page breaks
                  //For above to work, you need to run npm install jspdf-autotable
                   // pdf.setFont('helvetica')


                  const pageCount = pdf.internal.getNumberOfPages()
                  pdf.setTextColor(0, 0, 0);
                  pdf.setFontSize(8)
                  for (let i = 1; i <= pageCount; i++) {
                      console.log("page count",pageCount,"here",i)
                      pdf.setPage(i)
                      pdf.text('Page ' + String(i) + ' of ' + String(pageCount), pdf.internal.pageSize.width -5 , pdf.internal.pageSize.height - 5, {
                          align: 'right'
                      })
                  }
                  pdf.save(fileName);
              });
      // }, 1000);



  };

  return (
    <>
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
        <div id="TheDiv" className="tab-container-main padding-x-5 testClass">
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
                        {console.log("questions", questions)}
                        {questions.map((singleQuestion, idx) => {
                            // Extract the ID from each question and find its corresponding answer object
                            const questionID = singleQuestion.question;
                            const questionAnswer = tabAnswers.find(
                                element => element.question === questionID
                            );

                            let returnComponent = "";
                            let tempContextData = {};

                            console.log("singleQuestion", singleQuestion)
                            if (singleQuestion.context_data) {
                                tempContextData =
                                    singleQuestion.context_data.show_if_quarter_in;
                            }
                            // below is just in case the context_data does not exist for the question
                            else {
                                tempContextData = quarter
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

            <SummaryTab/>

            <CertificationTab/>
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
