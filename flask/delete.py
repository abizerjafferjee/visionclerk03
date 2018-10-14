from flask import Flask, Blueprint, render_template, abort, jsonify, request
import pandas as pd
import sys
import os
import psycopg2
from sqlalchemy import create_engine
sys.path.append('./flask')

delete = Blueprint('delete', __name__, template_folder='templates')

def connect_psql():
    psqldb = "host='visionclerk.ccikg5ltpbua.us-east-1.rds.amazonaws.com' dbname='visionclerk03' user='abizerjafferjee95' password='Qsaxzop15!'"
    conn = psycopg2.connect(psqldb)
    cursor = conn.cursor()
    print ("Connected to PSQL")
    return conn, cursor

psql_conn, psql_cursor = connect_psql()

@delete.route('/delete', methods = ['POST', 'GET'])
def delete_file():
    file = request.get_json()
    print("table ref: ", file['table_ref'])
    try:
        # psql_cursor.execute("""DROP TABLE %(table_ref);""", {"table_ref": file['table_ref']})
        psql_cursor.execute("""DROP TABLE """ + file['table_ref'] + """;""")
    except:
        print("ERROR")
        response = {"success": False}
        return jsonify(response)

    response = {"success": True}
    return jsonify(response)
