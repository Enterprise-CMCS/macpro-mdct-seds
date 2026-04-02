export const addCommas = (val) => {
  if (isNaN(val)) {
    return "";
  }
  return val.toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, ",");
};
