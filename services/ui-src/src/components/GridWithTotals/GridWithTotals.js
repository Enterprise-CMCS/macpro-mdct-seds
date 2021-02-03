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
  }, []);

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

          columnIndex = columnIndex - 1;

          if (isNaN(column) === false) {
            currentValue = parseFloat(column);
          }

          if (
            gridColumnTotalsCopy[columnIndex] === undefined ||
            gridColumnTotalsCopy[columnIndex] === null ||
            gridColumnTotalsCopy[columnIndex] === ""
          ) {
            gridColumnTotalsCopy[columnIndex] = 0;
          }

          gridColumnTotalsCopy[columnIndex] += currentValue;
          totalOfTotals += currentValue;
        });
      }
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
        });
        gridRowTotalsCopy[rowIndex] = rowTotal;
      }
    });

    updateGridRowTotals(gridRowTotalsCopy);
  };

  let headerColArray = [];
  let headerCellArray = [];
  let colCounter = 1;
  let rowCounter = 1;

  for (const column in props.gridData[0]) {
    headerColArray.push(props.gridData[0][column]);

    colCounter++;
  }

  for (const row in props.gridData) {
    for (const column in props.gridData[row]) {
      headerCellArray.push(props.gridData[row][column]);
      rowCounter++;
      break;
    }
  }

  const headerCols = headerColArray.map(header => (
    <th scope="col">{header}</th>
  ));

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
      <Table
        bordered={true}
        caption="This is an example of a table with totals"
        fullWidth={true}
      >
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
