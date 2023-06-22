import React from "react";
import { mount } from "enzyme";
import HomeAdmin from "./HomeAdmin";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
const mockStore = configureStore([]);
const mockUser = {
  Items: [
    {
      status: "success",
      email: "email@email.com",
      name: "Test User",
      states: ["CA"],
      role: "state"
    }
  ]
};
jest.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: () => Promise.resolve(mockUser)
}));
jest.mock("../../libs/api", () => ({
  obtainUserByEmail: () => mockUser
}));

describe("Tests for HomeAdmin.js", () => {
  let wrapper;
  let store;

  let fakeUser = {
    jwtToken:
      "eyJraWQiOiJXcVBXbU1IdkNiUE9lRlE0NUxKZnoyRG1iVEdIUnFyU3RKOW02RDhFNkJnPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIxMjEwNDhhNS01NDkwLTQ2N2YtOTE1NC1mMjIyMjJkNTA3OTEiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfNUY4RUxQbHA2IiwiY29nbml0bzp1c2VybmFtZSI6IjEyMTA0OGE1LTU0OTAtNDY3Zi05MTU0LWYyMjIyMmQ1MDc5MSIsImdpdmVuX25hbWUiOiJBbGV4aXMiLCJhdWQiOiI3ZTg5cGIzYzF0Z2M0cWpjYWdkZDVwc2ZwZSIsImN1c3RvbTppc21lbWJlcm9mIjoiQ0hJUF9EX1VTRVJfR1JPVVBfQURNSU4iLCJldmVudF9pZCI6ImQ5ZjQ1ODI3LWNjNjQtNGNmZi1hMTFhLTkxNDZmNTYzZDQxMiIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjIzMjYyNDYyLCJleHAiOjE2MjMyNjYwNjIsImlhdCI6MTYyMzI2MjQ2MiwiZmFtaWx5X25hbWUiOiJXb29kYnVyeSIsImVtYWlsIjoiYXdvb2RidXJ5QGNvbGxhYnJhbGluay5jb20ifQ.HswCApuuuDrd-9yNQtEhKg-WDS3dLU5q2F-79fPVKcbhaBDSdkmyD2AsKTDsXL_3PiKVWo4ylfhQUdWA6lFeol9FwT6K9M2aoT5ZmD0hBgTmSUF7TZoSQPQ-05u8q3V7R8Vmmmvs9AYmq10hUFyodknrnCx2Psx37y_QpTNJbEBDSw9haIK9qsEEiB7PS_1ys8sXfzNZfgKgZhAYCgi61JMflc31Gf1w-NMb9-qC0cpMx9b2rlKKSuSxWBA9H48UTsyxIjIoh0I9GJpmflWAkDqCYFRx4ZqB_EGhW3P1w_nL1MlBNF8904aGuAQL-ytZHSbRjw9X_Pjzx8oweEl6qw",
    payload: {
      sub: "121048a5-5490-467f-9154-f22222d50791",
      email_verified: true,
      iss: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_5F8ELPlp6",
      "cognito:username": "121048a5-5490-467f-9154-f22222d50791",
      given_name: "Alexis",
      aud: "7e89pb3c1tgc4qjcagdd5psfpe",
      "custom:ismemberof": "CHIP_D_USER_GROUP_ADMIN",
      event_id: "d9f45827-cc64-4cff-a11a-9146f563d412",
      token_use: "id",
      auth_time: 1623262462,
      exp: 1623266062,
      iat: 1623262462,
      family_name: "Woodbury",
      email: "awoodbury@collabralink.com",
      "app-role": "admin"
    },
    attributes: {
      sub: "121048a5-5490-467f-9154-f22222d50791",
      email_verified: true,
      iss: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_5F8ELPlp6",
      "cognito:username": "121048a5-5490-467f-9154-f22222d50791",
      given_name: "Alexis",
      aud: "7e89pb3c1tgc4qjcagdd5psfpe",
      "custom:ismemberof": "CHIP_D_USER_GROUP_ADMIN",
      event_id: "d9f45827-cc64-4cff-a11a-9146f563d412",
      token_use: "id",
      auth_time: 1623262462,
      exp: 1623266062,
      iat: 1623262462,
      family_name: "Woodbury",
      email: "awoodbury@collabralink.com",
      "app-role": "admin"
    }
  };

  beforeEach(() => {
    store = mockStore(fullStoreMock);

    wrapper = mount(
      <BrowserRouter>
        <Provider store={store}>
          <HomeAdmin user={fakeUser} />
        </Provider>
      </BrowserRouter>
    );
  });

  test("Ensure HomeAdmin exists", () => {
    expect(wrapper.find(".HomeAdmin").length).toBe(1);
  });

  test("Ensure links are visible", () => {
    expect(wrapper.find({ "data-testid": "HomeAdmin" }).length).toBe(1);
  });
});
