#/usr/bin/env python
import os
import json
import requests

TOKEN = os.getenv('TOKEN')
UBUNTU = os.getenv('UBUNTU')

dbUrl = 'https://data.imad.hasura.io/v1/query'
dbHeaders = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + TOKEN
}

sshUrl = 'http://ssh.imad.hasura-app.io:8080'
sshHeaders = {
  'Authorization': 'Bearer ' + UBUNTU,    
  'Content-Type': 'application/json'
}

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
  users = res.json()
  for user in users:
    username = user['username']
    print username
    if username != username.lower():
      # Delete ssh user
      sshPayload = {'username': username}
      sshRes = requests.post(sshUrl + '/delete-ssh-user', headers=sshHeaders, data=json.dumps(sshPayload))
      print sshRes.text
      updatePayload = {
        'type': 'update',
        'args': {
          'table': 'user',
          '$set' : {
            'username': username.lower(),  
            'ssh_pass': None
          },
          'where': {
            'username': username  
          }
        }
      }  
      # Set lowercase username
      updateRes = requests.post(dbUrl, headers=dbHeaders, data=json.dumps(updatePayload))
      print updateRes.text

if __name__=='__main__':
  main()
