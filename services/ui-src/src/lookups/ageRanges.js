export const ageRanges = {
  "0000": {
    name: "Under Age 0",
    description: "Conception to birth"
  },
  "0001": {
    name: "Ages 0 - 1",
    description: "Birth through age 12 months"
  },
  "0018": {
    name: "Ages 0 - 18",
    description: "Conception through age 18 years"
  },
  "0105": {
    name: "Ages 1 - 5",
    description: "Age 1 year through age 5 years"
  },
  "0612": {
    name: "Ages 6 - 12",
    description: "Age 6 years through age 12 years"
  },
  "1318": {
    name: "Ages 13 - 18",
    description: "Age 13 years through age 18 years"
  },
  "1920": {
    name: "Ages 19 - 20",
    description: "Age 19 years through age 20 years"
  },
  "1964": {
    name: "Ages 19 - 64",
    description: "Age 19 years through age 64 years"
  }
};

/**
 * @param {string} ageRangeId
 * @example
 * getAgeRangeDescription("0105")
 * //=> { name: "Ages 1 - 5", description: "Age 1 year through age 5 years" }
 */
export const getAgeRangeDetails = (ageRangeId) => ageRanges[ageRangeId];
