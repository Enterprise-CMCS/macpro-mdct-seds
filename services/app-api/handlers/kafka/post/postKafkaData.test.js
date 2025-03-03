import { beforeEach, describe, expect, it, vi } from "vitest";
import { handler as postKafkaData } from "./postKafkaData";
import { Kafka } from "kafkajs";

vi.mock("kafkajs", () => ({
  Kafka: vi.fn().mockReturnValue({
    producer: vi.fn().mockReturnValue({
      disconnect: vi.fn().mockResolvedValue(),
      connect: vi.fn().mockResolvedValue(),
      sendBatch: vi.fn().mockResolvedValue(),
      on: vi.fn().mockResolvedValue(),
    }),
  }),
}));
const mockConnect = Kafka().producer().connect;
const mockSendBatch = Kafka().producer().sendBatch;
const mockDisconnect = Kafka().producer().disconnect;
const mockOn = Kafka().producer().on;

let disconnectCallback = () => {};
mockOn.mockImplementation((eventId, callback) => {
  if (eventId === "producer.disconnect") {
    disconnectCallback = callback;
  }
});


describe("Post Kafka Data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should translate an AWS event into a batch of Kafka messages", async () => {
    const mockEvent = {
      Records: [
        {
          eventSourceARN: "foo/local-state-forms/bar",
          eventID: "change-a1",
          eventName: "ChangeAlpha1",
          dynamodb: {
            NewImage: { id: { "S": "a1" }, value: { "N": 5 }},
            OldImage: { id: { "S": "a1" }, value: { "N": 6 }},
            Keys: { id: { "S": "a1" } },
          }
        },
        {
          eventSourceARN: "foo/local-state-forms/bar",
          eventID: "change-a2",
          eventName: "ChangeAlpha2",
          dynamodb: {
            NewImage: { id: { "S": "a2" }, value: { "N": 44 }},
            OldImage: { id: { "S": "a2" }, value: { "N": 41 }},
            Keys: { id: { "S": "a2" } },
          }
        },
        {
          eventSourceARN: "foo/local-form-answers/bar",
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
    expect(mockConnect).not.toHaveBeenCalled();

    await postKafkaData(mockEvent);

    expect(Kafka).toHaveBeenCalledWith({
      clientId: "seds-local",
      brokers: ["broker1", "broker2"],
      retry: { initialRetryTime: 300 , retries: 8 },
      ssl: { rejectUnauthorized: false },
    });
    expect(mockConnect).toHaveBeenCalled();
    expect(mockSendBatch).toHaveBeenCalledWith({
      topicMessages: [
        {
          topic: "aws.mdct.seds.cdc.state-forms.v0",
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
          topic: "aws.mdct.seds.cdc.form-answers.v0",
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

  it("should ignore events for irrelevant tables", async () => {
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

    await postKafkaData(mockEvent);

    expect(mockSendBatch).not.toHaveBeenCalled();
  });

  it("should disconnect the kafka producer before exiting", async () => {
    await postKafkaData({ Records: [] });

    expect(mockDisconnect).not.toHaveBeenCalled();

    process.emit("beforeExit");

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("should construct a new producer after receiving a disconnect event", async () => {
    const mockEvent = {
      Records: [
        {
          eventSourceARN: "foo/local-state-forms/bar",
          eventID: "change-a1",
          eventName: "ChangeAlpha1",
          dynamodb: {
            NewImage: { id: { "S": "a1" }, value: { "N": 5 }},
            OldImage: { id: { "S": "a1" }, value: { "N": 6 }},
            Keys: { id: { "S": "a1" } },
          }
        },
      ]
    };

    // Event 1: We either get or create a producer.
    // We don't know which, due to the global variables in kafkaUtils.js
    await postKafkaData(mockEvent);
    const kafkaInstantiations = Kafka.mock.calls.length;

    // Event 2: That producer is re-used because it is still connected
    await postKafkaData(mockEvent);
    expect(Kafka).toHaveBeenCalledTimes(kafkaInstantiations);

    disconnectCallback();

    // Event 3: A new producer is created
    await postKafkaData(mockEvent);
    expect(Kafka).toHaveBeenCalledTimes(1 + kafkaInstantiations);
  });
});
