import React from "react";

import {
  FormGroup,
  FileInput,
  Table,
  Button,
  TextInput
} from "@trussworks/react-uswds";

import "./LoadData.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";

const LoadData = () => {
  const uploadFile = () => {};

  return (
    <div
      className="load-data-wrapper react-transition fade-in"
      data-testid="LoadData"
    >
      <h1 className="page-header">Load Data</h1>

      <FormGroup>
        <div className="center-content margin-top-5">
          <Table>
            <tbody>
              <tr>
                <th>Select Data File:</th>
                <td>
                  <FileInput id="fileDataFile" name="fileDataFile" />
                </td>
              </tr>
              <tr>
                <th>Select Target Table:</th>
                <td>
                  <TextInput
                    id="txtTargetTable"
                    name="txtTargetTable"
                    type="email"
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
