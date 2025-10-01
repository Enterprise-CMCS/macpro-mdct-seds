/*
 * Form status is complicated. You CANNOT determine it from a single field.
 * It is spread, conceptually, across several fields.
 *
 * Use these helper functions to ensure those fields are:
 *   1. Interpreted together correctly
 *   2. Changed in sync correctly
 *
 * We should absolutely consolidate form status into a single field,
 * which can be easily interpreted, and never get out of sync with itself.
 * And we will. As soon as we can coordinate with our downstream partners,
 * to send them thousands of updated state forms from past years,
 * with changed status semantics, without any surprising user-facing effects.
 */

/** Is this form In Progress? */
export const isInProgress = (stateForm) => {
  return stateForm.status_id === 1 || stateForm.status_id === 2;
}

export const InProgressStatusFields = () => {
  const statusFields = { status_id: 2, not_applicable: false };
  return {
    ...statusFields,
    status: getStatusDisplay(statusFields)
  };
};

/** Has the state Certified this form? */
export const isProvisionalCertified = (stateForm) => {
  return stateForm.status_id === 3;
}

export const ProvisionalCertifiedStatusFields = () => {
  const statusFields = { status_id: 3, not_applicable: false };
  return {
    ...statusFields,
    status: getStatusDisplay(statusFields)
  };
};

/** Has CMS Certified this form? */
export const isFinalCertified = (stateForm) => {
  return stateForm.status_id === 4 && !stateForm.not_applicable;
}

export const FinalCertifiedStatusFields = () => {
  const statusFields = { status_id: 4, not_applicable: false };
  return {
    ...statusFields,
    status: getStatusDisplay(statusFields)
  };
};

/** Has the state marked this form as Not Applicable? */
export const isNotRequired = (stateForm) => {
  return stateForm.status_id === 4 && stateForm.not_applicable;
}

export const NotRequiredStatusFields = () => {
  const statusFields = { status_id: 4, not_applicable: true };
  return {
    ...statusFields,
    status: getStatusDisplay(statusFields)
  };
};

/**
 * Given a state form, how should we display its status?
 * @param stateForm {{ status_id: number, not_applicable: boolean }}
 * @returns {string}
 */
export const getStatusDisplay = (stateForm) => {
  /*
   * I know this looks inefficient. "Why not just return stateForm.status?"
   * You make a good point, but hear me out.
   *
   * That is how this app used to work. But having status spread across
   * multiple fields is asking for trouble, and we found trouble.
   * A new SEDS developer, or one in a hurry, could easily read one field
   * without the others, or write to one field without writing to the others.
   * In either case, that leads to nasty, hard-to-find, harder-to-fix bugs.
   *
   * As such, we intend to delete the stateForm.status field.
   * See the comment at the top of this file for more details.
   * In the meantime, let's set a good example,
   * and NOT read a single status-related field in isolation.
   */
  if (isInProgress(stateForm)) {
    return "In Progress";
  } else if (isProvisionalCertified(stateForm)) {
    return "Provisional Data Certified and Submitted";
  } else if (isFinalCertified(stateForm)) {
    return "Final Data Certified and Submitted";
  } else if (isNotRequired(stateForm)) {
    return "Not Required";
  } else {
    throw new Error(`Unrecognized status fields: ${stateForm.status_id}, ${stateForm.not_applicable}`);
  }
}
