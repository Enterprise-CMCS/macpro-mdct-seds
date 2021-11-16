
import boto3
import sys
from boto3.dynamodb.conditions import Key
from dynamodb_json import json_util as json

if (len(sys.argv) > 1):
    
  dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
  table = dynamodb.Table(sys.argv[1])  

  response = table.scan()
  for i in response['Items']:
      print(i)  

  while 'LastEvaluatedKey' in response:
      response = table.scan(
          ExclusiveStartKey=response['LastEvaluatedKey']
          )  

      for i in response['Items']:
          print(i)
else:
    print("usage: dumpTable <dynamodb table name>")