import { describe, expect, it } from "vitest";
import {
  isFormId,
  isFormType,
  isIntegral,
  isStateAbbr,
  isStatusId,
  readFormIdentifiersFromPath,
} from "./parsing.ts";
import { APIGatewayProxyEvent } from "../shared/types.ts";

describe("Common parsing functions", () => {
  describe("isStateAbbr", () => {
    it("should accept state abbreviations", () => {
      expect(isStateAbbr("CO")).toBe(true);
    });

    it("should reject non-strings", () => {
      expect(isStateAbbr(undefined)).toBe(false);
      expect(isStateAbbr(null)).toBe(false);
      expect(isStateAbbr(42)).toBe(false);
    });

    it("should reject strings of the wrong length", () => {
      expect(isStateAbbr("")).toBe(false);
      expect(isStateAbbr("C")).toBe(false);
      expect(isStateAbbr("COW")).toBe(false);
    });

    it("should reject lowercase strings", () => {
      expect(isStateAbbr("co")).toBe(false);
    });
  });

  describe("isIntegral", () => {
    it("should accept strings consisting of digits", () => {
      expect(isIntegral("0")).toBe(true);
      expect(isIntegral("000")).toBe(true);
      expect(isIntegral("1234567890")).toBe(true);
    });

    it("should reject non-strings", () => {
      expect(isIntegral(undefined)).toBe(false);
      expect(isIntegral(null)).toBe(false);
      expect(isIntegral(123)).toBe(false);
    });

    it("should reject strings containing non-digit characters", () => {
      expect(isIntegral("abc")).toBe(false);
      expect(isIntegral("l33t")).toBe(false);
      expect(isIntegral("1.5")).toBe(false);
      expect(isIntegral("6e23")).toBe(false);
      expect(isIntegral("0xF00D")).toBe(false);
    });
  });

  describe("isFormType", () => {
    it("should accept form type abbreviations", () => {
      expect(isFormType("21E")).toBe(true);
      expect(isFormType("64.EC")).toBe(true);
      expect(isFormType("64.21E")).toBe(true);
      expect(isFormType("64.ECI")).toBe(true);
      expect(isFormType("GRE")).toBe(true);
      expect(isFormType("21PW")).toBe(true);
    });

    it("should reject non-strings", () => {
      expect(isFormType(undefined)).toBe(false);
      expect(isFormType(null)).toBe(false);
      expect(isFormType({})).toBe(false);
    });

    it("should reject all other strings", () => {
      expect(isFormType("")).toBe(false);
      expect(isFormType("5")).toBe(false);
      expect(isFormType("Number of Pregnant Women Served")).toBe(false);
      expect(isFormType("an infinite list of other strings")).toBe(false);
    });
  });

  describe("isFormId", () => {
    it("should accept well-formatted state_form strings", () => {
      expect(isFormId("CO-2026-1-21E")).toBe(true);
      expect(isFormId("TX-1999-2-21PW")).toBe(true);
      expect(isFormId("WI-3039-4-64.EC")).toBe(true);
    });

    it("should reject non-strings", () => {
      expect(isFormId(undefined)).toBe(false);
      expect(isFormId(null)).toBe(false);
      expect(isFormId(123)).toBe(false);
    });

    it("should reject strings that are not well-formid", () => {
      expect(isFormId("co-2026-1-21E")).toBe(false);
      expect(isFormId("COLO-2026-1-21E")).toBe(false);
      expect(isFormId("CO.2026.1.21E")).toBe(false);
      expect(isFormId("CO-26-1-21E")).toBe(false);
      expect(isFormId("CO-2026-X-21E")).toBe(false);
      expect(isFormId("CO-2026-5-21E")).toBe(false);
      expect(isFormId("CO-2026-1-21e")).toBe(false);
    });
  });

  describe("isStatusId", () => {
    it("should accept known status_id values", () => {
      expect(isStatusId(1)).toBe(true);
      expect(isStatusId(2)).toBe(true);
      expect(isStatusId(3)).toBe(true);
      expect(isStatusId(4)).toBe(true);
    });

    it("should reject all other values", () => {
      expect(isStatusId(undefined)).toBe(false);
      expect(isStatusId(null)).toBe(false);
      expect(isStatusId(0)).toBe(false);
      expect(isStatusId(5)).toBe(false);
      expect(isStatusId("InProgress")).toBe(false);
      expect(isStatusId("In Progress")).toBe(false);
    });
  });

  describe("readFormIdentifiersFromPath", () => {
    const goodParams = {
      state: "CO",
      year: "2026",
      quarter: "1",
      form: "21E",
    } as Record<string, string>;
    const mockEvent = { pathParameters: goodParams } as APIGatewayProxyEvent;

    it("should parse state, year, quarter, and form type from the path", () => {
      expect(readFormIdentifiersFromPath(mockEvent)).toEqual({
        state: "CO",
        year: 2026,
        quarter: 1,
        form: "21E",
      });
    });

    it("should reject events with invalid path parameters", () => {
      const assertRejects = (partialParams: Record<string, string>) => {
        const event = {
          ...mockEvent,
          pathParameters: {
            ...goodParams,
            ...partialParams,
          },
        };
        expect(readFormIdentifiersFromPath(event)).not.toBeDefined();
      };

      assertRejects({ state: "41" });
      assertRejects({ year: "abc" });
      assertRejects({ quarter: "Q" });
      assertRejects({ form: "42E" });
    });
  });
});
