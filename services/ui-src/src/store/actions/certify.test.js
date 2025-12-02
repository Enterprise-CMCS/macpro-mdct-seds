import { describe, expect, it, vi } from "vitest";
import {
  certifyAndSubmitFinal,
  certifyAndSubmitProvisional,
  uncertify
} from "./certify";

vi.mock("store/reducers/singleForm/singleForm", () => ({
  getUsername: vi.fn()
}));
const mockDispatch = vi.fn();

describe("Test certify", () => {
  it("Test certifyAndSubmitFinal", async () => {
    await certifyAndSubmitFinal()(mockDispatch);
    expect(mockDispatch).toHaveBeenCalled();
  });
  it("Test certifyAndSubmitProvisional", async () => {
    await certifyAndSubmitProvisional()(mockDispatch);
    expect(mockDispatch).toHaveBeenCalled();
  });
  it("Test uncertify", async () => {
    await uncertify()(mockDispatch);
    expect(mockDispatch).toHaveBeenCalled();
  });
});
