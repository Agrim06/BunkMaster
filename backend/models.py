from datetime import datetime

def user_model(user: dict) ->dict:
    return{
        "id" : str(user["_id"]),
        "name" : user["name"],
        "email" : user["email"],
        "created_at": user["created_at"]
    }