import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateEnrollmentTotals,
  generateQuarterlyForms,
  getSingleForm,
  getStateForms,
  getCurrentUser,
  getUserById,
  listUsers,
  obtainAvailableForms,
  obtainFormTemplate,
  obtainFormTemplateYears,
  saveSingleForm,
  sendUncertifyEmail,
  updateCreateFormTemplate,
  updateStateForm,
  updateUser
} from "./api";

const mockResponse = method => ({
  response: {
    body: {
      text: () => Promise.resolve(`{"responseAttr":"${method}"}`)
    }
  }
});

const mockGet = vi
  .fn()
  .mockImplementation(() => mockResponse("mock get response"));
const mockPost = vi
  .fn()
  .mockImplementation(() => mockResponse("mock post response"));

vi.mock("aws-amplify/api", () => ({
  get: args => mockGet(args),
  post: args => mockPost(args)
}));

vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn().mockResolvedValue({
    tokens: {
      idToken: "mock-token"
    }
  })
}));

const expectedHeaders = { "x-api-key": "mock-token" };
const mockPayload = { foo: "bar" };

describe("libs/api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should make the expected API call for listUsers", async () => {
    const response = await listUsers();
    expect(mockGet).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/users",
      options: { headers: expectedHeaders }
    });
  });

  it("should make the expected API call for getUserById", async () => {
    const response = await getUserById({ userId: "123" });
    expect(response.responseAttr).toBe("mock get response");

    expect(mockGet).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/users/123",
      options: { headers: expectedHeaders }
    });
  });

  it("should make the expected API call for getCurrentUser", async () => {
    const response = await getCurrentUser();
    expect(response.responseAttr).toBe("mock get response");
    expect(mockGet).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/getCurrentUser",
      options: { headers: expectedHeaders, body: undefined }
    });
  });

  it("should make the expected API call for updateUser", async () => {
    const mockUser = { userId: "123", state: "CO" };
    const response = await updateUser(mockUser);
    expect(response.responseAttr).toBe("mock post response");
    expect(mockPost).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/users/123",
      options: { headers: expectedHeaders, body: mockUser }
    });
  });

  it("should make the expected API call for getStateForms", async () => {
    const response = await getStateForms(mockPayload);
    expect(response.responseAttr).toBe("mock post response");
    expect(mockPost).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/forms/obtain-state-forms",
      options: { headers: expectedHeaders, body: mockPayload }
    });
  });

  it("should make the expected API call for updateStateForm", async () => {
    const response = await updateStateForm(mockPayload);
    expect(response.responseAttr).toBe("mock post response");
    expect(mockPost).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/state-forms/update",
      options: { headers: expectedHeaders, body: mockPayload }
    });
  });

  it("should make the expected API call for getSingleForm", async () => {
    const response = await getSingleForm("CO", 2025, 4, "21E");
    expect(response.responseAttr).toBe("mock get response");
    expect(mockGet).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/single-form/CO/2025/4/21E",
      options: { headers: expectedHeaders }
    });
  });

  it("should make the expected API call for obtainAvailableForms", async () => {
    const response = await obtainAvailableForms(mockPayload);
    expect(response.responseAttr).toBe("mock post response");
    expect(mockPost).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/forms/obtainAvailableForms",
      options: { headers: expectedHeaders, body: mockPayload }
    });
  });

  it("should make the expected API call for saveSingleForm", async () => {
    const response = await saveSingleForm(mockPayload);
    expect(response.responseAttr).toBe("mock post response");
    expect(mockPost).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/single-form/save",
      options: { headers: expectedHeaders, body: mockPayload }
    });
  });

  it("should make the expected API call for generateQuarterlyForms", async () => {
    const response = await generateQuarterlyForms(mockPayload);
    expect(response.responseAttr).toBe("mock post response");
    expect(mockPost).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/generate-forms",
      options: { headers: expectedHeaders, body: mockPayload }
    });
  });

  it("should make the expected API call for obtainFormTemplateYears", async () => {
    const response = await obtainFormTemplateYears(mockPayload);
    expect(response.responseAttr).toBe("mock post response");
    expect(mockPost).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/form-templates/years",
      options: { headers: expectedHeaders, body: mockPayload }
    });
  });

  it("should make the expected API call for obtainFormTemplate", async () => {
    const response = await obtainFormTemplate(mockPayload);
    expect(response.responseAttr).toBe("mock post response");
    expect(mockPost).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/form-template",
      options: { headers: expectedHeaders, body: mockPayload }
    });
  });

  it("should make the expected API call for updateCreateFormTemplate", async () => {
    const response = await updateCreateFormTemplate(mockPayload);
    expect(response.responseAttr).toBe("mock post response");
    expect(mockPost).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/form-templates/add",
      options: { headers: expectedHeaders, body: mockPayload }
    });
  });

  it("should make the expected API call for generateEnrollmentTotals", async () => {
    const response = await generateEnrollmentTotals(mockPayload);
    expect(response.responseAttr).toBe("mock post response");
    expect(mockPost).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/generate-enrollment-totals",
      options: { headers: expectedHeaders, body: mockPayload }
    });
  });

  it("should make the expected API call for sendUncertifyEmail", async () => {
    const response = await sendUncertifyEmail(mockPayload);
    expect(response.responseAttr).toBe("mock post response");
    expect(mockPost).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/notification/uncertified",
      options: { headers: expectedHeaders, body: mockPayload }
    });
  });
});
