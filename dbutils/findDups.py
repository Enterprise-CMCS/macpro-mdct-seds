
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
    sumDups = {}
    table = dynamodb.Table(sys.argv[2])
    for id in ids:
        currentKey = id.strip()

        #
        # Find record with the Duplicate based on the key field.
        #
        response = table.query(KeyConditionExpression=Key('answer_entry').eq(currentKey)   )
        found = response['Count']
        if (found != 0):
          currentRowValue=(response['Items'])
          noDups = []
          noDupCol1s = []
          dupKey = {}


          for row in currentRowValue[0]['rows']:
              dupColumn1 = row['col1'].replace(" ","_").replace(".","-")


              if dupColumn1 in dupKey:
                 print(currentKey)
                 break;
              else:
                if (dupColumn1 != ''):
                    dupKey[dupColumn1] = row
                else:
                    noDups.append(row)
else:
    print("usage: removeDups <dup key file> <dynamodb table>")

exit(0)
