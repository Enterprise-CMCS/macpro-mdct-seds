/****** Form 64.21E  ******/
with d as (
SELECT cast(year([SubmissionDate]) as varchar) + '-64.21E-' + left('0' + a.[LineNumber],2) as MdctQuestion
	  ,[StateCode] + '-' + cast(year([SubmissionDate]) as varchar) + '-' + cast(month([SubmissionDate]) as varchar) + '-64.21E' as MdctStateForm
	  ,[StateCode] + '-' + cast(year([SubmissionDate]) as varchar) + '-' + cast(month([SubmissionDate]) as varchar) + '-64.21E-' + MdctRangeId + '-'  + left('0' + a.[LineNumber],2) as MdctAnswerEntry
	  ,age.MdctDescription
	  ,age.MdctRangeId
	  ,'{"col1": "", "col2": "% of FPL 0-133", "col3": "% of FPL 134-200", "col4": "% of FPL 201-250", "col5": "% of FPL 251-300", "col6": "% of FPL 301-317"},' as MdctHeader
	  ,case when left('0' + a.[LineNumber],2) <> '05' then
      			'{"col1": "' + right(a.[LineNumber],1) + '. ' + l.[Description] + '", '
      			+ '"col2": "' + cast(ISNULL(Column1, 0) as nvarchar) + '", '
      			+ '"col3": "' + cast(ISNULL(Column2, 0) as nvarchar) + '", '
      			+ '"col4": "' + cast(ISNULL(Column3, 0) as nvarchar) + '", '
      			+ '"col5": "' + cast(ISNULL(Column4, 0) as nvarchar) + '", '
      			+ '"col6": "' + cast(ISNULL(Column5, 0) as nvarchar) + '"} '
      		else
      			case when right(a.[LineNumber],1) = 'A' then
      				'{"col1": "' + right(a.[LineNumber],1) + '. ' + l.[Description] + '", '
      				+ '"col2": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-04'')].rows[1].col2","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-01'')].rows[1].col2"]}], '
      				+ '"col3": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-04'')].rows[1].col3","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-01'')].rows[1].col3"]}], '
      				+ '"col4": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-04'')].rows[1].col4","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-01'')].rows[1].col4"]}], '
      				+ '"col5": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-04'')].rows[1].col5","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-01'')].rows[1].col5"]}], '
      				+ '"col6": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-04'')].rows[1].col6","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-01'')].rows[1].col6"]}]} '
      			when right(a.[LineNumber],1) = 'B' then
      				'{"col1": "' + right(a.[LineNumber],1) + '. ' + l.[Description] + '", '
      				+ '"col2": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-04'')].rows[2].col2","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-01'')].rows[2].col2"]}], '
      				+ '"col3": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-04'')].rows[2].col3","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-01'')].rows[2].col3"]}], '
      				+ '"col4": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-04'')].rows[2].col4","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-01'')].rows[2].col4"]}], '
      				+ '"col5": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-04'')].rows[2].col5","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-01'')].rows[2].col5"]}], '
      				+ '"col6": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-04'')].rows[2].col6","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-01'')].rows[2].col6"]}]} '
      			else --Then we're on line C
      				'{"col1": "' + right(a.[LineNumber],1) + '. ' + l.[Description] + '", '
      				+ '"col2": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-04'')].rows[3].col2","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-01'')].rows[3].col2"]}], '
      				+ '"col3": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-04'')].rows[3].col3","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-01'')].rows[3].col3"]}], '
      				+ '"col4": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-04'')].rows[3].col4","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-01'')].rows[3].col4"]}], '
      				+ '"col5": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-04'')].rows[3].col5","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-01'')].rows[3].col5"]}], '
      				+ '"col6": [{"targets": ["$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-04'')].rows[3].col6","$..[?(@.question==''' + cast(year([SubmissionDate]) as varchar) + '-64.21E-01'')].rows[3].col6"]}]} '
      			end
      		end as MdctRows
	  ,'Legacy SEDS' as MdctLastModifiedBy
	  ,convert(VARCHAR(33), getdate(), 126) as MdctLastModified
	  ,'Legacy SEDS' as MdctCreatedBy
	  ,convert(VARCHAR(33), getdate(), 126) as MdctCreatedDate
  FROM [SCHIP].[dbo].[tbl64_21E] a
	join (Select * from [SCHIP].[dbo].LineItems where form = '64.21E') l on l.LineNumber = a.LineNumber
	join [SCHIP].[dbo].AgeRange age on age.AgeRangeID = a.AgeRange
WHERE SubmissionDate >= '1-1-2019' and right(a.[LineNumber],1) in ('A','B','C')
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