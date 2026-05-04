import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handler } from "./postKafkaData.ts";
import { Kafka } from "kafkajs";

vi.spyOn(console, "debug").mockImplementation(vi.fn());
vi.spyOn(console, "info").mockImplementation(vi.fn());
vi.spyOn(console, "warn").mockImplementation(vi.fn());
vi.spyOn(console, "error").mockImplementation(vi.fn());

const { mockConnect, mockSendBatch, mockDisconnect, mockOn } = vi.hoisted(
  () => ({
    mockConnect: vi.fn(),
    mockSendBatch: vi.fn(),
    mockDisconnect: vi.fn(),
    mockOn: vi.fn(),
  })
);

vi.mock("kafkajs", () => ({
  Kafka: vi.fn(
    class {
      producer = vi.fn().mockReturnValue({
        disconnect: mockDisconnect,
        connect: mockConnect,
        sendBatch: mockSendBatch,
        on: mockOn,
      });
    }
  ),
}));

const formAnswerRecord = {
  eventSourceARN: "aaa/local-form-answers/bbb",
  eventID: "eid-123",
  eventName: "en-123",
  dynamodb: {
    Keys: { answer_entry: { S: "CO-2026-1-21E-0000-05" } },
    NewImage: {
      answer_entry: { S: "CO-2026-1-21E-0000-05" },
      state_form: { S: "CO-2026-1-21E" },
      last_modified: { S: "2026-04-12T01:48:59.815Z" },
    },
    OldImage: {
      answer_entry: { S: "CO-2026-1-21E-0000-05" },
      state_form: { S: "CO-2026-1-21E" },
    },
  },
};

const stateFormRecord = {
  eventSourceARN: "aaa/local-state-forms/bbb",
  eventID: "eid-456",
  eventName: "en-456",
  dynamodb: {
    Keys: { state_form: { S: "CO-2026-1-21E" } },
    NewImage: {
      state_form: { S: "CO-2026-1-21E" },
      last_modified: { S: "2026-04-12T01:48:59.815Z" },
      status_id: { N: 2 },
    },
    OldImage: {
      state_form: { S: "CO-2026-1-21E" },
      status_id: { N: 1 },
    },
  },
};

describe("Kafka message sending", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should convert AWS Dynamo Stream Events to Kafka Messages", async () => {
    const event = { Records: [formAnswerRecord] };

    // kafkalib.ts calls producer.connect() only once.
    // Reload the file to make sure we capture that call in this test.
    // Otherwise, assertions on producer.connect() would rely on test order.
    vi.resetModules();
    expect(mockConnect).not.toHaveBeenCalled();

    await handler(event);
    expect(Kafka).toHaveBeenCalledWith({
      clientId: "seds-local",
      brokers: ["broker1", "broker2"],
      retry: { initialRetryTime: 300, retries: 8 },
      ssl: { rejectUnauthorized: false },
    });
    expect(mockConnect).toHaveBeenCalled();
    expect(mockSendBatch).toHaveBeenCalledWith({
      topicMessages: [
        {
          topic: "aws.mdct.seds.cdc.form-answers.v0",
          messages: [
            {
              headers: {
                eventID: "eid-123",
                eventName: "en-123",
              },
              key: "CO-2026-1-21E-0000-05",
              partition: 0,
              value: JSON.stringify({
                NewImage: {
                  answer_entry: "CO-2026-1-21E-0000-05",
                  state_form: "CO-2026-1-21E",
                  last_modified: "2026-04-12T01:48:59.815Z",
                },
                OldImage: {
                  answer_entry: "CO-2026-1-21E-0000-05",
                  state_form: "CO-2026-1-21E",
                },
                Keys: { answer_entry: "CO-2026-1-21E-0000-05" },
              }),
            },
          ],
        },
      ],
    });
  });

  it("should successfully process events for newly-created records", async () => {
    const record = structuredClone(formAnswerRecord);
    delete (record.dynamodb as any).OldImage;
    const event = { Records: [record] };
    await handler(event);
    expect(mockSendBatch).toHaveBeenCalledWith({
      topicMessages: [
        {
          topic: "aws.mdct.seds.cdc.form-answers.v0",
          messages: [
            expect.objectContaining({
              value: JSON.stringify({
                NewImage: {
                  answer_entry: "CO-2026-1-21E-0000-05",
                  state_form: "CO-2026-1-21E",
                  last_modified: "2026-04-12T01:48:59.815Z",
                },
                OldImage: {},
                Keys: { answer_entry: "CO-2026-1-21E-0000-05" },
              }),
            }),
          ],
        },
      ],
    });
  });

  it("should ignore events from tables with no associated topic", async () => {
    const record = structuredClone(formAnswerRecord);
    record.eventSourceARN = "aaa/local-unknown-table/bbb";
    const event = { Records: [record] };
    await handler(event);
    expect(mockSendBatch).not.toHaveBeenCalled();
  });

  it("should group messages by topic", async () => {
    const answer2 = structuredClone(formAnswerRecord);
    answer2.dynamodb.Keys.answer_entry.S = "CO-2026-1-21E-0000-06";
    const event = { Records: [formAnswerRecord, answer2, stateFormRecord] };
    await handler(event);
    expect(mockSendBatch).toHaveBeenCalledWith({
      topicMessages: [
        {
          topic: "aws.mdct.seds.cdc.form-answers.v0",
          messages: [
            expect.objectContaining({ key: "CO-2026-1-21E-0000-05" }),
            expect.objectContaining({ key: "CO-2026-1-21E-0000-06" }),
          ],
        },
        {
          topic: "aws.mdct.seds.cdc.state-forms.v0",
          messages: [expect.objectContaining({ key: "CO-2026-1-21E" })],
        },
      ],
    });
  });

  it("should recognize all dynamo-related topics", async () => {
    const tables = [
      "auth-user",
      "form-answers",
      "form-questions",
      "form-templates",
      "state-forms",
    ];
    const event = {
      Records: tables.map((table) => ({
        eventSourceARN: `asdf/local-${table}/qwer`,
        dynamodb: {
          Keys: { foo: { S: "bar" } },
          NewImage: { state_form: { S: "mock state form id" } },
        },
      })) as any,
    };
    await handler(event);
    expect(mockSendBatch).toHaveBeenCalledWith({
      topicMessages: tables.map((table) =>
        expect.objectContaining({ topic: `aws.mdct.seds.cdc.${table}.v0` })
      ),
    });
  });

  it("should ignore empty events", async () => {
    await handler({});
    expect(mockSendBatch).not.toHaveBeenCalled();
  });

  it("should ignore events from unknown sources", async () => {
    const nonDynamoNonS3Record = {} as any;
    await handler({ Records: [nonDynamoNonS3Record] });
    expect(mockSendBatch).not.toHaveBeenCalled();
  });

  describe("when environment variables are not typical", () => {
    let originalEnv: any;

    beforeEach(() => {
      const keys = ["brokerString", "STAGE", "topicNamespace"];
      originalEnv = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
      vi.resetModules();
      vi.clearAllMocks();
    });

    afterEach(() => {
      for (let [key, value] of Object.entries(originalEnv)) {
        process.env[key] = value as string;
      }
    });

    it("should ignore all events when running in localstack", async () => {
      process.env.brokerString = "localstack";
      const event = { Records: [formAnswerRecord] };
      await handler(event);
      expect(mockSendBatch).not.toHaveBeenCalled();
    });

    it("should error immediately if brokerString is missing", async () => {
      delete process.env.brokerString;
      const event = { Records: [formAnswerRecord] };
      await expect(() => handler(event)).rejects.toThrow("Missing config");
      expect(mockSendBatch).not.toHaveBeenCalled();
    });

    it("should error immediately if STAGE is missing", async () => {
      delete process.env.STAGE;
      const event = { Records: [formAnswerRecord] };
      await expect(() => handler(event)).rejects.toThrow("Missing config");
      expect(mockSendBatch).not.toHaveBeenCalled();
    });
  });

  it("should ignore messages concerning unmodified SEDS 2019 forms", async () => {
    const answer2019 = structuredClone(formAnswerRecord);
    answer2019.dynamodb.NewImage.state_form.S = "CO-2019-1-21E";
    answer2019.dynamodb.NewImage.last_modified.S = "2019-03-15T12:34:46Z";

    const form2019 = structuredClone(stateFormRecord);
    form2019.dynamodb.NewImage.state_form.S = "CO-2019-1-21E";
    form2019.dynamodb.NewImage.last_modified.S = "2019-03-15T12:34:46Z";

    const event = { Records: [answer2019, form2019] };
    await handler(event);
    expect(mockSendBatch).not.toHaveBeenCalled();
  });

  it("should send messages concerning modified SEDS 2019 forms", async () => {
    const answer2019 = structuredClone(formAnswerRecord);
    answer2019.dynamodb.NewImage.state_form.S = "CO-2019-1-21E";
    answer2019.dynamodb.NewImage.last_modified.S = "2026-03-15T12:34:46Z";

    const form2019 = structuredClone(stateFormRecord);
    form2019.dynamodb.NewImage.state_form.S = "CO-2019-1-21E";
    form2019.dynamodb.NewImage.last_modified.S = "2026-03-15T12:34:46Z";

    const event = { Records: [answer2019, form2019] };
    await handler(event);
    expect(mockSendBatch).toHaveBeenCalledWith({
      topicMessages: [
        expect.objectContaining({ topic: "aws.mdct.seds.cdc.form-answers.v0" }),
        expect.objectContaining({ topic: "aws.mdct.seds.cdc.state-forms.v0" }),
      ],
    });
  });

  it("should disconnect the kafka producer before exiting", async () => {
    const event = { Records: [formAnswerRecord] };

    await handler(event);
    expect(mockSendBatch).toHaveBeenCalled();
    expect(mockDisconnect).not.toHaveBeenCalled();

    process.emit("beforeExit", 0);
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it.skip("should connect only as needed", async () => {
    // Delay connect to ensure the two calls will be in progress simultaneously
    const delay = () => new Promise((res) => setTimeout(res, 200));
    mockConnect.mockImplementationOnce(delay).mockImplementationOnce(delay);
    const event = { Records: [formAnswerRecord] };

    vi.resetModules();
    expect(mockConnect).not.toHaveBeenCalled();

    // Kick off both calls at once
    await Promise.all([handler(event), handler(event)]);

    // The first event starts a connection; the second event awaits it.
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it("should reconnect as needed", async () => {
    const event = { Records: [formAnswerRecord] };

    vi.resetModules();
    expect(mockOn).not.toHaveBeenCalled();
    expect(mockConnect).not.toHaveBeenCalled();

    await handler(event);
    await handler(event);

    // The first event makes the connection; the second event reuses it.
    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockOn).toHaveBeenCalledWith(
      "producer.disconnect",
      expect.any(Function)
    );
    const disconnectListener = mockOn.mock.calls[0][1];

    // The other end disconnects. A Kafka server error, say.
    await disconnectListener("mock disconnect reason");
    await handler(event);

    // The third event establishes a new connection.
    expect(mockConnect).toHaveBeenCalledTimes(2);
  });
});
