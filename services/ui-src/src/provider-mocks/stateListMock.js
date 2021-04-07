import * as states from "../../../../src/database/initial_data_load/states";

const stateListMock = {
  global: {
    stateList: [
      {
        label: "Alabama",
        value: "AL"
      },
      {
        label: "Alaska",
        value: "AK"
      },
      {
        label: "Arizona",
        value: "AZ"
      },
      {
        label: "Arkansas",
        value: "AR"
      },
      {
        label: "California",
        value: "CA"
      },
      {
        label: "Colorado",
        value: "CO"
      },
      {
        label: "Connecticut",
        value: "CT"
      },
      {
        label: "Delaware",
        value: "DE"
      },
      {
        label: "District Of Columbia",
        value: "DC"
      },
      {
        label: "Florida",
        value: "FL"
      },
      {
        label: "Georgia",
        value: "GA"
      },
      {
        label: "Hawaii",
        value: "HI"
      },
      {
        label: "Idaho",
        value: "ID"
      },
      {
        label: "Illinois",
        value: "IL"
      },
      {
        label: "Indiana",
        value: "IN"
      },
      {
        label: "Iowa",
        value: "IA"
      },
      {
        label: "Kansas",
        value: "KS"
      },
      {
        label: "Kentucky",
        value: "KY"
      },
      {
        label: "Louisiana",
        value: "LA"
      },
      {
        label: "Maine",
        value: "ME"
      },
      {
        label: "Maryland",
        value: "MD"
      },
      {
        label: "Massachusetts",
        value: "MA"
      },
      {
        label: "Michigan",
        value: "MI"
      },
      {
        label: "Minnesota",
        value: "MN"
      },
      {
        label: "Mississippi",
        value: "MS"
      },
      {
        label: "Missouri",
        value: "MO"
      },
      {
        label: "Montana",
        value: "MT"
      },
      {
        label: "Nebraska",
        value: "NE"
      },
      {
        label: "Nevada",
        value: "NV"
      },
      {
        label: "New Hampshire",
        value: "NH"
      },
      {
        label: "New Jersey",
        value: "NJ"
      },
      {
        label: "New Mexico",
        value: "NM"
      },
      {
        label: "New York",
        value: "NY"
      },
      {
        label: "North Carolina",
        value: "NC"
      },
      {
        label: "North Dakota",
        value: "ND"
      },
      {
        label: "Ohio",
        value: "OH"
      },
      {
        label: "Oklahoma",
        value: "OK"
      },
      {
        label: "Oregon",
        value: "OR"
      },
      {
        label: "Pennsylvania",
        value: "PA"
      },
      {
        label: "Rhode Island",
        value: "RI"
      },
      {
        label: "South Carolina",
        value: "SC"
      },
      {
        label: "South Dakota",
        value: "SD"
      },
      {
        label: "Tennessee",
        value: "TN"
      },
      {
        label: "Texas",
        value: "TX"
      },
      {
        label: "Utah",
        value: "UT"
      },
      {
        label: "Vermont",
        value: "VT"
      },
      {
        label: "Virginia",
        value: "VA"
      },
      {
        label: "Washington",
        value: "WA"
      },
      {
        label: "West Virginia",
        value: "WV"
      },
      {
        label: "Wisconsin",
        value: "WI"
      },
      {
        label: "Wyoming",
        value: "WY"
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

export default stateListMock;
