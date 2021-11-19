
# DynamoDB utilities to update or fix data
# NOTE: Python Scripts for Form Answers table Dups Issues

NOTE You need to setup AWS environment exports for:

========
Scripts:
========

---------------------------------------------
1.) findDups.py
---------------------------------------------

    This will find duplicate form-answer records Keys.

    EXAMPLE:

    python findDups.py prodAllRecordKeys.txt production-form-answers  > foundDupsInProd.txt

NOTE: Setup AWS credentials environment vars.

---------------------------------------------
2.) compareTwoDynamoDBTablesFormAnswers.py
---------------------------------------------

   This will compare two form-answer dyanamodb tables to find not found keys.

    EXAMPLE:

    python compareTwoDynamoDBTablesFormAnswers.py foundDupsInProd.txt production-form-answers val-form-answers

NOTE: You need to set enviroment vars for SRC_AWS_ACCESS_KEY_ID=
                                          SRC_AWS_SECRET_ACCESS_KEY=
                                          SRC_AWS_SESSION_TOKEN=
                                          DEST_AWS_ACCESS_KEY_ID=
                                          DEST_AWS_SECRET_ACCESS_KEY=
                                          DEST_AWS_SESSION_TOKEN=

---------------------------------------------
3.) dumpAll-master-form-answers-table.py
---------------------------------------------

    This script can backup the form-answers table.  It dumps all records from dev master-form-answers table.

    The output can be used to load VAL for final testing and to backup the table.

    example:  python dumpAll-master-form-answers-table.py master-form-answers

---------------------------------------------
4.) load-form-answer-table.py
---------------------------------------------

    This script takes a file and loads those records into a new-table.

    This can be used to load data dumped from the form-answers table.

    example:  python load-form-answer-table.py items.json master-form-answers

--------------------
