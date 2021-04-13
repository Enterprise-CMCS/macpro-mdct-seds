import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { RangeInput } from "@trussworks/react-uswds";
import PropTypes from "prop-types";
import { updatedStatus } from "../../store/reducers/singleForm/singleForm";
import { Auth } from "aws-amplify";

const NotApplicable = ({
  statusObject,
  toggle,
  last_modified_by,
  last_modified,
  not_applicable,
  status
}) => {
  const [applicableStatus, setApplicableStatus] = useState(0);
  const [username, setUsername] = useState();
  // FALSE = the form APPLIES TO THIS STATE (0)
  // TRUE = the form is NOT APPLICABLE (1)

  useEffect(() => {
    const loadUserData = async () => {
      const AuthUserInfo = await Auth.currentAuthenticatedUser();
      const { given_name, family_name } = AuthUserInfo.attributes;
      setUsername(`${given_name} ${family_name}`);
    };
    loadUserData();
  });

  useEffect(() => {
    let booleanToInt = not_applicable === false ? 0 : 1;
    setApplicableStatus(booleanToInt);
  }, [not_applicable]);

  const changeStatus = () => {
    if (applicableStatus === 0) {
      setApplicableStatus(1);
    } else {
      setApplicableStatus(0);
    }

    let updatedStatus =
      status === "Not Required" ? "In Progress" : "Not Required";

    let integerToBool = applicableStatus === 0 ? false : true;
    toggle(integerToBool, username, updatedStatus);
  };

  return (
    <>
      <h3>Does this form apply to your state?</h3>
      <h2>
        {applicableStatus === 0 ? <p>Active</p> : <p> Not Applicable</p>}{" "}
      </h2>
      <>
        <RangeInput
          onClick={() => changeStatus()}
          id="range-slider"
          name="range"
          min={0}
          max={1}
          value={applicableStatus}
          defaultValue={0}
          list="range-list-id"
          style={{ width: 100 }}
        />
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
