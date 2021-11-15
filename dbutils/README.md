
# DynamoDB utilities to update or fix data
# NOTE: Python Scripts for Form Answers table Dups Issues

========
Scripts:
========

---------------------------------------------
1.) removeDupsFromform_answers_table_byId.py
---------------------------------------------

     The PROD dynamoDB table had duplicate data in the rows field in the form_answers table that needed to be removed. This is for Story: https://qmacbis.atlassian.net/browse/OY2-13518

     The script uses the included file "dupAnswer_entry_Ids.txt" which is a list of records that had duplicate values for the rows field.

     The script reads the id and loops through the records and finds rows and removes duplicate rows.

---------------------------------------------
2.) dumpAll-master-form-answers-table.py
---------------------------------------------

    This script can backup the form-answers table.  It dumps all records from dev master-form-answers table.

    The output can be used to load VAL for final testing and to backup the table.

    example:  python dumpAll-master-form-answers-table.py master-form-answers

---------------------------------------------
3.) load-form-answer-table.py
---------------------------------------------

    This script takes a file and loads those records into a new-table.

    This can be used to load data dumped from the form-answers table.

    example:  python load-form-answer-table.py items.json master-form-answers

--------------------