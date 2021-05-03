import React, { useEffect, useState } from "react";

import { loadData, getTableNames } from "../../libs/api";

import { Alert, ComboBox, Dropdown } from "@trussworks/react-uswds";

import { FormGroup, FileInput, Table, Button } from "@trussworks/react-uswds";

import "./LoadData.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";

const LoadData = () => {
  const [fileToUpload, setFileToUpload] = useState(null);
  const [targetTable, setTargetTable] = useState("");
  const [tableNames, setTableNames] = useState([]);
  const [displayMessage, setDisplayMessage] = useState(false);

  const loadTableNames = async () => {
    const tableNames = await getTableNames();
    setTableNames(tableNames);
  };

  const handleAutocomplete = event => {
    setTargetTable(event);
  };

  useEffect(() => {
    async function fetchData() {
      await loadTableNames();
    }
    fetchData().then();
  }, []);

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append("targetTable", targetTable);
    formData.append("fileToUpload", fileToUpload, fileToUpload.name);

    const result = await loadData(formData);

    console.log(result);

    displayConfirmation();
    return true;
  };

  const displayConfirmation = () => {
    const second = 1000;

    setDisplayMessage(true);

    setTimeout(() => {
      setDisplayMessage(false);
    }, 3 * second);
  };

  return (
    <div
      className="load-data-wrapper react-transition fade-in"
      data-testid="LoadData"
    >
      <h1 className="page-header">Load Data</h1>

      {displayMessage === true ? (
        <Alert
          type="success"
          heading="Upload success:"
          className="react-transition flip-in-x"
        >
          Data for {targetTable} has been successfully saved.
        </Alert>
      ) : null}

      <FormGroup>
        <div className="center-content margin-top-5">
          <Table>
            <tbody>
              <tr>
                <th>Select Data File:</th>
                <td>
                  <FileInput
                    id="fileDataFile"
                    name="fileDataFile"
                    onChange={event => setFileToUpload(event.target.files[0])}
                  />
                </td>
              </tr>
              <tr>
                <th>Select Target Table:</th>
                <td>
                  <ComboBox
                    id="txtTargetTable"
                    name="txtTargetTable"
                    options={tableNames}
                    onChange={event => handleAutocomplete(event)}
                  />
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </FormGroup>

      <div className="action-buttons center-content margin-bottom-3">
        <Button
          type="button"
          className="createUser form-button"
          onClick={() => uploadFile()}
        >
          Upload File
          <FontAwesomeIcon icon={faCloudUploadAlt} className="margin-left-2" />
        </Button>
      </div>
    </div>
  );
};

LoadData.propTypes = {};

export default LoadData;
