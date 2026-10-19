# Uncertified Emails

SEDS previously sent three types of automated emails for uncertified forms:

1. Once a quarter, an email to every business user,
   listing all states with forms that had not yet been certified.
2. Once a quarter, an email to every state user belonging to a state
   which had any forms which had not yet been certified.
3. Whenever any certified form was moved back to In Progress by a state user,
   an email to every business user notfying them.

All of these emails were disabled, in Feb 2024.
However, the business owners requested that code be maintained,
so that we can easily re-enable the emails if the need ever arises.

So we have several blocks of commented email code throughout the repo:

- In the deployment folder
- In the Certification Tab component
- In the tests

The lambdas themselves are not commented,
but since they are technically dead code,
they are excluded from unit test coverage analysis.

The related JIRA ticket was [3229](https://jiraent.cms.gov/browse/CMDCT-3229).
