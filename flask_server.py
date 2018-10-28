from flask import Flask
import pymongo
import psycopg2
import sys
import logging
sys.path.append('./flask')

# print(sys.path)
from logic import logic_check
from upload import upload
from delete import delete
from datatable import datatable
from deduplicate import dedupe

app = Flask(__name__)

app.logger.setLevel(logging.DEBUG)
logging.basicConfig(level=logging.DEBUG)

app.register_blueprint(upload)
app.register_blueprint(delete)
app.register_blueprint(logic_check)
app.register_blueprint(datatable)
app.register_blueprint(dedupe)

def connect_psql():
    psqldb = "host='visionclerk.ccikg5ltpbua.us-east-1.rds.amazonaws.com' dbname='visionclerk03' user='abizerjafferjee95' password='Qsaxzop15!'"
    # print ("Connecting to database")
    conn = psycopg2.connect(psqldb)
    cursor = conn.cursor()
    print ("Connected to PSQL")
    return cursor

def connect_mongo():
    mongodb = 'mongodb://legalx_admin:legalx1234@ds125198.mlab.com:25198/legalx_db'
    mongo = pymongo.MongoClient(mongodb)
    print ("Connected to MongoDB")
    return mongo

# psql = connect_psql()
# mongo = connect_mongo()

@app.route('/')
def hello_flask():
   return 'Hello Flask'


if __name__ == '__main__':
   app.run()
