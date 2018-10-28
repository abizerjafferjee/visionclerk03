from flask import Flask, Blueprint, render_template, abort, jsonify, request
import pandas as pd
import sys
import os
import psycopg2
from sqlalchemy import create_engine
from connect_db import connect_psql
import json
sys.path.append('./flask')

datatable = Blueprint('datatable', __name__, template_folder='templates')

psql_conn, psql_cursor = connect_psql()

engine = create_engine('postgresql://abizerjafferjee95:Qsaxzop15!@visionclerk.ccikg5ltpbua.us-east-1.rds.amazonaws.com:5432/visionclerk03')


@datatable.route('/datatable', methods = ['POST', 'GET'])
def get_datatable():
    file = request.get_json()
    print("table ref: ", file['table_ref'])

    try:
        df = pd.read_sql_query('select * from "'+ file['table_ref'] + '";', con=engine)
    except Exception as e:
        print(e)
        return jsonify({"success": False})

    # data_set = df.to_dict(orient='index')
    # print(data_set)
    data_set = df.to_json(orient = 'records')

    response = {"success": True, "data": data_set}
    return jsonify(response)

@datatable.route('/save', methods = ['POST', 'GET'])
def save_data():

    req = request.get_json()
    file = req["file"]
    dataTable = req["data"]

    df = pd.read_json(json.dumps(dataTable), orient='records')
    df = df.drop(columns=["col"])
    print(df)

    # try:
    #     q_drop = 'DROP TABLE "' + file['table_ref'] + '";'
    #     print(q_drop)
    #     psql_cursor.execute(q_drop)
    # except Exception as e:
    #     print(e)
    #     print("ERROR Could not delete table")
    #     return jsonify({"success": False})

    try:
        df.to_sql(file['table_ref'], con=engine, if_exists='replace')
    except Exception as e:
        print("ERROR Could not save table")
        print(e)
        return jsonify({"success": False})

    try:
        updated_df = pd.read_sql_query('select * from "'+ file['table_ref'] + '";', con=engine)
    except Exception as e:
        print(e)
        return jsonify({"success": False})

    data_set = updated_df.to_json(orient = 'records')

    return jsonify({"success": True, "data": data_set})
