export const UserRole = {
  Admin: "admin",
  Business: "business",
  State: "state",
}

export const UserRoleDisplay = {
  [UserRole.Admin]: "Admin User",
  [UserRole.Business]: "Business User",
  [UserRole.State]: "State User",
};

export const FormStatus = {
  NotStarted: 1,
  InProgress: 2,
  ProvisionalCertified: 3,
  FinalCertified: 4,
  NotApplicable: 5,
};

export const FormStatusDisplay = {
  [FormStatus.NotStarted]: "In Progress",
  [FormStatus.InProgress]: "In Progress",
  [FormStatus.ProvisionalCertified]: "Provisional Data Certified and Submitted",
  [FormStatus.FinalCertified]: "Final Data Certified and Submitted",
  [FormStatus.NotApplicable]: "Not Required",
};
