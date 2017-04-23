#!/bin/sh
cd /src
exec gunicorn --config /src/gunicorn_config.py server:app
