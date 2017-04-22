#/usr/bin/env python
import os
import json
import requests

TOKEN = os.getenv('TOKEN')

dbUrl = 'https://data.imad.hasura.io/v1/query'
dbHeaders = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + TOKEN
}

authUrl = 'https://auth.imad.hasura.io/'

def main():
  # Get all users
  payload = {
    'type': 'select',
    'args': {
      'table': 'user',
      'columns': ['hasura_id', 'username']
    }
  }
  res = requests.post(dbUrl, headers=dbHeaders, data=json.dumps(payload))
  dbUsers = res.json()
  res = requests.get(authUrl + 'admin/users?limit=3000&offset=0', headers=dbHeaders)
  resp = res.json()
  authUsers = resp['users']

  authUserIds = set([u['id'] for u in authUsers])
  dbUserIds = set([u['hasura_id'] for u in dbUsers])

  difference = authUserIds - dbUserIds
  print difference

  for id in list(difference):
    print id
    payload = {
      "hasura_id": id    
    }
    res = requests.post(authUrl + 'admin/user/delete', headers=dbHeaders, data=json.dumps(payload))
    print res.status_code
    print res.json()

if __name__=='__main__':
  main()
