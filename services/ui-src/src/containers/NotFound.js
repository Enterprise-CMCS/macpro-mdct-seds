import React from "react";
import { connect } from "react-redux";
import "./NotFound.css";

import { disableForm } from "../store/reducers/singleForm";
import { Button } from "@trussworks/react-uswds";

const NotFound = ({ form }) => {
  const toggleStatus = form.status === "active" ? "N/A" : "active";
  return (
    <div className="NotFound">
      <Button onClick={disableForm(toggleStatus)}>{form.status}</Button>
      <h3>Sorry, page not found!</h3>
    </div>
  );
};

const mapState = state => ({
  form: state.currentForm
});

export default connect(mapState)(NotFound);
