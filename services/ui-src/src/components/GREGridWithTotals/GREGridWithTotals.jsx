import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { TextField, Table } from "@cmsgov/design-system";
import { addCommas } from "../../utility-functions/transformFunctions";
import { useStore } from "../../store/store";
import "./GREGridWithTotals.scss";

/*This component is specifically designed to for the Gender/Race/Ethnicity form as of 2021.
 * It is based off of the GridWithTotals component.
 * The expectation is that the rows array will follow this pattern:
 * [0] Row Header, [1] 21E, [2] 64.21E, [3] Total CHIP ([1] + [2]), [4] 64.EC, [5] 21PW
 * The Totals column will then be a sum of [1] + [2] + [4] + [5]*/

const GREGridWithTotals = (props) => {
  const setAnswer = useStore((state) => state.updateAnswer);
  function compare(a, b) {
    const first = a.col1 !== "" ? parseInt(a.col1.split(".")[0]) : null;
    const second = b.col1 !== "" ? parseInt(b.col1.split(".")[0]) : null;

    if (first === second) {
      return 0;
    }
    // nulls sort after anything else
    /* eslint-disable valid-typeof */
    else if (typeof first == null) {
      return 1;
      /* eslint-disable valid-typeof */
    } else if (typeof second == null) {
      return -1;
    }

    return first < second ? -1 : 1;
  }

  // Sort by label
  const sortedGridData = props.gridData.sort(compare);

  const [gridData, updateGridData] = useState(
    translateInitialData(sortedGridData)
  );

  const [gridColumnTotals, updateGridColumnTotals] = useState([]);
  const [gridRowTotals, updateGridRowTotals] = useState([]);

  const [gridCHIPTotals, updateGridCHIPTotals] = useState([]);
  const [gridTotalOfTotals, updateGridTotalOfTotals] = useState();

  const currentPrecision = props.precision;

  useEffect(() => {
    updateTotals();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateGrid = (row, column, event) => {
    let gridCopy = [...gridData];

    gridCopy[row][column] = parseFloat(
      event.target.value.replace(/[^0-9]/g, "")
    );

    updateGridData(gridCopy);
    updateTotals();

    //Set the Total CHIP Enrolled value
    gridCopy[row][4] = gridCHIPTotals[row];
    updateGridData(gridCopy);

    setAnswer(gridCopy, props.questionID);
  };

  const updateTotals = () => {
    updateRowTotals();
    updateColumnTotals();
    updateCHIPTotals();
  };

  const updateColumnTotals = () => {
    let gridColumnTotalsCopy = [...gridColumnTotals];
    let totalOfTotals = 0;

    gridColumnTotalsCopy.forEach((part, index, columnTotalsArray) => {
      columnTotalsArray[index] = 0;
    });

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

          gridColumnTotalsCopy[gridColumnIndex] += currentValue;

          //Do not add the Total CHIP Enrolled column (4) to the Total of Totals value (last column, last cell)
          if (columnIndex !== 4) {
            totalOfTotals += currentValue;
          }

          return true;
        });
      }
      return true;
    });

    updateGridColumnTotals(gridColumnTotalsCopy);
    updateGridTotalOfTotals(totalOfTotals);
  };

  const updateRowTotals = () => {
    let rowTotal = 0;
    let gridRowTotalsCopy = [...gridRowTotals];

    gridData.map((row, rowIndex) => {
      rowTotal = 0;
      if (row !== undefined) {
        row.map((column, columnIndex) => {
          let currentValue = 0;

          if (isNaN(column) === false) {
            currentValue = parseFloat(column);
          }

          //Do not add the Total CHIP Enrolled column (4) to the row Totals value (last column of row)
          if (columnIndex !== 4) {
            rowTotal += currentValue;
          }

          return true;
        });
        gridRowTotalsCopy[rowIndex] = rowTotal;
      }

      return true;
    });

    updateGridRowTotals(gridRowTotalsCopy);
  };

  const updateCHIPTotals = () => {
    let gridCHIPTotalsCopy = [...gridCHIPTotals];
    let totalCHIP = 0;

    gridData.map((row, rowIndex) => {
      totalCHIP = 0;
      if (row !== undefined) {
        row.map((column, columnIndex) => {
          let currentValue = 0;

          if (isNaN(column) === false) {
            currentValue = parseFloat(column);
          }

          if (
            gridCHIPTotalsCopy[columnIndex] === undefined ||
            gridCHIPTotalsCopy[columnIndex] === null ||
            gridCHIPTotalsCopy[columnIndex] === ""
          ) {
            gridCHIPTotalsCopy[columnIndex] = 0;
          }

          //If we are in Columns 2 (21E) or 3 (64.21E), sum the values to send to Column 4 (Total CHIP Enrolled)
          if (columnIndex === 2 || columnIndex === 3) {
            totalCHIP += currentValue;
          }

          return true;
        });
        gridCHIPTotalsCopy[rowIndex] = totalCHIP;
      }

      return true;
    });

    updateGridCHIPTotals(gridCHIPTotalsCopy);
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
    if (headerIndex !== 3) {
      return (
        <th scope="col" key={headerIndex}>
          <span>{header}</span>
        </th>
      );
    } else {
      return (
        <th scope="col" className="total-header-cell" key={headerIndex}>
          <span>{header}</span>
        </th>
      );
    }
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
                    <TextField
                      className="grid-column"
                      onChange={(event) =>
                        updateGrid(rowIndex, columnIndex, event)
                      }
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
                  </td>
                </React.Fragment>
              );
            } else if (columnIndex === 4) {
              // This is the Total CHIP Enrolled column
              formattedCell = (
                <td key={columnIndex} className="total-column">
                  {addCommas(
                    parseFloat(gridCHIPTotals[rowIndex]).toFixed(
                      currentPrecision
                    )
                  )}
                </td>
              );
            } else {
              formattedCell = (
                <td key={columnIndex}>
                  <TextField
                    className="grid-column"
                    onChange={(event) =>
                      updateGrid(rowIndex, columnIndex, event)
                    }
                    defaultValue={parseFloat(column).toFixed(currentPrecision)}
                    value={addCommas(
                      parseFloat(gridData[rowIndex][columnIndex]).toFixed(
                        currentPrecision
                      )
                    )}
                    disabled={props.disabled}
                  />
                </td>
              );
            }

            return formattedCell;
          })}
          <td className="total-column">
            {addCommas(
              parseFloat(gridRowTotals[rowIndex]).toFixed(currentPrecision)
            )}
          </td>
        </tr>
      );
    }

    return true;
  });

  const totalsRow = Array.from(Array(headerCols.length - 1), (_, i) => {
    let column;

    if (i === 0) {
      column = (
        <th scope="row" className="total-header-cell" key={i}>
          Totals:
        </th>
      );
    } else if (i === 3) {
      column = (
        <td className="total-column" key={i}>
          {addCommas(
            parseFloat(
              gridCHIPTotals.reduce(function (s, v) {
                return s + (v || 0);
              }, 0)
            ).toFixed(currentPrecision)
          )}
        </td>
      );
    } else {
      column = (
        <td className="total-column" key={i}>
          {addCommas(parseFloat(gridColumnTotals[i]).toFixed(currentPrecision))}
        </td>
      );
    }

    return column;
  });

  return (
    <div className="gre-grid-with-totals" id={`"${props.questionID}"`}>
      <Table bordered={true} fullWidth={true}>
        <thead>
          <tr>{headerCols}</tr>
        </thead>
        <tbody>
          {tableData}
          <tr className="total-row">
            {totalsRow}
            <td className="total-column">
              {addCommas(
                parseFloat(gridTotalOfTotals).toFixed(currentPrecision)
              )}
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

const translateInitialData = (gridDataObject) => {
  let rowCounter = 1;
  let colCounter = 1;
  let translatedData = [];

  gridDataObject.forEach((row) => {
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

GREGridWithTotals.propTypes = {
  gridData: PropTypes.array.isRequired,
  questionID: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default GREGridWithTotals;
