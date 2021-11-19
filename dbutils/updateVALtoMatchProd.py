
import boto3
import sys
import os
from boto3.dynamodb.conditions import Key
from dynamodb_json import json_util as json

# Open duplicate ids list file
if (len(sys.argv) > 3):
    file1 = open(sys.argv[1], 'r')
    ids = file1.readlines()
    count = 0
    session1 = boto3.Session(
        aws_access_key_id=os.getenv('SRC_AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('SRC_AWS_SECRET_ACCESS_KEY'),
        aws_session_token=os.getenv('SRC_AWS_SESSION_TOKEN')
    )
    session2 = boto3.Session(
        aws_access_key_id=os.getenv('DEST_AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('DEST_AWS_SECRET_ACCESS_KEY'),
        aws_session_token=os.getenv('DEST_AWS_SESSION_TOKEN')
    )

    dynamodb = session1.resource('dynamodb', region_name='us-east-1')
    dynamodb2 = session2.resource('dynamodb', region_name='us-east-1')

    srcRows = []
    table = dynamodb.Table(sys.argv[2])
    table2 = dynamodb2.Table(sys.argv[3])
    for id in ids:
        currentKey = id.strip()

        #
        # Find record with the Duplicate based on the key field.
        #
        response = table.query(KeyConditionExpression=Key('answer_entry').eq(currentKey)   )
        found = response['Count']
        if (found != 0):
          srcRows = []
          currentRowValue=(response['Items'])
          response2 = table2.query(KeyConditionExpression=Key('answer_entry').eq(currentKey))
          found = response2['Count']
          if (found != 0):
              print("Updating: " + currentKey)
              for row in currentRowValue[0]['rows']:
                  srcRows.append(row)
              response2 = table2.update_item(
                                      Key={'answer_entry': currentKey},UpdateExpression='SET #myrows = :newRow',
                                      ExpressionAttributeValues={
                                          ':newRow': srcRows
                                      },
                                      ExpressionAttributeNames={
                                            "#myrows": "rows"
                                      },
                                      ReturnValues="UPDATED_NEW"
                                  )
              print(str(response2))
          else:
              print("NOT FOUND: " + currentKey)
else:
    print("usage: removeDups <dup key file> <source dynamodb table> <dest dynamodb table>")

exit(0)
