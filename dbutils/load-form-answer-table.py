
import sys
import ast
import datetime
#import json
import boto3
from boto3.dynamodb.conditions import Key
from dynamodb_json import json_util as json

if (len(sys.argv) > 2):

 file1 = open(sys.argv[1], 'r')
 items = file1.readlines()

 dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
 table = dynamodb.Table(sys.argv[2])

 for item in items:
    json_item = json.loads(ast.literal_eval(item.strip()))
    json_item['last_modified'] = str(datetime.datetime.strptime(json_item['last_modified'], '%Y-%m-%dT%H:%M:%S.%fZ'))
    json_item['lastSynced'] = str(datetime.datetime.strptime(json_item['lastSynced'], '%Y-%m-%dT%H:%M:%S.%fZ'))
    json_item['created_date'] = str(json_item['created_date'])
    #print(json_item)
    response = table.put_item(Item=json_item)
else:
 print("usage: loadtable <json data file> <dynamodb table name>")
