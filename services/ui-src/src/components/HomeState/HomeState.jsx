import React, { useState, useEffect } from "react";
import { Accordion, AccordionItem } from "@cmsgov/design-system";
import { useNavigate } from "react-router";
import { listFormsForState } from "../../libs/api";
import {
  sortFormsByYearAndQuarter,
  buildSortedAccordionByYearQuarter,
} from "../../utility-functions/sortingFunctions";
import { useStore } from "../../store/store";

const HomeState = () => {
  const user = useStore((state) => state.user);
  const navigate = useNavigate();
  const [accordionItems, setAccordionItems] = useState([]);

  const loadForms = async (stateId) => {
    try {
      const availableForms = await listFormsForState(stateId);
      return sortFormsByYearAndQuarter(availableForms);
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  useEffect(() => {
    (async () => {
      if (!user.state) {
        navigate("/register-state");
      }

      const forms = await loadForms(user.state);
      setAccordionItems(buildSortedAccordionByYearQuarter(forms, user.state));
    })();
  }, []);

  return (
    <div className="flex-col-gap-1half">
      <p>
        Welcome to SEDS! Please select a Federal Fiscal Year and quarter below
        to view available reports.
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
    </div>
  );
};

export default HomeState;
