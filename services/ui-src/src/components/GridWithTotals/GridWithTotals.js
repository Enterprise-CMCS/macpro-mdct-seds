import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { TextInput, Table } from "@trussworks/react-uswds";
import { connect } from "react-redux";
import "./GridWithTotals.scss";
import { gotAnswer } from "../../store/reducers/singleForm/singleForm";

const GridWithTotals = props => {
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
    props.setAnswer(gridCopy, props.questionID);
  };

  const updateTotals = () => {
    updateRowTotals();
    updateColumnTotals();
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
          totalOfTotals += currentValue;

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

          rowTotal += currentValue;

          return true;
        });
        gridRowTotalsCopy[rowIndex] = rowTotal;
      }

      return true;
    });

    updateGridRowTotals(gridRowTotalsCopy);
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

  const addCommas = val => {
    if (isNaN(val) === true) {
      return "";
    } 
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

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
                      <TextInput
                        className="grid-column"
                        onChange={event =>
                          updateGrid(rowIndex, columnIndex, event)
                        }
                        defaultValue={parseFloat(column).toFixed(
                          currentPrecision
                        )}
                        value={addCommas(parseFloat(
                          gridData[rowIndex][columnIndex]
                        ).toFixed(currentPrecision))}
                        disabled={props.disabled}
                      />
                    ) : (
                      <span className="usa-input rid-column synthesized">
                        {gridData[rowIndex][columnIndex] >= 0
                          ? addCommas(parseFloat(gridData[rowIndex][columnIndex]).toFixed(
                              currentPrecision
                            ))
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
                    <TextInput
                      className="grid-column"
                      onChange={event =>
                        updateGrid(rowIndex, columnIndex, event)
                      }
                      defaultValue={parseFloat(column).toFixed(
                        currentPrecision
                      )}
                      value={addCommas(parseFloat(
                        gridData[rowIndex][columnIndex]
                      ).toFixed(currentPrecision))}
                      disabled={props.disabled}
                    />
                  ) : (
                    <span className="usa-input grid-column synthesized ">
                      {column >= 0
                        ? addCommas(parseFloat(column).toFixed(currentPrecision))
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
              ? addCommas(parseFloat(gridRowTotals[rowIndex]).toFixed(currentPrecision))
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
        <td className="total-column">
          {gridColumnTotals[i] > 0
            ? addCommas(parseFloat(gridColumnTotals[i]).toFixed(currentPrecision))
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
                ? addCommas (parseFloat(gridTotalOfTotals).toFixed(currentPrecision))
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
  setAnswer: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  synthesized: PropTypes.bool.isRequired
};

const mapDispatch = {
  setAnswer: gotAnswer ?? {}
};

export default connect(null, mapDispatch)(GridWithTotals);
