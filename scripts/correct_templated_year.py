import boto3
from boto3.dynamodb.conditions import Attr
import time

# This script was created to address null values in the seds reports,
#  and set them as 0 for accessibility reasons.
# Items should display as 0 for screen readers, and not have a heap of empty cells
# This script will modify every entry in the row column with
# "rows.col*" entries from {"NULL": True} -> {"N": "0"}
#
# Running this script:
#    * Set the aws environment config file with the
#       temporary values in [default] within ~/.aws/config
#    * pip install boto3
#    * Set RUN_LOCAL, RUN_UPDATE, and STAGE appropriately
#    * run the script (`python3 correct_null_responses.py`)

RUN_LOCAL = True                        # Target localhost:8000
RUN_UPDATE = False                       # Dispatch updates for detected changes
STAGE = "main"                        # Prefix for the environment
TABLE = "-form-answers"  # "-form-answers" and "-form-questions" should be corrected
TARGET_YEAR = "2019"     # "$..[?(@.question=='2020-21E-04')].rows[1].col2",
INCORRECT_YEAR = "2021"  # "$..[?(@.question=='2021-21E-04')].rows[1].col2",


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
    print("Updating ", stage + TABLE)
    table = dynamodb.Table(stage + TABLE)

    # Perform scan and execute a new batch for each 'LastEvaluatedKey'
    filter_ex = Attr(
        "question").contains(TARGET_YEAR) & Attr(
        "question").contains("-05")  # targets only appear in q 5
    response = table.scan(FilterExpression=filter_ex)
    updates = process_response(response)
    total_scans = 1
    while 'LastEvaluatedKey' in response:
        total_scans += 1
        print("Batch", total_scans)
        print("  -- LastEvaluatedKey:", response['LastEvaluatedKey'])

        # BATCH
        response = table.scan(FilterExpression=filter_ex,
                              ExclusiveStartKey=response['LastEvaluatedKey'])
        modified = process_response(response)
        updates.extend(modified)

        # Log details
        print("  -- IN PROGRESS: Changed Count:", len(modified),
              "/", len(response['Items']))

    print("  -- Final Changed Count:", len(updates))
    # Execute Changes
    if RUN_UPDATE:
        update(table, updates)


def process_response(response):
    items = response['Items']
    corrections = [correct_responses(i) for i in items]
    changed = [updated_item for (
        updated_item, modified) in corrections if modified]
    return changed


def correct_responses(item):
    changes = False
    for row in item["rows"]:
        for key in [k for k in row]:
            # Check that the entry in the row object for a key
            #  is actually a column, and not a header string
            if type(key) != str or not key.startswith('col') or type(row[key]) == str:
                continue
            for entry in row[key]:
                for i, val in enumerate(entry["targets"]):
                    if INCORRECT_YEAR in val:
                        changes = True
                    entry["targets"][i] = val.replace(
                        INCORRECT_YEAR, TARGET_YEAR)
    return item, changes


def update(table, changed):
    print("Preparing Batch")
    with table.batch_writer() as writer:
        for item in changed:
            writer.put_item(Item=item)
    print("Batch executed")


#### RUN #####
if __name__ == "__main__":
    start_time = time.time()
    main()
    print("--- %s seconds ---" % (time.time() - start_time))
