import React, { useEffect, useState } from "react";
import {
  obtainFormTemplate,
  obtainFormTemplateYears,
  updateCreateFormTemplate
} from "../../libs/api";
import Dropdown from "react-dropdown";
import { Alert, Button, Textarea, TextInput } from "@trussworks/react-uswds";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";

const FormTemplates = () => {
  const [formYears, setFormYears] = useState();
  const [selectedYear, setSelectedYear] = useState();
  const [inputYear, setInputYear] = useState();
  const [currentTemplate, setCurrentTemplate] = useState(false);
  const [showYearInput, setShowYearInput] = useState(false);
  const [alert, setAlert] = useState(false);

  let nextYear = new Date(
    new Date().setFullYear(new Date().getFullYear() + 1)
  ).getFullYear();

  let newTemplateObject = {
    label: "+ Create New Template",
    value: 0
  };

  const handleSave = async () => {
    const confirm = window.confirm(
      `Are you sure you want to update the template for ${inputYear}? This option cannot be undone.`
    );
    let response;
    if (confirm) {
      try {
        response = await updateCreateFormTemplate({
          year: inputYear,
          template: JSON.parse(currentTemplate)
        });
      } catch (e) {
        setAlert({
          status: 400,
          message:
            "Unable to save. Please verify that the template contains valid JSON"
        });
      }
      if (response) {
        console.log(response);
        setAlert(response);
      }
    }
  };

  const updateYear = async year => {
    if (year !== 0) {
      const template = await obtainFormTemplate({ year: year });
      setCurrentTemplate(JSON.stringify(template[0].template, null, 2));
      setShowYearInput(false);
      setInputYear(year);
    } else {
      setCurrentTemplate("");
      setShowYearInput(true);
      setSelectedYear(newTemplateObject);
      setInputYear(nextYear);
    }
  };

  const onLoad = async () => {
    let yearsArray = await obtainFormTemplateYears();
    let yearsObjects = yearsArray.map(i => {
      return {
        label: i,
        value: i
      };
    });
    yearsObjects.unshift(newTemplateObject);
    setFormYears(yearsObjects);
    setSelectedYear(yearsObjects[1]);
    await updateYear(yearsObjects[1].value);
  };

  useEffect(() => {
    onLoad().then();
  }, []);

  return (
    <>
      <h1>Add/Edit Form Templates</h1>

      <div className="formTemplates" data-testid="formTemplates">
        {alert ? (
          <Alert
            className="margin-bottom-3"
            type={alert.status === 200 ? "success" : "error"}
          >
            {alert.message}
          </Alert>
        ) : null}
        {formYears && selectedYear ? (
          <div className="margin-top-3">
            <label for="year-select" className="margin-top-3">
              Select Year or Create New
            </label>
            <Dropdown
              id="year-select"
              options={formYears}
              onChange={event => updateYear(event.value)}
              value={selectedYear ? selectedYear : ""}
              placeholder="Select a year"
              autosize={false}
              className="year-select-list"
            />
          </div>
        ) : null}
        {showYearInput ? (
          <>
            <label for="year-input" className="margin-top-3">
              Enter Year
            </label>
            <TextInput
              id="year-input"
              name="year-input"
              type="number"
              onChange={e => setInputYear(e.target.value)}
              defaultValue={nextYear}
            />
          </>
        ) : null}
        {currentTemplate !== false ? (
          <div className="template-input margin-top-3">
            <label for="templateInput">Enter or Modify Template</label>
            <Textarea
              id="templateInput"
              name="templateInput"
              value={currentTemplate}
              type="text"
              onChange={e => setCurrentTemplate(e.target.value)}
            />
          </div>
        ) : null}

        <Button
          primary="true"
          onClick={() => handleSave()}
          data-testid="saveButton"
          className="margin-top-3 margin-bottom-2"
        >
          Save <FontAwesomeIcon icon={faSave} className="margin-left-2" />
        </Button>
      </div>
    </>
  );
};

export default FormTemplates;
