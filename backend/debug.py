import pymongo, os, json
from bson.json_util import dumps
from dotenv import load_dotenv

load_dotenv('.env')
client = pymongo.MongoClient(os.getenv('MONGO_URL'))
db = client['BunkTracker']

users = list(db['users'].find())
otps = list(db['otps'].find())

with open('debug_output.json', 'w') as f:
    f.write(dumps({'users': users, 'otps': otps}, indent=2))
