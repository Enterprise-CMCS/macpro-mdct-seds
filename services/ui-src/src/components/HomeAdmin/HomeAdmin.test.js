import React from "react";
import { mount } from "enzyme";
import HomeAdmin from "./HomeAdmin";
import { Link } from "react-router-dom";

describe("Tests for HomeAdmin.js", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(<HomeAdmin />);
  });

  test("Ensure HomeAdmin exists", () => {
    expect(wrapper.find(".HomeAdmin").length).toBe(1);
  });

  test("Ensure links are visible", () => {
    expect(wrapper.containsMatchingElement(<Link />));
  });

  test("Ensure view/edit user link exists", () => {
    let anchor = wrapper
      .find(".user-view-edit")
      .children()
      .find("a")
      .prop("href");
    expect(anchor).toEqual("/#/users");
  });
  test("Ensure add user link exists", () => {
    let anchor = wrapper.find(".user-add").children().find("a").prop("href");
    expect(anchor).toEqual("/#/users/add");
  });
});
