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
RUN_LOCAL = False
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
    missing = []
    for idx, form in enumerate(state_forms):
        form_id = form['state_form']
        expr = Attr('state_form').eq(form_id)
        matching_answers = scan(
            answers_table, FilterExpression=expr, first=True)
        if len(matching_answers) <= 0:
            missing.append(form_id)
            print(f'{form_id}    [{idx}/{len(state_forms)}]')

    print("--------------\n TOTAL MISSING", len(missing))
    print(f"writing to {FILENAME}.txt")
    text = "\n".join(missing)
    with open(FILENAME, 'w') as f:
        f.write(text)


def scan(table, FilterExpression=None, first=False):
    # Perform scan and execute a new batch for each 'LastEvaluatedKey'
    if FilterExpression is not None:
        response = table.scan(FilterExpression=FilterExpression)
    else:
        response = table.scan()
    entries = response['Items']
    total_scans = 1
    while 'LastEvaluatedKey' in response:
        total_scans += 1
        # print("Batch", total_scans)
        # print("  -- LastEvaluatedKey:",
        #       response['LastEvaluatedKey'], "\nFilter:", FilterExpression)

        # BATCH
        if FilterExpression is not None:
            response = table.scan(
                FilterExpression=FilterExpression,
                ExclusiveStartKey=response['LastEvaluatedKey'])
        else:
            response = table.scan(
                ExclusiveStartKey=response['LastEvaluatedKey'])
        entries.extend(response['Items'])
        # Log details
        # print("  -- Retrieved Count:", len(response['Items']))
        if len(entries) > 0 and first:
            break

    return entries


#### RUN #####
if __name__ == "__main__":
    start_time = time.time()
    main()
    print("--- %s seconds ---" % (time.time() - start_time))
