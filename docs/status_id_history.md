# A History of Status ID
_As of November 2025_

This document describes how state forms' status was previously tracked,
and how that changed over time.

This document is not a guide for the current implementation.

## SEDS before SEDS (as we know it)

The purpose of SEDS (Statistical Enrollment Data System) is to collect data:
For each state, for each quarter, how many children are enrolled in CHIP?
The federal government has been collecting this data since 1998.
But this codebase was [effectively created in 2020][seds-initial-commit].
So there are years and years of SEDS data outside of the system you see now.

I can't tell you exactly what that data looks like,
or how it might have changed between 1998 and 2020.
But we can make some inferences.

## What are the statuses?

A state form can be:
   - **In Progress**:
     The form is missing some or all of its data.
     SEDS does not make a distinction for Not Started;
     a form is In Progress from the moment it is created.
   - **Provisional Certified**:
     The state user believes they have entered all the data,
     but it is still being reviewed.
   - **Final Certified**:
     Now the state user has declared that the data is complete.
   - **Not Required**:
     Not every form makes sense for every state.
     If a state user says that a form doesn't apply to them,
     it will have this status.

Those are the only statuses currently.
As far as I'm aware, they are the only statuses ever.

Note that I am using shortened names.
For example, the full name of Provisional Certified is
`Provisional Data Certified and Submitted`.
But those full names are irrelevant to the rest of this document.

## How did SEDS track status in 2020?

Every entry in the `state-forms` table had three related fields.
An integer `status_id`, a string `status`, and a boolean `not_applicable`.

These three fields were intended to correspond with each other.
Ideally, `status_id` would map directly to `status`,
and the `not_applicable` flag would be true if (and only if)
the form were Not Required.
Unfortunately, that's not what was implemented.

- Not every `status_id` mapped to a different `status`.
  Both 1 and 2 meant In Progress;
  they were treated identically by the code.
  I theorize that this was due to an uncompleted attempt
  to implement a Not Started status,
  but that's only a guess.
- Not every `status` was represented by a different `status_id`.
  4 meant either Final Certified or Not Required,
  depending on the value of `not_applicable`.
  I theorize that Not Required was intended to be 5,
  but that's only a guess.
- Several small bugs added up to allow `not_applicable` to change
  independently of `status` and `status_id`.
  Thus, a handful of forms claimed to be In Progress but also `not_applicable`.
  Another handful were Not Required but also not `not_applicable`.
  These bugs were rare; only about 20 forms were affected, ever.

I theorize that the original intention was to have only `status_id`,
and look up the `status` description using a relational database join.
But when SEDS landed on a NoSQL database, the design was reworked on the fly.
Again, this is only a guess.

## Where does the data go?

Let's take a step back.

Ultimately, we collect this data on behalf of the federal government,
so that they can effectively allocate CHIP funds.
But we don't deliver reports directly to your senator.
Whenever a state form is modified,
we send a copy of that form through Kafka.

There are two parties listening to that Kafka topic.
[One is CARTS][carts-listener], which uses it to auto-fill a table in its reports.
The other is DataConnect.
They gather data from many sources
(including multiple MDCT apps)
and compile it into various reports and dashboards.
Those, in theory, your senator can read.

Our clue for what pre-2020 data looks like is here:
in the old DataConnect [code to interpret `status_id`][status-id-interpret-2020].
Let me format that code as a table:

| ID | Meaning pre-2020 | Meaning post-2020              |
|----|------------------|--------------------------------|
|  1 | In Progress      | In Progress                    |
|  2 | Provisional Cert | In Progress                    |
|  3 | Final Cert       | Provisional Cert               |
|  4 | Not Required     | Final Cert **OR** Not Required |

Attentive readers will notice that the "OR Not Required" part
was not implemented in DataConnect's code.
Therefore, I believe that all Not Required forms from that time period
were displayed as being Final Certified.
A bug, but probably a low-impact one.

## What did we try to do?

In theory, it would have been possible for us to just fix the bugs in SEDS,
ensuring that the three fields stay in sync with each other.
Then update the twenty-or-so forms affected by those bugs.
And move on to other stories.

But we decided that the best course of action would be to
remove the extra fields from state forms, leaving only `status_id`.
The `status` descriptions could be looked up separately,
and the `not_applicable` flag could be derived on the fly.
No need to store those fields on every individual state form object.

However, DataConnect was reading those fields in their SEDS ingestion pipeline.
Before we could remove them, we needed DataConnect to start ignoring them.
Happily, they were able to [do just that][dc-removes-old-fields].

The next question: which ID mapping should we use?
We considered completing the implementation of Not Started at 1,
and bumping Not Required down to 5.
Ultimately we decided that future SEDS forms should align with past SEDS forms,
so we should use the pre-2020 meanings of `status_id`.

The next question: What to do with existing data?
This was an easier choice.
No one wants to maintain a system where IDs' meanings change year-to-year.
We had to run an ETL, updating all state forms (2020-2025),
removing the extra fields and updating `status_id` as appropriate.
Happily, this would also simplify the code on DataConnect's end.

Since we were changing the meaning of `status_id`,
this required a coordinated release with DataConnect.
We would update all of our data, sending it through Kafka.
They would update their interpretation code.
Then they would re-run their Kafka message processing.

## How did it go?

This was planned for September 24, 2025, and it did not happen that day.

When coordinating test cases, we discovered that:
- Some forms in the MDCT database didn't match the status of those forms in DC
- Some forms in MDCT don't even exist in DC
- Some forms in DC appear to be missing status information entirely

We postponed the release until we could figure out what was going on.

## Data Problems

The vast majority of forms with status mismatches were from 2019.
And let's pause for a second.
Didn't I tell you that SEDS as we know it went live in 2020?
How could we have data from 2019 in our database?

Let me tell you, I'm as confused as you are.
Maybe the 2020 SEDS maintainers generated a set of blank forms for 2019.
Maybe they tried to import that data from the previous system.
Maybe they wanted to allow users to edit past years' forms in the new UI?
I don't know.

What I can say for sure is that the 2019 data in this system looks wrong.
The vast majority of forms are In Progress,
whereas DataConnect shows most 2019 forms as being Final Certified
(which makes more sense).
These forms do have _some_ data,
but I can't say how it got there,
how complete it is,
or how accurate it is.

As for the forms which exist in MDCT but not DC,
those are all (at least, after 2019 they are all) a specific form type: 64.ECI.
This form type has been discontinued;
the real problem is that they exist in MDCT at all.
But that's a problem for another day.
In the meantime, DC is correctly ignoring all 64.ECI forms,
and they are not missing any others.

That just leaves the forms which have no status in DataConnect's database.
This appears to be an artifact of their data ingestion process.
Specifically, the table `dc_prod_bi_catalog.seds_bi.seds_enrollment_vw`
will sometimes have multiple rows for a given form ID.
The form ID contains the state, year, and quarter,
but only one row will have matching values in the year and quarter columns.
The other rows will not match, and will not have status information.
I don't understand how this happens,
and I don't understand how it's handled before being displayed to users,
but I don't _need_ to understand the entire universe.
The folks at DataConnect seem to have this under control,
so it doesn't pose a problem for our `status_id` rework.

## Data Solutions

Therefore, the only change we needed to make was to quarantine our 2019 data.
Not just exclude it from this ETL,
but ensure that it would be excluded from any future ETL.
We did so directly within [our Kafka message sending code][2019-filter].

Whenever we're about to send a Kafka message about a 2019 state form,
or answers within a 2019 state form,
if that form hasn't actually been modified,
we will just skip that message instead.
This will allow legitimate user activity to continue to flow through Kafka,
but will prevent forceKafkaSync.js (or any similar script)
from re-sending all 2019 data at once.
On DC's side, that would effectively reset hundreds of forms
from Final Certified back to In Progress,
which we **definitely** want to avoid.

The MDCT deployment took place on Octobver 22, 2025.
The DC deployment took place the following morning.
As far as I can tell, everything went perfectly smoothly.
And DC's [status interpretation code][status-id-interpret-2025] is simpler than ever.

## Lessons learned

### Don't fear the lookup

I believe the primary design lesson here is to be less afraid of lookups.
When displaying a form's status,
it is convenient to have it immediately available as `form.status`,
as opposed to looking up `statusDescriptions[form.status_id]`.
But having the same concept duplicated across multiplie fields
is precisely what allows for bugs where those fields get out of sync,
and those bugs are precisely what happened.

### Down with toggle switches

One of those bugs arose from the NotApplicable component,
which was for a time the _only_ toggle switch in any MDCT app.
This was the control which allowed users to indicate a form was Not Required.
The [code was complicated][not-applicable-before],
and it [had had other bugs too][old-not-applicable-bug].

That toggle switch is now a radio button.
Since it's only been in production as such for a few weeks,
it may be a bit early to declare victory.
But you know what they say:
"Either code obviously has no bugs, or it has no obvious bugs."
I'm willing to bet the radio button code won't sprout any problems for a while.

### Don't merge until you're sure

I merged code to delete `status` and `not_applicable` to main in mid-September.
After discovering the data problems,
I had to roll that code back in order to let other changes through.
And then I had to roll back the roll back when we were actually ready to go.
And it wasn't that simple, because I had also run my ETL in dev.
That makes the git history a bit of a mess.
The relevant PRs are [15161][initial-status-pr],
[15202][status-rollback],
and [15223][status-rollback-rollback].

### Don't fear the hard code

Additionally, there may be a lesson in favor of hardcoding.
If the status descriptions had been hardcoded directly in a map on the UI side,
it's possible that none of this would have happened.
This is something we developers shy away from:
"What if the status descriptions change? Wouldn't a DB update be easier?"
My answer is, "easier for who?"
This app's UI is fantastically easy to redeploy, and we do it all the time.
But production database updates require special know-how and permissions.

Also, note: as far as I can tell, the status descriptions have never changed.

## Okay that's it love you bye

If you read this whole document, I can only assume that you are
- entertained by the ups and downs of the story, or
- desparately looking for clues to unravel some new `status_id` problem.

I certainly hope it's the former. Either way, good luck 🙂

[seds-initial-commit]: https://github.com/Enterprise-CMCS/macpro-mdct-seds/commit/1d3a2a584a9183aee370366b9994bb03863ec477
[carts-listener]: https://github.com/Enterprise-CMCS/macpro-mdct-carts/blob/1f81a334a88fcf769e189148cd2219d928f960b9/services/carts-bigmac-streams/handlers/sinkEnrollmentCounts.js
[status-id-interpret-2020]: https://github.com/Enterprise-CMCS/macdc-dqe/blob/6dc91eec559bcd1b9d18c6833aeb29df1f3883c6/notebooks/gold/enrollment/seds_gold_data_pipeline.py#L423-L439
[dc-removes-old-fields]: https://github.com/Enterprise-CMCS/macdc-etl/pull/427/files
[2019-filter]: https://github.com/Enterprise-CMCS/macpro-mdct-seds/blob/b197ed6b8c300e8d659a827ca2b70f0a76e773cd/services/app-api/libs/kafka-source-lib.js#L96-L121
[status-id-interpret-2025]: https://github.com/Enterprise-CMCS/macdc-dqe/blob/23702dabb70737f8e0d4f6bfb0559c9d4740aaf7/notebooks/gold/enrollment/seds_gold_data_pipeline.py#L430-L438
[not-applicable-before]: https://github.com/Enterprise-CMCS/macpro-mdct-seds/blob/e3756c30f865c14ede0ea91cef0bd36cc6245da6/services/ui-src/src/components/NotApplicable/NotApplicable.jsx
[old-not-applicable-bug]: https://github.com/Enterprise-CMCS/macpro-mdct-seds/pull/14920/files
[initial-status-pr]: https://github.com/Enterprise-CMCS/macpro-mdct-seds/pull/15161
[status-rollback]: https://github.com/Enterprise-CMCS/macpro-mdct-seds/pull/15202
[status-rollback-rollback]: https://github.com/Enterprise-CMCS/macpro-mdct-seds/pull/15223
