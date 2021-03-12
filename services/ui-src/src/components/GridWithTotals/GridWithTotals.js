import React, { useEffect, useState } from "react";
import { TextInput, Table } from "@trussworks/react-uswds";
import "./GridWithTotals.scss";

const GridWithTotals = props => {
  const [gridData, updateGridData] = useState(
    translateInitialData(props.gridData)
  );

  const [gridColumnTotals, updateGridColumnTotals] = useState([]);
  const [gridRowTotals, updateGridRowTotals] = useState([]);

  const [gridTotalOfTotals, updateGridTotalOfTotals] = useState();

  useEffect(() => {
    updateTotals();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateGrid = (row, column, event) => {
    let gridCopy = [...gridData];
    gridCopy[row][column] = parseFloat(event.target.value);

    updateGridData(gridCopy);
    updateTotals();
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

  const headerCols = headerColArray.map(header => {
    return <th scope="col">{header}</th>;
  });

  headerCols.push(
    <th scope="col" className="total-header-cell">
      Totals
    </th>
  );

  const tableData = gridData.map((row, rowIndex) => {
    if (row !== undefined) {
      return (
        <tr>
          {row.map((column, columnIndex) => {
            let formattedCell;

            if (columnIndex === 2) {
              formattedCell = (
                <React.Fragment>
                  <th scope="row">{headerCellArray[rowIndex - 1]}</th>
                  <td>
                    <TextInput
                      type="number"
                      className="grid-column"
                      onChange={event =>
                        updateGrid(rowIndex, columnIndex, event)
                      }
                      defaultValue={column}
                      disabled={props.disabled}
                    />
                  </td>
                </React.Fragment>
              );
            } else {
              formattedCell = (
                <td>
                  <TextInput
                    type="number"
                    className="grid-column"
                    onChange={event => updateGrid(rowIndex, columnIndex, event)}
                    defaultValue={column}
                    disabled={props.disabled}
                  />
                </td>
              );
            }

            return formattedCell;
          })}
          <td className="total-column">{gridRowTotals[rowIndex]}</td>
        </tr>
      );
    }

    return true;
  });

  const totalsRow = Array.from(Array(headerCols.length - 1), (e, i) => {
    let column;

    if (i === 0) {
      column = (
        <th scope="row" className="total-header-cell">
          Totals:
        </th>
      );
    } else {
      column = <td className="total-column">{gridColumnTotals[i]}</td>;
    }

    return column;
  });

  return (
    <div className="grid-with-totals">
      <Table bordered={true} fullWidth={true}>
        <thead>
          <tr>{headerCols}</tr>
        </thead>
        <tbody>
          {tableData}
          <tr>
            {totalsRow}
            <td className="total-column">{gridTotalOfTotals}</td>
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

export default GridWithTotals;
