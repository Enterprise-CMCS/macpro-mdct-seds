import boto3
import time

# This script was created to load data from a PITR-created
# table after data loss on 3/23/23-3/24/23.

# Running this script:
#    * Set the aws environment config file with the
#       temporary values in [default] within ~/.aws/config
#    * `pip install boto3` or `python3 -m pip install boto3`
#    * Set RUN_LOCAL, RUN_UPDATE, and STAGE appropriately
#    * run the script (`python3 pitr_recovery.py`)
# Target localhost:8000, won't go up to AWS if True
RUN_LOCAL = True
# Prefix for the environment (main/val/production)
STAGE = "main"
TABLE_MAP = [("-state-forms-recovered", "-state-forms"),
             ("-form-answers-recovered", "-form-answers")]
            # (source, destination), aka (backup, original)
# If True, will execute the changes in the database, rather than just logging them.
COMMIT_CHANGES = False


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

    for tables in TABLE_MAP:
        run_transfer(tables, stage, dynamodb)


def run_transfer(tables, stage, dynamodb):
    (source_table, destination_table) = tables
    print("Copying ", stage, source_table, "to", destination_table)
    source = dynamodb.Table(stage + source_table)
    destination = dynamodb.Table(stage + destination_table)

    # Perform scan and execute a new batch for each 'LastEvaluatedKey'
    response = source.scan()
    updates = response['Items']
    total_scans = 1
    while 'LastEvaluatedKey' in response:
        total_scans += 1
        print("Batch", total_scans)
        print("  -- LastEvaluatedKey:", response['LastEvaluatedKey'])

        # BATCH
        response = source.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        updates.extend(response['Items'])

        # Log details
        print("  -- Retrieved Count:", len(response['Items']))
    print(" > Total Count:", len(updates))

    # Execute Changes
    if COMMIT_CHANGES:
        update(destination, updates)


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
