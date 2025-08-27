import boto3
import time

# Created this to correct all the 21E Question 5
# settings for a question with a bad year reference.
# Copied the scaffolding from the null responses script
# Maine 2020 Q4 is pointing at 2021, and breaking.
# Wanted to save the script in case any other states have the issue

# Running this script:
#    * Set the aws environment config file with the
#       temporary values in [default] within ~/.aws/credentials
#    * pip install boto3
#    * Set RUN_LOCAL, RUN_UPDATE, and STAGE appropriately
#    * run the script (`python3 correct_2020_21E.py`)

RUN_LOCAL = True                        # Target localhost:8000
STAGE = "main"                        # Prefix for the environment
ANSWER_TABLE = "-form-answers"
STATE_TABLE = "-states"
COMMIT_CHANGES = False
AGE_GROUPS = ["0001", "0105", "0612", "1318"]


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
    print("Updating ", stage + ANSWER_TABLE)

    state_codes = get_state_codes(stage, dynamodb)
    for state in state_codes:
        correct_answers(stage, dynamodb, state)


def correct_answers(stage, dynamodb, state):
    answer_table = dynamodb.Table(stage + ANSWER_TABLE)
    state_code = state['state_id']
    corrected_keys = []

    for age_group in AGE_GROUPS:
        mismatch = False
        key = f'{state_code}-2020-4-21E-{age_group}-05'

        # Get answer
        response = answer_table.get_item(Key={'answer_entry': key})
        if 'Item' not in response:
            continue
        rows_arr = response['Item']['rows']

        # navigate json schema
        for rows in rows_arr[1:]:  # rows[0] is names, and follows a different layout
            for col in rows:
                if col == 'col1':  # This one also has a special convention
                    continue
                rules = rows[col]
                for cell in rules:
                    # Overwrite any matches of the target 2021 at this level
                    for i in range(len(cell['targets'])):
                        if('2021-21E-' in cell['targets'][i]):
                            mismatch = True
                            cell['targets'][i] = cell['targets'][i].replace(
                                '2021-21E-', '2020-21E-')

        if(mismatch):
            corrected_keys.append(key)
        # Write it back
        if COMMIT_CHANGES and mismatch:
            answer_table.update_item(
                Key={
                    'answer_entry': key,
                },
                UpdateExpression="set #r = :rows",
                ExpressionAttributeNames={
                    '#r': 'rows'
                },
                ExpressionAttributeValues={
                    ':rows': rows_arr
                },
                ReturnValues="UPDATED_NEW"
            )

    if len(corrected_keys) > 0:
        print("Mismatch id'd:", state_code)
        if COMMIT_CHANGES:
            print("    Corrected:", corrected_keys)
    return mismatch


def get_state_codes(stage, dynamodb):
    states_table = dynamodb.Table(stage + STATE_TABLE)
    response = states_table.scan()
    return response['Items']


#### RUN #####
if __name__ == "__main__":
    start_time = time.time()
    main()
    print("--- %s seconds ---" % (time.time() - start_time))
