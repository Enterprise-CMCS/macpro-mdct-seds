# AWS Services Actually Used Across All MDCT Apps

## From Code Analysis (all macpro-mdct-\* repos):

### Core Services (Every App Uses):

1. **Cognito** (cognito-identity-provider) - Authentication
2. **DynamoDB** - Database
3. **Lambda** - Compute
4. **API Gateway** - REST APIs
5. **IAM** - Access management
6. **CloudWatch Logs** - Logging
7. **WAFv2** - Web firewall

### File Storage:

8. **S3** - Used by: CARTS, MCR, SEDS, MFP

### Email:

9. **SES** - Used by: SEDS

### Additional (from CDK but not direct SDK calls):

- **CloudFormation** - Infrastructure deployment (all apps)
- **VPC/EC2** - Networking (implied by CDK stacks)
- **CloudFront** - CDN (for UI distribution)
- **Certificate Manager** - SSL/TLS certificates

## Total: ~13 AWS Services Actually Used

---

# Updated 3-Way Comparison: Services MDCT Actually Uses

| Service                 | LocalEmu                | Ministack          | Floci          |
| ----------------------- | ----------------------- | ------------------ | -------------- |
| **Cognito**             | ✅ Full                 | ✅ Full            | ✅ Full        |
| **DynamoDB**            | ✅ Full                 | ✅ Full            | ✅ Full        |
| **S3**                  | ✅ Full                 | ✅ Full            | ✅ Full        |
| **Lambda**              | ✅ Real Docker          | ✅ Real Docker     | ✅ Real Docker |
| **API Gateway**         | ✅ REST+WS              | ✅ REST+WS         | ✅ REST+WS     |
| **IAM**                 | ✅ **Full enforcement** | ✅ Basic           | ✅ Basic       |
| **CloudWatch Logs**     | ✅ Full                 | ✅ Full            | ✅ Full        |
| **WAFv2**               | ✅ Full                 | ✅ Full            | ❌ **Missing** |
| **SES**                 | ✅ Full                 | ✅ Full            | ✅ Full        |
| **CloudFormation**      | ✅ 120+ resources       | ✅ 68 resources    | ✅ Standard    |
| **VPC/EC2**             | ✅ Real containers      | ✅ Real containers | ✅ Emulated    |
| **CloudFront**          | ✅ Full                 | ✅ Basic           | ✅ Basic       |
| **Certificate Manager** | ✅ Full                 | ✅ Full            | ✅ Full        |

## Key Findings:

### ❌ Floci Missing Service:

- **WAFv2 not supported** - This is used by ALL MDCT apps for web firewall protection
- This is a **blocker** if you need local WAF testing

### ✅ All three support:

- Cognito, DynamoDB, S3, Lambda, API Gateway, SES, CloudWatch Logs, CloudFormation, Certificate Manager

### 🏆 LocalEmu Unique Advantage:

- **Full IAM policy enforcement** - Test permission bugs locally before prod
- All other features equal for MDCT use cases

### Verdict:

**For MDCT apps, the comparison is:**

1. **LocalEmu** 🏆
   - All 13 services ✅
   - IAM enforcement ✅
   - Best tooling (dashboard, CloudTrail)
2. **Ministack** ✅
   - All 13 services ✅
   - Simplest setup (Docker)
   - No IAM enforcement
3. **Floci** ❌
   - **Missing WAFv2** (used by all MDCT apps)
   - Fastest performance
   - No IAM enforcement

**Recommendation: LocalEmu or Ministack**

- Choose **LocalEmu** if you want IAM policy testing + best debugging tools
- Choose **Ministack** if you want simplest Docker-only setup
- **Don't choose Floci** - missing WAFv2 support

The "132 services vs 45" doesn't matter - what matters is **all 13 services you actually use**.
