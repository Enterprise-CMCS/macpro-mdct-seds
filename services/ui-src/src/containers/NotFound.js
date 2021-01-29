import React from "react";
import { connect, useDispatch } from "react-redux";
import "./NotFound.css";

import { disableForm } from "../store/reducers/singleForm";
import { Button } from "@trussworks/react-uswds";

const NotFound = ({ form, toggle }) => {
  // const dispatch = useDispatch();
  const newStatus = form.not_applicable ? false : true;
  const statusButtonText = form.not_applicable ? "Not Applicable" : "Active";

  let A = 0;

  return (
    <div className="NotFound">
      <Button onClick={() => toggle(newStatus)}>{statusButtonText}</Button>
      <h3>Sorry, page not found!</h3>
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  toggle: status => dispatch(disableForm(status))
});

const mapStateToProps = state => ({
  form: state.currentForm
});

export default connect(mapStateToProps, mapDispatchToProps)(NotFound);

// IS DISPATCH WRONG??
// ACCESSING PROPS INCORRECTLY??
