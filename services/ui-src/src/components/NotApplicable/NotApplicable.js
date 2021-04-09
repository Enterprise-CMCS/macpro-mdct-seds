import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { RangeInput, Button } from "@trussworks/react-uswds";
import TabContainer from "../TabContainer/TabContainer";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { updatedStatus } from "../../store/reducers/singleForm/singleForm";

const NotApplicable = ({
  statusObject,
  toggle,
  last_modified_by,
  last_modified,
  not_applicable,
  status
}) => {
  const [applicableStatus, setApplicableStatus] = useState([]);
  // FALSE = the form DOES APPLY TO THIS STATE
  // TRUE = the form is NOT APPLICABLE

  useEffect(() => {
    setApplicableStatus(not_applicable);
  }, [not_applicable]);

  const changeStatus = event => {
    setApplicableStatus(event.target.value);
    updatedStatus(applicableStatus);
  };

  //   <Button type="buton" onClick={() => toggle(newStatus)}>
  //     {statusButtonText}
  //   </Button>

  //   if (applicableStatus === true) {
  //     newStatus = false;
  //     statusText = "Not Applicable";
  //   } else {
  //     newStatus = true;
  //     statusText = "Active";
  //   }

  return (
    <>
      <h3>
        {applicableStatus === true ? <p> Not Applicable</p> : <p>Active</p>}{" "}
      </h3>
      <>
        <RangeInput
          onClick={() => changeStatus()}
          id="range-slider"
          name="range"
          min={0}
          max={1}
          defaultValue={0}
          list="range-list-id"
          style={{ width: 50 }}
        />
        <datalist id="range-list-id">
          <option>0</option>
          <option>1</option>
        </datalist>
      </>
    </>
  );
};

NotApplicable.propTypes = {
  statusObject: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired
};

const mapState = state => ({
  statusObject: state.currentForm.statusData,
  last_modified_by: state.currentForm.statusData,
  last_modified: state.currentForm.statusData.last_modified,
  not_applicable: state.currentForm.statusData.not_applicable,
  status: state.currentForm.statusData.status
});

const mapDispatch = {
  toggle: updatedStatus ?? {}
};

export default connect(mapState, mapDispatch)(NotApplicable);

// ----------------
// const NotFound = ({ form, toggle }) => {
//     let newStatus;
//     let statusButtonText;

//     if (form.not_applicable === true) {
//       newStatus = false;
//       statusButtonText = "Not Applicable";
//     } else {
//       newStatus = true;
//       statusButtonText = "Active";
//     }

//     return (
//       <div className="NotFound" data-testid="NotFound">
//         <Button type="buton" onClick={() => toggle(newStatus)}>
//           {statusButtonText}
//         </Button>
//         <h3>Sorry, page not found!</h3>
//       </div>
//     );
//   };

//   const mapStateToProps = state => ({
//     form: state.currentForm.statusData
//   });

// const mapDispatchToProps = dispatch => ({
//     toggle: status => dispatch(disableForm(status))
//   });

//   export default connect(mapStateToProps, mapDispatchToProps)(NotFound);
// ---------------

//TODO:

// XXX Make slider “Does this form apply to your state”, initially set to “Applicable”
// props to play with: draggable,

// Should be accessing/connected to the statusData object

// Need user data
// —
// Selecting “Not applicable” triggers a prompt (pop up window), all your data will be lost.

// Change status of form in statusData reducer

// Save user’s name

// Send crazy big array of null values? To reset? Or will disable reset?

// The form should become disabled as soon as that prop is set to disabled or whatever

// Trigger a save??
// — Re selecting applicable changes form status back to “in progress”

// Change status of form in statusData reducer

// Save user’s name

// Form should now be totally editable

//QUESTIONS: Is a pop up window really the way to go? maybe we use a trussworks alert component

// NOTES:
// THIS MUST MUST MUST DISABLE THE CERTIFICATION  ABILITIES
