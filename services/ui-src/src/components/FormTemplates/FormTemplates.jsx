import React, { useEffect } from "react";
import {
  obtainFormTemplate,
  obtainFormTemplateYears,
  updateCreateFormTemplate,
} from "../../libs/api";
import { Button, Alert, TextInput, TextField } from "@cmsgov/design-system";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";

const FormTemplates = () => {
  const [formYears, setFormYears] = React.useState();
  const [selectedYear, setSelectedYear] = React.useState();
  const [inputYear, setInputYear] = React.useState();
  const [currentTemplate, setCurrentTemplate] = React.useState(false);
  const [showYearInput, setShowYearInput] = React.useState(false);
  const [alert, setAlert] = React.useState(undefined);

  let nextYear = new Date(
    new Date().setFullYear(new Date().getFullYear() + 1)
  ).getFullYear();

  const handleSave = async () => {
    const confirm = window.confirm(
      `Are you sure you want to update the template for ${inputYear}? This option cannot be undone.`
    );
    let response;
    if (confirm) {
      setAlert(undefined);
      try {
        response = await updateCreateFormTemplate({
          year: Number(inputYear),
          template: JSON.parse(currentTemplate),
        });
        setAlert({
          variation: "success",
          message: "Template saved successfully.",
        });
      } catch (err) {
        const message =
          err instanceof Error ? `Save failed: ${err.message}` : "Save failed.";
        setAlert({ variation: "error", message });
      }
    }
  };

  const updateYear = async (year) => {
    setSelectedYear(year);
    if (year !== "CREATE_NEW") {
      const template = await obtainFormTemplate(Number(year));
      setCurrentTemplate(JSON.stringify(template.template, null, 2));
      setShowYearInput(false);
      setInputYear(year);
    } else {
      setCurrentTemplate("");
      setShowYearInput(true);
      setInputYear(nextYear);
    }
  };

  const onLoad = async () => {
    let yearsArray = await obtainFormTemplateYears();
    yearsArray.sort((a, b) => b - a);
    if (!yearsArray.length) {
      setShowYearInput(true);
      setInputYear(nextYear);
    } else {
      let yearsObjects = [
        {
          label: "+ Create New Template",
          value: "CREATE_NEW",
        },
        ...yearsArray.map((year) => ({
          label: year.toString(),
          value: year.toString(),
        })),
      ];

      setFormYears(yearsObjects);
      setSelectedYear(yearsObjects[1].value);
      await updateYear(yearsObjects[1].value);
    }
  };

  useEffect(() => {
    onLoad().then();
  }, []);

  return (
    <div className="flex-col-gap-1half">
      <h1>Add/Edit Form Templates</h1>
      <div data-testid="formTemplates" className="flex-col-gap-1half">
        {alert ? (
          <Alert variation={alert.variation} headingLevel="1">
            {alert.message}
          </Alert>
        ) : null}
        {formYears && selectedYear ? (
          <div>
            <label htmlFor="year-select">Select Year or Create New</label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(evt) => updateYear(evt.target.value)}
            >
              {formYears.map(({ label, value }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
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
              onChange={(e) => setInputYear(e.target.value)}
              defaultValue={nextYear}
            />
          </>
        ) : null}
        <div>
          <label htmlFor="templateInput">Enter or Modify Template</label>
          <TextField
            multiline={true}
            id="templateInput"
            name="templateInput"
            value={currentTemplate ? currentTemplate : ""}
            type="text"
            onChange={(e) => setCurrentTemplate(e.target.value)}
          />
        </div>
        <Button
          id="save-button"
          variation="solid"
          className="flex-end"
          onClick={() => handleSave()}
          data-testid="saveButton"
        >
          Save <FontAwesomeIcon icon={faSave} />
        </Button>
      </div>
    </div>
  );
};

export default FormTemplates;
