import React, { useState } from "react";
import { Link } from "react-router-dom";
import { obtainAvailableForms } from "../../libs/api";
import { buildSortedAccordionByYearQuarter } from "../../utility-functions/sortingFunctions";
import { Accordion, AccordionItem } from "@cmsgov/design-system";
import { stateSelectOptions } from "../../lookups/states";
import { useStore } from "../../store/store";

const HomeAdmin = () => {
  const user = useStore((state) => state.user);
  const [selectedState, setSelectedState] = useState();
  const [accordionItems, setAccordionItems] = useState("");

  const updateUsState = async (stateId) => {
    setSelectedState(stateId);

    // Get list of all state forms
    let forms = [];
    try {
      forms = await obtainAvailableForms(stateId);
    } catch (e) {
      /* no-op */
    }

    // Build Accordion items and set to local state
    setAccordionItems(buildSortedAccordionByYearQuarter(forms, stateId));
  };

  let role = user.role;
  return (
    <div data-testid="HomeAdmin" className="flex-col-gap-1half">
      {role === "admin" ? (
        <div className="flex-col-gap-1half">
          <h1>Home Admin User Page</h1>
          <div>
            <ul className="flex-col-gap-1">
              <li>
                <Link to="/users">View / Edit Users</Link>
              </li>
              <li>
                <Link to="/form-templates">Add/Edit Form Templates</Link>
              </li>
              <li>
                <Link to="/generate-forms">Generate Quarterly Forms</Link>
              </li>
              <li>
                <Link to="/generate-counts">
                  Generate Total Enrollment Counts
                </Link>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <h1>Home Business User Page</h1>
      )}
      <div className="flex-col-gap-1half">
        <div>
          <label htmlFor="state-select">Select State to View</label>
          <select
            id="state-select"
            value={selectedState}
            onChange={(evt) => updateUsState(evt.target.value)}
          >
            <option value>- Select a State -</option>
            {stateSelectOptions.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-col-gap-1">
          {accordionItems && accordionItems.length !== 0 ? (
            <>
              <p>
                Welcome to SEDS! Please select a Federal Fiscal Year and quarter
                below to view available reports.
              </p>

              <div>
                <Accordion bordered>
                  {accordionItems.map((item, idx) => (
                    <AccordionItem
                      key={idx}
                      defaultOpen={item.expanded}
                      heading={item.title}
                    >
                      {item.content}
                    </AccordionItem>
                  ))}
                </Accordion>
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
