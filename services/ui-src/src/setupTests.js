// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

jest.mock("aws-amplify", () => ({
  Auth: {
    currentSession: jest.fn().mockReturnValue({
      getIdToken: () => ({
        getJwtToken: () => "eyJLongToken"
      }),
      idToken: {
        payload: {
          email: "testEmail@email.com"
        }
      }
    }),
    currentAuthenticatedUser: () => {},
    configure: () => {},
    signOut: async () => {},
    federatedSignIn: () => {},
    signIn: () => {}
  },
  API: {
    get: () => {},
    post: () => {},
    put: () => {},
    del: () => {},
    configure: () => {}
  },
  Hub: {
    listen: jest.fn()
  }
}));

jest.mock("./utility-functions/constants", () => ({
  MODE: "production",
  BASE_URL: "mdctcartsdev.cms.gov"
}));

HTMLCanvasElement.prototype.getContext = () => {
  /* Nothing; we don't unit test our jsPDF integration */
};
