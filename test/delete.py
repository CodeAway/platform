#!/usr/bin/env python3
import requests
import time
import json

print (os.getenv('TOKEN'))
if not (os.getenv('TOKEN') and os.getenv('TOKEN').strip() != ''):
  print('Needs env var called TOKEN with hasura admin token')
  exit(1)

headers = {
  'Authorization': 'Bearer ' + os.getenv('TOKEN'),
  'Content-Type': 'application/json'
}

response=requests.post(
  'http://data.imad-stg.hasura-app.io/api/1/table/logger/delete',
  headers=headers,
  data=json.dumps({"where": {"username": {"$like": "bomb%"}}}))
print(response.status_code)
print(response.text)
