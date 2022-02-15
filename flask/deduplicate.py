from flask import Flask, Blueprint, render_template, abort, jsonify, request
import pandas as pd
import datetime
import sys
import os
import json
import psycopg2
from sqlalchemy import create_engine
import numpy as np
from connect_db import connect_psql
sys.path.append('./flask')
sys.path.append('./models')
from train_dedupe import *
import json

engine = create_engine('postgresql://un:pw@domain.us-east-1.rds.amazonaws.com:5432')

dedupe = Blueprint('dedupe', __name__, template_folder='templates')

@dedupe.route('/dedupe', methods=['POST', 'GET'])
def create_clusters():

    file = request.get_json()

    try:
        df = pd.read_sql_query('select * from "'+ file['table_ref'] + '";', con=engine)
    except Exception as e:
        print(e)
        return jsonify({"success": False})

    df = df.rename(columns = {'index': 'Id'})
    df_dedupe = df.to_dict(orient='index')

    for i in df_dedupe:
        for j in df_dedupe[i]:
            df_dedupe[i][j] = str(df_dedupe[i][j])


    settings_file = './models/dedupe_settings'

    # clusters = create_clusters_DB(df_dedupe, settings_file)

    clusters = [{'cluster_id': 0, 'canonical representation': {'Id': '0', 'invoice_number': '1', 'invoice_net_amount': '1017', 'invoice_gross_amount': '1000', 'invoice_shipping_cost': '20', 'invoice_insurance_charge': '15', 'invoice_discounts': '-100', 'invoice_tax': '80', 'invoice_other_charge': '2', 'vendor_number': '1017', 'vendor_invoice_number': '15', 'po_flag': 'po', 'po_number': '121212', 'match_type': '2-way', 'invoice_date': '2012-04-12', 'invoice_due_date': '2012-04-01', 'invoice_paid_date': '2012-04-20', 'vendor_payment_terms': '2/10 net 30', 'invoice_status': 'paid', 'invoice_type': 'd', 'gl_account': '100000', 'company': 'a', 'business_unit': 'a', 'currency_code': 'cad', 'source': 'manual, necho, purchasing etc'}, 'records': [{'record_id': 0, 'confidence': 0.9998942017555237}, {'record_id': 1, 'confidence': 0.9998942017555237}, {'record_id': 2, 'confidence': 0.9997892379760742}]}, {'cluster_id': 1, 'canonical representation': {'Id': '23', 'invoice_number': '23', 'invoice_net_amount': '1000', 'invoice_gross_amount': '1000', 'invoice_shipping_cost': '45', 'invoice_insurance_charge': '15', 'invoice_discounts': '-100', 'invoice_tax': '80', 'invoice_other_charge': '2', 'vendor_number': '45', 'vendor_invoice_number': '34', 'po_flag': '2-way', 'po_number': '5', 'match_type': '2-way', 'invoice_date': '2018-10-21', 'invoice_due_date': '2018-10-22', 'invoice_paid_date': '2018-10-20', 'vendor_payment_terms': '2/10 net 30', 'invoice_status': 'paid', 'invoice_type': '2/10 net 30', 'gl_account': '100000', 'company': 'b', 'business_unit': 'b', 'currency_code': 'cad', 'source': 'paid'}, 'records': [{'record_id': 23, 'confidence': 0.0009052683}, {'record_id': 28, 'confidence': 0.0009052683}]}]

    df_records = df.to_dict(orient='records')
    print(df_records)
    print(len(df_records))

    cluster_groups = []

    for cluster in clusters:
        group = {
            'cluster_id': cluster['cluster_id'],
            'canonical_rep': cluster['canonical representation'],
            'records': []
        }

        for record in cluster['records']:
            member = df_records[record['record_id']]
            member['cluster_id'] = cluster['cluster_id']
            member['confidence'] = record['confidence']
            group['records'].append(member)

        cluster_groups.append(group)

    # print(cluster_groups)

    # df['confidence'] = np.nan
    # df['cluster_id'] = np.nan
    #
    # cluster_table = []
    # for cluster_id in clusters:
    #     canonical_rep = clusters[cluster_id]['canonical representation']
    #     canonical_rep['cluster_id'] = cluster_id
    #     cluster_table.append(canonical_rep)
    #
    #     for record in clusters[cluster_id]['records']:
    #         df.iloc[record]['cluster_id'] = cluster_id
    #         df.iloc[record]['confidence'] = clusters[cluster_id]['records'][record]

    # df_clusters = pd.DataFrame(str(cluster_table), orient = 'records')

    # print(df)
    # print(cluster_groups)

    return jsonify({'success': True, 'clusters': cluster_groups})


@dedupe.route('/dedupe/mergeCluster', methods=['POST', 'GET'])
def merge_cluster():

    body = request.get_json()
    file = body['file']
    group = body['group']

    records = group['records']
    record_idx = [record['Id'] for record in records]
    replacement_record = group['canonical_rep']
    replacement_record = json.dumps([replacement_record])
    replacement_df = pd.read_json(replacement_record, orient = 'records')
    replacement_df = replacement_df.iloc[0]

    try:
        df = pd.read_sql_query('select * from "'+ file['table_ref'] + '";', con=engine)
    except Exception as e:
        print(e)
        return jsonify({"success": False})

    for idx in record_idx:
        df.iloc[idx] = replacement_df

    df = df.drop('index', axis=1)

    df = df[df.columns].astype(str)

    # for col in df.columns:
    #     df[col] = df[col].astype(str)

    print(df.dtypes)

    try:
        df.to_sql(file['table_ref'], con=engine, if_exists='replace')
    except Exception as e:
        print("ERROR Could not save table")
        print(e)
        return jsonify({"success": False})

    return jsonify({'success': True})
