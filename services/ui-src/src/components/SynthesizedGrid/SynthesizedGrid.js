import React, { useEffect, useState } from "react";
import GridWithTotals from "../GridWithTotals/GridWithTotals"
import PropTypes from "prop-types";
import {connect} from "react-redux";
import jsonpath from "../util/jsonpath";

const SynthesizedGrid = props => {


  useEffect(() => {
    const {answerData,questionData, gridData, allAnswers} = props
    console.log("questionData",questionData)
    console.log("answerData",answerData)

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
            let tempCalculatedValue = calculateValue(key[1][0],tabAnswers)
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
    const rowIndex = targetInfo[2].split("rows[")[1].substring(0,1)
    const colNumber = targetInfo[2].substring(targetInfo[2].length - 4)
    const tempvalue = selectFragmentById(tabAnswers,target)
    console.log("rowIndex",rowIndex)
    console.log("colNumber",colNumber)
    const questionAnswer1 = tabAnswers.filter(element => element.question === targetInfo[1]);
  }

  return ("tst");
};

export const selectFragmentById = (state, id) => {
  const jpexpr = `$..*[?(@.id=='${id}')]`;
  const fragment = jsonpath.query(state, id)[0];
  console.log("fragment", fragment)
  return fragment;
};

SynthesizedGrid.propTypes = {
  answerData: PropTypes.array.isRequired,
  allAnswers: PropTypes.array.isRequired,
};

const mapState = state => ({
  allAnswers: state.currentForm.answers
});

export default connect(mapState)(SynthesizedGrid);