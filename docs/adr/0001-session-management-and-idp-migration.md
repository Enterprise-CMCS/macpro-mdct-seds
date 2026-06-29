# Session Management and IdP Migration

- Status: Accepted
- Date: 2026-06-29
- Ticket: [CMDCT-6066](https://jiraent.cms.gov/browse/CMDCT-6066)

## Context

SEDS does not refresh user sessions or warn users before session expiry.
After 30 minutes, API calls silently fail with no feedback to the user.
This is an unfriendly experience and raises an accessibility concern under
[WCAG 2.2 - Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable).
The goal is to improve user experience and achieve WCAG 2.2 compliance with
minimal scope, while establishing a clear long-term path toward platform
alignment.

All other MDCT apps handle this via silent token refresh, which SEDS cannot
do today due to its authentication configuration.

Testing this behavior is constrained by the environment setup:

- **Ephemeral environments** each get an isolated Cognito User Pool. The EUA
  Okta SAML app only has ACS URLs registered for named environments, so SAML
  authentication always fails in ephemeral envs with a RelayState error.
- **Local development** requires manual AWS console changes to the `seds-main`
  Cognito User Pool and WAF before auth will work locally. DevSecOps
  involvement may be required.

## Options

### Option 1: Authorization code flow with idle timeout warning modal

Switching from implicit flow (`responseType: "token"`) to authorization code
flow (`responseType: "code"`) allows Amplify to receive and manage refresh
tokens. This enables two complementary behaviors:

1. **Silent refresh on network activity:** tokens are automatically renewed
   when API calls are made, with no user interruption.
2. **Idle timeout warning modal:** for users actively entering data without
   making API calls, an idle timer triggers a warning modal before the
   session expires. "Stay logged in" silently renews the token with no
   redirect required.

#### Reference implementation

`macpro-mdct-hcbs` - specifically
[`services/ui-src/src/components/layout/Timeout.tsx`](https://github.com/Enterprise-CMCS/macpro-mdct-hcbs/blob/06d48b1673b1cc024a4c0dc17edbd99042ebb4d5/services/ui-src/src/components/layout/Timeout.tsx)
and
[`services/ui-src/src/utils/auth/authLifecycle.tsx`](https://github.com/Enterprise-CMCS/macpro-mdct-hcbs/blob/06d48b1673b1cc024a4c0dc17edbd99042ebb4d5/services/ui-src/src/utils/auth/authLifecycle.tsx).

#### Scope of changes

- Switch the Amplify OAuth configuration to code flow and enable the OAuth
  listener
- Update the Cognito UserPoolClient to permit authorization code grant
- Add idle timeout tracking and warning modal, modeled on the HCBS
  implementation

### Option 2 - Session expiry warning modal with redirect

This option was designed as a fallback for when code flow was believed
non-viable. It involved a redirect-based re-authentication rather than
silent token refresh. This is a less preferable option to Option 1, and
is not recommended if Option 1 is viable.

### Option 3 - Migrate from EUA to IDM

All other MDCT apps authenticate via IDM (Identity Management). SEDS uses
EUA (Enterprise User Administration). Migrating to IDM aligns SEDS with the
platform standard and eliminates the dependency on EUA's Okta configuration
entirely. (Notably, RHTP allows authentication with both IDM and EUA.)

#### Authorization impact

SEDS currently maps EUA job codes (`CHIP_D_USER_GROUP`, etc.) to application
roles in [`services/app-api/libs/authorization.ts`](https://github.com/Enterprise-CMCS/macpro-mdct-seds/blob/3fbc99f9286c23d3f4cc280c9b285f51a834f098/services/app-api/libs/authorization.ts).
IDM sends `cmsRoles` instead; this mapping will need to be updated as part
of the migration.

#### Relevant documentation

- [IDM Integration Guide for Applications](https://confluenceent.cms.gov/pages/viewpage.action?pageId=329989170)
- [IDM Request to Integrate (Onboarding) Process](https://confluenceent.cms.gov/pages/viewpage.action?pageId=309867923)
- [MDCT RHTP - IDM Integration Meetings](https://confluenceent.cms.gov/pages/viewpage.action?pageId=1325572263) -
  most recent MDCT app to complete this process; useful reference for what the
  onboarding looks like in practice
  (RTI ID [1000901](https://identity.cms.gov/application_inventory/edit_application?appId=1000901))

#### Code reference

[`macpro-mdct-rhtp` `deployment/stacks/ui-auth.ts`](https://github.com/Enterprise-CMCS/macpro-mdct-rhtp/blob/db89929c1017f16a066f3fab25778768618a9e63/deployment/stacks/ui-auth.ts) -
shows the CDK changes needed to add IDM as a Cognito SAML identity
provider, including attribute mapping (`cmsRoles`, `state`) and
`authorizationCodeGrant` configuration.

#### High-level steps

1. **Pre-development:** Submit the IDM Request to Integrate (RTI) form at
   [identity.cms.gov/store/become_a_partner](https://identity.cms.gov/store/become_a_partner)
   to kick off the onboarding process. Specify SAML as the federation type,
   consistent with all other MDCT apps.
2. **IDM team:** Create the Okta SAML application in TEST, IMPL, and PROD;
   grant Okta access to an MDCT lead developer.
3. **MDCT team:** Create Okta application groups and rules to associate IDM
   CMS roles; update Cognito CDK to register IDM as a SAML identity provider;
   update role mapping logic (`custom:ismemberof` → `custom:cms_roles`).
4. **Testing:** End-to-end testing in TEST and IMPL with test user accounts
   before each environment promotion; architecture review before go-live.
5. **Business/onboarding:** Work with the IDM team to plan migration for
   existing SEDS users; coordinate with users to register in IDM and request
   application roles prior to cutover.
6. **Post go-live:** Ensure support channels are in place for users
   experiencing access issues after cutover.

---

## Decision

Chosen approach: Option 1. Option 3 is recommended as a separate follow-on
effort.

Option 1 was validated locally on 2026-06-29. Code flow works with the
existing EUA Okta SAML configuration. Silent token refresh was confirmed
working: a token was observed being issued 44 minutes after the original
login (well past the 30-minute expiry) with no redirect or user interaction
required.

The implementation should closely follow the pattern used by the other MDCT
apps. See `macpro-mdct-hcbs` as the reference implementation.

Option 3 is the right long-term direction, but involves cross-team
coordination and business onboarding work that warrants its own planning
and prioritization.

## Consequences

- **Good:** Resolves the immediate user experience and accessibility problem
- **Good:** No external dependencies; works with existing EUA Okta
  configuration
- **Bad:** SEDS remains on EUA while all other MDCT apps use IDM; full
  platform alignment is deferred until Option 3 is separately prioritized
