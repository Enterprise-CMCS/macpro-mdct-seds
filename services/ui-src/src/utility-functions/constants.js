// import.meta.env is threaded through here, enabling mocking for unit tests
export const { MODE, BASE_URL } = import.meta.env;

export const formTypes = [
  {
    form: "21E",
    form_id: "1",
    form_name: "Number of Children Served in Separate CHIP Program",
    form_text:
      "Form 21E collects data on children enrolled in separate child health programs, or separate CHIP.",
  },
  {
    form: "64.EC",
    form_id: "2",
    form_name: "Number of Children Served in Medicaid Program",
    form_text:
      "Form 64.EC collects data on children enrolled in the Medicaid Program.",
  },
  {
    form: "64.21E",
    form_id: "3",
    form_name: "Number of Children Served in Medicaid CHIP Expansion Program",
    form_text:
      "Form 64.21E collects data on children enrolled in the Medicaid CHIP Expansion Program.",
  },
  {
    form: "64.ECI",
    form_id: "4",
    form_name: "Informational Number of Children Served in Medicaid Program",
    form_text:
      "Form 64.ECI collects data on unborn children enrolled in the Medicaid Program.",
  },
  {
    form: "GRE",
    form_id: "5",
    form_name: "Gender, Race & Ethnicity",
    form_text:
      "The Gender, Race & Ethnicity Form collects data on the number of children in each Gender, Race, and Ethnicity.",
  },
  {
    form: "21PW",
    form_id: "6",
    form_name: "Number of Pregnant Women Served",
    form_text:
      "Children's Health Insurance Program Number of Pregnant Women served",
  },
];

