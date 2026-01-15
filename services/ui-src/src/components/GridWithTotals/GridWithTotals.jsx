import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { TextField, Table } from "@cmsgov/design-system";
import { addCommas } from "../../utility-functions/transformFunctions";
import { useStore } from "../../store/store";
import "./GridWithTotals.scss";

const GridWithTotals = props => {
  const setAnswer = useStore(state => state.updateAnswer);
  const [gridData, updateGridData] = useState(
    translateInitialData(props.gridData)
  );

  const [gridColumnTotals, updateGridColumnTotals] = useState([]);
  const [gridRowTotals, updateGridRowTotals] = useState([]);

  const [gridTotalOfTotals, updateGridTotalOfTotals] = useState();

  const currentPrecision = props.precision;

  const synthesized = props.synthesized;

  useEffect(() => {
    updateGridData(translateInitialData(props.gridData));
    updateTotals();
  }, [props.gridData]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateLocalStateOnChange = (row, column, event) => {
    let gridCopy = [...gridData];
    gridCopy[row][column] = parseFloat(
      event.target.value.replace(/[^0-9]/g, "")
    );
    updateGridData(gridCopy);
    updateTotals();
  };

  const updateGridOnBlur = () => {
    setAnswer(gridData, props.questionID);
  };

  const updateTotals = () => {
    updateRowTotals();
    updateColumnTotals();
  };

  const sumValues = obj => Object.values(obj).reduce((a, b) => a + b);

  const updateColumnTotals = () => {
    let gridColumnTotalsCopy = [...gridColumnTotals];
    let totalOfTotals = 0;

    gridColumnTotalsCopy.forEach((part, index, columnTotalsArray) => {
      columnTotalsArray[index] = 0;
    });
    let checkQuestion5Summary = props.questionID;
    if (
      checkQuestion5Summary &&
      checkQuestion5Summary.includes("summary-synthesized")
    ) {
      let sum5Data = translateInitialData(props.gridData);
      sum5Data.map((row, rowIndex) => {
        if (row !== undefined && props.questions) {
          let q1c1Total =
            props.questions[0].rows[1].col2 +
            props.questions[0].rows[2].col2 +
            props.questions[0].rows[3].col2;

          let q4c1Total =
            props.questions[3].rows[1].col2 +
            props.questions[3].rows[2].col2 +
            props.questions[3].rows[3].col2;
          ////////////////////////////

          let q1c2Total =
            props.questions[0].rows[1].col3 +
            props.questions[0].rows[2].col3 +
            props.questions[0].rows[3].col3;

          let q4c2Total =
            props.questions[3].rows[1].col3 +
            props.questions[3].rows[2].col3 +
            props.questions[3].rows[3].col3;

          /////////////////////////////

          let q1c3Total =
            props.questions[0].rows[1].col4 +
            props.questions[0].rows[2].col4 +
            props.questions[0].rows[3].col4;

          let q4c3Total =
            props.questions[3].rows[1].col4 +
            props.questions[3].rows[2].col4 +
            props.questions[3].rows[3].col4;

          /////////////////////////////

          let q1c4Total =
            props.questions[0].rows[1].col5 +
            props.questions[0].rows[2].col5 +
            props.questions[0].rows[3].col5;

          let q4c4Total =
            props.questions[3].rows[1].col5 +
            props.questions[3].rows[2].col5 +
            props.questions[3].rows[3].col5;
          /////////////////////////////

          let q1c5Total =
            props.questions[0].rows[1].col6 +
            props.questions[0].rows[2].col6 +
            props.questions[0].rows[3].col6;

          let q4c5Total =
            props.questions[3].rows[1].col6 +
            props.questions[3].rows[2].col6 +
            props.questions[3].rows[3].col6;

          gridColumnTotalsCopy[1] = q4c1Total / q1c1Total;
          gridColumnTotalsCopy[2] = q4c2Total / q1c2Total;
          gridColumnTotalsCopy[3] = q4c3Total / q1c3Total;
          gridColumnTotalsCopy[4] = q4c4Total / q1c4Total;
          gridColumnTotalsCopy[5] = q4c5Total / q1c5Total;

          updateGridColumnTotals(gridColumnTotalsCopy);
        }
        return true;
      });
    } else {
      gridData.map((row, rowIndex) => {
        if (row !== undefined) {
          row.map((column, columnIndex) => {
            let currentValue = 0;

            const gridColumnIndex = columnIndex - 1;

            if (isNaN(column) === false) {
              currentValue = parseFloat(column);
            }

            if (
              gridColumnTotalsCopy[gridColumnIndex] === undefined ||
              gridColumnTotalsCopy[gridColumnIndex] === null ||
              gridColumnTotalsCopy[gridColumnIndex] === ""
            ) {
              gridColumnTotalsCopy[gridColumnIndex] = 0;
            }

            // If average totals exist use them
            if (props.totals) {
              gridColumnTotalsCopy[gridColumnIndex] =
                props.totals[gridColumnIndex];
              // totalOfTotals += props.totals[gridColumnIndex];
            } else {
              gridColumnTotalsCopy[gridColumnIndex] += currentValue;
              // totalOfTotals += currentValue;
            }
            totalOfTotals += currentValue;

            if (synthesized && props.rowTotals) {
              let sum = sumValues(props.rowTotals);
              let avg = sum / props.rowTotals.length;
              totalOfTotals = avg;
            }
            return true;
          });
        }
        return true;
      });

      updateGridColumnTotals(gridColumnTotalsCopy);
      updateGridTotalOfTotals(totalOfTotals);
    }
  };

  const updateRowTotals = () => {
    let rowTotal = 0;
    let totalOfTotals = 0;
    let gridRowTotalsCopy = [...gridRowTotals];
    let checkQuestion5Summary = props.questionID;
    if (
      checkQuestion5Summary &&
      checkQuestion5Summary.includes("summary-synthesized")
    ) {
      let sum5Data = translateInitialData(props.gridData);

      sum5Data.map((row, rowIndex) => {
        if (row !== undefined && props.questions) {
          let q1r1 = props.questions[0].rows[1];
          let q4r1 = props.questions[3].rows[1];

          let q1r2 = props.questions[0].rows[2];
          let q4r2 = props.questions[3].rows[2];

          let q1r3 = props.questions[0].rows[3];
          let q4r3 = props.questions[3].rows[3];

          q1r1.col1 = 0;
          q4r1.col1 = 0;

          q1r2.col1 = 0;
          q4r2.col1 = 0;

          q1r3.col1 = 0;
          q4r3.col1 = 0;

          let q1r1Total = Object.values(q1r1).reduce((a, b) => a + b, 0);
          let q4r1Total = Object.values(q4r1).reduce((a, b) => a + b, 0);

          let q1r2Total = Object.values(q1r2).reduce((a, b) => a + b, 0);
          let q4r2Total = Object.values(q4r2).reduce((a, b) => a + b, 0);

          let q1r3Total = Object.values(q1r3).reduce((a, b) => a + b, 0);
          let q4r3Total = Object.values(q4r3).reduce((a, b) => a + b, 0);

          gridRowTotalsCopy[2] = q4r1Total / q1r1Total;
          gridRowTotalsCopy[3] = q4r2Total / q1r2Total;
          gridRowTotalsCopy[4] = q4r3Total / q1r3Total;

          totalOfTotals =
            (q4r1Total + q4r2Total + q4r3Total) /
            (q1r1Total + q1r2Total + q1r3Total);
        }
        return true;
      });
      updateGridTotalOfTotals(totalOfTotals);
      updateGridRowTotals(gridRowTotalsCopy);
    } else {
      gridData.map((row, rowIndex) => {
        rowTotal = 0;
        if (row !== undefined) {
          row.map((column, columnIndex) => {
            let currentValue = 0;

            if (isNaN(column) === false) {
              currentValue = parseFloat(column);
            }
            rowTotal += currentValue;
            return true;
          });
          gridRowTotalsCopy[rowIndex] = rowTotal;
          if (synthesized && props.rowTotals) {
            let newIndex = rowIndex - 2;
            gridRowTotalsCopy[rowIndex] = props.rowTotals[newIndex];
          }
        }

        return true;
      });

      updateGridRowTotals(gridRowTotalsCopy);
    }
  };

  let headerColArray = [];
  let headerCellArray = [];

  for (const column in props.gridData[0]) {
    headerColArray.push(props.gridData[0][column]);
  }

  for (const row in props.gridData) {
    for (const column in props.gridData[row]) {
      headerCellArray.push(props.gridData[row][column]);
      break;
    }
  }

  let nextHeaderIndex;
  const headerCols = headerColArray.map((header, headerIndex) => {
    nextHeaderIndex = headerIndex;
    return (
      <th scope="col" key={headerIndex}>
        <span>{header}</span>
      </th>
    );
  });

  headerCols.push(
    <th scope="col" className="total-header-cell" key={nextHeaderIndex + 1}>
      Totals
    </th>
  );

  const tableData = gridData.map((row, rowIndex) => {
    if (row !== undefined) {
      return (
        <tr key={rowIndex}>
          {row.map((column, columnIndex) => {
            let formattedCell;

            if (columnIndex === 2) {
              formattedCell = (
                <React.Fragment key={columnIndex}>
                  <th scope="row">{headerCellArray[rowIndex - 1]}</th>
                  <td>
                    {!synthesized ? (
                      <TextField
                        style={{ width: "100%", padding: 0 }}
                        className="grid-column"
                        onChange={event =>
                          updateLocalStateOnChange(rowIndex, columnIndex, event)
                        }
                        onBlur={updateGridOnBlur}
                        defaultValue={parseFloat(column).toFixed(
                          currentPrecision
                        )}
                        value={addCommas(
                          parseFloat(gridData[rowIndex][columnIndex]).toFixed(
                            currentPrecision
                          )
                        )}
                        disabled={props.disabled}
                      />
                    ) : (
                      <span className="usa-input rid-column synthesized">
                        {gridData[rowIndex][columnIndex] >= 0
                          ? addCommas(
                              parseFloat(
                                gridData[rowIndex][columnIndex]
                              ).toFixed(currentPrecision)
                            )
                          : ""}
                      </span>
                    )}
                  </td>
                </React.Fragment>
              );
            } else {
              formattedCell = (
                <td key={columnIndex}>
                  {!synthesized ? (
                    <TextField
                      style={{ width: "100%", padding: 0 }}
                      className="grid-column"
                      onChange={event =>
                        updateLocalStateOnChange(rowIndex, columnIndex, event)
                      }
                      onBlur={updateGridOnBlur}
                      defaultValue={parseFloat(column).toFixed(
                        currentPrecision
                      )}
                      value={addCommas(
                        parseFloat(gridData[rowIndex][columnIndex]).toFixed(
                          currentPrecision
                        )
                      )}
                      disabled={props.disabled}
                    />
                  ) : (
                    <span className="usa-input grid-column synthesized ">
                      {column >= 0
                        ? addCommas(
                            parseFloat(column).toFixed(currentPrecision)
                          )
                        : ""}
                    </span>
                  )}
                </td>
              );
            }

            return formattedCell;
          })}
          <td className="total-column">
            {gridRowTotals[rowIndex] > 0
              ? addCommas(
                  parseFloat(gridRowTotals[rowIndex]).toFixed(currentPrecision)
                )
              : 0}
          </td>
        </tr>
      );
    }

    return true;
  });

  const totalsRow = Array.from(Array(headerCols.length - 1), (e, i) => {
    let column;

    if (i === 0) {
      column = (
        <th scope="row" className="total-header-cell" key={i}>
          Totals:
        </th>
      );
    } else {
      column = (
        <td key={`tc-${i}`} className="total-column">
          {gridColumnTotals[i] > 0
            ? addCommas(
                parseFloat(gridColumnTotals[i]).toFixed(currentPrecision)
              )
            : 0}
        </td>
      );
    }

    return column;
  });

  return (
    <div className="grid-with-totals" id={`"${props.questionID}"`}>
      <Table bordered={true} fullWidth={true}>
        <thead>
          <tr>{headerCols}</tr>
        </thead>
        <tbody>
          {tableData}
          <tr className="total-row">
            {totalsRow}
            <td className="total-column">
              {gridTotalOfTotals > 0
                ? addCommas(
                    parseFloat(gridTotalOfTotals).toFixed(currentPrecision)
                  )
                : 0}
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

const translateInitialData = gridDataObject => {
  let rowCounter = 1;
  let colCounter = 1;
  let translatedData = [];

  gridDataObject.forEach(row => {
    // *** skip the first row (headers)
    if (rowCounter > 1) {
      colCounter = 1;
      translatedData[rowCounter] = [];

      // *** traverse each column
      for (const i in row) {
        // *** skip the first column (headers)
        if (colCounter > 1) {
          translatedData[rowCounter][colCounter] = parseFloat(row[i]);
        }
        colCounter++;
      }
    }
    rowCounter++;
  });

  return translatedData;
};

GridWithTotals.propTypes = {
  gridData: PropTypes.array.isRequired,
  questionID: PropTypes.string.isRequired,
  updateSynthesizedValues: PropTypes.func,
  disabled: PropTypes.bool,
  synthesized: PropTypes.bool,
  precision: PropTypes.number
};

export default GridWithTotals;
