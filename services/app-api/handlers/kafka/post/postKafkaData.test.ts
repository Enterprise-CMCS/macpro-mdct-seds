import { describe, expect, it, vi } from "vitest";
import KafkaSourceLib from "../../../libs/kafka-source-lib.ts";
import { handler as PostKafkaData } from "./postKafkaData.ts";

vi.mock("../../../libs/kafka-source-lib.ts", () => ({
  default: vi.fn().mockReturnValue({
    handler: vi.fn(),
  }),
}));

const mockKafkaHandler = KafkaSourceLib().handler;

describe("postKafkaData", () => {
  it("should forward calls to the underlying library", () => {
    const mockEvent = { foo: "bar" };
    PostKafkaData(mockEvent);
    expect(mockKafkaHandler).toHaveBeenCalledWith(mockEvent);
  });
});
