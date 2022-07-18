from distutils.command.build import build
import boto3
import time

# Created this to correct all the 21E Question 5 settings for a question with a bad year reference.
# Copied the scaffolding from the null responses script
# Maine 2020 Q4 is pointing at 2021, and breaking. Wanted to save the script in case any other states have the issue

# Running this script:
#    * Set the aws environment config file with the temporary values in [default] within ~/.aws/config
#    * pip install boto3
#    * Set RUN_LOCAL, RUN_UPDATE, and STAGE appropriately
#    * run the script (`python3 correct_2020_21E.py`)

RUN_LOCAL = True                        # Target localhost:8000
STAGE = "master"                        # Prefix for the environment
TABLE = "-form-answers"
STATE_CODE = "ME"
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
    print("Updating ", stage + TABLE)
    table = dynamodb.Table(stage + TABLE)

    for age_group in AGE_GROUPS:
        key = f'{STATE_CODE}-2020-4-21E-{age_group}-05'
        print('Updating key:', key)

        response = table.get_item(Key={'answer_entry': key})

        rows_arr = response['Item']['rows']
        for rows in rows_arr[1:]:  # rows[0] is names, and follows a different layout
            for col in rows:
                if col == 'col1':  # This one also has a special convention
                    continue
                rules = rows[col]
                for cell in rules:
                    # Overwrite any matches of the target 2021 at this level
                    for i in range(len(cell['targets'])):
                        cell['targets'][i] = cell['targets'][i].replace(
                            '2021-21E-', '2020-21E-')

            # Write it back
            table.update_item(
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


#### RUN #####
if __name__ == "__main__":
    start_time = time.time()
    main()
    print("--- %s seconds ---" % (time.time() - start_time))
