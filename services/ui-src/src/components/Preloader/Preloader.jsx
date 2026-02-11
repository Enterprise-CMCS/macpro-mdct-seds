import React from "react";

const Preloader = () => {
  return (
    <div data-testid="profile">
      <p>
        <img src="/preloaders/gears.gif" alt="Loading..." title="Loading" />
      </p>
    </div>
  );
};

export default Preloader;
