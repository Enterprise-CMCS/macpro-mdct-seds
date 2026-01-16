import * as matchers from "@testing-library/jest-dom/matchers";
import { afterEach, expect, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// @testing-library defines custom matchers for DOM nodes.
// It allows us to assert things like:
//     expect(element).toHaveTextContent(/react/i)
// Learn more: https://github.com/testing-library/jest-dom
// Since vitest is so jest-like, there is no separate TL package for it.
expect.extend(matchers);

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

vi.mock("./utility-functions/environment", () => ({
  MODE: "production",
  BASE_URL: "mdctcartsdev.cms.gov",
}));

HTMLCanvasElement.prototype.getContext = () => {
  /* Nothing; we don't unit test our jsPDF integration */
};
