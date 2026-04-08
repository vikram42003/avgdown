import psycopg
import os
from dotenv import load_dotenv

load_dotenv()

_conn = None

def get_db() -> psycopg.Connection:
    global _conn

    if _conn == None or _conn.closed:
        DATABASE_URL = os.environ["DATABASE_URL"]  
        _conn = psycopg.connect(DATABASE_URL)
    
    return _conn