import math 

def calculate_attendance_percentage(attended : int , total : int):
    if total == 0 :
        return 0.0
    return round((attended / total) * 100, 2)


def calculate_safe_bunk(attended: int , total: int , min_percentage : float = 0.75):
    if total == 0:
        return 0
    
    safe_bunk = math.floor((attended / min_percentage) - total)
    return max(safe_bunk , 0)