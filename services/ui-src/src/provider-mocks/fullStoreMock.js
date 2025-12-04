import { InProgressStatusFields } from "../utility-functions/formStatus";

const fullStoreMock = {
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
        created_date: "2021-04-14T12:46:35.838Z",
        last_modified: "2021-04-14T12:46:35.838Z"
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
        created_date: "2021-04-14T12:46:35.838Z",
        last_modified: "2021-04-14T12:46:35.838Z"
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
        created_date: "2021-04-14T12:46:35.838Z",
        last_modified: "2021-04-14T12:46:35.838Z"
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
        created_date: "2021-04-14T12:46:35.838Z",
        last_modified: "2021-04-14T12:46:35.838Z"
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
                  "$..[?(@.question=='2021-21E-04')].rows[1].col6",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col4",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col5",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col2",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col3",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col3"
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
                  "$..[?(@.question=='2021-21E-04')].rows[2].col6",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col4",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col5",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col2",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col3",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col3"
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
                  "$..[?(@.question=='2021-21E-04')].rows[3].col6",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col4",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col5",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col2",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col3",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col3"
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
        created_date: "2021-04-14T12:46:35.838Z",
        last_modified: "2021-04-14T12:46:35.838Z"
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
        created_date: "2021-04-14T12:46:35.838Z",
        last_modified: "2021-04-14T12:46:35.838Z"
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
        context_data: {
          show_if_quarter_in: ["4"]
        },
        form: "21E",
        created_date: "2021-04-14T12:46:35.838Z",
        last_modified: "2021-04-14T12:46:35.838Z"
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
        context_data: {
          show_if_quarter_in: ["4"]
        },
        form: "21E",
        created_date: "2021-04-14T12:46:35.838Z",
        last_modified: "2021-04-14T12:46:35.838Z"
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
        context_data: {
          show_if_quarter_in: ["4"]
        },
        form: "21E",
        created_date: "2021-04-14T12:46:35.838Z",
        last_modified: "2021-04-14T12:46:35.838Z"
      }
    ],
    answers: [
      {
        ageRange: "Ages 6 - 12",
        rangeId: "0612",
        question: "2021-21E-03",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0612-03"
      },
      {
        ageRange: "Ages 1 - 5",
        rangeId: "0105",
        question: "2021-21E-08",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0105-08"
      },
      {
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        question: "2021-21E-09",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0612-09"
      },
      {
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        question: "2021-21E-02",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0105-02"
      },
      {
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        question: "2021-21E-03",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0001-03"
      },
      {
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        question: "2021-21E-03",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0105-03"
      },
      {
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        question: "2021-21E-01",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-1318-01"
      },
      {
        age_range: "Under Age 0",
        rangeId: "0000",
        question: "2021-21E-03",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0000-03"
      },
      {
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        question: "2021-21E-06",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0001-06"
      },
      {
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        question: "2021-21E-07",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-1318-07"
      },
      {
        age_range: "Under Age 0",
        rangeId: "0000",
        question: "2021-21E-01",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0000-01"
      },
      {
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        question: "2021-21E-05",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
                  "$..[?(@.question=='2021-21E-04')].rows[1].col6",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col4",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col5",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col2",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col3",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col3"
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
                  "$..[?(@.question=='2021-21E-04')].rows[2].col6",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col4",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col5",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col2",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col3",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col3"
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
                  "$..[?(@.question=='2021-21E-04')].rows[3].col6",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col4",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col5",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col2",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col3",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col1: "C. Primary Care Case Management"
          }
        ],
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0001-05"
      },
      {
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        question: "2021-21E-04",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0105-04"
      },
      {
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        question: "2021-21E-09",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0001-09"
      },
      {
        age_range: "Under Age 0",
        rangeId: "0000",
        question: "2021-21E-07",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0000-07"
      },
      {
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        question: "2021-21E-08",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-1318-08"
      },
      {
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        question: "2021-21E-08",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0612-08"
      },
      {
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        question: "2021-21E-06",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-1318-06"
      },
      {
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        question: "2021-21E-01",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0001-01"
      },
      {
        age_range: "Under Age 0",
        rangeId: "0000",
        question: "2021-21E-02",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0000-02"
      },
      {
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        question: "2021-21E-07",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0612-07"
      },
      {
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        question: "2021-21E-05",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
                  "$..[?(@.question=='2021-21E-04')].rows[1].col6",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col4",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col5",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col2",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col3",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col3"
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
                  "$..[?(@.question=='2021-21E-04')].rows[2].col6",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col4",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col5",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col2",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col3",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col3"
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
                  "$..[?(@.question=='2021-21E-04')].rows[3].col6",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col4",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col5",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col2",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col3",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col1: "C. Primary Care Case Management"
          }
        ],
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-1318-05"
      },
      {
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        question: "2021-21E-05",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
                  "$..[?(@.question=='2021-21E-04')].rows[1].col6",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col4",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col5",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col2",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col3",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col3"
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
                  "$..[?(@.question=='2021-21E-04')].rows[2].col6",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col4",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col5",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col2",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col3",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col3"
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
                  "$..[?(@.question=='2021-21E-04')].rows[3].col6",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col4",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col5",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col2",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col3",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col1: "C. Primary Care Case Management"
          }
        ],
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0105-05"
      },
      {
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        question: "2021-21E-01",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0612-01"
      },
      {
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        question: "2021-21E-02",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0612-02"
      },
      {
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        question: "2021-21E-07",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0001-07"
      },
      {
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        question: "2021-21E-02",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0001-02"
      },
      {
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        question: "2021-21E-06",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0612-06"
      },
      {
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        question: "2021-21E-06",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0105-06"
      },
      {
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        question: "2021-21E-09",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0105-09"
      },
      {
        age_range: "Under Age 0",
        rangeId: "0000",
        question: "2021-21E-08",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0000-08"
      },
      {
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        question: "2021-21E-04",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0612-04"
      },
      {
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        question: "2021-21E-05",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
                  "$..[?(@.question=='2021-21E-04')].rows[1].col6",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col4",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col5",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col2",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col3",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col3"
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
                  "$..[?(@.question=='2021-21E-04')].rows[2].col6",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col4",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col5",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col2",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col3",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col3"
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
                  "$..[?(@.question=='2021-21E-04')].rows[3].col6",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col4",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col5",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col2",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col3",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col1: "C. Primary Care Case Management"
          }
        ],
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0612-05"
      },
      {
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        question: "2021-21E-04",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-1318-04"
      },
      {
        age_range: "Under Age 0",
        rangeId: "0000",
        question: "2021-21E-06",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0000-06"
      },
      {
        age_range: "Under Age 0",
        rangeId: "0000",
        question: "2021-21E-09",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0000-09"
      },
      {
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        question: "2021-21E-08",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0001-08"
      },
      {
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        question: "2021-21E-03",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-1318-03"
      },
      {
        age_range: "Under Age 0",
        rangeId: "0000",
        question: "2021-21E-04",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0000-04"
      },
      {
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        question: "2021-21E-01",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0105-01"
      },
      {
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        question: "2021-21E-09",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-1318-09"
      },
      {
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        question: "2021-21E-07",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0105-07"
      },
      {
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        question: "2021-21E-04",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0001-04"
      },
      {
        age_range: "Under Age 0",
        rangeId: "0000",
        question: "2021-21E-05",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
                  "$..[?(@.question=='2021-21E-04')].rows[1].col6",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col4",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col5",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col2",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[1].col3",
                  "$..[?(@.question=='2021-21E-01')].rows[1].col3"
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
                  "$..[?(@.question=='2021-21E-04')].rows[2].col6",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col4",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col5",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col2",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[2].col3",
                  "$..[?(@.question=='2021-21E-01')].rows[2].col3"
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
                  "$..[?(@.question=='2021-21E-04')].rows[3].col6",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col4",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col5",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col2",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..[?(@.question=='2021-21E-04')].rows[3].col3",
                  "$..[?(@.question=='2021-21E-01')].rows[3].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col1: "C. Primary Care Case Management"
          }
        ],
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-0000-05"
      },
      {
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        question: "2021-21E-02",
        state_form: "AL-2021-1-21E",
        last_modified_by: "seed",
        created_date: "2021-04-14T12:46:35.838Z",
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
        last_modified: "2021-04-14T12:46:35.838Z",
        created_by: "seed",
        answer_entry: "AL-2021-1-21E-1318-02"
      }
    ],
    statusData: {
      status_modified_by: "Timothy Griesemer",
      status_date: "2021-01-15T12:46:35.838Z",
      year: 2021,
      state_comments: [
        {
          type: "text_multiline",
          entry: null
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
      created_date: "2021-04-14T12:46:35.838Z",
      form_name: "Number of Children Served in Separate CHIP Program",
      last_modified: "2021-04-14T12:46:35.838Z",
      quarter: 1,
      ...InProgressStatusFields()
    },
    tabs: ["0000", "0001", "0105", "0612", "1318"]
  },
  global: {
    formTypes: [],
    age_ranges: [
      {
        ageRange: "Under Age 0",
        ageDescription: "Conception to birth",
        rangeId: "0000"
      },
      {
        ageRange: "Ages 0 - 1",
        ageDescription: "Birth through age 12 months",
        rangeId: "0001"
      },
      {
        ageRange: "Ages 1 - 5",
        ageDescription: "Age 1 year through age 5 years",
        rangeId: "0105"
      },
      {
        ageRange: "Ages 6 - 12",
        ageDescription: "Age 6 years through age 12 years",
        rangeId: "0612"
      },
      {
        ageRange: "Ages 13 - 18",
        ageDescription: "Age 13 years through age 18 years",
        rangeId: "1318"
      }
    ],
    states: [
      {
        state_name: "Alabama",
        state_id: "AL"
      },
      {
        state_name: "Alaska",
        state_id: "AK"
      },
      {
        state_name: "Arizona",
        state_id: "AZ"
      },
      {
        state_name: "Arkansas",
        state_id: "AR"
      },
      {
        state_name: "California",
        state_id: "CA"
      },
      {
        state_name: "Colorado",
        state_id: "CO"
      },
      {
        state_name: "Connecticut",
        state_id: "CT"
      },
      {
        state_name: "Delaware",
        state_id: "DE"
      },
      {
        state_name: "District Of Columbia",
        state_id: "DC"
      },
      {
        state_name: "Florida",
        state_id: "FL"
      },
      {
        state_name: "Georgia",
        state_id: "GA"
      },
      {
        state_name: "Hawaii",
        state_id: "HI"
      },
      {
        state_name: "Idaho",
        state_id: "ID"
      },
      {
        state_name: "Illinois",
        state_id: "IL"
      },
      {
        state_name: "Indiana",
        state_id: "IN"
      },
      {
        state_name: "Iowa",
        state_id: "IA"
      },
      {
        state_name: "Kansas",
        state_id: "KS"
      },
      {
        state_name: "Kentucky",
        state_id: "KY"
      },
      {
        state_name: "Louisiana",
        state_id: "LA"
      },
      {
        state_name: "Maine",
        state_id: "ME"
      },
      {
        state_name: "Maryland",
        state_id: "MD"
      },
      {
        state_name: "Massachusetts",
        state_id: "MA"
      },
      {
        state_name: "Michigan",
        state_id: "MI"
      },
      {
        state_name: "Minnesota",
        state_id: "MN"
      },
      {
        state_name: "Mississippi",
        state_id: "MS"
      },
      {
        state_name: "Missouri",
        state_id: "MO"
      },
      {
        state_name: "Montana",
        state_id: "MT"
      },
      {
        state_name: "Nebraska",
        state_id: "NE"
      },
      {
        state_name: "Nevada",
        state_id: "NV"
      },
      {
        state_name: "New Hampshire",
        state_id: "NH"
      },
      {
        state_name: "New Jersey",
        state_id: "NJ"
      },
      {
        state_name: "New Mexico",
        state_id: "NM"
      },
      {
        state_name: "New York",
        state_id: "NY"
      },
      {
        state_name: "North Carolina",
        state_id: "NC"
      },
      {
        state_name: "North Dakota",
        state_id: "ND"
      },
      {
        state_name: "Ohio",
        state_id: "OH"
      },
      {
        state_name: "Oklahoma",
        state_id: "OK"
      },
      {
        state_name: "Oregon",
        state_id: "OR"
      },
      {
        state_name: "Pennsylvania",
        state_id: "PA"
      },
      {
        state_name: "Rhode Island",
        state_id: "RI"
      },
      {
        state_name: "South Carolina",
        state_id: "SC"
      },
      {
        state_name: "South Dakota",
        state_id: "SD"
      },
      {
        state_name: "Tennessee",
        state_id: "TN"
      },
      {
        state_name: "Texas",
        state_id: "TX"
      },
      {
        state_name: "Utah",
        state_id: "UT"
      },
      {
        state_name: "Vermont",
        state_id: "VT"
      },
      {
        state_name: "Virginia",
        state_id: "VA"
      },
      {
        state_name: "Washington",
        state_id: "WA"
      },
      {
        state_name: "West Virginia",
        state_id: "WV"
      },
      {
        state_name: "Wisconsin",
        state_id: "WI"
      },
      {
        state_name: "Wyoming",
        state_id: "WY"
      }
    ]
  }
};

export default fullStoreMock;
