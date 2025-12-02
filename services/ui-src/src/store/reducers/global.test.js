import { vi, describe, it } from "vitest";
import global, {getAgeRanges, getStates} from "./global";

const mockDispatch = vi.fn();

describe("Test global.js", () => {
  it("Test all test", async () => {
    const ageMock = await getAgeRanges()(mockDispatch);
    const stateMock = await getStates()(mockDispatch);

    const test = global({}, "LOAD_AGE_RANGES")

    const gotAgeMock = getAgeRanges([])
    console.log(gotAgeMock);
  });
});
