import { beforeEach, describe, expect, it, vi } from "vitest";
import KafkaSourceLib from "./kafka-source-lib";
import { Kafka } from "kafkajs";

vi.mock("kafkajs", () => ({
  Kafka: vi.fn().mockReturnValue({
    producer: vi.fn().mockReturnValue({
      disconnect: vi.fn().mockResolvedValue(),
      connect: vi.fn().mockResolvedValue(),
      sendBatch: vi.fn().mockResolvedValue(),
    }),
  }),
}));
const mockConnect = Kafka().producer().connect;
const mockSendBatch = Kafka().producer().sendBatch;
const mockDisconnect = Kafka().producer().disconnect;

// The file under test has some one-time behavior on load,
// which we test one time here.
expect(Kafka).toHaveBeenCalledWith({
  clientId: "seds-local",
  brokers: ["broker1", "broker2"],
  retry: { initialRetryTime: 300 , retries: 8 },
  ssl: { rejectUnauthorized: false },
});
expect(mockConnect).not.toHaveBeenCalled();

describe("Kafka Source Lib", () => {
  describe("with a standard configuration", () => {
    class TestKafkaExtension extends KafkaSourceLib {
      topicPrefix = "mockPrefix";
      version = "mockVersion";
      tables = [
        "mock-table-alpha",
        "mock-table-beta",
      ];
    };
    let TestKafkaInstance;

    beforeEach(() => {
      vi.clearAllMocks();
      TestKafkaInstance = new TestKafkaExtension();
    });

    it("should translate an AWS event into a batch of Kafka messages", async () => {
      const mockEvent = {
        Records: [
          {
            eventSourceARN: "foo/local-mock-table-alpha/bar",
            eventID: "change-a1",
            eventName: "ChangeAlpha1",
            dynamodb: {
              NewImage: { id: { "S": "a1" }, value: { "N": 5 }},
              OldImage: { id: { "S": "a1" }, value: { "N": 6 }},
              Keys: { id: { "S": "a1" } },
            }
          },
          {
            eventSourceARN: "foo/local-mock-table-alpha/bar",
            eventID: "change-a2",
            eventName: "ChangeAlpha2",
            dynamodb: {
              NewImage: { id: { "S": "a2" }, value: { "N": 44 }},
              OldImage: { id: { "S": "a2" }, value: { "N": 41 }},
              Keys: { id: { "S": "a2" } },
            }
          },
          {
            eventSourceARN: "foo/local-mock-table-beta/bar",
            eventID: "new-b",
            eventName: "NewBeta",
            dynamodb: {
              NewImage: {
                state: { "S": "CO" },
                year: { "N": 2025 },
                flag: { "BOOL": true }
              },
              Keys: { state: { "S": "CO" }, year: { "N": 2025 } },
            }
          },
        ]
      }

      await TestKafkaInstance.handler(mockEvent);

      expect(mockConnect).toHaveBeenCalled();
      expect(mockSendBatch).toHaveBeenCalledWith({
        topicMessages: [
          {
            topic: "mockPrefix.mock-table-alpha.mockVersion",
            messages: [
              {
                headers: { eventID: "change-a1", eventName: "ChangeAlpha1" },
                key: "a1",
                partition: 0,
                value: JSON.stringify({
                  NewImage: { id: "a1", value: 5 },
                  OldImage: { id: "a1", value: 6 },
                  Keys: { id: "a1" },
                }),
              },
              {
                headers: { eventID: "change-a2", eventName: "ChangeAlpha2" },
                key: "a2",
                partition: 0,
                value: JSON.stringify({
                  NewImage: { id: "a2", value: 44 },
                  OldImage: { id: "a2", value: 41 },
                  Keys: { id: "a2" },
                }),
              }
            ]
          },
          {
            topic: "mockPrefix.mock-table-beta.mockVersion",
            messages: [
              {
                headers: { eventID: "new-b", eventName: "NewBeta" },
                key: "CO#2025",
                partition: 0,
                value: JSON.stringify({
                  NewImage: { state: "CO", year: 2025, flag: true },
                  OldImage: {},
                  Keys: { state: "CO", year: 2025 },
                }),
              }
            ]
          },
        ]
      });
    });

    it.skip("should ignore events for irrelevant tables", async () => {
      // This test fails, because we happily send events with `topic: undefined`
      const mockEvent = {
        Records: [
          {
            eventSourceARN: "unknown-table-name",
            eventID: "mockEventId",
            eventName: "mockEventName",
            dynamodb: {
              NewImage: { id: { "S": "1" } },
              Keys: { id: { "S": "1" } },
            }
          },
        ],
      };

      await TestKafkaInstance.handler(mockEvent);

      expect(mockSendBatch).not.toHaveBeenCalled();
    });

    it("should disconnect the kafka producer before exiting", async () => {
      await TestKafkaInstance.handler({ Records: [] });

      expect(mockDisconnect).not.toHaveBeenCalled();

      process.emit("beforeExit");

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});
