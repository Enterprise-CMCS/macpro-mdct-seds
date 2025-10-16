/*
 * Form status used to be very complicated.
 * It was spread, conceptually, across several fields.
 * These helpers helped manage interpretation & updates for those fields.
 * Someday, we should refactor these helpers into an enum, or two. How nice!
 */

/** Is this form In Progress? */
export const isInProgress = stateForm => {
  return stateForm.status_id === 1;
};

export const InProgressStatusFields = () => {
  return { status_id: 1 };
};

/** Has the state Certified this form? */
export const isProvisionalCertified = stateForm => {
  return stateForm.status_id === 2;
};

export const ProvisionalCertifiedStatusFields = () => {
  return { status_id: 2 };
};

/** Has CMS Certified this form? */
export const isFinalCertified = stateForm => {
  return stateForm.status_id === 3;
};

export const FinalCertifiedStatusFields = () => {
  return { status_id: 3 };
};

/** Has the state marked this form as Not Applicable? */
export const isNotRequired = stateForm => {
  return stateForm.status_id === 4;
};

export const NotRequiredStatusFields = () => {
  return { status_id: 4 };
};

/**
 * Given a state form, how should we display its status?
 * @param stateForm {{ status_id: number }}
 * @returns {string}
 */
export const getStatusDisplay = stateForm => {
  switch (stateForm.status_id) {
    case 1: 
      return "In Progress";
    case 2: 
      return "Provisional Data Certified and Submitted";
    case 3: 
      return "Final Data Certified and Submitted";
    case 4: 
      return "Not Required";
    default:
      throw new Error(`Unrecognized status field: ${stateForm.status_id}`);
  }
};
