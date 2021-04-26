import React from "react";
import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import CertificationTab from "../CertificationTab/CertificationTab";
import CertificationTabMock from "../../provider-mocks/certificationTabMock";
import CertificationTabMock2 from "../../provider-mocks/certificationTabMock2";
import CertificationTabMock3 from "../../provider-mocks/certificationTabMock3";

const mockStore = configureStore([]);

describe("Test CertificationTab.js", () => {
  let wrapper;
  let wrapper2;
  let wrapper3;
  let store = mockStore(CertificationTabMock); // form status = in_progress
  let store2 = mockStore(CertificationTabMock2); // form status = provisional
  let store3 = mockStore(CertificationTabMock3); // form status = final

  beforeEach(() => {
    wrapper = mount(
      <Provider store={store}>
        <CertificationTab />
      </Provider>
    );

    wrapper2 = mount(
      <Provider store={store2}>
        <CertificationTab />
      </Provider>
    );

    wrapper3 = mount(
      <Provider store={store3}>
        <CertificationTab />
      </Provider>
    );
  });

  test("Check for modified_on and modified_by for all three statuses", async () => {
    expect(wrapper.find({ "data-testid": "statusText" }).text()).toMatch(
      "This report was updated to In Progress on 01-15-2021 at 12:46:35 am by Timothy Griesemer"
    );

    expect(wrapper2.find({ "data-testid": "statusText" }).text()).toMatch(
      "This report was updated to Provisional Data Certified and Submitted on 01-15-2021 at 12:46:35 am by Tim Griesemer"
    );

    expect(wrapper3.find({ "data-testid": "statusText" }).text()).toMatch(
      "This report was updated to Final Data Certified and Submitted on 01-15-2021 at 12:46:35 am by Timothy Griesemer"
    );
  });
  test("Check button prop disabled for all three statuses", () => {
    expect(wrapper.find("button").at(0).prop("disabled")).toBe(false);
    expect(wrapper.find("button").at(1).prop("disabled")).toBe(false);
    expect(wrapper.find("button").at(2).exists()).toBe(false);

    expect(wrapper2.find("button").at(0).prop("disabled")).toBe(true);
    expect(wrapper2.find("button").at(1).prop("disabled")).toBe(false);
    expect(wrapper.find("button").at(2).exists()).toBe(false);

    expect(wrapper3.find("button").at(0).prop("disabled")).toBe(true);
    expect(wrapper3.find("button").at(1).prop("disabled")).toBe(true);
    expect(wrapper3.find("button").at(2).exists()).toBe(true);
  });

  test("Check truthy text for all three statuses", () => {
    expect(
      wrapper
        .find({ "data-testid": "certificationText" })
        .find("b")
        .at(0)
        .text()
    ).toMatch("Ready to certify?");

    expect(
      wrapper2
        .find({ "data-testid": "certificationText" })
        .find("b")
        .at(0)
        .text()
    ).toMatch("Ready to final certify?");

    expect(
      wrapper3
        .find({ "data-testid": "certificationText" })
        .find("b")
        .at(0)
        .text()
    ).toMatch("Thank you for submitting your SEDS data!");
  });
});
