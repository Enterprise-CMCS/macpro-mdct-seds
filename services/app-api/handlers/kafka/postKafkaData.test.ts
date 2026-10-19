import { describe, expect, it, vi } from "vitest";
import { handler as PostKafkaData } from "./postKafkaData.ts";

const { mockKafkaHandler } = vi.hoisted(() => ({ mockKafkaHandler: vi.fn() }));

vi.mock("../../libs/kafka-source-lib.ts", () => ({
  default: vi.fn(
    class {
      handler = mockKafkaHandler;
    }
  ),
}));

describe("postKafkaData", () => {
  it("should forward calls to the underlying library", () => {
    const mockEvent = { foo: "bar" };
    PostKafkaData(mockEvent);
    expect(mockKafkaHandler).toHaveBeenCalledWith(mockEvent);
  });
});
