import React, { useState } from "react";
import { Link } from "react-router-dom";
import Dropdown from "react-dropdown";
import { obtainAvailableForms } from "../../libs/api";
import {
  buildSortedAccordionByYearQuarter
} from "../../utility-functions/sortingFunctions";
import { Accordion } from "@trussworks/react-uswds";
import "./HomeAdmin.scss";
import { stateSelectOptions } from "../../lookups/states";
import { useStore } from "../../store/store";

const HomeAdmin = () => {
  const user = useStore(state => state.user);
  const [selectedState, setSelectedState] = useState();
  const [accordionItems, setAccordionItems] = useState("");

  const updateUsState = async e => {
    setSelectedState(e.value);

    // Get list of all state forms
    let forms;
    try {
      forms = await obtainAvailableForms({
        stateId: e.value
      });
    } catch (e) {
      forms = [];
    }

    // Build Accordion items and set to local state
    setAccordionItems(buildSortedAccordionByYearQuarter(forms, e.value));
  };

  let role = user.role;
  return (
    <div className="HomeAdmin" data-testid="HomeAdmin">
      {role === "admin" ? (
        <div>
          <h1 className="page-header">Home Admin User Page</h1>
          <div className="list-display-container">
            <ul>
              <li className="user-view-edit">
                <Link to="/users" className="text-bold">
                  View / Edit Users
                </Link>
              </li>
              <li className="form-templates">
                <Link to="/form-templates" className="text-bold">
                  Add/Edit Form Templates
                </Link>
              </li>
              <li className="generate-forms">
                <Link to="/generate-forms" className="text-bold">
                  Generate Quarterly Forms
                </Link>
              </li>
              <li className="generate-counts">
                <Link to="/generate-counts" className="text-bold">
                  Generate Total Enrollment Counts
                </Link>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <h1 className="page-header">Home Business User Page</h1>
      )}
      <div className="state-coreset-container margin-bottom-2">
        <div className="state-selector">
          <h3>Select Your State</h3>
          <Dropdown
            options={stateSelectOptions}
            onChange={e => updateUsState(e)}
            value={selectedState ? selectedState : ""}
            placeholder="Select a state"
            autosize={false}
            className="state-select-list"
          />
        </div>

        <div className="year-coreset-selector">
          {accordionItems && accordionItems.length !== 0 ? (
            <>
              <p className="instructions">
                Welcome to SEDS! Please select a Federal Fiscal Year and quarter
                below to view available reports.
              </p>

              <div className="quarterly-report-list">
                <Accordion bordered={true} items={accordionItems} />
              </div>
            </>
          ) : (
            accordionItems !== "" &&
            "There are no forms available for the selected state"
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeAdmin;
