#/usr/bin/env python
import os
import json
import requests

TOKEN = os.getenv('TOKEN')

dbUrl = 'https://data.imad.hasura.io/v1/query'
apiUrl = 'https://api.imad.hasura.io/restart?user='

dbHeaders = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + TOKEN
}

def main():
  # Get all users
  errors = []
  success = []

  done = ['vinitss']

  payload = {
    'type': 'select',
    'args': {
      'table': 'user',
      'columns': ['hasura_id', 'username', 'github_token']
    }
  }
  res = requests.post(dbUrl, headers=dbHeaders, data=json.dumps(payload))
  users = res.json()
  for user in users:
    try: 
      username = user['username']
      if username in done:
        print '======> Skip: ', username
        continue
      token = user['github_token']
      print '======> Executing: ', username
      github_url = 'https://github.com/'+ username + '/imad-2016-app.git'
      github_res_url = 'https://api.github.com/repos/'+username+'/imad-2016-app/git/refs/heads/master?access_token='+token
      try:
        github_res = requests.get(github_res_url)
        commit_hash = github_res.json()['object']['sha']
        apiPayload = {
          "gitRevision": commit_hash,
          "gitUrl": github_url
        }
        api_res = requests.post(apiUrl + username, headers=dbHeaders, data = json.dumps(apiPayload))
        if api_res.status_code >= 200 and api_res.status_code <= 300: 
          print '======> Success: ', username
          success.append(username)
        else:
          raise Exception()

      except Exception, e:
        print '======> ERROR: ', username
        errors.append(username)
    except KeyboardInterrupt, e:
      print '\n======> errors at'  
      print errors
      print '======> succeeded: ' 
      print success + done
      break

if __name__=='__main__':
  main()
