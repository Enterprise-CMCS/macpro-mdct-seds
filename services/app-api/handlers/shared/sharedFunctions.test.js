import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addToQuestionTable,
  createFormTemplate,
  fetchOrCreateQuestions,
  findExistingStateForms,
  getAnswersSet,
  getFormDescriptions,
  getFormResultByStateString,
  getQuarter,
  getQuestionsByYear,
  getStatesList,
  getUncertifiedStates,
  getUncertifiedStatesAndForms,
  getUsersEmailByRole,
  replaceFormYear,
} from "./sharedFunctions.js";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockBatchWrite = vi.fn().mockResolvedValue({ UnprocessedItems: {} });
mockDynamo.on(BatchWriteCommand).callsFake(mockBatchWrite);
const mockPut = vi.fn();
mockDynamo.on(PutCommand).callsFake(mockPut);
const mockQuery = vi.fn();
mockDynamo.on(QueryCommand).callsFake(mockQuery);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

describe("sharedFunctions.js", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("getUsersEmailByRole", () => {
    it("should fetch user info from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 2,
        Items: [
          { states: ["CO"], email: "stateuserCO@test.com" },
          { states: ["TX"], email: "stateuserTX@test.com" },
        ],
      });

      const result = await getUsersEmailByRole("state");

      expect(result).toEqual([
        { state: ["CO"], email: "stateuserCO@test.com" },
        { state: ["TX"], email: "stateuserTX@test.com" },
      ]);
      expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({
        TableName: "local-auth-user",
        Select: "ALL_ATTRIBUTES",
        ExpressionAttributeNames: { "#r": "role" },
        ExpressionAttributeValues: { ":role": "state" },
        FilterExpression: "#r = :role",
      }), expect.any(Function));
    });

    it("should return an empty array if no users can be found", async () => {
      mockScan.mockResolvedValueOnce({ Count: 0 });

      const result = await getUsersEmailByRole("state");

      expect(result).toEqual([]);
    });
  });

  describe("getUncertifiedStates", () => {
    it("should fetch unique uncertified state IDs from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 3,
        Items: [
          { state_id: "CO" },
          { state_id: "TX" },
          { state_id: "CO" },
        ],
      });

      const result = await getUncertifiedStates(2025, 1);

      expect(result).toEqual(["CO", "TX"]);
      expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({
        TableName: "local-state-forms",
        Select: "ALL_ATTRIBUTES",
        ExpressionAttributeNames: {
          "#theYear": "year",
          "#theQuarter": "quarter",
        },
        ExpressionAttributeValues: {
          ":in_progress": 1,
          ":year": 2025,
          ":quarter": 1,
        },
        FilterExpression: "status_id = :in_progress AND #theYear = :year AND #theQuarter = :quarter",
      }), expect.any(Function));
    });

    it("should return an explanatory mesage if no uncertified forms can be found", async () => {
      mockScan.mockResolvedValueOnce({ Count: 0 });

      const result = await getUncertifiedStates(2025, 1);

      expect(result).toEqual([
        {
          message: expect.stringMatching(/There are no states .* In Progress/),
        },
      ]);
    });
  });

  describe("getUncertifiedStatesAndForms", () => {
    it("should fetch unique uncertified state IDs from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 3,
        Items: [
          { state_id: "CO", form: "F1" },
          { state_id: "TX", form: "F1" },
          { state_id: "CO", form: "F2" },
        ],
      });

      const result = await getUncertifiedStatesAndForms(2025, 1);

      expect(result).toEqual([
        { state: "CO", form: ["F1", "F2"]},
        { state: "TX", form: ["F1"]},
      ]);
      expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({
        TableName: "local-state-forms",
        Select: "ALL_ATTRIBUTES",
        ExpressionAttributeNames: {
          "#theYear": "year",
          "#theQuarter": "quarter",
        },
        ExpressionAttributeValues: {
          ":in_progress": 1,
          ":year": 2025,
          ":quarter": 1,
        },
        FilterExpression: "status_id = :in_progress AND #theYear = :year AND #theQuarter = :quarter",
      }), expect.any(Function));
    });

    it("should sort form IDs within each state's result", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 3,
        Items: [
          { state_id: "CO", form: "F2" },
          { state_id: "CO", form: "F3" },
          { state_id: "CO", form: "F1" },
        ],
      });

      const result = await getUncertifiedStatesAndForms(2025, 1);

      expect(result).toEqual([
        { state: "CO", form: ["F1", "F2", "F3"]},
      ]);
    });

    it("should return an explanatory mesage if no uncertified forms can be found", async () => {
      mockScan.mockResolvedValueOnce({ Count: 0 });

      const result = await getUncertifiedStatesAndForms(2025, 1);

      expect(result).toEqual([
        {
          message: expect.stringMatching(/There are no states .* In Progress/),
        },
      ]);
    });
  });

  describe("getQuestionsByYear", () => {
    it("should query questions from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 2,
        Items: [{ question: "Q1" }, { question: "Q2" }],
      });

      const result = await getQuestionsByYear("2025");

      expect(result).toEqual([{ question: "Q1" }, { question: "Q2" }]);
      expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({
        TableName: "local-form-questions",
        ExpressionAttributeNames: { "#theYear": "year" },
        ExpressionAttributeValues: { ":specifiedYear": 2025 },
        FilterExpression: "#theYear = :specifiedYear",
      }), expect.any(Function));
    });
  });

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

  describe("getFormDescriptions", () => {
    it("should query states from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 2,
        Items: [{ form: "F1" }, { form: "F2" }],
      });

      const result = await getFormDescriptions();

      expect(result).toEqual([{ form: "F1" }, { form: "F2" }]);
      expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({
        TableName: "local-forms",
      }), expect.any(Function));
    });
  });

  describe("getFormResultByStateString", () => {
    it("should query states from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 2,
        Items: [{ form: "F1" }, { form: "F2" }],
      });

      const result = await getFormResultByStateString("CO-2025-1-A");

      expect(result).toEqual([{ form: "F1" }, { form: "F2" }]);
      expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({
        TableName: "local-form-answers",
        ExpressionAttributeValues: { ":state_form": "CO-2025-1-A" },
        FilterExpression: "state_form = :state_form",
      }), expect.any(Function));
    });
  });

  describe("getAnswersSet", () => {
    it("should query answer form IDs from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 2,
        Items: [{ state_form: "F1" }, { state_form: "F2" }],
      });

      const result = await getAnswersSet();

      expect(result).toEqual(new Set(["F1", "F2"]));
      expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({
        TableName: "local-form-answers",
      }), expect.any(Function));
    });
  });

  describe("findExistingStateForms", () => {
    it("should query state form IDs from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 2,
        Items: [{ state_form: "F1" }, { state_form: "F2" }],
      });

      const result = await findExistingStateForms(2025, 1);

      expect(result).toEqual(["F1", "F2"]);
      expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({
        TableName: "local-state-forms",
        ExpressionAttributeNames: { "#theYear": "year" },
        ExpressionAttributeValues: { ":year": 2025, ":quarter": 1 },
        FilterExpression: "#theYear = :year and quarter = :quarter",
        ProjectionExpression: "state_form",
      }), expect.any(Function));
    });
  });

  describe("fetchOrCreateQuestions", () => {
    it("should write template questions to the database", async () => {
      mockQuery.mockResolvedValueOnce({
        Count: 1,
        Items: [{
          template: [{ questionId: "2025-Q1" }, { questionId: "2025-Q2" }],
        }],
      });

      const result = await fetchOrCreateQuestions("2025");

      expect(result).toEqual({
        status: 200,
        message: "Questions added to form questions table from template",
        payload: [{ questionId: "2025-Q1" }, { questionId: "2025-Q2" }],
      });
      expect(mockQuery).toHaveBeenCalledWith({
        TableName: "local-form-templates",
        ExpressionAttributeNames: { "#theYear": "year" },
        ExpressionAttributeValues: { ":year": 2025 },
        KeyConditionExpression: "#theYear = :year",
      }, expect.any(Function));
    });

    it("should copy last year's form template if needed", async () => {
      mockQuery.mockResolvedValueOnce({ Count: 0 });
      mockScan.mockResolvedValueOnce({
        Count: 1,
        Items: [{
          template: [{ questionId: "2024-Q1" }, { questionId: "2024-Q2" }],
        }],
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
      expect(mockPut).toHaveBeenCalledWith(expect.objectContaining({
        TableName: "local-form-templates",
      }), expect.any(Function));
    });

    it("should return an error if there are no templates, this year or last", async () => {
      mockQuery.mockResolvedValueOnce({ Count: 0 });
      mockScan.mockResolvedValueOnce({ Count: 0 });

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

      expect(mockBatchWrite).toHaveBeenCalledTimes(2);
      expect(mockBatchWrite).toHaveBeenCalledWith({
        RequestItems: {
          "local-form-questions": [
            {
              PutRequest: {
                Item: {
                  questionId: "Q1",
                  year: 2025,
                  created_date: expect.stringMatching(ISO_DATE_REGEX),
                  last_modified: expect.stringMatching(ISO_DATE_REGEX),
                },
              },
            },
            {
              PutRequest: {
                Item: {
                  questionId: "Q2",
                  year: 2025,
                  created_date: expect.stringMatching(ISO_DATE_REGEX),
                  last_modified: expect.stringMatching(ISO_DATE_REGEX),
                },
              },
            },
          ],
        },
      }, expect.any(Function));
      expect(mockBatchWrite).toHaveBeenCalledWith({
        RequestItems: {
          "local-form-questions": [
            {
              PutRequest: {
                Item: {
                  questionId: "Q3",
                  year: 2025,
                  created_date: expect.stringMatching(ISO_DATE_REGEX),
                  last_modified: expect.stringMatching(ISO_DATE_REGEX),
                },
              },
            },
            {
              PutRequest: {
                Item: {
                  questionId: "Q4",
                  year: 2025,
                  created_date: expect.stringMatching(ISO_DATE_REGEX),
                  last_modified: expect.stringMatching(ISO_DATE_REGEX),
                },
              },
            },
          ],
        },
      }, expect.any(Function));
    });
  });

  describe("createFormTemplate", () => {
    it("should write data to dynamo", async () => {
      const result = await createFormTemplate("2025", [{ questionId: "Q1 "}]);

      expect(result).toEqual({
        status: 200,
        message: "Template updated for 2025!",
      });
      expect(mockPut).toHaveBeenCalledWith({
        TableName: "local-form-templates",
        Item: {
          year: 2025,
          template: [{ questionId: "Q1 "}],
          lastSynced: expect.stringMatching(ISO_DATE_REGEX),
        },
      }, expect.any(Function));
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

  describe("getQuarter", () => {
    it("should return the federal fiscal quarter for the given date", () => {
      // Note that we're dodging exact quarter boundaries by a day or few,
      // to avoid any issues with time zones.
      expect(getQuarter(new Date("2025-01-02"))).toBe(2);
      expect(getQuarter(new Date("2025-03-28"))).toBe(2);
      expect(getQuarter(new Date("2025-04-02"))).toBe(3);
      expect(getQuarter(new Date("2025-06-28"))).toBe(3);
      expect(getQuarter(new Date("2025-07-02"))).toBe(4);
      expect(getQuarter(new Date("2025-09-28"))).toBe(4);
      expect(getQuarter(new Date("2025-10-02"))).toBe(1);
      expect(getQuarter(new Date("2025-12-28"))).toBe(1);
    });
  })
});
