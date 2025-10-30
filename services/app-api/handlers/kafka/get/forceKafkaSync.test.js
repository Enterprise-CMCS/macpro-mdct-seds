import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as forceKafkaSync } from "./forceKafkaSync.js";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const mockDynamo = mockClient(DynamoDBDocumentClient);

const mockBatchWrite = vi.fn().mockResolvedValue({ UnprocessedItems: {} });
mockDynamo.on(BatchWriteCommand).callsFake(mockBatchWrite);

const mockScan = vi.fn().mockResolvedValue({ Count: 0 });
mockDynamo.on(ScanCommand).callsFake(mockScan);

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

describe("forceKafkaSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should read literally everything from every table, then write it back with slight modifications", async () => {
    // We will mock only the first scan
    mockScan.mockResolvedValueOnce({ Count: 1, Items: [{ foo: "bar" }] });

    await forceKafkaSync({});

    expect(mockScan).toHaveBeenCalledTimes(7);
    expect(mockBatchWrite).toHaveBeenCalled();

    // I don't want to test the exact table name,
    // but it's a key in the params object.
    // So digging into the params object gets a bit awkward here.
    // What I do want to verify is that the lastSynced property was added.
    const firstBatchWriteParams = mockBatchWrite.mock.calls[0][0];
    const request = Object.values(firstBatchWriteParams.RequestItems)[0][0];
    expect(request.PutRequest.Item).toEqual({
      foo: "bar",
      lastSynced: expect.stringMatching(ISO_DATE_REGEX),
    });
  });

  it("should limit batch writes to 25 items or less", async () => {
    // We will mock only the first scan
    mockScan.mockResolvedValueOnce({
      Count: 60,
      Items: new Array(60).fill({ foo: "bar" }, 0, 60),
    });

    await forceKafkaSync({});

    expect(mockScan).toHaveBeenCalledTimes(7);
    expect(mockBatchWrite).toHaveBeenCalledTimes(3);
    const batchSizes = mockBatchWrite.mock.calls.map(
      (call) => Object.values(call[0].RequestItems)[0].length
    );
    expect(batchSizes).toEqual([25, 25, 10]);
  });
});
