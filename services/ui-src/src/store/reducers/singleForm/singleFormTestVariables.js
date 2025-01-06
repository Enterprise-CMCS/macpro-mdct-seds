export const tabs = ["0000", "0001", "0105", "0612"];

export const statusData = {
  status_modified_by: "Timothy Griesemer",
  status_date: "2021-03-02T12:46:35.838Z",
  year: 2021,
  state_comments: [
    {
      type: "text_multiline",
      entry: "This is an example of summary notes on the state form 21PW for PA"
    }
  ],
  form_id: "6",
  last_modified_by: "Timothy Griesemer",
  created_by: "seed",
  validation_percent: 0.03,
  form: "21PW",
  program_code: "PA",
  state_form: "PA-2021-1-21PW",
  state_id: "PA",
  created_date: "2021-03-02T12:46:35.838Z",
  form_name: "Number of Pregnant Women Served",
  last_modified: "2021-04-09T12:46:35.838Z",
  quarter: 1,
  status_id: 1,
};

export const answers = [
  {
    ageRange: "Ages 6 - 12",
    rangeId: "0612",
    question: "2021-21E-03",
    state_form: "AL-2021-1-21E",
    last_modified_by: "seed",
    created_date: "2021-01-15T12:46:35.838Z",
    rows: [
      {
        col6: "% of FPL 301-317",
        col4: "% of FPL 201-250",
        col5: "% of FPL 251-300",
        col2: "% of FPL 0-133",
        col3: "% of FPL 134-200",
        col1: ""
      },
      {
        col6: null,
        col4: null,
        col5: null,
        col2: null,
        col3: null,
        col1: "A. Fee-for-Service"
      },
      {
        col6: null,
        col4: null,
        col5: null,
        col2: null,
        col3: null,
        col1: "B. Managed Care Arrangements"
      },
      {
        col6: null,
        col4: null,
        col5: null,
        col2: null,
        col3: null,
        col1: "C. Primary Care Case Management"
      }
    ],
    last_modified: "2021-01-15T12:46:35.838Z",
    created_by: "seed",
    answer_entry: "AL-2021-1-21E-0612-03"
  },
  {
    ageRange: "Ages 1 - 5",
    rangeId: "0105",
    question: "2021-21E-08",
    state_form: "AL-2021-1-21E",
    last_modified_by: "seed",
    created_date: "2021-01-15T12:46:35.838Z",
    rows: [
      {
        col6: "% of FPL 301-317",
        col4: "% of FPL 201-250",
        col5: "% of FPL 251-300",
        col2: "% of FPL 0-133",
        col3: "% of FPL 134-200",
        col1: ""
      },
      {
        col6: null,
        col4: null,
        col5: null,
        col2: null,
        col3: null,
        col1: "A. Fee-for-Service"
      },
      {
        col6: null,
        col4: null,
        col5: null,
        col2: null,
        col3: null,
        col1: "B. Managed Care Arrangements"
      },
      {
        col6: null,
        col4: null,
        col5: null,
        col2: null,
        col3: null,
        col1: "C. Primary Care Case Management"
      }
    ],
    last_modified: "2021-01-15T12:46:35.838Z",
    created_by: "seed",
    answer_entry: "AL-2021-1-21E-0105-08"
  },
  {
    ageRange: "Ages 6 - 12",
    rangeId: "0612",
    question: "2021-21E-09",
    state_form: "AL-2021-1-21E",
    last_modified_by: "seed",
    created_date: "2021-01-15T12:46:35.838Z",
    rows: [
      {
        col6: "% of FPL 301-317",
        col4: "% of FPL 201-250",
        col5: "% of FPL 251-300",
        col2: "% of FPL 0-133",
        col3: "% of FPL 134-200",
        col1: ""
      },
      {
        col6: null,
        col4: null,
        col5: null,
        col2: null,
        col3: null,
        col1: "A. Fee-for-Service"
      },
      {
        col6: null,
        col4: null,
        col5: null,
        col2: null,
        col3: null,
        col1: "B. Managed Care Arrangements"
      },
      {
        col6: null,
        col4: null,
        col5: null,
        col2: null,
        col3: null,
        col1: "C. Primary Care Case Management"
      }
    ],
    last_modified: "2021-01-15T12:46:35.838Z",
    created_by: "seed",
    answer_entry: "AL-2021-1-21E-0612-09"
  }
];

export const questions = [
  {
    question: "2021-21E-03",
    column_total: true,
    year: 2021,
    form_id: "1",
    row_total: true,
    label:
      "What is the unduplicated number of children &&&VARIABLE&&& ever enrolled during the quarter?",
    last_modified_by: "seed",
    type: "datagridwithtotals",
    rows: [
      {
        col6: "% of FPL 301-317",
        col4: "% of FPL 201-250",
        col5: "% of FPL 251-300",
        col2: "% of FPL 0-133",
        col3: "% of FPL 134-200",
        col1: ""
      },
      {
        col6: null,
        col4: null,
        col5: null,
        col2: null,
        col3: null,
        col1: "A. Fee-for-Service"
      },
      {
        col6: null,
        col4: null,
        col5: null,
        col2: null,
        col3: null,
        col1: "B. Managed Care Arrangements"
      },
      {
        col6: null,
        col4: null,
        col5: null,
        col2: null,
        col3: null,
        col1: "C. Primary Care Case Management"
      }
    ],
    created_by: "seed",
    form: "21E",
    created_date: "2021-01-15T12:46:35.838Z",
    last_modified: "2021-01-15T12:46:35.838Z"
  },
  {
    question: "2021-21E-02",
    column_total: true,
    year: 2021,
    form_id: "1",
    row_total: true,
    label:
      "What is the unduplicated number of new enrollees &&&VARIABLE&&& in the quarter?",
    last_modified_by: "seed",
    type: "datagridwithtotals",
    rows: [
      {
        col6: "% of FPL 301-317",
        col4: "% of FPL 201-250",
        col5: "% of FPL 251-300",
        col2: "% of FPL 0-133",
        col3: "% of FPL 134-200",
        col1: ""
      },
      {
        col6: null,
        col4: null,
        col5: null,
        col2: null,
        col3: null,
        col1: "A. Fee-for-Service"
      },
      {
        col6: null,
        col4: null,
        col5: null,
        col2: null,
        col3: null,
        col1: "B. Managed Care Arrangements"
      },
      {
        col6: null,
        col4: null,
        col5: null,
        col2: null,
        col3: null,
        col1: "C. Primary Care Case Management"
      }
    ],
    created_by: "seed",
    form: "21E",
    created_date: "2021-01-15T12:46:35.838Z",
    last_modified: "2021-01-15T12:46:35.838Z"
  },
  {
    question: "2021-21E-01",
    column_total: true,
    year: 2021,
    form_id: "1",
    row_total: true,
    label:
      "What is the unduplicated number of disenrollees &&&VARIABLE&&& in the quarter?",
    last_modified_by: "seed",
    type: "datagridwithtotals",
    rows: [
      {
        col6: "% of FPL 301-317",
        col4: "% of FPL 201-250",
        col5: "% of FPL 251-300",
        col2: "% of FPL 0-133",
        col3: "% of FPL 134-200",
        col1: ""
      },
      {
        col6: null,
        col4: null,
        col5: null,
        col2: null,
        col3: null,
        col1: "A. Fee-for-Service"
      },
      {
        col6: null,
        col4: null,
        col5: null,
        col2: null,
        col3: null,
        col1: "B. Managed Care Arrangements"
      },
      {
        col6: null,
        col4: null,
        col5: null,
        col2: null,
        col3: null,
        col1: "C. Primary Care Case Management"
      }
    ],
    created_by: "seed",
    form: "21E",
    created_date: "2021-01-15T12:46:35.838Z",
    last_modified: "2021-01-15T12:46:35.838Z"
  }
];
