#!/usr/bin/env python3
import requests
import time
import json

def maxping(v):
  oks = 0
  bads = 0
  for i in range(0,v):
    response = requests.get('http://bomb' + str(i) + '.imad.hasura-app.io')
    print (response.status_code)
    if response.status_code == 200:
      oks += 1
    else:
      bads += 1
  print (oks)
  print (bads)

maxping(200)
