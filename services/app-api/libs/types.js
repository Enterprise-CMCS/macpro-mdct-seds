export const FormStatus = {
  InProgress: 1,
  ProvisionalCertified: 2,
  FinalCertified: 3,
  NotApplicable: 4,
};

export const FormStatusDisplay = {
  [FormStatus.InProgress]: "In Progress",
  [FormStatus.ProvisionalCertified]: "Provisional Data Certified and Submitted",
  [FormStatus.FinalCertified]: "Final Data Certified and Submitted",
  [FormStatus.NotApplicable]: "Not Required",
};
