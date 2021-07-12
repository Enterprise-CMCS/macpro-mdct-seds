import React, { useEffect, useState } from "react";
import { obtainFormTemplateYears } from "../../libs/api";

const FormTemplates = () => {
  const [formYears, setFormYears] = useState();

  const onLoad = async () => {
    setFormYears(await obtainFormTemplateYears());
    let a = await obtainFormTemplateYears();
    let b;
  };

  useEffect(() => {
    onLoad().then();
  }, []);

  return (
    <>
      <h1>Add/Edit Form Templates</h1>

      <div className="formTemplates" data-testid="formTemplates"></div>
    </>
  );
};

export default FormTemplates;
