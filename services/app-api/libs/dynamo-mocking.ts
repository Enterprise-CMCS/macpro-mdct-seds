import { vi } from "vitest";
import {
  BatchWriteCommand,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const {
  mockBatchWrite,
  mockDelete,
  mockGet,
  mockPut,
  mockQuery,
  mockScan,
  mockUpdate,
} = vi.hoisted(() => ({
  mockBatchWrite: vi.fn().mockResolvedValue({}),
  mockDelete: vi.fn(),
  mockGet: vi.fn(),
  mockPut: vi.fn(),
  mockQuery: vi.fn(),
  mockScan: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock("@aws-sdk/lib-dynamodb", async (importOriginal) => ({
  ...(await importOriginal()),
  DynamoDBDocumentClient: {
    from: () => ({
      send(command: unknown) {
        if (command instanceof BatchWriteCommand) {
          return mockBatchWrite(command.input);
        } else if (command instanceof DeleteCommand) {
          return mockDelete(command.input);
        } else if (command instanceof GetCommand) {
          return mockGet(command.input);
        } else if (command instanceof PutCommand) {
          return mockPut(command.input);
        } else if (command instanceof QueryCommand) {
          return mockQuery(command.input);
        } else if (command instanceof ScanCommand) {
          return mockScan(command.input);
        } else if (command instanceof UpdateCommand) {
          return mockUpdate(command.input);
        } else {
          throw new TypeError("Mock not implemented for this command type");
        }
      },
    }),
  },
  // No point in implementing pagination behavior here.
  // Individual tests should always mock Query and Scan to return all results.
  paginateQuery: async function* (_config: any, params: any) {
    yield await mockQuery(params);
    return;
  },
  paginateScan: async function* (_config: any, params: any) {
    yield await mockScan(params);
    return;
  },
}));

export {
  mockBatchWrite,
  mockDelete,
  mockGet,
  mockPut,
  mockQuery,
  mockScan,
  mockUpdate,
};
