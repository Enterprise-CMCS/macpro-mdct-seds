const mockCurrentForm_6421E = {
  currentForm: {
    questions: [
      {
        question: "2021-64.21E-01",
        column_total: true,
        year: 2021,
        form_id: "3",
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
        form: "64.21E",
        created_date: "01/15/2021",
        last_modified: "01/15/2021"
      },
      {
        question: "2021-64.21E-02",
        column_total: true,
        year: 2021,
        form_id: "3",
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
        form: "64.21E",
        created_date: "01/15/2021",
        last_modified: "01/15/2021"
      },
      {
        question: "2021-64.21E-03",
        column_total: true,
        year: 2021,
        form_id: "3",
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
        form: "64.21E",
        created_date: "01/15/2021",
        last_modified: "01/15/2021"
      },
      {
        question: "2021-64.21E-04",
        column_total: true,
        year: 2021,
        form_id: "3",
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
        form: "64.21E",
        created_date: "01/15/2021",
        last_modified: "01/15/2021"
      },
      {
        question: "2021-64.21E-05",
        column_total: true,
        year: 2021,
        form_id: "3",
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
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col6",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col4",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col5",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col2",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col3",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col3"
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
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col6",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col4",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col5",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col2",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col3",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col3"
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
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col6",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col4",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col5",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col2",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col3",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col1: "C. Primary Care Case Management"
          }
        ],
        created_by: "seed",
        form: "64.21E",
        readonly: true,
        comment:
          "Divide the entries in Question 4 by the entries in Question 1.",
        created_date: "01/15/2021",
        last_modified: "01/15/2021"
      },
      {
        question: "2021-64.21E-06",
        column_total: true,
        year: 2021,
        form_id: "3",
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
        form: "64.21E",
        created_date: "01/15/2021",
        last_modified: "01/15/2021"
      },
      {
        question: "2021-64.21E-07",
        column_total: true,
        year: 2021,
        form_id: "3",
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
          show_if_quarter_in: "4"
        },
        form: "64.21E",
        created_date: "01/15/2021",
        last_modified: "01/15/2021"
      },
      {
        question: "2021-64.21E-08",
        column_total: true,
        year: 2021,
        form_id: "3",
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
          show_if_quarter_in: "4"
        },
        form: "64.21E",
        created_date: "01/15/2021",
        last_modified: "01/15/2021"
      },
      {
        question: "2021-64.21E-09",
        column_total: true,
        year: 2021,
        form_id: "3",
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
          show_if_quarter_in: "4"
        },
        form: "64.21E",
        created_date: "01/15/2021",
        last_modified: "01/15/2021"
      }
    ],
    answers: [
      {
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        question: "2021-64.21E-09",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0001-09"
      },
      {
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        question: "2021-64.21E-08",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0612-08"
      },
      {
        age_range: "Under Age 0",
        rangeId: "0000",
        question: "2021-64.21E-05",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col6",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col4",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col5",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col2",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col3",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col3"
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
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col6",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col4",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col5",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col2",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col3",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col3"
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
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col6",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col4",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col5",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col2",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col3",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col1: "C. Primary Care Case Management"
          }
        ],
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0000-05"
      },
      {
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        question: "2021-64.21E-09",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-1318-09"
      },
      {
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        question: "2021-64.21E-01",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0001-01"
      },
      {
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        question: "2021-64.21E-04",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0612-04"
      },
      {
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        question: "2021-64.21E-04",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0001-04"
      },
      {
        age_range: "Under Age 0",
        rangeId: "0000",
        question: "2021-64.21E-07",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0000-07"
      },
      {
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        question: "2021-64.21E-05",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col6",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col4",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col5",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col2",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col3",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col3"
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
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col6",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col4",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col5",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col2",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col3",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col3"
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
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col6",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col4",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col5",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col2",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col3",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col1: "C. Primary Care Case Management"
          }
        ],
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-1318-05"
      },
      {
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        question: "2021-64.21E-09",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0105-09"
      },
      {
        age_range: "Under Age 0",
        rangeId: "0000",
        question: "2021-64.21E-09",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0000-09"
      },
      {
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        question: "2021-64.21E-06",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-1318-06"
      },
      {
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        question: "2021-64.21E-02",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0105-02"
      },
      {
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        question: "2021-64.21E-07",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0612-07"
      },
      {
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        question: "2021-64.21E-06",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0105-06"
      },
      {
        age_range: "Under Age 0",
        rangeId: "0000",
        question: "2021-64.21E-04",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0000-04"
      },
      {
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        question: "2021-64.21E-07",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0001-07"
      },
      {
        age_range: "Under Age 0",
        rangeId: "0000",
        question: "2021-64.21E-02",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0000-02"
      },
      {
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        question: "2021-64.21E-01",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-1318-01"
      },
      {
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        question: "2021-64.21E-05",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col6",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col4",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col5",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col2",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col3",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col3"
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
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col6",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col4",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col5",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col2",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col3",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col3"
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
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col6",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col4",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col5",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col2",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col3",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col1: "C. Primary Care Case Management"
          }
        ],
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0001-05"
      },
      {
        age_range: "Under Age 0",
        rangeId: "0000",
        question: "2021-64.21E-08",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0000-08"
      },
      {
        age_range: "Under Age 0",
        rangeId: "0000",
        question: "2021-64.21E-06",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0000-06"
      },
      {
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        question: "2021-64.21E-01",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0105-01"
      },
      {
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        question: "2021-64.21E-02",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-1318-02"
      },
      {
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        question: "2021-64.21E-07",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-1318-07"
      },
      {
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        question: "2021-64.21E-06",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0001-06"
      },
      {
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        question: "2021-64.21E-03",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0612-03"
      },
      {
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        question: "2021-64.21E-08",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0001-08"
      },
      {
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        question: "2021-64.21E-08",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-1318-08"
      },
      {
        age_range: "Under Age 0",
        rangeId: "0000",
        question: "2021-64.21E-03",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0000-03"
      },
      {
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        question: "2021-64.21E-04",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-1318-04"
      },
      {
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        question: "2021-64.21E-07",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0105-07"
      },
      {
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        question: "2021-64.21E-04",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0105-04"
      },
      {
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        question: "2021-64.21E-03",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0001-03"
      },
      {
        age_range: "Ages 0 - 1",
        rangeId: "0001",
        question: "2021-64.21E-02",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0001-02"
      },
      {
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        question: "2021-64.21E-02",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0612-02"
      },
      {
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        question: "2021-64.21E-09",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0612-09"
      },
      {
        age_range: "Under Age 0",
        rangeId: "0000",
        question: "2021-64.21E-01",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0000-01"
      },
      {
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        question: "2021-64.21E-08",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0105-08"
      },
      {
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        question: "2021-64.21E-01",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0612-01"
      },
      {
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        question: "2021-64.21E-03",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0105-03"
      },
      {
        age_range: "Ages 1 - 5",
        rangeId: "0105",
        question: "2021-64.21E-05",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col6",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col4",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col5",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col2",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col3",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col3"
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
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col6",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col4",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col5",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col2",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col3",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col3"
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
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col6",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col4",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col5",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col2",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col3",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col1: "C. Primary Care Case Management"
          }
        ],
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0105-05"
      },
      {
        age_range: "Ages 13 - 18",
        rangeId: "1318",
        question: "2021-64.21E-03",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-1318-03"
      },
      {
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        question: "2021-64.21E-05",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col6",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col4",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col5",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col2",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[1].col3",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[1].col3"
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
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col6",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col4",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col5",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col2",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[2].col3",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[2].col3"
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
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col6",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col6"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col4: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col4",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col4"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col5: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col5",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col5"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col2: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col2",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col2"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col3: [
              {
                targets: [
                  "$..*[?(@.question=='2021-64.21E-04')].rows[3].col3",
                  "$..*[?(@.question=='2021-64.21E-01')].rows[3].col3"
                ],
                actions: ["formula"],
                formula: "<0> / <1>"
              }
            ],
            col1: "C. Primary Care Case Management"
          }
        ],
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0612-05"
      },
      {
        age_range: "Ages 6 - 12",
        rangeId: "0612",
        question: "2021-64.21E-06",
        state_form: "AL-2021-1-64.21E",
        last_modified_by: "seed",
        created_date: "01/15/2021",
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
        last_modified: "01/15/2021",
        created_by: "seed",
        answer_entry: "AL-2021-1-64.21E-0612-06"
      }
    ],
    statusData: {
      status_date: "01-15-2021",
      year: 2021,
      state_comments: [
        {
          type: "text_multiline",
          entry: null
        }
      ],
      form_id: "3",
      last_modified_by: "seed",
      created_by: "seed",
      validation_percent: 0.03,
      form: "64.21E",
      program_code: "AL",
      state_form: "AL-2021-1-64.21E",
      state_id: "AL",
      not_applicable: false,
      created_date: "01-15-2021",
      form_name: "Number of Children Served in Medicaid Expansion Program",
      last_modified: "01-15-2021",
      quarter: 1,
      status: "Not Started"
    },
    tabs: ["0000", "0001", "0105", "0612", "1318"]
  }
};

export default mockCurrentForm_6421E;
