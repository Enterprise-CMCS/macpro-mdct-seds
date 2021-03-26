import React from "react";
import { connect } from "react-redux";
import "./NotFound.css";

import { disableForm } from "../store/reducers/singleForm/singleForm";
import { Button } from "@trussworks/react-uswds";

const NotFound = ({ form, toggle }) => {
  let newStatus;
  let statusButtonText;

  if (form.not_applicable === true) {
    newStatus = false;
    statusButtonText = "Not Applicable";
  } else {
    newStatus = true;
    statusButtonText = "Active";
  }

  return (
    <div className="NotFound">
      <Button type="buton" onClick={() => toggle(newStatus)}>
        {statusButtonText}
      </Button>
      <h3>Sorry, page not found!</h3>
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  toggle: status => dispatch(disableForm(status))
});

const mapStateToProps = state => ({
  form: state.currentForm.statusData
});

export default connect(mapStateToProps, mapDispatchToProps)(NotFound);
