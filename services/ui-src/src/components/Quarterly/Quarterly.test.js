import React from "react";
import { mount } from "enzyme";
import * as AppContext from "../../libs/contextLib";

import Quarterly from "../Quarterly/Quarterly";
import { BrowserRouter, Route } from "react-router-dom";

// Mock for useLocation
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLocation: () => ({
        pathname: "localhost:3000/#/forms/AL/2021/1"
    })
}));

describe("Quarterly tests", () => {
    test("Check that quarterly is getting the array of state forms", () => {

        // Cache original functionality
        const realUseState = React.useState

        // Stub the initial state
        const mockInitialState = [
            {
                "status_date": "01-15-2021",
                "year": 2021,
                "state_comments": [
                    {
                        "type": "text_multiline",
                        "entry": null
                    }
                ],
                "form_id": "5",
                "last_modified_by": "seed",
                "created_by": "seed",
                "validation_percent": 0.03,
                "form": "GRE",
                "program_code": "AL",
                "state_form": "AL-2021-1-GRE",
                "state_id": "AL",
                "not_applicable": false,
                "created_date": "01-15-2021",
                "form_name": "Gender, Race & Ethnicity",
                "last_modified": "01-15-2021",
                "quarter": 1,
                "status": "Not Started"
            },
            {
                "status_date": "03-02-2021",
                "year": 2021,
                "state_comments": [
                    {
                        "type": "text_multiline",
                        "entry": null
                    }
                ],
                "form_id": "6",
                "last_modified_by": "seed",
                "created_by": "seed",
                "validation_percent": 0.03,
                "form": "21PW",
                "program_code": "AL",
                "state_form": "AL-2021-1-21PW",
                "state_id": "AL",
                "not_applicable": false,
                "created_date": "03-02-2021",
                "form_name": "Number of Pregnant Women Served",
                "last_modified": "03-02-2021",
                "quarter": 1,
                "status": "Not Started"
            },
            {
                "status_date": "01-15-2021",
                "year": 2021,
                "state_comments": [
                    {
                        "type": "text_multiline",
                        "entry": null
                    }
                ],
                "form_id": "3",
                "last_modified_by": "seed",
                "created_by": "seed",
                "validation_percent": 0.03,
                "form": "64.21E",
                "program_code": "AL",
                "state_form": "AL-2021-1-64.21E",
                "state_id": "AL",
                "not_applicable": false,
                "created_date": "01-15-2021",
                "form_name": "Number of Children Served in Medicaid Expansion Program",
                "last_modified": "01-15-2021",
                "quarter": 1,
                "status": "Not Started"
            },
            {
                "status_date": "01-15-2021",
                "year": 2021,
                "state_comments": [
                    {
                        "type": "text_multiline",
                        "entry": null
                    }
                ],
                "form_id": "1",
                "last_modified_by": "seed",
                "created_by": "seed",
                "validation_percent": 0.03,
                "form": "21E",
                "program_code": "AL",
                "state_form": "AL-2021-1-21E",
                "state_id": "AL",
                "not_applicable": false,
                "created_date": "01-15-2021",
                "form_name": "Number of Children Served in Separate CHIP Program",
                "last_modified": "01-15-2021",
                "quarter": 1,
                "status": "Not Started"
            },
            {
                "status_date": "01-15-2021",
                "year": 2021,
                "state_comments": [
                    {
                        "type": "text_multiline",
                        "entry": null
                    }
                ],
                "form_id": "2",
                "last_modified_by": "seed",
                "created_by": "seed",
                "validation_percent": 0.03,
                "form": "64.EC",
                "program_code": "AL",
                "state_form": "AL-2021-1-64.EC",
                "state_id": "AL",
                "not_applicable": false,
                "created_date": "01-15-2021",
                "form_name": "Number of Children Served in Medicaid Program",
                "last_modified": "01-15-2021",
                "quarter": 1,
                "status": "Not Started"
            }
        ];

        // Mock useState before rendering your component
        jest
            .spyOn(React, 'useState')
            .mockImplementationOnce(() => realUseState(mockInitialState))

        const wrapper = mount(
            <BrowserRouter>
                <Quarterly/>
            </BrowserRouter>
        );
        expect(wrapper.find(".page-quarterly").debug()).toBe(1);

    });
});