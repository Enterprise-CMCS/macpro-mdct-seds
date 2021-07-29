export const generateDateForDB = (date = new Date()) => {
  return date.toISOString();
};

export const addCommas = val => {
  if (isNaN(val) === true) {
    return "";
  }
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
