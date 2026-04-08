from db import get_db

if __name__ == "__main__":
    conn = get_db()

    with conn.cursor() as cur:
        cur.execute("SELECT 1")
        output = cur.fetchone()
        print(output)