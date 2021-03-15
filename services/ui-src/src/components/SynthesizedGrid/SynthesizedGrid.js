import React, { useEffect, useState } from "react";
import GridWithTotals from "../GridWithTotals/GridWithTotals"
import PropTypes from "prop-types";
import {connect} from "react-redux";
import jsonpath,{selectObjectInArrayByQuestionId} from "../../utilityFunctions/jsonPath";
import { sortQuestionColumns } from "../../utilityFunctions/sortingFunctions";
import QuestionComponent from "../Question";


const SynthesizedGrid = props => {
  const tempQuestionId = props.questionID;
  let tempGridData = []
  const tempDisabled = props.disabled
  useEffect(() => {
    const {answerData,questionData, gridData, allAnswers} = props
    console.log("questionData",questionData)
    console.log("answerData",answerData)

    const tabAnswers = allAnswers.filter(
        element => element.rangeId === answerData.rangeId
    );

    answerData.rows.map((row,rowIndex) => {
      // add header row
      if(rowIndex === 0)
      {
        tempGridData[rowIndex] = gridData[rowIndex]
      }
      else
      {
        let tempRowObject = {}
        Object.entries(row).forEach((key) => {
          // get row header
          if(key[0] === "col1"){
            tempRowObject = Object.assign(tempRowObject, {[key[0]]:key[1]})
          }
          //calculate values for each column by row
          else{
            let tempCalculatedValue = calculateValue(key[1][0],tabAnswers)
            tempRowObject = Object.assign(tempRowObject, {[key[0]]:tempCalculatedValue})
          }
        })
        tempGridData.push(tempRowObject)
      }
      console.log("final tempgridedata",tempGridData)
    })
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateValue = (incomingCalculation, tabAnswers) => {
    if(incomingCalculation.actions && incomingCalculation.actions[0] === "formula"){
      let tempCalculation = []
      let returnValue = {}
      Object.entries(incomingCalculation.targets).forEach((key) => {
        tempCalculation[key[0]] = getValue(key[1],tabAnswers)
      })

      return eval(incomingCalculation.formula.replace("<0>",tempCalculation[0]).replace("<1>",tempCalculation[1]))
    }
  }

  const getValue = (target,tabAnswers) => {
    // example target "$..*[?(@.question=='2021-64.21E-04')].rows[2].col2",
    const targetInfo = target.split("'")
    // rowIndex = '2' (out of .rows[2])
    const rowIndex = targetInfo[2].split("rows[")[1].substring(0,1)
    // colName = 'col2' out of .rows[2].col2
    const colName = targetInfo[2].substring(targetInfo[2].length - 4)

    let tempTargetHolder = target.split("'")
    const tempValue = selectObjectInArrayByQuestionId(tabAnswers,tempTargetHolder[1])
    return tempValue[0].rows[rowIndex][colName]
  }
  console.log("tempquestionID", tempQuestionId)
  console.log("tempGridData", tempGridData)
  console.log("tempDisabled",tempDisabled)
  const sortedRows = sortQuestionColumns(tempGridData);
  let returnObject = [];
  console.log("sorted Rows",sortedRows.length)
  if (sortedRows.length >= 4){
    returnObject = <GridWithTotals
        questionID={tempQuestionId}
        gridData={sortedRows}
        disabled={tempDisabled}
    />
  }

  return returnObject
};



SynthesizedGrid.propTypes = {
  answerData: PropTypes.array.isRequired,
  allAnswers: PropTypes.array.isRequired,
};

const mapState = state => ({
  allAnswers: state.currentForm.answers
});

export default connect(mapState)(SynthesizedGrid);