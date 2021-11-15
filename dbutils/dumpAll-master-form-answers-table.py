
import boto3
from boto3.dynamodb.conditions import Key
from dynamodb_json import json_util as json

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('master-form-answers')

response = table.scan()
for i in response['Items']:
    print(i)

while 'LastEvaluatedKey' in response:
    response = table.scan(
        ExclusiveStartKey=response['LastEvaluatedKey']
        )

    for i in response['Items']:
        print(i)
