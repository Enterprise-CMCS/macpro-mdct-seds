import { describe, expect, it } from "vitest";
import {
  FinalCertifiedStatusFields,
  getStatusDisplay,
  InProgressStatusFields,
  isFinalCertified,
  isInProgress,
  isNotRequired,
  isProvisionalCertified,
  NotRequiredStatusFields,
  ProvisionalCertifiedStatusFields,
} from "./formStatus";

const inProgressDescription = "In Progress";
const provCertDescription = "Provisional Data Certified and Submitted";
const finalCertDescription = "Final Data Certified and Submitted";
const notReqDescription = "Not Required";

describe("Form status utilities", () => {
  describe("getStatusDisplay", () => {
    it("should recognize all possible status field combinations", () => {
      expect(getStatusDisplay({ status_id: 1 })).toBe(inProgressDescription);
      expect(getStatusDisplay({ status_id: 2 })).toBe(provCertDescription);
      expect(getStatusDisplay({ status_id: 3 })).toBe(finalCertDescription);
      expect(getStatusDisplay({ status_id: 4 })).toBe(notReqDescription);
    });

    it("should reject impossible status_id values", () => {
      expect(() => getStatusDisplay({ status_id: 0 })).toThrow();
      expect(() => getStatusDisplay({ status_id: 5 })).toThrow();
    });
  });

  describe("The ___StatusFields objects", () => {
    it("should produce the expected statuses", () => {
      expect(isInProgress(InProgressStatusFields())).toBe(true);
      expect(isProvisionalCertified(ProvisionalCertifiedStatusFields())).toBe(
        true
      );
      expect(isFinalCertified(FinalCertifiedStatusFields())).toBe(true);
      expect(isNotRequired(NotRequiredStatusFields())).toBe(true);
    });
  });
});
