# Installation
* Run `npm install`, if not already.
* Run this example that uses the StackExchange API.
* Change the namespace, schema and other details on the `package.json` file to use your API server.

# Usage
* For development environment, run the commands `npm run start-dev`.
* For production environment, run the command `npm run start-prod`.
* For local development, configure package.json and rundevserver.sh
* For prod development, set env vars in deployment (preferably using kubectl edit, UI can be scary)

Secret tokens in rundevserver.sh. Never anything in package.json!

