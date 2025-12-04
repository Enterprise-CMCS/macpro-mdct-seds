export const InProgressStatusFields = () => {
  return { status_id: 1 };
};

export const statusHasChanged = (prevStatusData, newStatusData) => {
  return prevStatusData.status_id !== newStatusData.status_id;
};
