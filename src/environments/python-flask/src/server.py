from flask import Flask, jsonify, request
import requests
import json

app = Flask(__name__)

@app.route("/")
def hello():
    return json.dumps({"message":"Hello World!"})
