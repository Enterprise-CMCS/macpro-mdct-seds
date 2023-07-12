import React, { useState } from "react";

import { loadData } from "../../libs/api";

import { Alert, TextInput } from "@trussworks/react-uswds";

import { FormGroup, FileInput, Table, Button } from "@trussworks/react-uswds";

import "./LoadData.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";

const LoadData = () => {
  const [fileToUpload, setFileToUpload] = useState(null);
  const [targetTable, setTargetTable] = useState("");
  const [displayMessage, setDisplayMessage] = useState(false);

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
          headingLevel="h1"
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
                  <TextInput
                    id="txtTargetTable"
                    name="txtTargetTable"
                    onChange={event => setTargetTable(event.target.value)}
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
