export const canViewStateData = (user, state) => {
  return (
    user.role === "admin" ||
    user.role === "business" ||
    (user.role === "state" && user.state === state)
  );
};
