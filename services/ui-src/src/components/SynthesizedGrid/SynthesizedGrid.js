import React, { useEffect, useState } from "react";
import GridWithTotals from "../GridWithTotals/GridWithTotals"
import PropTypes from "prop-types";
import {connect} from "react-redux";

const SynthesizedGrid = props => {


  useEffect(() => {
    const {answerData,questionData, gridData, allAnswers} = props
    console.log("questionData",questionData)
    console.log("answerData",answerData)
    //let yearForm = answerData.question.substring(0,answerData.question.length -3)
    console.log("yearForm",yearForm)

    let tempGridData = []
    const tabAnswers = allAnswers.filter(
        element => element.rangeId === answerData.rangeId
    );

    answerData.rows.map((row,rowIndex) => {
      // add header row
      if(rowIndex = 0)
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
            let tempCalculatedValue = calculateValue(key[1][0],tabAnswers,yearForm)
            tempRowObject = Object.assign(tempRowObject, {[key[0]]:tempCalculatedValue})
          }
        })

      }

    })
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateValue = (incomingCalculation, tabAnswers) => {
    if(incomingCalculation.actions && incomingCalculation.actions[0] === "formula"){
      let tempCalculation = []
      let returnValue = {}
      Object.entries(incomingCalculation.targets).forEach((key) => {
        tempCalculation[key[0]] = pullValue(key[1],tabAnswers)
        console.log("calculation key",key)
      })
    }
  }

  const pullValue = (target,tabAnswers) => {
    const targetInfo = target.split("'")
    console.log("target",target)
    console.log("tabAnswers",tabAnswers)
    //const returnValue = tabAnswers.filter(element => element.question === targetInfo[1]);

  }

  return (
    <GridWithTotals //NEED TO UPDATE, THIS IS GENERIC
        questionData={questionData}
        gridData={sortedRows}
        disabled={disabled}
    />
  );
};


SynthesizedGrid.propTypes = {
  answerData: PropTypes.array.isRequired,
  allAnswers: PropTypes.array.isRequired,
};

const mapState = state => ({
  allAnswers: state.currentForm.answers
});

export default connect(mapState)(SynthesizedGrid);