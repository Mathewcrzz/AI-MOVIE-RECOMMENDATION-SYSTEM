import psycopg2
import select
import subprocess
from dotenv import load_dotenv
import os
load_dotenv()

db_url = os.getenv("SUPABASE_DB_URL")
if not db_url:
    raise ValueError("SUPABASE_DB_URL is not set in the environment")
try:
    conn = psycopg2.connect(dsn=db_url)
except psycopg2.ProgrammingError as e:
    raise ValueError(f"Invalid DSN. Check your SUPABASE_DB_URL. Error: {e}")
conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
cur = conn.cursor()
cur.execute("LISTEN model_update;")
print("\n==========================")
print("✅ SUCCESS: Connected to Supabase and Listening for Updates")
print("==========================\n")

while True:
    if select.select([conn], [], [], 5) == ([], [], []):
        continue
    conn.poll()
    while conn.notifies:
        notify = conn.notifies.pop(0)
        print("📦 Trigger received:", notify.payload)
        subprocess.run(["python", "train_model.py"])
        print("✅ Model retraining triggered.")
        print("🎯 Finished executing train_model.py\n")