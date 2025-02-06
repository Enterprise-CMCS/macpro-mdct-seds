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
      + If the magic comment worked, TS will like this and VSC will be helpful.
      + If it doesn't work, you may need to fiddle with the versions of `vite` and `vitest`. For me, TS was angry when I had `vite@5.2.14` and `vitest@3.0.5`, but was mollified when I upgraded to `vite@6.1.0`
         - You may be able to get more specific TS errors by importing defineConfig from vitest instead of vite - but more specific doesn't necessarily mean easier to troubleshoot.
         - You may also be able to dodge the issue by importing both separately, and using mergeConfig
         - But, in my weakly-held opinion, the magic comment the best approach here. vite gets its config from its own defineConfig, TS gets the hints it needs to help us write test config in the same object, and there's zero opportunity for drift between the deploy config & the test config.
      + If you can't get it working, then you should be able to temporarily proceed with a cast: `export default defineConfig({...} as any);`
         - But we'll figure it out together eventually
   * Specify your options in there.
      + probably will want a `root: "src"`, so that vitest does not scan node_modules for tests
      * probably will want a `setupFiles: "setupTests.js"`, which will be relative to the root you just specified
      * probably will want to specify `environment: "jsdom"` so that global objects like `document` will be available to your `render()` calls
   * TODO dotenv how?
6. If you're testing specific local URLs (perhaps for tealium-related code), you may find you need to change the expected URLs to include port (eg: `localhost` -> `localhost:3000`)
   * Why? idk. I guess window.location.href can vary based on your test runner.
7. If your tests rely on environment variables, and you want to use a .env file (rather than writing to process.env within setupTests.js), there are certainly ways to do that. [This one looks pretty good](https://stackoverflow.com/a/78802309), in my opinion. But also, I'm not doing that. Writing env variables in setupTest.js feels less magical to me.

TODO transcribe this file into the PR description
TODO delete this file
