# SEDS Manual Regression Test Plan

These steps describe a complete regression test of SEDS.

Our automated end-to-end test suite should verify most or all of this behavior,
but if that automation fails (for any reason _unrelated_ to site functionality),
we can fall back on this test outline to ensure everything is working.

**Test 0:** The site should load.

## User and Login types

**Test 1.1:** Should be able to log in with a test account.

- For most testing, we log in with test accounts like `stateuser@test.com`.

**Test 1.2:** Should be able to log in with a real account.

- In production, users log in with their EUA IDs.

**Test 1.3:** State users should see the state selector on initial login.

- If we don't already have a record in the AuthUser table,
  we don't know which state this user belongs to.
  They tell us by selecting their state from a dropdown.
- In ephemeral environments, AuthUser is not seeded.
  So the first test you run _will_ be that user's first login.
- In persistent, pre-prod environments, you can simulate a first login:
  Log in to the AWS web UI, and delete your test user's record in AuthUser.
- After selecting a state, the user should see the state home page.
  This is a two-level accordion with years and quarters.
- _Common issue:_ The database seeding process takes longer than you expect.
  Until it completes, the site may behave strangely;
  like repeatedly redirecting state users to the state select selector.

**Test 1.4:** State users should not see the state selector on later logins.

- Once we know a user's state, we should never have to ask them again.

**Setup for later test:** Log in as a second state user.

- This will create another record in AuthUser, for us to manipulate later.

**Test 1.5:** Admin users should see the admin home page.

- This is a list of links to admin-only pages, followed by a state dropdown.
  When the user selects a state, we also show the year & quarter accordion.

**Setup for later test:** Promote a State user to a Business user.

- As admin, click on the `View / Edit Users` link.
- On this page, you should see a table with three users:
  The two state users from before, and yourself.
- Click on the username of the second state user (leftmost table column).
- On this page, you will see that user's details.
- Change the Role dropdown from "State" to "Business", and save.
- This completes **Test 3.1**.

**Test 1.6:** Business users should see the business home page.

- Log in as the user you promoted.
- Instead of the state home page, you should see the business home page.
  This is the same as the admin home page, but without the list of links.

## Permissions

**Test 2.1:** State users should be able to edit FPL

- The FPL control only appears at the top of non-GRE forms

**Test 2.2:** State users should be able to edit data within forms.

**Test 2.3:** State users should be able to edit summary notes.

- This field only appears on the Summary tab of a form, at the very bottom.

**Test 2.4:** State users should be able to mark a form as Not Applicable.

- This is the "Does this form apply to this state" radio button.

**Test 2.5:** State users should be able to Provisionally Certify a form.

**Test 2.6:** State users should be able to Final Certify a form.

**Test 2.7:** State users should be able to Uncertify a form.

- The uncertify button is only displayed when the form is certified.

**Test 2.8:** State users should _not_ be able to view admin-only pages.

**Test 2.8:** State users should _not_ be able to view data for other states.

**Test 2.9:** Business users should _not_ be able to edit FPL.

**Test 2.10:** Business users should _not_ be able to edit data within forms.

**Test 2.11:** Business users should _not_ be able to edit summary notes.

**Test 2.12:** Business users should be able to mark a form as Not Applicable.

**Test 2.13:** Business users should be able to Provisionally Certify a form.

**Test 2.14:** Business users should be able to Final Certify a form.

**Test 2.15:** Business users should be able to Uncertify a form.

**Test 2.16:** Business users should _not_ be able to view admin-only pages.

**Test 2.17:** Admin users should _not_ be able to edit FPL.

**Test 2.18:** Admin users should _not_ be able to edit data within forms.

**Test 2.19:** Admin users should _not_ be able to edit summary notes.

**Test 2.20:** Admin users should _not_ be able to mark a form as Not Applicable.

**Test 2.21:** Admin users should _not_ be able to Provisionally Certify a form.

**Test 2.22:** Admin users should _not_ be able to Final Certify a form.

**Test 2.23:** Admin users should _not_ be able to Uncertify a form.

**Test 2.24:** Admin users should be able to view admin-only pages.

## Admin functions

**Test 3.1:** Admins should be able to view users and edit their role.

- This was already verified when setting up the business user.

**Test 3.2:** Admins should be able to edit a user's state

- On the edit user page, change the state dropdown.
- Log back in as the state user.
- You should see the new state's forms.

**Test 3.3:** Admins should be able to edit form templates.

- From the admin home page, go to the "Add/Edit Form Templates" link.
- Wait for a moment for the year dropdown to populate.
- The text area will also populate with a large JSON array.
- Change something about this JSON.
  - For example, the `label` of the first `age_ranges` object.
- Save the change, confirming in the modal that pops up.
- You should see a message: "Template saved successfully".
- If you refresh the page, you should see the JSON with your change.

**Test 3.4:** Admins should be able to create form templates.

- On the form templates page, select "+ Create New" in the year dropdown.
- Select a year - probably the year after the most recent dropdown option.
- Enter some JSON.
  - You might copy the JSON from the previous year.
  - Or you might just throw in `[{ "foo": "bar" }]`.
  - It must be valid JSON, and it must be an array.
- Save the template, confirming in the modal.
- You should see a success message.
- If you refresh the page, you should see your data.

**Test 3.5:** Admins should be able to generate forms.

- From the admin home page, go to the "Generate Quarterly Forms" link.
- Select a year.
  - You MUST select a form for which a template exists, or can be auto-created.
  - If a year has a template, it will show in the dropdown from test 3.3.
  - Templates can be auto-created immediately after a year with a template.
  - For example: if we have templates for 2019 and 2020,
    we can generate forms for 2019, 2020, or 2021, but _not_ 2022.
  - If you try an invalid year, the environment will be broken.
    It will be fixable, but only by manual AWS interventions.
- Select a quarter.
- Click the "Generate Forms" button, and confirm in the modal.
- This should be successful.
  - If the quarter already had forms, you should see a message saying so.
  - If it did not, you should see a message saying they've been created.
  - In either case, you should be able to view the new forms, in any state.

**Test 3.6:** Admins should be able to re-generate enrollment counts.

- Prepare the data:
  - Ensure that at least one state, in at least one year, has Q4 forms.
    - Enrollment Counts are annual; they do not exist in Q1, Q2, or Q3.
  - Log in to SEDS as a state user, and open a form 21E or 64.21E, in Q4.
  - Add some data to Question 7, in any age group.
- Deliberately corrupt that data:
  - Log in to the AWS web UI, with admin access.
  - Find the form you just modified, in the `state-forms` DynamoDB table.
  - Note that it has an `enrollmentCounts` property, reflecting your new data.
  - Edit that object. Change the count to some other, wrong number.
    - This count is auto-calculated whenever form data is saved from the UI,
      but that's not what we're trying to test,
      so we have to change it from here.
- Fix the data:
  - Log in to SEDS as an admin user.
  - Go to the "Generate Total Enrollment Counts" link.
  - Click the Button, and confirm.
  - Eventually (this takes a while), you should see a success message.
- Verify the fix:
  - Back in the AWS Web UI, find that `state-forms` record again.
  - It should be reset back to the correct number.

## Data Behavior

**Test 4.1:** Question 5 should auto-calculate.

- Log in as a state user.
- Open form 21E, in any quarter.
- Enter some data for Questions 1 and 4.
- Note that Question 5 contains the ratios of the data you entered.
