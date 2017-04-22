#!/usr/bin/env python3
import requests
import time
import json
import os, sys

print (os.getenv('TOKEN'))
if not (os.getenv('TOKEN') and os.getenv('TOKEN').strip() != ''):
  print('Needs env var called TOKEN with hasura admin token')
  exit(1)

headers = {
  'Authorization': 'Bearer ' + os.getenv('TOKEN'),
  'Content-Type': 'application/json'
}

body = {"index.html":"<!doctype html>\n<html>\n    <head>\n        <link href=\"style.css\" rel=\"stylesheet\" />\n    </head>\n    <body>\n        yo yo honey singh\n        <script type=\"text/javascript\" src=\"main.js\">\n        </script>\n    </body>\n</html>\n","main.js":"console.log('Loaded!');\n","server.js":"var express = require('express');\nvar morgan = require('morgan');\nvar app = express();\napp.use(morgan('combined'));\n\napp.get('/', function (req, res) {\n res.sendFile('/app/index.html');\n});\n\napp.listen(80, function () {\n  console.log('IMAD course app listening on port 80!');\n});\n","style.css":"body {\n    font-family: sans-serif;\n}\n"}

response=requests.post(
  'http://data.imad-stg.hasura-app.io/api/1/table/logger/delete',
  headers=headers,
  data=json.dumps({"where": {"username": {"$like": "bomb%"}}}))
print(response.status_code)
print(response.text)

if response.status_code == 200:
  for i in range(1,251):
    logger = {"objects": [{ "username": "bomb" + str(i)}]}
    response = requests.post('http://data.imad-stg.hasura-app.io/api/1/table/logger/insert', headers=headers, data=json.dumps(logger))
    print (response.status_code)
    print(response.text)
    if response.status_code == 200:
      response = requests.post('http://api.imad-stg.hasura-app.io/restart?user=bomb'+str(i), headers=headers, data=json.dumps(body))
      print ('bomb' + str(i))
      print (response.status_code)
      time.sleep(0.2)
    if (i % 50) == 0:
      time.sleep(300)
