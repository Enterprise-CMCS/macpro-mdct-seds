/****** Certification for state_forms  ******/
Declare @date as date

Set @date = '1-1-2019';

With schip as (
SELECT f.[StateCode] as MdctStateId
      ,year([SubmissionDate]) as MdctYear
	  ,month([SubmissionDate]) as MdctQuarter
	  ,f.[StateCode] + '-' + cast(year([SubmissionDate]) as varchar) + '-' + cast(month([SubmissionDate]) as varchar) + '-21E' as MdctStateForm
      ,'1' as MdctFormId
	  ,'21E' as MdctForm
	  ,'Number of Children Served in Separate CHIP Program' as MdctFormName
	  ,case when [Form21E] = 'Y' then '4' else '1' end as MdctStatusId
	  ,case when [Form21E] = 'Y' then 'Final Data Certified and Submitted' else 'In Progress' end as MdctStatus
	  ,'false' as MdctNotApplicable
	  ,'All' as MdctProgramCode
	  ,0.03 as MdctValidationPercent
	  ,'text_multiline' as MdctStateComments_Type
	  ,null as MdctStateComments_Entry
	  ,'Legacy SEDS' as MdctStatusModifiedBy
	  ,convert(VARCHAR(33), getdate(), 126) as MdctStatusDate
	  ,'Legacy SEDS' as MdctLastModifiedBy
	  ,convert(VARCHAR(33), getdate(), 126) as MdctLastModified
	  ,'Legacy SEDS' as MdctCreatedBy
	  ,convert(VARCHAR(33), getdate(), 126) as MdctCreatedDate
  FROM [SCHIP].[dbo].[tbl21E] f
	left join [SCHIP].[dbo].[CertificationRequirements] c on c.[StateCode] = f.[StateCode] and c.[StartQuarter] = f.[SubmissionDate]
  where [SubmissionDate] >= @date
  group by f.[StateCode], [SubmissionDate], case when [Form21E] = 'Y' then '4' else '1' end, case when [Form21E] = 'Y' then 'Final Data Certified and Submitted' else 'In Progress' end
),
medicaid as (
SELECT f.[StateCode] as MdctStateId
	  ,year([SubmissionDate]) as MdctYear
	  ,month([SubmissionDate]) as MdctQuarter
	  ,f.[StateCode] + '-' + cast(year([SubmissionDate]) as varchar) + '-' + cast(month([SubmissionDate]) as varchar) + '-64.EC' as MdctStateForm
      ,'2' as MdctFormId
	  ,'64.EC' as MdctForm
	  ,'Number of Children Served in Medicaid Program' as MdctFormName
	  ,case when [Form64EC] = 'Y' then '4' else '1' end as MdctStatusId
	  ,case when [Form64EC] = 'Y' then 'Final Data Certified and Submitted' else 'In Progress' end as MdctStatus
	  ,'false' as MdctNotApplicable
	  ,'All' as MdctProgramCode
	  ,0.03 as MdctValidationPercent
	  ,'text_multiline' as MdctStateComments_Type
	  ,null as MdctStateComments_Entry
	  ,'Legacy SEDS' as MdctStatusModifiedBy
	  ,convert(VARCHAR(33), getdate(), 126) as MdctStatusDate
	  ,'Legacy SEDS' as MdctLastModifiedBy
	  ,convert(VARCHAR(33), getdate(), 126) as MdctLastModified
	  ,'Legacy SEDS' as MdctCreatedBy
	  ,convert(VARCHAR(33), getdate(), 126) as MdctCreatedDate
  FROM [SCHIP].[dbo].[tbl64_EC] f
	left join [SCHIP].[dbo].[CertificationRequirements] c on c.[StateCode] = f.[StateCode] and c.[StartQuarter] = f.[SubmissionDate]
  where [SubmissionDate] >= @date
  group by f.[StateCode], [SubmissionDate], case when [Form64EC] = 'Y' then '4' else '1' end, case when [Form64EC] = 'Y' then 'Final Data Certified and Submitted' else 'In Progress' end
),
med_exp as (
SELECT f.[StateCode] as MdctStateId
	  ,year([SubmissionDate]) as MdctYear
	  ,month([SubmissionDate]) as MdctQuarter
	  ,f.[StateCode] + '-' + cast(year([SubmissionDate]) as varchar) + '-' + cast(month([SubmissionDate]) as varchar) + '-64.21E' as MdctStateForm
      ,'3' as MdctFormId
	  ,'64.21E' as MdctForm
	  ,'Number of Children Served in Medicaid Expansion Program' as MdctFormName
	  ,case when Form6421E = 'Y' then '4' else '1' end as MdctStatusId
	  ,case when Form6421E = 'Y' then 'Final Data Certified and Submitted' else 'In Progress' end as MdctStatus
	  ,'false' as MdctNotApplicable
	  ,'All' as MdctProgramCode
	  ,0.03 as MdctValidationPercent
	  ,'text_multiline' as MdctStateComments_Type
	  ,null as MdctStateComments_Entry
	  ,'Legacy SEDS' as MdctStatusModifiedBy
	  ,convert(VARCHAR(33), getdate(), 126) as MdctStatusDate
	  ,'Legacy SEDS' as MdctLastModifiedBy
	  ,convert(VARCHAR(33), getdate(), 126) as MdctLastModified
	  ,'Legacy SEDS' as MdctCreatedBy
	  ,convert(VARCHAR(33), getdate(), 126) as MdctCreatedDate
  FROM [SCHIP].[dbo].[tbl64_21E] f
	left join [SCHIP].[dbo].[CertificationRequirements] c on c.[StateCode] = f.[StateCode] and c.[StartQuarter] = f.[SubmissionDate]
  where [SubmissionDate] >= @date
  group by f.[StateCode], [SubmissionDate], case when [Form6421E] = 'Y' then '4' else '1' end, case when [Form6421E] = 'Y' then 'Final Data Certified and Submitted' else 'In Progress' end
),
gre as (
SELECT f.[StateCode] as MdctStateId
	  ,year([SubmissionDate]) as MdctYear
	  ,month([SubmissionDate]) as MdctQuarter
	  ,f.[StateCode] + '-' + cast(year([SubmissionDate]) as varchar) + '-' + cast(month([SubmissionDate]) as varchar) + '-GRE' as MdctStateForm
      ,'5' as MdctFormId
	  ,'GRE' as MdctForm
	  ,'Gender, Race & Ethnicity' as MdctFormName
	  ,case when FormREG = 'Y' then '4' else '1' end as MdctStatusId
	  ,case when FormREG = 'Y' then 'Final Data Certified and Submitted' else 'In Progress' end as MdctStatus
	  ,'false' as MdctNotApplicable
	  ,'All' as MdctProgramCode
	  ,0.03 as MdctValidationPercent
	  ,'text_multiline' as MdctStateComments_Type
	  ,null as MdctStateComments_Entry
	  ,'Legacy SEDS' as MdctStatusModifiedBy
	  ,convert(VARCHAR(33), getdate(), 126) as MdctStatusDate
	  ,'Legacy SEDS' as MdctLastModifiedBy
	  ,convert(VARCHAR(33), getdate(), 126) as MdctLastModified
	  ,'Legacy SEDS' as MdctCreatedBy
	  ,convert(VARCHAR(33), getdate(), 126) as MdctCreatedDate
  FROM [SCHIP].[dbo].[tblRace] f
	left join [SCHIP].[dbo].[CertificationRequirements] c on c.[StateCode] = f.[StateCode] and c.[StartQuarter] = f.[SubmissionDate]
  where [SubmissionDate] >= @date
  group by f.[StateCode], [SubmissionDate], case when [FormREG] = 'Y' then '4' else '1' end, case when [FormREG] = 'Y' then 'Final Data Certified and Submitted' else 'In Progress' end
),
pw as (
SELECT f.[StateCode] as MdctStateId
	  ,year([SubmissionDate]) as MdctYear
	  ,month([SubmissionDate]) as MdctQuarter
	  ,f.[StateCode] + '-' + cast(year([SubmissionDate]) as varchar) + '-' + cast(month([SubmissionDate]) as varchar) + '-21PW' as MdctStateForm
      ,'6' as MdctFormId
	  ,'21PW' as MdctForm
	  ,'Number of Pregnant Women Served' as MdctFormName
	  ,case when Form21PW = 'Y' then '4' else '1' end as MdctStatusId
	  ,case when Form21PW = 'Y' then 'Final Data Certified and Submitted' else 'In Progress' end as MdctStatus
	  ,'false' as MdctNotApplicable
	  ,'All' as MdctProgramCode
	  ,0.03 as MdctValidationPercent
	  ,'text_multiline' as MdctStateComments_Type
	  ,null as MdctStateComments_Entry
	  ,'Legacy SEDS' as MdctStatusModifiedBy
	  ,convert(VARCHAR(33), getdate(), 126) as MdctStatusDate
	  ,'Legacy SEDS' as MdctLastModifiedBy
	  ,convert(VARCHAR(33), getdate(), 126) as MdctLastModified
	  ,'Legacy SEDS' as MdctCreatedBy
	  ,convert(VARCHAR(33), getdate(), 126) as MdctCreatedDate
  FROM [SCHIP].[dbo].[tbl21PW] f
	left join [SCHIP].[dbo].[CertificationRequirements] c on c.[StateCode] = f.[StateCode] and c.[StartQuarter] = f.[SubmissionDate]
  where [SubmissionDate] >= @date
  group by f.[StateCode], [SubmissionDate], case when [Form21PW] = 'Y' then '4' else '1' end, case when [Form21PW] = 'Y' then 'Final Data Certified and Submitted' else 'In Progress' end
)

select * from schip
UNION
select * from medicaid
UNION
select * from med_exp
UNION
select * from gre
UNION
select * from pw