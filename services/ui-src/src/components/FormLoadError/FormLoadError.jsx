import React from "react";

/**
 * This generic error is created to prevent users from interacting with apps in a bad state.
 * - 64.ECI forms never have answers, and should be hidden going forward
 * - some 2019/2020 forms do not have answers, and the app is prone to display other answers when retrieved.
 */
const FormLoadError = () => {
  return (
    <div className="formLoadError" data-testid="formLoadTest">
      <div className="container">
        <div row>
          <div col={12}>
            <h1>Error Retrieving Form</h1>
            <p>
              There was an issue loading the form, please contact the helpdesk
              at{" "}
              <a href="mailto:mdct_help@cms.hhs.gov">MDCT_Help@cms.hhs.gov</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormLoadError;
