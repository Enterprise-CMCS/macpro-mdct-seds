import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import "./SynthesizedGrid.scss";
import { Table } from "@trussworks/react-uswds";

export const SynthesizedGrid = ({
  entireForm,
  range
}) => {


  let answer_arr = [];
  // Retrieve the answers specific to the current tab
  let tabAnswers = entireForm.answers.filter(
    element => element.rangeId === range
  );
  // Retrieve question 4 answer data for the current tab
  let q4arry = tabAnswers.filter(e => e.question.includes("-04"));
  q4arry.map(e => {
    answer_arr.push(e.rows);
    return true;
  });

  let q1arry = tabAnswers.filter(e => e.question.includes("-01"));
  q1arry.map(e => {
    answer_arr.push(e.rows);
    return true;
  });

  let numOr0 = n => isNaN(n) ? 0 : n

  let firstRowQ4Total = Object.values(q4arry[0].rows[1]).reduce((a, b) => numOr0(a) + numOr0(b));
  let firstRowQ1Total = Object.values(q1arry[0].rows[1]).reduce((a, b) => numOr0(a) + numOr0(b));
  let firstRowQ5Total = isFinite(firstRowQ4Total / firstRowQ1Total) && (firstRowQ4Total / firstRowQ1Total) || 0;

  let secondRowQ4Total = Object.values(q4arry[0].rows[2]).reduce((a, b) => numOr0(a) + numOr0(b));
  let secondRowQ1Total = Object.values(q1arry[0].rows[2]).reduce((a, b) => numOr0(a) + numOr0(b));
  let secondRowQ5Total = isFinite(secondRowQ4Total / secondRowQ1Total) && (secondRowQ4Total / secondRowQ1Total) || 0;

  let thirdRowQ4Total = Object.values(q4arry[0].rows[3]).reduce((a, b) => numOr0(a) + numOr0(b));
  let thirdRowQ1Total = Object.values(q1arry[0].rows[3]).reduce((a, b) => numOr0(a) + numOr0(b));
  let thirdRowQ5Total = isFinite(thirdRowQ4Total / thirdRowQ1Total) && (thirdRowQ4Total / thirdRowQ1Total) || 0;
  let fourthRowQ5Total =
    isFinite((firstRowQ4Total + secondRowQ4Total + thirdRowQ4Total) / (firstRowQ1Total + secondRowQ1Total + thirdRowQ1Total)) &&
    (firstRowQ4Total + secondRowQ4Total + thirdRowQ4Total) / (firstRowQ1Total + secondRowQ1Total + thirdRowQ1Total) || 0;

  let Q5Col1Total =
    isFinite((q4arry[0].rows[1].col2 + q4arry[0].rows[2].col2 + q4arry[0].rows[3].col2) / (q1arry[0].rows[1].col2 + q1arry[0].rows[2].col2 + q1arry[0].rows[3].col2)) &&
    (q4arry[0].rows[1].col2 + q4arry[0].rows[2].col2 + q4arry[0].rows[3].col2) / (q1arry[0].rows[1].col2 + q1arry[0].rows[2].col2 + q1arry[0].rows[3].col2) || 0;

  let Q5Col2Total =
    isFinite((q4arry[0].rows[1].col3 + q4arry[0].rows[2].col3 + q4arry[0].rows[3].col3) / (q1arry[0].rows[1].col3 + q1arry[0].rows[2].col3 + q1arry[0].rows[3].col3)) &&
    (q4arry[0].rows[1].col3 + q4arry[0].rows[2].col3 + q4arry[0].rows[3].col3) / (q1arry[0].rows[1].col3 + q1arry[0].rows[2].col3 + q1arry[0].rows[3].col3) || 0;

  let Q5Col3Total =
    isFinite((q4arry[0].rows[1].col4 + q4arry[0].rows[2].col4 + q4arry[0].rows[3].col4) / (q1arry[0].rows[1].col4 + q1arry[0].rows[2].col4 + q1arry[0].rows[3].col4)) &&
    (q4arry[0].rows[1].col4 + q4arry[0].rows[2].col4 + q4arry[0].rows[3].col4) / (q1arry[0].rows[1].col4 + q1arry[0].rows[2].col4 + q1arry[0].rows[3].col4) || 0;

  let Q5Col4Total =
    isFinite((q4arry[0].rows[1].col5 + q4arry[0].rows[2].col5 + q4arry[0].rows[3].col5) / (q1arry[0].rows[1].col5 + q1arry[0].rows[2].col5 + q1arry[0].rows[3].col5)) &&
    (q4arry[0].rows[1].col5 + q4arry[0].rows[2].col5 + q4arry[0].rows[3].col5) / (q1arry[0].rows[1].col5 + q1arry[0].rows[2].col5 + q1arry[0].rows[3].col5) || 0;

  let Q5Col5Total =
    isFinite((q4arry[0].rows[1].col6 + q4arry[0].rows[2].col6 + q4arry[0].rows[3].col6) / (q1arry[0].rows[1].col6 + q1arry[0].rows[2].col6 + q1arry[0].rows[3].col6)) &&
    (q4arry[0].rows[1].col6 + q4arry[0].rows[2].col6 + q4arry[0].rows[3].col6) / (q1arry[0].rows[1].col6 + q1arry[0].rows[2].col6 + q1arry[0].rows[3].col6) || 0;

  return (
    <div className="grid-with-totals">
      <Table bordered={true} fullWidth={true}>
        <thead>
          <tr>
            <th></th>
            <th>% of FPL 0-133</th>
            <th>% of FPL 134-200</th>
            <th>% of FPL 201-250</th>
            <th>% of FPL 251-300</th>
            <th>% of FPL 301-317</th>
            <th className="total-header-cell">Totals</th>
          </tr>
        </thead>
        <tr>
          <th>A. Fee-for-Service</th>
          <td>{isFinite(q4arry[0].rows[1].col2 / q1arry[0].rows[1].col2) && (q4arry[0].rows[1].col2 / q1arry[0].rows[1].col2).toFixed(1) || 0}</td>
          <td>{isFinite(q4arry[0].rows[1].col3 / q1arry[0].rows[1].col3) && (q4arry[0].rows[1].col3 / q1arry[0].rows[1].col3).toFixed(1) || 0}</td>
          <td>{isFinite(q4arry[0].rows[1].col4 / q1arry[0].rows[1].col4) && (q4arry[0].rows[1].col4 / q1arry[0].rows[1].col4).toFixed(1) || 0}</td>
          <td>{isFinite(q4arry[0].rows[1].col5 / q1arry[0].rows[1].col5) && (q4arry[0].rows[1].col5 / q1arry[0].rows[1].col5).toFixed(1) || 0}</td>
          <td>{isFinite(q4arry[0].rows[1].col6 / q1arry[0].rows[1].col6) && (q4arry[0].rows[1].col6 / q1arry[0].rows[1].col6).toFixed(1) || 0}</td>
          <td className="total-column">{firstRowQ5Total.toFixed(2)}</td>
        </tr>
        <tr>
          <th>B. Managed Care Arrangements	</th>
          <td>{isFinite(q4arry[0].rows[2].col2 / q1arry[0].rows[2].col2) && (q4arry[0].rows[2].col2 / q1arry[0].rows[2].col2).toFixed(1) || 0}</td>
          <td>{isFinite(q4arry[0].rows[2].col3 / q1arry[0].rows[2].col3) && (q4arry[0].rows[2].col3 / q1arry[0].rows[2].col3).toFixed(1) || 0}</td>
          <td>{isFinite(q4arry[0].rows[2].col4 / q1arry[0].rows[2].col4) && (q4arry[0].rows[2].col4 / q1arry[0].rows[2].col4).toFixed(1) || 0}</td>
          <td>{isFinite(q4arry[0].rows[2].col5 / q1arry[0].rows[2].col5) && (q4arry[0].rows[2].col5 / q1arry[0].rows[2].col5).toFixed(1) || 0}</td>
          <td>{isFinite(q4arry[0].rows[2].col6 / q1arry[0].rows[2].col6) && (q4arry[0].rows[2].col6 / q1arry[0].rows[2].col6).toFixed(1) || 0}</td>
          <td className="total-column">{secondRowQ5Total.toFixed(2)}</td>
        </tr>
        <tr>
          <th>C. Primary Care Case Management	</th>
          <td>{isFinite(q4arry[0].rows[3].col2 / q1arry[0].rows[3].col2) && (q4arry[0].rows[3].col2 / q1arry[0].rows[3].col2).toFixed(1) || 0}</td>
          <td>{isFinite(q4arry[0].rows[3].col3 / q1arry[0].rows[3].col3) && (q4arry[0].rows[3].col3 / q1arry[0].rows[3].col3).toFixed(1) || 0}</td>
          <td>{isFinite(q4arry[0].rows[3].col4 / q1arry[0].rows[3].col4) && (q4arry[0].rows[3].col4 / q1arry[0].rows[3].col4).toFixed(1) || 0}</td>
          <td>{isFinite(q4arry[0].rows[3].col5 / q1arry[0].rows[3].col5) && (q4arry[0].rows[3].col5 / q1arry[0].rows[3].col5).toFixed(1) || 0}</td>
          <td>{isFinite(q4arry[0].rows[3].col6 / q1arry[0].rows[3].col6) && (q4arry[0].rows[3].col6 / q1arry[0].rows[3].col6).toFixed(1) || 0}</td>
          <td className="total-column">{thirdRowQ5Total.toFixed(2)}</td>
        </tr>
        <tr className="total-row">
          <th className="total-header-cell">Totals:</th>
          <td className="total-column">{Q5Col1Total.toFixed(2)}</td>
          <td className="total-column">{Q5Col2Total.toFixed(2)}</td>
          <td className="total-column">{Q5Col3Total.toFixed(2)}</td>
          <td className="total-column">{Q5Col4Total.toFixed(2)}</td>
          <td className="total-column">{Q5Col5Total.toFixed(2)}</td>
          <td className="total-column">{fourthRowQ5Total.toFixed(2)}</td>
        </tr>
      </Table>
      <div className="disclaimer">
        {" "}
        Values will not appear until source data is provided
      </div>
    </div>
  );
};

SynthesizedGrid.propTypes = {
  entireForm: PropTypes.object.isRequired,
  questionID: PropTypes.string.isRequired,
  gridData: PropTypes.array.isRequired,
  range: PropTypes.string.isRequired
};

const mapState = state => ({
  entireForm: state.currentForm
});

export default connect(mapState)(SynthesizedGrid);
