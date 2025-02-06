1. Find and replace:
   * `jest.mock(` -> `vi.mock(`
   * `jest.fn()` -> `vi.fn()`
   * `jest.spyOn(` -> `vi.spyOn(`
   * `() => ({ ...jest.requireActual("asdf")` -> `async (importOriginal) => ({ ...(await importOriginal())`
   * `jest.clearAllMocks()` -> `vi.clearAllMocks()`
   * You get the idea
2. In every file you did that, import the test globals you need.
   * import { afterEach, beforeEach, describe, expect, it, test, vi } from "vitest";
   * Alternatively, when you get to the config step below, add `globals: true`
3. `vitest` requires more explicit mocking for default exports. You may need to replace `vi.mock("foo", bar)` with `vi.mock("foo", () => ({ default: bar }))`
4. Pop open vite.config.ts
   * Add a magic comment to the defineConfig import
   * Add a `test` property to the config object
      + If the magic comment worked, TS will like this and VSC will be helpful. It didn't work for me, so I cast to `any` to get TS to shut up and I'm flying blind. Well I mean there are docs, but still.
   * Specify your options in there.
      + probably will want a `root: "src"`, so that vitest does not scan node_modules for tests
      * probably will want a `setupFiles: "setupTests.js"`, which will be relative to the root you just specified
      * probably will want to specify `environment: "jsdom"` so that global objects like `document` will be available to your `render()` calls
   * TODO dotenv how?
5. 
6. If you're testing specific local URLs (perhaps for tealium-related code), you may find you need to change the expected URLs to include port (eg: `localhost` -> `localhost:3000`)
   * Why? idk. I guess window.location.href can vary based on your test runner.


TODO how dotenv? Need dotenv??
TODO fix types in vite.config.ts
TODO transcribe this file into the PR description
TODO delete this file
