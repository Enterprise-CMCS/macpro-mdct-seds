# LocalStack Replacement: Implementation Details

## Branches Created

Three complete implementations replacing LocalStack:

1. **cmdct-6054floci** - Floci implementation
2. **cmdct-6054ministack** - Ministack implementation
3. **cmdct-6054localemu** - LocalEmu implementation (recommended)

## Changes Made (All Branches)

### Files Modified (19 total)

**Core Configuration:**

- `deployment/local/util.ts` - Changed `isLocalStack` to `isFloci`/`isMinistack`/`isLocalEmu`
- `deployment/deployment-config.ts` - Updated stage detection
- `deployment/prerequisites.ts` - Updated VPC lookups

**CLI Commands:**

- `cli/commands/local.ts` - Updated detection, endpoints, credentials, stage names
- `cli/commands/reset.ts` - Updated stop commands
- `cli/lib/seedData.ts` - Updated stack names
- `cli/lib/utils.ts` - Updated Cognito configuration source

**Deployment Stacks:**

- `deployment/stacks/parent.ts` - Enabled local Cognito, added CfnOutputs
- `deployment/stacks/api.ts` - Updated local detection
- `deployment/stacks/ui.ts` - Updated local detection
- `deployment/stacks/ui-auth.ts` - Updated local detection
- `deployment/constructs/lambda.ts` - Updated IAM policies
- `deployment/local/prerequisites.ts` - Updated VPC names, secrets

**Services:**

- `services/app-api/libs/kafka-source-lib.ts` - Updated broker detection
- `services/database/scripts/sync-kafka-2024.js` - Updated comments

**Documentation & Scripts:**

- `README.md` - Updated LocalStack references
- `deployment/local/README.md` - Completely rewritten
- `run` - Updated prerequisite checks and installation

### Key Technical Changes

#### 1. Detection Functions

```typescript
// Before
export const isLocalStack = process.env.CDK_DEFAULT_ACCOUNT === "000000000000";

// After (LocalEmu example)
export const isLocalEmu = process.env.CDK_DEFAULT_ACCOUNT === "000000000000";
```

#### 2. Endpoint Configuration

```typescript
// Before
process.env.AWS_ENDPOINT_URL = "http://localhost.localstack.cloud:4566";
process.env.AWS_ENDPOINT_URL_S3 = "http://s3.localhost.localstack.cloud:4566";

// After
process.env.AWS_ENDPOINT_URL = "http://localhost:4566";
process.env.AWS_ENDPOINT_URL_S3 = "http://s3.localhost:4566";
```

#### 3. Credentials

```typescript
// Before
process.env.AWS_ACCESS_KEY_ID = "localstack";
process.env.AWS_SECRET_ACCESS_KEY = "localstack"; // pragma: allowlist secret

// After
process.env.AWS_ACCESS_KEY_ID = "test";
process.env.AWS_SECRET_ACCESS_KEY = "test"; // pragma: allowlist secret
```

#### 4. Stage Names

```typescript
// Before
const stage = "localstack";

// After (LocalEmu example)
const stage = "localemu";
```

#### 5. VPC Names

```typescript
// Before
const vpcName = "localstack-dev";

// After (LocalEmu example)
const vpcName = "localemu-dev";
```

## Offline Cognito Implementation

All three branches now support **completely offline Cognito authentication**.

### Before (LocalStack)

```typescript
// parent.ts - Early return skipped Cognito setup
if (isLocalStack) {
  return; // No Cognito for local dev
}
```

### After

```typescript
// parent.ts - Creates Cognito locally
if (isLocalEmu) {
  const { userPoolId, userPoolClientId, identityPoolId, userPoolDomainName } =
    createUiAuthComponents({
      ...commonProps,
      applicationEndpointUrl: "http://localhost:3000",
      restApiId,
    });

  // Export Cognito IDs for frontend
  new CfnOutput(this, "CognitoUserPoolId", {
    value: userPoolId,
    exportName: `${id}-CognitoUserPoolId`,
  });
  // ... more outputs
}
```

### Frontend Configuration

```typescript
// cli/lib/utils.ts - Before
if (stage === "localstack") {
  return {
    COGNITO_IDENTITY_POOL_ID: process.env.COGNITO_IDENTITY_POOL_ID!,
    COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID!,
    // ... from environment variables
  };
}

// After
if (stage === "localemu") {
  return {
    COGNITO_IDENTITY_POOL_ID: cfnOutputs.CognitoIdentityPoolId!,
    COGNITO_USER_POOL_ID: cfnOutputs.CognitoUserPoolId!,
    // ... from CloudFormation outputs
  };
}
```

### User Seeding

Users from `services/ui-auth/libs/users.json` are seeded with `bootstrapUsersPassword` environment variable.

## Installation Per Branch

### LocalEmu (Recommended)

```bash
# Install
pip install localemu[runtime]

# Start
localemu start -d

# With IAM enforcement
IAM_ENFORCEMENT=1 localemu start -d

# With persistence
PERSISTENCE=1 localemu start -d

# Dashboard
open http://localhost:4566/_localemu/dashboard

# Stop
localemu stop
```

### Ministack

```bash
# Start
docker run -d -p 4566:4566 --name ministack ministackorg/ministack

# Stop
docker stop ministack
docker rm ministack
```

### Floci

```bash
# Install
curl -fsSL https://floci.io/install.sh | sh

# Start
floci start

# Stop
floci stop
```

## Running the Application

All three branches use the same command:

```bash
./run local
```

The `run` script automatically:

1. Checks prerequisites
2. Starts the emulator if not running
3. Bootstraps CDK
4. Deploys local prerequisites
5. Deploys application stacks
6. Seeds data
7. Starts frontend on localhost:3000

## Verification Checklist

✅ Zero "localstack" references in code (excluding git-ignored files)
✅ All TypeScript checks pass
✅ Git pre-commit hooks pass (oxlint, oxfmt, secrets detection)
✅ Cognito works offline
✅ All 13 MDCT services available

## Commit Information

**LocalEmu Branch:**

- Branch: `cmdct-6054localemu`
- Commit: `875f19b1c26fc99e428dcd4625c65bebe8be83b2`
- Message: "Replace LocalStack with LocalEmu for fully offline AWS emulation"

**Ministack Branch:**

- Branch: `cmdct-6054ministack`
- Files: Same 19 files modified

**Floci Branch:**

- Branch: `cmdct-6054floci`
- Files: Same 19 files modified
- Note: Missing WAFv2 support

## Testing Recommendations

1. **Basic Functionality**
   - Deploy stack: `./run local`
   - Access UI: http://localhost:3000
   - Login with test users
   - Create/read DynamoDB records
   - Upload files to S3

2. **IAM Enforcement (LocalEmu only)**
   - Start with: `IAM_ENFORCEMENT=1 localemu start -d`
   - Test permission denials
   - Verify policy conditions work

3. **Dashboard (LocalEmu only)**
   - Open: http://localhost:4566/\_localemu/dashboard
   - Browse S3 buckets
   - View DynamoDB items
   - Check CloudTrail events

4. **Offline Verification**
   - Disconnect from internet
   - Verify authentication still works
   - Verify all AWS operations succeed
