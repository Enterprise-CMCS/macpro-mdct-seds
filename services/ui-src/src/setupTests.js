// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";

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

jest.mock("./util/constants", () => ({
  MODE: "production",
  BASE_URL: "mdctcartsdev.cms.gov",
}));
