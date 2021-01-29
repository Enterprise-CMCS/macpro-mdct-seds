import React from "react";
import { connect, useDispatch } from "react-redux";
import "./NotFound.css";

import { disableForm } from "../store/reducers/singleForm";
import { Button } from "@trussworks/react-uswds";

const NotFound = ({ form }) => {
  const dispatch = useDispatch();
  const toggleStatus = form.not_applicable ? false : true;
  const statusButtonText = form.not_applicable ? "Not Applicable" : "Active";
  return (
    <div className="NotFound">
      <Button onClick={dispatch(disableForm(toggleStatus))}>
        {statusButtonText}
      </Button>
      <h3>Sorry, page not found!</h3>
    </div>
  );
};

// LOOK AT DISPATCH, WRONG NAME???

// const mapDispatchToProps = {
//   toggleStaus: disableForm
// };

const mapStateToProps = state => ({
  form: state.currentForm
});

export default connect(mapStateToProps)(NotFound);
