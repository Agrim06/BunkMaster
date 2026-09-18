from pymongo import MongoClient, ASCENDING, DESCENDING
from config import MONGO_URL

client = MongoClient(MONGO_URL)
db = client["BunkTracker"]

users_collection = db["users"]
subjects_collection = db["subjects"]
attendance_collection = db["attendance"]
attendance_logs_collection = db["attendance_logs"]
otp_collection = db["otps"]

def init_indexes():
    try:
        # Fast lookup on user email (unique)
        users_collection.create_index([("email", ASCENDING)], unique=True, background=True)

        # Compound index for subjects per user
        subjects_collection.create_index([("user_id", ASCENDING), ("name", ASCENDING)], background=True)

        # Compound index for attendance summary lookups
        attendance_collection.create_index([("user_id", ASCENDING), ("subject_id", ASCENDING)], unique=True, background=True)

        # Compound index for attendance logs queries (fast range and sorted queries)
        attendance_logs_collection.create_index([
            ("user_id", ASCENDING),
            ("subject_id", ASCENDING),
            ("timestamp", DESCENDING)
        ], background=True)

        # TTL index for automatic OTP document deletion when expires_at timestamp is reached
        otp_collection.create_index([("expires_at", ASCENDING)], expireAfterSeconds=0, background=True)
    except Exception as e:
        print(f"Notice during index initialization: {e}")

init_indexes()