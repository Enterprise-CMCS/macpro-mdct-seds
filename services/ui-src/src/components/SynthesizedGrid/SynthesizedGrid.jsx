import React from "react";
import PropTypes from "prop-types";
import { Table } from "@cmsgov/design-system";
import { useStore } from "../../store/store";

export const SynthesizedGrid = ({ range }) => {
  const answers = useStore((state) => state.answers);
  let answer_arr = [];
  // Retrieve the answers specific to the current tab
  let tabAnswers = answers.filter((element) => element.rangeId === range);
  // Retrieve question 4 answer data for the current tab
  let q4arry = tabAnswers.filter((e) => e.question.includes("-04"));
  q4arry.map((e) => {
    answer_arr.push(e.rows);
    return true;
  });

  let q1arry = tabAnswers.filter((e) => e.question.includes("-01"));
  q1arry.map((e) => {
    answer_arr.push(e.rows);
    return true;
  });

  let numOr0 = (n) => (isNaN(n) ? 0 : Number(n));

  let firstRowQ4Total = Object.values(q4arry[0].rows[1]).reduce(
    (a, b) => numOr0(a) + numOr0(b)
  );
  let firstRowQ1Total = Object.values(q1arry[0].rows[1]).reduce(
    (a, b) => numOr0(a) + numOr0(b)
  );
  let firstRowQ5Total =
    (isFinite(firstRowQ4Total / firstRowQ1Total) &&
      firstRowQ4Total / firstRowQ1Total) ||
    0;

  let secondRowQ4Total = Object.values(q4arry[0].rows[2]).reduce(
    (a, b) => numOr0(a) + numOr0(b)
  );
  let secondRowQ1Total = Object.values(q1arry[0].rows[2]).reduce(
    (a, b) => numOr0(a) + numOr0(b)
  );
  let secondRowQ5Total =
    (isFinite(secondRowQ4Total / secondRowQ1Total) &&
      secondRowQ4Total / secondRowQ1Total) ||
    0;

  let thirdRowQ4Total = Object.values(q4arry[0].rows[3]).reduce(
    (a, b) => numOr0(a) + numOr0(b)
  );
  let thirdRowQ1Total = Object.values(q1arry[0].rows[3]).reduce(
    (a, b) => numOr0(a) + numOr0(b)
  );
  let thirdRowQ5Total =
    (isFinite(thirdRowQ4Total / thirdRowQ1Total) &&
      thirdRowQ4Total / thirdRowQ1Total) ||
    0;
  let fourthRowQ5Total =
    (isFinite(
      (firstRowQ4Total + secondRowQ4Total + thirdRowQ4Total) /
        (firstRowQ1Total + secondRowQ1Total + thirdRowQ1Total)
    ) &&
      (firstRowQ4Total + secondRowQ4Total + thirdRowQ4Total) /
        (firstRowQ1Total + secondRowQ1Total + thirdRowQ1Total)) ||
    0;

  const getCellAverage = (rowNumber, columnNumber) => {
    const total =
      q4arry[0].rows[rowNumber][columnNumber] /
      q1arry[0].rows[rowNumber][columnNumber];
    return isFinite(total) ? total.toFixed(1) : 0;
  };

  const columnTotal = (questionArray, columnNumber) => {
    let total = 0;
    for (let i = 1; i < 4; i++) {
      total += Number(questionArray.rows[i][columnNumber]);
    }
    return total;
  };

  const getColumnTotalAverage = (column) => {
    const total =
      columnTotal(q4arry[0], column) / columnTotal(q1arry[0], column);
    return isFinite(total) ? total : 0;
  };

  let Q5Col1Total = getColumnTotalAverage("col2");
  let Q5Col2Total = getColumnTotalAverage("col3");
  let Q5Col3Total = getColumnTotalAverage("col4");
  let Q5Col4Total = getColumnTotalAverage("col5");
  let Q5Col5Total = getColumnTotalAverage("col6");

  return (
    <div className="flex-col-gap-1">
      <Table>
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
        <tbody>
          <tr>
            <th>A. Fee-for-Service</th>
            <td>{getCellAverage(1, "col2")}</td>
            <td>{getCellAverage(1, "col3")}</td>
            <td>{getCellAverage(1, "col4")}</td>
            <td>{getCellAverage(1, "col5")}</td>
            <td>{getCellAverage(1, "col6")}</td>
            <td className="total-column">{firstRowQ5Total.toFixed(1)}</td>
          </tr>
          <tr>
            <th>B. Managed Care Arrangements </th>
            <td>{getCellAverage(2, "col2")}</td>
            <td>{getCellAverage(2, "col3")}</td>
            <td>{getCellAverage(2, "col4")}</td>
            <td>{getCellAverage(2, "col5")}</td>
            <td>{getCellAverage(2, "col6")}</td>
            <td className="total-column">{secondRowQ5Total.toFixed(1)}</td>
          </tr>
          <tr>
            <th>C. Primary Care Case Management </th>
            <td>{getCellAverage(3, "col2")}</td>
            <td>{getCellAverage(3, "col3")}</td>
            <td>{getCellAverage(3, "col4")}</td>
            <td>{getCellAverage(3, "col5")}</td>
            <td>{getCellAverage(3, "col6")}</td>
            <td className="total-column">{thirdRowQ5Total.toFixed(1)}</td>
          </tr>
          <tr className="total-row">
            <th className="total-header-cell">Totals:</th>
            <td className="total-column">{Q5Col1Total.toFixed(1)}</td>
            <td className="total-column">{Q5Col2Total.toFixed(1)}</td>
            <td className="total-column">{Q5Col3Total.toFixed(1)}</td>
            <td className="total-column">{Q5Col4Total.toFixed(1)}</td>
            <td className="total-column">{Q5Col5Total.toFixed(1)}</td>
            <td className="total-column">{fourthRowQ5Total.toFixed(1)}</td>
          </tr>
        </tbody>
      </Table>
      <div className="disclaimer">
        Values will not appear until source data is provided
      </div>
    </div>
  );
};

SynthesizedGrid.propTypes = {
  range: PropTypes.string.isRequired,
};

export default SynthesizedGrid;
