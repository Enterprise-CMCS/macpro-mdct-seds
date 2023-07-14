import boto3
from boto3.dynamodb.conditions import Key, Attr
import time

# This script was created to load data from a PITR-created table after data loss on 3/23/23-3/24/23.

# Running this script:
#    * Set the aws environment config file with the temporary values in [default] within ~/.aws/config
#    * `pip install boto3` or `python3 -m pip install boto3`
#    * Set RUN_LOCAL, RUN_UPDATE, and STAGE appropriately
#    * run the script (`python3 pitr_recovery.py`)
# Target localhost:8000, won't go up to AWS if True
RUN_LOCAL = True
# Prefix for the environment (master/val/production)
STAGE = "master"
STATE_FORMS_TABLE = "-state-forms"  # 5.3 k forms, 2.6MB
ANSWERS_TABLE = "-form-answers"  # 120k answers, 97MB
FILENAME = STAGE + "-missing.txt"


def main():
    # Config db connection
    dynamodb = None
    stage = STAGE
    if RUN_LOCAL:
        dynamodb = boto3.resource(
            'dynamodb', endpoint_url='http://localhost:8000')
        stage = "local"
    else:
        dynamodb = boto3.resource('dynamodb')

    missing = find_missing_answers(stage, dynamodb)


def find_missing_answers(stage, dynamodb):
    print("Scanning State Forms")
    state_forms_table = dynamodb.Table(stage + STATE_FORMS_TABLE)
    answers_table = dynamodb.Table(stage + ANSWERS_TABLE)

    state_forms = scan(state_forms_table)
    print(" > Total Forms:", len(state_forms))

    # For each form, check for answers, if one exists, break
    # WB-2021-1-21E
    # WV-2021-1-21E-1318-01
    missing_dict = {}
    print("Building Map")
    for form in state_forms:
        missing_dict[form['state_form']] = True

    print("Populating...")
    response = answers_table.scan()
    entries = response['Items']
    while 'LastEvaluatedKey' in response:
        for entry in entries:
            missing_dict[entry['state_form']] = False
        # BATCH
        response = answers_table.scan(
            ExclusiveStartKey=response['LastEvaluatedKey'])
        entries.extend(response['Items'])

    missing = [k for k, v in missing_dict.items() if v]
    print("--------------\n TOTAL MISSING", len(missing))
    print(f"writing to {FILENAME}.txt")
    text = "\n".join(missing)
    with open(FILENAME, 'w') as f:
        f.write(text)


def scan(table):
    # Perform scan and execute a new batch for each 'LastEvaluatedKey'

    response = table.scan()
    entries = response['Items']
    total_scans = 1
    while 'LastEvaluatedKey' in response:
        total_scans += 1

        # BATCH
        response = table.scan(
            ExclusiveStartKey=response['LastEvaluatedKey'])
        entries.extend(response['Items'])

    return entries


#### RUN #####
if __name__ == "__main__":
    start_time = time.time()
    main()
    print("--- %s seconds ---" % (time.time() - start_time))
