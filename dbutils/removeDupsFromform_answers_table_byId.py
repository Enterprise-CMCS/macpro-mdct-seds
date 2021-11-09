
import boto3
from boto3.dynamodb.conditions import Key
from dynamodb_json import json_util as json

# Open duplicate ids list file

file1 = open('dupAnswer_entry_Ids.txt', 'r')
ids = file1.readlines()
count = 0
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('master-form-answers')
for id in ids:
  currentKey = id.strip()
  #
  # Find record with the Duplicate based on the key field.
  #
  response = table.query(KeyConditionExpression=Key('answer_entry').eq(currentKey)   )
  found = response['Count']
  if (found != 0):
    currentRowValue=(response['Items'])
    print("Rows Before Update answer_entry = " + currentKey)
    print("------------------")
    print(currentRowValue[0]['rows'])
    noDups = []
    print("------------------")
    print("After Rows Update ")
    print("------------------")
    #
    #Remove Duplicate Rows
    #
    for row in currentRowValue[0]['rows']:
        if row not in noDups:
           noDups.append(row)

    print(noDups)
    #
    # Update Row field without Duplicates
    #
    response = table.update_item(
        Key={'answer_entry': currentKey},UpdateExpression='SET #myrows = :newRow',
        ExpressionAttributeValues={
            ':newRow': noDups
        },
        ExpressionAttributeNames={
              "#myrows": "rows"
        },
        ReturnValues="UPDATED_NEW"
    )
    count += 1

exit(0)
