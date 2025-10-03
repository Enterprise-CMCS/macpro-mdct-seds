export const InProgressStatusFields = () => {
  return { status_id: 2, not_applicable: false, status: "In Progress" };
};

export const statusHasChanged = (prevStatusData, newStatusData) => {
  return prevStatusData.status_id !== newStatusData.status_id ||
    prevStatusData.not_applicable !== newStatusData.not_applicable;
};
