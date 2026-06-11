# AWS Emulator Bakeoff: LocalEmu vs Floci vs MiniStack

Fresh bakeoff run from the dedicated `cmdct-6054localemu`, `cmdct-6054floci`, and `cmdct-6054ministack` worktrees on this machine.

## Method

For each candidate, the run used the branch's own `./run local` flow from a cleaned local baseline:

1. stop any running LocalEmu process
2. remove emulator containers
3. delete repo `.cdk`
4. delete generated `services/ui-src/public/env-config.js`
5. run the candidate's own `./run local`

The same repo `.env` was used across all three worktrees. Existing `node_modules` and cached Docker images were reused if already present; Docker images were **not** forcibly purged. LocalEmu needed extra host setup first because its current runtime dependencies did not resolve on the machine's default Python 3.14.

## Result Summary

| Candidate     | Result        | Time to ready / blocker | Evidence                                                                                                                                                           | Notable issues                                                                                          |
| ------------- | ------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| **LocalEmu**  | **Failed**    | failed at ~1m51s        | `localemu start -d` succeeded, but `cdklocal bootstrap` failed every run on `AWS::SSM::Parameter CdkBootstrapVersion` with `ParameterAlreadyExists`                | also required a Python 3.12 venv because `localemu[runtime]` would not install cleanly on Python 3.14   |
| **Floci**     | **Succeeded** | UI ready at ~37s        | container healthy, `_floci/init` returned ready, bootstrap/prereqs/deploy all exited `0`, Vite served `http://localhost:3000/`, API root responded `405`           | post-deploy watch logs showed non-fatal `seedData` `ResourceNotFoundException` errors for `floci-forms` |
| **MiniStack** | **Succeeded** | UI ready at ~55s        | health endpoint healthy, bootstrap/prereqs/deploy all exited `0`, watch started, Vite served `http://localhost:3000/`, UI returned `200`, API root responded `405` | first run had to pull `ministackorg/ministack:latest`, so its cold-start time includes image download   |

## Candidate Notes

### LocalEmu

`./run local` could not get past CDK bootstrap. The failure was repeatable:

- `AWS::SSM::Parameter CdkBootstrapVersion`
- `ParameterAlreadyExists`
- stack ended in `ROLLBACK_COMPLETE`

I isolated one likely cause before concluding: a fresh LocalEmu process started successfully with no pre-existing SSM parameters, so this does **not** look like leftover host state from a previous run. It looks like a LocalEmu/CDK bootstrap compatibility problem in the branch's actual deploy path. Separately, the host setup story is weaker than the other two candidates right now because LocalEmu needed a dedicated Python 3.12 virtualenv just to install and start.

### Floci

Floci gave the fastest successful path on this machine once its image was already present:

- run start: `23:11:43Z`
- container start complete: `23:11:47Z`
- bootstrap exit `0`: `23:11:56Z`
- local prerequisite exit `0`: `23:11:59Z`
- prerequisite exit `0`: `23:12:01Z`
- deploy exit `0`: `23:12:19Z`
- Vite ready / local UI announced: `23:12:20Z`

Operationally, this is a real end-to-end success. The main blemish is after deploy: the watch logs captured `seedData` errors trying to write `floci-forms` (`ResourceNotFoundException`). Those errors did not stop the environment from coming up, but they are real correctness noise and should be explained before treating Floci as the cleanest option.

### MiniStack

MiniStack also completed end to end:

- run start: `00:15:44Z`
- container start complete: `00:15:55Z`
- bootstrap exit `0`: `00:16:00Z`
- local prerequisite exit `0`: `00:16:02Z`
- prerequisite exit `0`: `00:16:05Z`
- deploy exit `0`: `00:16:38Z`
- watch start: `00:16:38Z`
- Vite ready: `00:16:39Z`

Unlike Floci, the first MiniStack run had to pull the image, so its cold-start clock includes image download time. Even with that penalty, the full path still completed cleanly. I did not find corresponding error lines in the bakeoff log, and the frontend/API probes looked normal (`200` on UI, `405` on API root).

## Recommendation

**MiniStack is the strongest fresh-run result from this bakeoff.** It was the only candidate that completed end to end without a comparable logged runtime error during the bakeoff run itself.

**Floci remains viable and is fast**, especially once cached, but its `seedData` errors mean the environment is not as clean as MiniStack yet.

**LocalEmu is currently blocked** by a repeatable CDK bootstrap failure in the branch's real `./run local` path and should not be chosen until that is fixed.
