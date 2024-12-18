import React, { useEffect } from "react";
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
  const [formYears, setFormYears] = React.useState();
  const [selectedYear, setSelectedYear] = React.useState();
  const [inputYear, setInputYear] = React.useState();
  const [currentTemplate, setCurrentTemplate] = React.useState(false);
  const [showYearInput, setShowYearInput] = React.useState(false);
  const [alert, setAlert] = React.useState(false);

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
    if (!yearsArray.length) {
      setShowYearInput(true);
      setInputYear(nextYear);
    } else {
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
    }
  };

  useEffect(() => {
    onLoad().then();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="formTemplates">
      <h1 className="page-header">Add/Edit Form Templates</h1>
      <div data-testid="formTemplates">
        {alert ? (
          <Alert
            className="margin-bottom-3"
            type={alert.status === 200 ? "success" : "error"}
            headingLevel="h1"
          >
            {alert.message}
          </Alert>
        ) : null}
        {formYears && selectedYear ? (
          <div className="year-selection-container">
            <label htmlFor="year-select">Select Year or Create New</label>
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
            <label htmlFor="year-input" className="margin-top-3">
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
        <div className="template-input margin-top-3 margin-bottom-4">
          <label htmlFor="templateInput">Enter or Modify Template</label>
          <Textarea
            id="templateInput"
            name="templateInput"
            value={currentTemplate ? currentTemplate : ""}
            type="text"
            onChange={e => setCurrentTemplate(e.target.value)}
          />
        </div>
        <Button
          id="save-button"
          primary="true"
          onClick={() => handleSave()}
          data-testid="saveButton"
        >
          Save <FontAwesomeIcon icon={faSave} className="margin-left-2" />
        </Button>
      </div>
    </div>
  );
};

export default FormTemplates;
