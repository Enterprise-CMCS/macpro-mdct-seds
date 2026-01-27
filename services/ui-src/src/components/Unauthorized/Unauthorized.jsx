import React from "react";

const Unauthorized = () => {
  return (
    <div className="unauthorized" data-testid="unauthorizedTest">
      <div className="container page-login">
        <div>
          <div>
            <h1>Unauthorized</h1>
            <p>You are not authorized to view this page.</p>
            <p>
              If you feel this is an error, please contact the helpdesk{" "}
              <a href="mailto:mdct_help@cms.hhs.gov">MDCT_Help@cms.hhs.gov</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
