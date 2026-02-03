import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateEnrollmentTotals,
  generateQuarterForms,
  getForm,
  listFormsForQuarter,
  getCurrentUser,
  getUserById,
  listUsers,
  listFormsForState,
  getTemplate,
  listTemplateYears,
  updateForm,
  updateTemplate,
  updateTotals,
  updateUser,
} from "./api";

const mockResponse = (method) => ({
  response: {
    body: {
      text: () => Promise.resolve(`{"responseAttr":"${method}"}`),
    },
  },
});

const mockGet = vi
  .fn()
  .mockImplementation(() => mockResponse("mock get response"));
const mockPost = vi
  .fn()
  .mockImplementation(() => mockResponse("mock post response"));

vi.mock("aws-amplify/api", () => ({
  get: (args) => mockGet(args),
  post: (args) => mockPost(args),
}));

vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn().mockResolvedValue({
    tokens: {
      idToken: "mock-token",
    },
  }),
}));

const expectedHeaders = { "x-api-key": "mock-token" };

describe("libs/api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should make the expected API call for listUsers", async () => {
    const response = await listUsers();
    expect(mockGet).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/users",
      options: { headers: expectedHeaders },
    });
  });

  it("should make the expected API call for getUserById", async () => {
    const response = await getUserById("123");
    expect(response.responseAttr).toBe("mock get response");

    expect(mockGet).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/users/123",
      options: { headers: expectedHeaders },
    });
  });

  it("should make the expected API call for getCurrentUser", async () => {
    const response = await getCurrentUser();
    expect(response.responseAttr).toBe("mock get response");
    expect(mockGet).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/getCurrentUser",
      options: { headers: expectedHeaders, body: undefined },
    });
  });

  it("should make the expected API call for updateUser", async () => {
    const mockUser = { userId: "123", state: "CO" };
    const response = await updateUser(mockUser);
    expect(response.responseAttr).toBe("mock post response");
    expect(mockPost).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/users/123",
      options: { headers: expectedHeaders, body: mockUser },
    });
  });

  it("should make the expected API call for listFormsForQuarter", async () => {
    const mockFormPayload = { state: "CO", year: 2025, quarter: 1 };
    const response = await listFormsForQuarter(mockFormPayload);
    expect(response.responseAttr).toBe("mock get response");
    expect(mockGet).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: `/forms/${mockFormPayload.state}/${mockFormPayload.year}/${mockFormPayload.quarter}`,
      options: { headers: expectedHeaders },
    });
  });

  it("should make the expected API call for updateTotals", async () => {
    const mockSavePayload = {
      state: "CO",
      year: 2025,
      quarter: 4,
      form: "GRE",
    };
    const response = await updateTotals(mockSavePayload);
    expect(response.responseAttr).toBe("mock post response");
    expect(mockPost).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: `/forms/${mockSavePayload.state}/${mockSavePayload.year}/${mockSavePayload.quarter}/${mockSavePayload.form}/totals`,
      options: { headers: expectedHeaders, body: mockSavePayload },
    });
  });

  it("should make the expected API call for getForm", async () => {
    const response = await getForm("CO", 2025, 4, "21E");
    expect(response.responseAttr).toBe("mock get response");
    expect(mockGet).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/forms/CO/2025/4/21E",
      options: { headers: expectedHeaders },
    });
  });

  it("should make the expected API call for obtainAvailableForms", async () => {
    const response = await listFormsForState("CO");
    expect(response.responseAttr).toBe("mock get response");
    expect(mockGet).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: `/forms/CO`,
      options: { headers: expectedHeaders },
    });
  });

  it("should make the expected API call for updateForm", async () => {
    const mockSavePayload = {
      statusData: { state_id: "CO", year: 2025, quarter: 4, form: "GRE" },
    };
    const response = await updateForm(mockSavePayload);
    expect(response.responseAttr).toBe("mock post response");
    expect(mockPost).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/forms/CO/2025/4/GRE",
      options: { headers: expectedHeaders, body: mockSavePayload },
    });
  });

  it("should make the expected API call for generateQuarterForms", async () => {
    const mockGeneratePayload = { year: 2022, quarter: 2 };
    const response = await generateQuarterForms(mockGeneratePayload);
    expect(response.responseAttr).toBe("mock post response");
    expect(mockPost).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: `/admin/generate-forms?year=${mockGeneratePayload.year}&quarter=${mockGeneratePayload.quarter}`,
      options: { headers: expectedHeaders },
    });
  });

  it("should make the expected API call for listTemplateYears", async () => {
    const response = await listTemplateYears();
    expect(response.responseAttr).toBe("mock get response");
    expect(mockGet).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/templates",
      options: { headers: expectedHeaders },
    });
  });

  it("should make the expected API call for getTemplate", async () => {
    const mockYear = 2022;
    const response = await getTemplate(mockYear);
    expect(response.responseAttr).toBe("mock get response");
    expect(mockGet).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: `/templates/${mockYear}`,
      options: { headers: expectedHeaders },
    });
  });

  it("should make the expected API call for updateTemplate", async () => {
    const mockFormPayload = { year: 2022, template: { foo: "bar" } };
    const response = await updateTemplate(mockFormPayload);
    expect(response.responseAttr).toBe("mock post response");
    expect(mockPost).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: `/templates/${mockFormPayload.year}`,
      options: { headers: expectedHeaders, body: mockFormPayload },
    });
  });

  it("should make the expected API call for generateEnrollmentTotals", async () => {
    const response = await generateEnrollmentTotals();
    expect(response.responseAttr).toBe("mock post response");
    expect(mockPost).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/admin/generate-totals",
      options: { headers: expectedHeaders },
    });
  });
  /*
    NOTE: The SEDS business owners have requested that the email flow to users be disabled, but would like to be
    able to re-enable it at a future point (see: https://bit.ly/3w3mVmT). For now, this will be commented out and not removed.
  
  it("should make the expected API call for sendUncertifyEmail", async () => {
    const response = await sendUncertifyEmail(mockPayload);
    expect(response.responseAttr).toBe("mock post response");
    expect(mockPost).toHaveBeenCalledWith({
      apiName: "mdct-seds",
      path: "/notification/uncertified",
      options: { headers: expectedHeaders, body: mockPayload }
    });
  });
  */
});
