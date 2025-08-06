import boto3
import time

# This script writes out text files of all state forms missing answers.
# Notably 64.ECI forms and 2020/2019 forms

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
STATE_FORMS_TABLE = "-state-forms"  # 5.3 k forms, 2.6MB
ANSWERS_TABLE = "-form-answers"  # 120k answers, 97MB
FILENAME = STAGE + "-missing"


def write(file_suffix, data):
    text = "\n".join(data)
    with open(FILENAME + file_suffix, 'w') as f:
        f.write(text)
    print(f"writing to {FILENAME}{file_suffix}")


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

    find_missing_answers(stage, dynamodb)


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
    forms_dict = {}
    print("Building Map")
    for form in state_forms:
        missing_dict[form['state_form']] = {
            "missing": True,
            "created_by": form["created_by"]
        }
        form_key = str(form["year"]) + "-" + \
            str(form["quarter"]) + "-" + form["form"]
        if form_key not in forms_dict:
            forms_dict[form_key] = 0
        forms_dict[form_key] = forms_dict[form_key] + 1
    counts = [f"{k}, {v}" for k,
              v in forms_dict.items()]
    counts.sort()
    write("-quarter-form-counts.txt", counts)

    print("Populating...")
    response = answers_table.scan()
    entries = response['Items']
    while 'LastEvaluatedKey' in response:
        for entry in entries:
            if entry['state_form'] not in missing_dict:
                missing_dict[entry['state_form']] = {
                    "missing": False,
                    "created_by": "ORPHANED"
                }
                continue
            missing_dict[entry['state_form']]["missing"] = False
        # BATCH
        response = answers_table.scan(
            ExclusiveStartKey=response['LastEvaluatedKey'])
        entries.extend(response['Items'])

    missing = [f"{k}, {v['created_by']}" for k,
               v in missing_dict.items() if v["missing"]]
    orphaned = [f"{k}, {v['created_by']}" for k,
                v in missing_dict.items() if v["created_by"] == "ORPHANED"]
    orphaned.sort()
    print("--------------\n TOTAL MISSING", len(missing))
    write(".txt", missing)
    write("-orphaned.txt", orphaned)
    print(f"writing to {FILENAME}-non-eci.txt")
    non_eci = [s for s in missing if 'ECI' not in s]
    write("-non-eci.txt", non_eci)


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
