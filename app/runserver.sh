#!/bin/sh
cd /app
if [ "$API_ENV" = "prod" ]; then
    npm run start-prod
elif [ "$API_ENV" = "dev" ];then    
    npm run start-dev
else
    echo "API_ENV not set\n"
fi
