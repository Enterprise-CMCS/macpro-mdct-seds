/****** Gender, Race, Ethnicity  ******/
with d as (
SELECT cast(year([SubmissionDate]) as varchar) + '-GRE-' + case when left(a.[LineNumber],1) = 'G' then '01'
																when left(a.[LineNumber],1) = 'R' then '02' else '03' end as MdctQuestion
	  ,[StateCode] + '-' + cast(year([SubmissionDate]) as varchar) + '-' + cast(month([SubmissionDate]) as varchar) + '-GRE' as MdctStateForm
	  ,[StateCode] + '-' + cast(year([SubmissionDate]) as varchar) + '-' + cast(month([SubmissionDate]) as varchar) + '-GRE-0018-'  + case when left(a.[LineNumber],1) = 'G' then '01'
																																			when left(a.[LineNumber],1) = 'R' then '02' else '03' end  as MdctAnswerEntry
	  ,'All Ages' as MdctDescription
	  ,'0018' as MdctRangeId
	  ,'{"col1": "", "col2": "21E Enrolled", "col3": "64.21E Enrolled", "col4": "Total CHIP Enrolled", "col5": "64.EC Enrolled", "col6": "21PW Enrolled"},' as MdctHeader
	  ,case when left('0' + a.[LineNumber],2) <> '05' then
      			'{"col1": "' + right(a.[LineNumber],1) + '. ' + l.[Description] + '", '
      			+ '"col2": "' + cast(ISNULL([Enr21E], 0) as nvarchar) + '", '
                + '"col3": "' + cast(ISNULL([Enr6421E], 0) as nvarchar) + '", '
                + '"col4": "' + cast(ISNULL([EnrTotal], 0) as nvarchar) + '", '
                + '"col5": "' + cast(ISNULL([Enr64EC], 0) as nvarchar) + '", '
                + '"col6": "' + cast(ISNULL([Enr21PW], 0) as nvarchar) + '"} '
      		else
      			case when right(a.[LineNumber],1) = 'A' then
      				'{"col1": "' + right(a.[LineNumber],1) + '. ' + l.[Description] + '", '
      				+ '"col2": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-04'')].rows[1].col2","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-01'')].rows[1].col2"]}], '
      				+ '"col3": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-04'')].rows[1].col3","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-01'')].rows[1].col3"]}], '
      				+ '"col4": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-04'')].rows[1].col4","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-01'')].rows[1].col4"]}], '
      				+ '"col5": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-04'')].rows[1].col5","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-01'')].rows[1].col5"]}], '
      				+ '"col6": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-04'')].rows[1].col6","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-01'')].rows[1].col6"]}]} '
      			when right(a.[LineNumber],1) = 'B' then
      				'{"col1": "' + right(a.[LineNumber],1) + '. ' + l.[Description] + '", '
      				+ '"col2": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-04'')].rows[2].col2","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-01'')].rows[2].col2"]}], '
      				+ '"col3": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-04'')].rows[2].col3","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-01'')].rows[2].col3"]}], '
      				+ '"col4": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-04'')].rows[2].col4","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-01'')].rows[2].col4"]}], '
      				+ '"col5": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-04'')].rows[2].col5","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-01'')].rows[2].col5"]}], '
      				+ '"col6": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-04'')].rows[2].col6","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-01'')].rows[2].col6"]}]} '
      			else --Then we're on line C
      				'{"col1": "' + right(a.[LineNumber],1) + '. ' + l.[Description] + '", '
      				+ '"col2": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-04'')].rows[3].col2","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-01'')].rows[3].col2"]}], '
      				+ '"col3": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-04'')].rows[3].col3","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-01'')].rows[3].col3"]}], '
      				+ '"col4": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-04'')].rows[3].col4","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-01'')].rows[3].col4"]}], '
      				+ '"col5": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-04'')].rows[3].col5","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-01'')].rows[3].col5"]}], '
      				+ '"col6": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-04'')].rows[3].col6","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-GRE-01'')].rows[3].col6"]}]} '
      			end
      		end as MdctRows
	  ,'Legacy SEDS' as MdctLastModifiedBy
	  ,convert(VARCHAR(33), getdate(), 126) as MdctLastModified
	  ,'Legacy SEDS' as MdctCreatedBy
	  ,convert(VARCHAR(33), getdate(), 126) as MdctCreatedDate
  FROM [SCHIP].[dbo].[tblRace] a
	join (Select * from [SCHIP].[dbo].LineItems where form = 'RACE') l on l.LineNumber = a.LineNumber
WHERE SubmissionDate >= '1-1-2019'
)

select MdctQuestion, MdctStateForm, MdctAnswerEntry, MdctDescription, MdctRangeId
	  ,MdctLastModifiedBy, MdctLastModified, MdctCreatedBy, MdctCreatedDate
	  ,MdctHeader + STUFF ((Select ', ' + dd.MdctRows
				from d dd
				where dd.MdctAnswerEntry = d.MdctAnswerEntry
				for XML PATH ('')), 1, 1, '') MdctRows
from d
group by MdctQuestion, MdctStateForm, MdctAnswerEntry, MdctDescription, MdctRangeId
	  ,MdctLastModifiedBy, MdctLastModified, MdctCreatedBy, MdctCreatedDate, MdctHeader