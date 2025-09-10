import { beforeEach, describe, expect, it, vi } from "vitest";
import { API } from "aws-amplify";
import {
  createUser,
  generateEnrollmentTotals,
  generateQuarterlyForms,
  getFormTypes,
  getSingleForm,
  getStateForms,
  getUserById,
  listUsers,
  obtainAvailableForms,
  obtainFormTemplate,
  obtainFormTemplateYears,
  obtainUserByEmail,
  saveSingleForm,
  sendUncertifyEmail,
  updateCreateFormTemplate,
  updateStateForm,
  updateUser
} from "./api";

vi.mock("aws-amplify", () => ({
  API: {
    get: vi.fn(),
    post: vi.fn(),
  },
  Auth: {
    currentSession: vi.fn().mockResolvedValue({
      getIdToken: vi.fn().mockReturnValue({
        getJwtToken: vi.fn().mockResolvedValue("mock-token")
      })
    })
  }
}));

const expectedHeaders = { "x-api-key": "mock-token" };
const mockPayload = { foo: "bar" };

describe("libs/api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should make the expected API call for listUsers", async () => {
    const _response = await listUsers();
    expect(API.get).toHaveBeenCalledWith(
      "mdct-seds",
      "/users",
      { headers: expectedHeaders }
    );
  });

  it("should make the expected API call for getUserById", async () => {
    const _response = await getUserById({ userId: "123" });
    expect(API.get).toHaveBeenCalledWith(
      "mdct-seds",
      "/users/123",
      { headers: expectedHeaders }
    );
  });

  it("should make the expected API call for obtainUserByEmail", async () => {
    const _response = await obtainUserByEmail("test@example.com");
    expect(API.post).toHaveBeenCalledWith(
      "mdct-seds",
      "/users/get/email",
      {
        headers: expectedHeaders,
        body: "test@example.com"
      }
    );
  });

  it("should make the expected API call for updateUser", async () => {
    const mockUser = { userId: "123", states: ["CO"]}
    const _response = await updateUser(mockUser);
    expect(API.post).toHaveBeenCalledWith(
      "mdct-seds",
      "/users/update/123",
      {
        headers: expectedHeaders,
        body: mockUser
      }
    );
  });

  it("should make the expected API call for createUser", async () => {
    const _response = await createUser(mockPayload);
    expect(API.post).toHaveBeenCalledWith(
      "mdct-seds",
      "/users/add",
      {
        headers: expectedHeaders,
        body: mockPayload
      }
    );
  });

  it("should make the expected API call for getStateForms", async () => {
    const _response = await getStateForms(mockPayload);
    expect(API.post).toHaveBeenCalledWith(
      "mdct-seds",
      "/forms/obtain-state-forms",
      {
        headers: expectedHeaders,
        body: mockPayload
      }
    );
  });

  it("should make the expected API call for updateStateForm", async () => {
    const _response = await updateStateForm(mockPayload);
    expect(API.post).toHaveBeenCalledWith(
      "mdct-seds",
      "/state-forms/update",
      {
        headers: expectedHeaders,
        body: mockPayload
      }
    );
  });

  it("should make the expected API call for getSingleForm", async () => {
    const _response = await getSingleForm("CO", 2025, 4, "21E");
    expect(API.get).toHaveBeenCalledWith(
      "mdct-seds",
      "/single-form/CO/2025/4/21E",
      { headers: expectedHeaders }
    );
  });

  it("should make the expected API call for getFormTypes", async () => {
    const _response = await getFormTypes();
    expect(API.get).toHaveBeenCalledWith(
      "mdct-seds",
      "/form-types",
      { headers: expectedHeaders }
    );
  });

  it("should make the expected API call for obtainAvailableForms", async () => {
    const _response = await obtainAvailableForms(mockPayload);
    expect(API.post).toHaveBeenCalledWith(
      "mdct-seds",
      "/forms/obtainAvailableForms",
      {
        headers: expectedHeaders,
        body: mockPayload
      }
    );
  });

  it("should make the expected API call for saveSingleForm", async () => {
    const _response = await saveSingleForm(mockPayload);
    expect(API.post).toHaveBeenCalledWith(
      "mdct-seds",
      "/single-form/save",
      {
        headers: expectedHeaders,
        body: mockPayload
      }
    );
  });

  it("should make the expected API call for generateQuarterlyForms", async () => {
    const _response = await generateQuarterlyForms(mockPayload);
    expect(API.post).toHaveBeenCalledWith(
      "mdct-seds",
      "/generate-forms",
      {
        headers: expectedHeaders,
        body: mockPayload
      }
    );
  });

  it("should make the expected API call for obtainFormTemplateYears", async () => {
    const _response = await obtainFormTemplateYears(mockPayload);
    expect(API.post).toHaveBeenCalledWith(
      "mdct-seds",
      "/form-templates/years",
      {
        headers: expectedHeaders,
        body: mockPayload
      }
    );
  });

  it("should make the expected API call for obtainFormTemplate", async () => {
    const _response = await obtainFormTemplate(mockPayload);
    expect(API.post).toHaveBeenCalledWith(
      "mdct-seds",
      "/form-template",
      {
        headers: expectedHeaders,
        body: mockPayload
      }
    );
  });

  it("should make the expected API call for updateCreateFormTemplate", async () => {
    const _response = await updateCreateFormTemplate(mockPayload);
    expect(API.post).toHaveBeenCalledWith(
      "mdct-seds",
      "/form-templates/add",
      {
        headers: expectedHeaders,
        body: mockPayload
      }
    );
  });

  it("should make the expected API call for generateEnrollmentTotals", async () => {
    const _response = await generateEnrollmentTotals(mockPayload);
    expect(API.post).toHaveBeenCalledWith(
      "mdct-seds",
      "/generate-enrollment-totals",
      {
        headers: expectedHeaders,
        body: mockPayload
      }
    );
  });

  it("should make the expected API call for sendUncertifyEmail", async () => {
    const _response = await sendUncertifyEmail(mockPayload);
    expect(API.post).toHaveBeenCalledWith(
      "mdct-seds",
      "/notification/uncertified",
      {
        headers: expectedHeaders,
        body: mockPayload
      }
    );
  });
});
