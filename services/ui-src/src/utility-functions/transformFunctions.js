export const addCommas = (val) => {
  if (isNaN(val)) {
    return "";
  }
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
