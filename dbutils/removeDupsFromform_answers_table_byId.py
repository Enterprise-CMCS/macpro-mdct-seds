
import boto3
import sys
from boto3.dynamodb.conditions import Key
from dynamodb_json import json_util as json

# Open duplicate ids list file
if (len(sys.argv) > 2):
    file1 = open(sys.argv[1], 'r')
    ids = file1.readlines()
    count = 0
    dynamodb = boto3.resource('dynamodb', region_name='us-east-1')    

    table = dynamodb.Table(sys.argv[2])
    for id in ids:
        currentKey = id.strip()
        #currentKey = id.strip()
        #
        # Find record with the Duplicate based on the key field.
        #
        response = table.query(KeyConditionExpression=Key('answer_entry').eq(currentKey)   )
        found = response['Count']
        if (found != 0):
          currentRowValue=(response['Items'])
          #print("Rows Before Update answer_entry = " + currentKey)
          #print("------------------")
          #print(currentRowValue[0]['rows'])
          noDups = []
          noDupCol1s = []
          #print("------------------")
          #print("After Rows Update ")
          #print("------------------")
          #
          #Remove Duplicate Rows
          #
          for row in currentRowValue[0]['rows']:
              if row not in noDups:
                 noDups.append(row)    
                 dupColumn1 = currentKey + ":" + noDups[noDups.index(row)]['col1']
                 if ( dupColumn1 in noDupCol1s):
                    print("========================")
                    print(currentKey + " : " + currentRowValue[0]['created_by'] + ":" + str(row))
                    print("========================")
                 else:
                    noDupCol1s.append(dupColumn1)
          #print(currentRowValue[0]['created_by'])
          #print(noDups)
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
else:
    print("usage: removeDups <dup key file> <dynamodb table>")

exit(0)
