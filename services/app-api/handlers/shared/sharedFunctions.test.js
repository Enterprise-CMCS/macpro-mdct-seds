import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addToQuestionTable,
  createFormTemplate,
  fetchOrCreateQuestions,
  getStatesList,
} from "./sharedFunctions.js";
import { getTemplate, putTemplate } from "../../storage/formTemplates.js";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { writeAllFormQuestions } from "../../storage/formQuestions.js";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);

vi.mock("../../storage/formTemplates.js", () => ({
  getTemplate: vi.fn(),
  putTemplate: vi.fn(),
}));

vi.mock("../../storage/formQuestions.js", () => ({
  writeAllFormQuestions: vi.fn(),
}));

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

describe("sharedFunctions.js", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("getStatesList", () => {
    it("should query states from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 2,
        Items: [{ state_id: "CO" }, { state_id: "TX" }],
      });

      const result = await getStatesList();

      expect(result).toEqual([{ state_id: "CO" }, { state_id: "TX" }]);
      expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({
        TableName: "local-states",
      }), expect.any(Function));
    });
  });

  describe("fetchOrCreateQuestions", () => {
    it("should write template questions to the database", async () => {
      getTemplate.mockResolvedValueOnce({
        template: [{ questionId: "2025-Q1" }, { questionId: "2025-Q2" }],
      });

      const result = await fetchOrCreateQuestions(2025);

      expect(result).toEqual({
        status: 200,
        message: "Questions added to form questions table from template",
        payload: [{ questionId: "2025-Q1" }, { questionId: "2025-Q2" }],
      });
      expect(getTemplate).toHaveBeenCalledWith(2025);
    });

    it("should copy last year's form template if needed", async () => {
      getTemplate
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({
          template: [{ questionId: "2024-Q1" }, { questionId: "2024-Q2" }],
        });

      const result = await fetchOrCreateQuestions("2025");

      expect(result).toEqual({
        status: 200,
        message: "Questions added to form questions table from template",
        payload: [
          {
            questionId: "2025-Q1",
            created_date: expect.stringMatching(ISO_DATE_REGEX),
            last_modified: expect.stringMatching(ISO_DATE_REGEX),
          },
          {
            questionId: "2025-Q2",
            created_date: expect.stringMatching(ISO_DATE_REGEX),
            last_modified: expect.stringMatching(ISO_DATE_REGEX),
          }
        ],
      });
      expect(putTemplate).toHaveBeenCalled();
    });

    it("should return an error if there are no templates, this year or last", async () => {
      getTemplate
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)

      const result = await fetchOrCreateQuestions("2025");

      expect(result).toEqual({
        status: 500,
        message: "Failed to generate form template, check requested year",
      });
    });
  });

  describe("addToQuestionTable", () => {
    it("should write questions to dynamo, in two batches", async () => {
      const questionsForThisYear = [
        { questionId: "Q1" },
        { questionId: "Q2" },
        { questionId: "Q3" },
        { questionId: "Q4" },
      ];
      const result = await addToQuestionTable(questionsForThisYear, "2025");
      
      expect(result).toEqual({
        status: 200,
        message: "Questions added to form questions table from template",
      });

      expect(writeAllFormQuestions).toHaveBeenCalledWith([
        {
          questionId: "Q1",
          year: 2025,
          created_date: expect.stringMatching(ISO_DATE_REGEX),
          last_modified: expect.stringMatching(ISO_DATE_REGEX),
        },
        {
          questionId: "Q2",
          year: 2025,
          created_date: expect.stringMatching(ISO_DATE_REGEX),
          last_modified: expect.stringMatching(ISO_DATE_REGEX),
        },
        {
          questionId: "Q3",
          year: 2025,
          created_date: expect.stringMatching(ISO_DATE_REGEX),
          last_modified: expect.stringMatching(ISO_DATE_REGEX),
        },
        {
          questionId: "Q4",
          year: 2025,
          created_date: expect.stringMatching(ISO_DATE_REGEX),
          last_modified: expect.stringMatching(ISO_DATE_REGEX),
        },
      ]);
    });
  });

  describe("createFormTemplate", () => {
    it("should write data to dynamo", async () => {
      const result = await createFormTemplate("2025", [{ questionId: "Q1 "}]);

      expect(result).toEqual({
        status: 200,
        message: "Template updated for 2025!",
      });
      expect(putTemplate).toHaveBeenCalledWith({
        year: 2025,
        template: [{ questionId: "Q1 "}],
        lastSynced: expect.stringMatching(ISO_DATE_REGEX),
      });
    });

    it("should return an error if year is missing", async () => {
      const result = await createFormTemplate(undefined, [{ questionId: "Q1 "}]);

      expect(result).toEqual({
        status: 422,
        message: "Please specify both a year and a template",
      });
    });

    it("should return an error if data is missing", async () => {
      const result = await createFormTemplate("2025", null);

      expect(result).toEqual({
        status: 422,
        message: "Please specify both a year and a template",
      });
    });
  });
});
