import { beforeEach, describe, expect, it, vi } from "vitest";
import dynamodbLib from "./dynamodb-lib.ts";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
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
const mockUpdate = vi.fn();
mockDynamo.on(UpdateCommand).callsFake(mockUpdate);

describe("DynamoDB library functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("scan", () => {
    it("should gather all items across multiple requests", async () => {
      mockScan
        .mockResolvedValueOnce({ Items: [1], LastEvaluatedKey: "a" })
        .mockResolvedValueOnce({ Items: [2, 3], LastEvaluatedKey: "b" })
        .mockResolvedValueOnce({ LastEvaluatedKey: "c" })
        .mockResolvedValueOnce({ Items: [4] });

      const result = await dynamodbLib.scan({});

      expect(result).toEqual({
        Count: 4,
        Items: [1, 2, 3, 4],
      });
      for (let mockStartKey of ["a", "b", "c"]) {
        expect(mockScan).toHaveBeenCalledWith(
          expect.objectContaining({
            ExclusiveStartKey: mockStartKey,
          }),
          expect.any(Function)
        );
      }
    });
  });

  describe("putMultiple", () => {
    it("should batch items appropriately", async () => {
      mockBatchWrite.mockResolvedValue({});
      const items = [...new Array(60)].map((_, id) => ({ id }));

      await dynamodbLib.putMultiple("mockTableName", items, (item) => item.id);

      expect(mockBatchWrite).toHaveBeenCalledTimes(3);
      const batchSizes = mockBatchWrite.mock.calls.map(
        (call) => call[0].RequestItems.mockTableName.length
      );
      expect(batchSizes).toEqual([25, 25, 10]);
      const processedItems = mockBatchWrite.mock.calls.flatMap((call) =>
        call[0].RequestItems.mockTableName.map((req) => req.PutRequest.Item)
      );
      expect(processedItems).toEqual(items);
    });

    it("should throw if any item fails", async () => {
      mockBatchWrite.mockImplementation(async (batchRequest) => {
        // Let's cause a handful of failures in the second batch
        const itemsToFail = batchRequest.RequestItems.mockTableName.filter(
          (req) => {
            const item = req.PutRequest.Item;
            return item.id > 40 && item.id % 2 === 1;
          }
        );
        if (itemsToFail.length === 0) {
          return Promise.resolve({});
        } else {
          return Promise.resolve({
            UnprocessedItems: {
              mockTableName: itemsToFail,
            },
          });
        }
      });
      const items = [...new Array(60)].map((_, id) => ({ id }));

      const tryPutMultiple = async () =>
        await dynamodbLib.putMultiple(
          "mockTableName",
          items,
          (item) => item.id
        );

      await expect(tryPutMultiple).rejects.toThrow(
        "Failed to insert item(s): [41, 43, 45, 47, 49]"
      );
    });
  });
});
