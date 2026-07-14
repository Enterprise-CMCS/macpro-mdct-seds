import * as matchers from "@testing-library/jest-dom/matchers";
import { afterEach, expect, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// @testing-library defines custom matchers for DOM nodes.
// It allows us to assert things like:
//     expect(element).toHaveTextContent(/react/i)
// Learn more: https://github.com/testing-library/jest-dom
// Since vitest is so jest-like, there is no separate TL package for it.
expect.extend(matchers);

(window as any)._env_ = {
  API_REGION: "us-east-1",
  API_URL: "",
  COGNITO_REGION: "us-east-1",
  COGNITO_IDENTITY_POOL_ID: "",
  COGNITO_USER_POOL_ID: "",
  COGNITO_USER_POOL_CLIENT_ID: "",
  COGNITO_USER_POOL_CLIENT_DOMAIN: "",
  COGNITO_USER_POOL_ENDPOINT: "",
  COGNITO_REDIRECT_SIGNIN: "http://localhost:3000/",
  COGNITO_REDIRECT_SIGNOUT: "http://localhost:3000/",
};

// Explicitly instruct TL to tear down the DOM between each test
afterEach(() => {
  cleanup();
});

vi.mock("aws-amplify", () => ({
  Auth: {
    currentSession: vi.fn().mockReturnValue({
      getIdToken: () => ({
        getJwtToken: () => "eyJLongToken",
      }),
      idToken: {
        payload: {
          email: "testEmail@email.com",
        },
      },
    }),
    currentAuthenticatedUser: () => {},
    configure: () => {},
    signOut: async () => {},
    federatedSignIn: () => {},
    signIn: () => {},
  },
  API: {
    get: () => {},
    post: () => {},
    put: () => {},
    del: () => {},
    configure: () => {},
  },
  Hub: {
    listen: vi.fn(),
  },
}));

HTMLDialogElement.prototype.show = vi.fn();
HTMLDialogElement.prototype.showModal = vi.fn();
HTMLDialogElement.prototype.close = vi.fn();
