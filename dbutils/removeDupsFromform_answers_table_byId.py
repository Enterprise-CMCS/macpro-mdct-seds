
import boto3
import sys
from boto3.dynamodb.conditions import Key

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
        count += 1
        print(str(count) +":WorkingOn:" + currentKey)
        #
        # Find record with the Duplicate based on the key field.
        #
        response = table.query(
           KeyConditionExpression=Key('answer_entry').eq(currentKey)
        )
        found = response['Count']
        if (found != 0):
          currentRowValue=(response['Items'])
          noDups = []
          noDupCol1s = []
          dupKey = {}


          for row in currentRowValue[0]['rows']:
              dupColumn1 = row['col1'].replace(" ","_").replace(".","-")


              if dupColumn1 in dupKey:
                 print("Found: Dup: " + currentKey + " : " + dupColumn1)
                 for x in 2,3,4,5,6,7,8,9:
                    try:
                      if (str(row['col' + str(x)]).find("targets") < 0):
                       newtot = (
                          int(row['col' + str(x)]) +
                          int(dupKey[dupColumn1]['col' + str(x)])
                       )
                       dupKey[dupColumn1]['col' + str(x)] = str(newtot)
                    except: # noqa: E722
                       continue
              else:
                if (dupColumn1 != ''):
                    dupKey[dupColumn1] = row
                else:
                    noDups.append(row)

          for key1 in dupKey:
             noDups.append(dupKey[key1])


          response = table.update_item(
                        Key={'answer_entry': currentKey},
                        UpdateExpression='SET #myrows = :newRow',
                        ExpressionAttributeValues={
                            ':newRow': noDups
                        },
                        ExpressionAttributeNames={
                              "#myrows": "rows"
                        },
                        ReturnValues="UPDATED_NEW"
                    )

else:
    print("usage: removeDups <dup key file> <dynamodb table>")

exit(0)
