import { InProgressStatusFields } from "../utility-functions/formStatus";

const currentFormMock_21E = {
  currentForm: {
    questions: [
      {
        question: "2021-21E-01",
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
        question: "2021-21E-03",
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
      },
      {
        question: "2021-21E-04",
        column_total: true,
        year: 2021,
        form_id: "1",
        row_total: true,
        label:
          "What is the number of member-months of enrollment for &&&VARIABLE&&& in the quarter?",
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
        question: "2021-21E-05",
        column_total: true,
        year: 2021,
        form_id: "1",
        row_total: true,
        label:
          "What is the average number of months of enrollment for &&&VARIABLE&&& ever enrolled during the quarter?",
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
            col6: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col6",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col4",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col5",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col2",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col3",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col1: "A. Fee-for-Service"
          },
          {
            col6: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col6",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col4",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col5",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col2",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col3",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col1: "B. Managed Care Arrangements"
          },
          {
            col6: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col6",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col4",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='21E-2021-04')].rows[3].col5",
                  "$..*[?(@.question=='21E-2021-01')].rows[3].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col2",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col3",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col1: "C. Primary Care Case Management"
          }
        ],
        created_by: "seed",
        form: "21E",
        readonly: true,
        comment:
          "Divide the entries in Question 4 by the entries in Question 1.",
        created_date: "2021-01-15T12:46:35.838Z",
        last_modified: "2021-01-15T12:46:35.838Z"
      },
      {
        question: "2021-21E-06",
        column_total: true,
        year: 2021,
        form_id: "1",
        row_total: true,
        label:
          "What is the number of children, pregnant women or waiver adults &&&VARIABLE&&& enrolled at the end of the quarter?",
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
            col6: 5,
            col4: 3,
            col5: 4,
            col2: 1,
            col3: 2,
            col1: "A. Fee-for-Service"
          },
          {
            col6: 1,
            col4: 3,
            col5: 21,
            col2: 5,
            col3: 4,
            col1: "B. Managed Care Arrangements"
          },
          {
            col6: 5,
            col4: 3,
            col5: 4,
            col2: 1,
            col3: 2,
            col1: "C. Primary Care Case Management"
          }
        ],
        created_by: "seed",
        form: "21E",
        created_date: "2021-01-15T12:46:35.838Z",
        last_modified: "2021-01-15T12:46:35.838Z"
      },
      {
        question: "2021-21E-07",
        column_total: true,
        year: 2021,
        form_id: "1",
        row_total: true,
        label:
          "What is the unduplicated number of children &&&VARIABLE&&& ever enrolled during the year?",
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
            col6: 9,
            col4: 7,
            col5: 8,
            col2: 5,
            col3: 6,
            col1: "A. Fee-for-Service"
          },
          {
            col6: 5,
            col4: 8,
            col5: 4,
            col2: 4,
            col3: 2,
            col1: "B. Managed Care Arrangements"
          },
          {
            col6: 3,
            col4: 1,
            col5: 2,
            col2: 3,
            col3: 2,
            col1: "C. Primary Care Case Management"
          }
        ],
        created_by: "seed",
        context_data: {
          show_if_quarter_in: ["4"]
        },
        form: "21E",
        created_date: "2021-01-15T12:46:35.838Z",
        last_modified: "2021-01-15T12:46:35.838Z"
      },
      {
        question: "2021-21E-08",
        column_total: true,
        year: 2021,
        form_id: "1",
        row_total: true,
        label:
          "What is the unduplicated number of new enrollees &&&VARIABLE&&& during the year?",
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
            col6: 1,
            col4: 3,
            col5: 2,
            col2: 5,
            col3: 4,
            col1: "A. Fee-for-Service"
          },
          {
            col6: 5,
            col4: 3,
            col5: 4,
            col2: 1,
            col3: 2,
            col1: "B. Managed Care Arrangements"
          },
          {
            col6: 1,
            col4: 3,
            col5: 2,
            col2: 5,
            col3: 4,
            col1: "C. Primary Care Case Management"
          }
        ],
        created_by: "seed",
        context_data: {
          show_if_quarter_in: ["4"]
        },
        form: "21E",
        created_date: "2021-01-15T12:46:35.838Z",
        last_modified: "2021-01-15T12:46:35.838Z"
      },
      {
        question: "2021-21E-09",
        column_total: true,
        year: 2021,
        form_id: "1",
        row_total: true,
        label:
          "What is the unduplicated number of disenrollees &&&VARIABLE&&& during the year?",
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
            col6: 5,
            col4: 3,
            col5: 4,
            col2: 1,
            col3: 2,
            col1: "A. Fee-for-Service"
          },
          {
            col6: 1,
            col4: 3,
            col5: 2,
            col2: 5,
            col3: 4,
            col1: "B. Managed Care Arrangements"
          },
          {
            col6: 5,
            col4: 3,
            col5: 4,
            col2: 1,
            col3: 2,
            col1: "C. Primary Care Case Management"
          }
        ],
        created_by: "seed",
        context_data: {
          show_if_quarter_in: ["4"]
        },
        form: "21E",
        created_date: "2021-01-15T12:46:35.838Z",
        last_modified: "2021-01-15T12:46:35.838Z"
      }
    ],
    answers: [
      {
        answer_entry: "AL-2021-1-21E-0000-01",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-01",
        ageRange: "Under Age 0",
        rangeId: "0000",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: 1,
            col3: 2,
            col4: 3,
            col5: 4,
            col6: 5
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: 3,
            col3: 4,
            col4: 5,
            col5: 6,
            col6: 7
          },
          {
            col1: "C. Primary Care Case Management",
            col2: 6,
            col3: 7,
            col4: 8,
            col5: 9,
            col6: 0
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0000-02",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-02",
        ageRange: "Under Age 0",
        rangeId: "0000",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: 1,
            col3: 2,
            col4: 3,
            col5: 4,
            col6: 5
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: 4,
            col3: 5,
            col4: 6,
            col5: 7,
            col6: 8
          },
          {
            col1: "C. Primary Care Case Management",
            col2: 9,
            col3: 0,
            col4: 3,
            col5: 5,
            col6: 2
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0000-03",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-03",
        ageRange: "Under Age 0",
        rangeId: "0000",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: 6,
            col3: 45,
            col4: 3,
            col5: 2,
            col6: 1
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: 6,
            col3: 34,
            col4: 73,
            col5: 56,
            col6: 39
          },
          {
            col1: "C. Primary Care Case Management",
            col2: 4,
            col3: 234,
            col4: 34,
            col5: 73,
            col6: 34
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0000-04",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-04",
        ageRange: "Under Age 0",
        rangeId: "0000",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: 98,
            col3: 4,
            col4: 3,
            col5: 457,
            col6: 4
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: 4,
            col3: 5,
            col4: 9,
            col5: 3,
            col6: 1
          },
          {
            col1: "C. Primary Care Case Management",
            col2: 8,
            col3: 7,
            col4: 3,
            col5: 2,
            col6: 1
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0000-05",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-05",
        ageRange: "Under Age 0",
        rangeId: "0000",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col2",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col3",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col4",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col5",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col6: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col6",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ]
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col2",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col3",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col4",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col5",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col6: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col6",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ]
          },
          {
            col1: "C. Primary Care Case Management",
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col2",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col3",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col4",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='21E-2021-04')].rows[3].col5",
                  "$..*[?(@.question=='21E-2021-01')].rows[3].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col6: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col6",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ]
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0000-06",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-06",
        ageRange: "Under Age 0",
        rangeId: "0000",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0000-07",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-07",
        ageRange: "Under Age 0",
        rangeId: "0000",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0000-08",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-08",
        ageRange: "Under Age 0",
        rangeId: "0000",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0000-09",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-09",
        ageRange: "Under Age 0",
        rangeId: "0000",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0001-01",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-01",
        ageRange: "Ages 0 - 1",
        rangeId: "0001",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: 1,
            col3: 2,
            col4: 3,
            col5: 4,
            col6: 5
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: 1,
            col3: 2,
            col4: 3,
            col5: 4,
            col6: 5
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0001-02",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-02",
        ageRange: "Ages 0 - 1",
        rangeId: "0001",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0001-03",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-03",
        ageRange: "Ages 0 - 1",
        rangeId: "0001",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0001-04",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-04",
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0001-05",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-05",
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col2",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col3",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col4",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col5",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col6: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col6",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ]
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col2",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col3",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col4",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col5",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col6: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col6",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ]
          },
          {
            col1: "C. Primary Care Case Management",
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col2",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col3",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col4",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='21E-2021-04')].rows[3].col5",
                  "$..*[?(@.question=='21E-2021-01')].rows[3].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col6: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col6",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ]
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0001-06",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-06",
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0001-07",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-07",
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0001-08",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-08",
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0001-09",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-09",
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0105-01",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-01",
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0105-02",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-02",
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0105-03",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-03",
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0105-04",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-04",
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0105-05",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-05",
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col2",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col3",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col4",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col5",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col6: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col6",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ]
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col2",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col3",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col4",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col5",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col6: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col6",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ]
          },
          {
            col1: "C. Primary Care Case Management",
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col2",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col3",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col4",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='21E-2021-04')].rows[3].col5",
                  "$..*[?(@.question=='21E-2021-01')].rows[3].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col6: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col6",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ]
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0105-06",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-06",
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0105-07",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-07",
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0105-08",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-08",
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0105-09",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-09",
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0612-01",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-01",
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0612-02",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-02",
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0612-03",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-03",
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0612-04",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-04",
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0612-05",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-05",
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col2",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col3",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col4",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col5",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col6: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col6",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ]
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col2",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col3",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col4",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col5",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col6: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col6",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ]
          },
          {
            col1: "C. Primary Care Case Management",
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col2",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col3",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col4",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='21E-2021-04')].rows[3].col5",
                  "$..*[?(@.question=='21E-2021-01')].rows[3].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col6: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col6",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ]
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0612-06",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-06",
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0612-07",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-07",
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0612-08",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-08",
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-0612-09",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-09",
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-1318-01",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-01",
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-1318-02",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-02",
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-1318-03",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-03",
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-1318-04",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-04",
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-1318-05",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-05",
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col2",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col3",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col4",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col5",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col6: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[1].col6",
                  "$..*[?(@.question=='2021-21E-01')].rows[1].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ]
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col2",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col3",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col4",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col5",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col6: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[2].col6",
                  "$..*[?(@.question=='2021-21E-01')].rows[2].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ]
          },
          {
            col1: "C. Primary Care Case Management",
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col2",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col3",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col4",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='21E-2021-04')].rows[3].col5",
                  "$..*[?(@.question=='21E-2021-01')].rows[3].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col6: [
              {
                targets: [
                  "$..*[?(@.question=='2021-21E-04')].rows[3].col6",
                  "$..*[?(@.question=='2021-21E-01')].rows[3].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ]
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-1318-06",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-06",
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-1318-07",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-07",
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-1318-08",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-08",
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      },
      {
        answer_entry: "AL-2021-1-21E-1318-09",
        state_form: "AL-2021-1-21E",
        question: "2021-21E-09",
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        rows: [
          {
            col1: "",
            col2: "% of FPL 0-133",
            col3: "% of FPL 134-200",
            col4: "% of FPL 201-250",
            col5: "% of FPL 251-300",
            col6: "% of FPL 301-317"
          },
          {
            col1: "A. Fee-for-Service",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "B. Managed Care Arrangements",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          },
          {
            col1: "C. Primary Care Case Management",
            col2: null,
            col3: null,
            col4: null,
            col5: null,
            col6: null
          }
        ],
        last_modified: "2021-01-15T12:46:35.838Z",
        last_modified_by: "seed",
        created_date: "2021-01-15T12:46:35.838Z",
        created_by: "seed"
      }
    ],
    statusData: {
      status_modified_by: "seed",
      status_date: "01-15-2021",
      year: 2021,
      state_comments: [
        {
          type: "text_multiline",
          entry:
            "This is an example of summary notes on the state form 21E for AL"
        }
      ],
      form_id: "1",
      last_modified_by: "seed",
      created_by: "seed",
      validation_percent: 0.03,
      form: "21E",
      program_code: "AL",
      state_form: "AL-2021-1-21E",
      state_id: "AL",
      created_date: "01-15-2021",
      form_name: "Number of Children Served in Separate CHIP Program",
      last_modified: "2021-01-15T12:46:35.838Z",
      quarter: 1,
      ...InProgressStatusFields()
    },
    tabs: ["0000", "0001", "0105", "0612", "1318"]
  }
};

export default currentFormMock_21E;
