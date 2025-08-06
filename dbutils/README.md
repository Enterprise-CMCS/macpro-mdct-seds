# DynamoDB utilities to update or fix data

# NOTE: Python Scripts for Form Answers table Dups Issues

NOTE You need to setup AWS environment exports for:

========
Scripts:
========

---

## 1.) removeDupsFromform_answers_table_byId.py

This will remove dups for keys listed in a file provided for form-answers table.

NOTE: Use the prodAllRecordKeys.txt file as the ids for all PROD records as of now.

EXAMPLE

<pre>
For Dev
  python removeDupsFromform_answers_table_byId.py prodAllRecordKeys.txt main-form-answers

For VAL
  python removeDupsFromform_answers_table_byId.py prodAllRecordKeys.txt val-form-answers


For PROD:
  python removeDupsFromform_answers_table_byId.py prodAllRecordKeys.txt production-form-answers
</pre>

---
