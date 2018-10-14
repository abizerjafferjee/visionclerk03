import sys
import os
import psycopg2
from sqlalchemy import create_engine

def connect_psql():
    psqldb = "host='visionclerk.ccikg5ltpbua.us-east-1.rds.amazonaws.com' dbname='visionclerk03' user='abizerjafferjee95' password='Qsaxzop15!'"
    conn = psycopg2.connect(psqldb)
    cursor = conn.cursor()
    print ("Connected to PSQL")
    return conn, cursor
