import React from "react";

const Preloader = () => {
  return (
    <div className="padding-y-9" data-testid="profile">
      <p className="center-content">
        <img src="preloaders/gears.gif" alt="Loading..." title="Loading" />
      </p>
    </div>
  );
};

export default Preloader;
