#!/bin/sh
exec gunicorn --config /src/gunicorn_config.py server:app
