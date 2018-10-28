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

# def connect_psql():
#     psqldb = "host='visionclerk.ccikg5ltpbua.us-east-1.rds.amazonaws.com' dbname='visionclerk03' user='abizerjafferjee95' password='Qsaxzop15!'"
#     conn = psycopg2.connect(psqldb)
#     cursor = conn.cursor()
#     print ("Connected to PSQL")
#     return conn, cursor

# psql_conn, psql_cursor = connect_psql()

engine = create_engine('postgresql://abizerjafferjee95:Qsaxzop15!@visionclerk.ccikg5ltpbua.us-east-1.rds.amazonaws.com:5432/visionclerk03')


logic_check = Blueprint('login_check', __name__, template_folder='templates')
@logic_check.route('/check', methods=['POST', 'GET'])
def perform_checks():

    file = request.get_json()

    try:
        df = pd.read_sql_query('select * from "'+ file['table_ref'] + '";', con=engine)
    except Exception as e:
        print(e)
        return jsonify({"success": False})

    report = []

    def empty_string_helper(cols):
        values = df[cols].apply(lambda x: x == 'nan')
        # values = values.tolist()

        print(values)

        rows = []
        count = 0
        # for i in values:
            # print(i)
            # if True in i:
            #     rows.append(count)
            # count += 1
        return rows

    def empty_number_helper(cols):
        values = df[cols].isnull().values
        rows = []
        for i in range(len(values)):
            if True in values[i]:
                rows.append(i)
        return rows

    def report_helper(test, values, description):
        values = [int(x) for x in values]
        if values != []:
            empty_business_info_report = {'test': test, 'rows': values, 'description': description}
            report.append(empty_business_info_report)

    flags = [0]*len(df)

    def add_to_flags(flag, rows):
        for row in rows:
            if flags[row] == 0:
                flags[row] = [flag]
            else:
                flags[row].append(flag)


    # company or business_unit is na
    empty_company_info_cols = ['company', 'business_unit']
    empty_business_info = empty_string_helper(empty_company_info_cols)
    report_helper('empty-business-info', empty_business_info, 'company or business_unit columns have some empty values.')
    add_to_flags(1, empty_business_info)

    # associated payment amounts are na
    empty_associated_payments_cols = ['invoice_gross_amount', 'invoice_shipping_cost', 'invoice_insurance_charge', 'invoice_discounts', 'invoice_tax', 'invoice_other_charge']
    empty_associated_payments = empty_number_helper(empty_associated_payments_cols)
    report_helper('empty-associated-payments', empty_associated_payments, 'invoice_gross_amount, invoice_shipping_cost, invoice_insurance_charge, invoice_discounts, invoice_tax or invoice_other_charge have some empty values.')
    add_to_flags(2, empty_associated_payments)

    # duplicate invoice invoice number
    unique_invoice_numbers = []
    non_unique_invoice_numbers = []
    for idx, row in df.iterrows():
        if row['invoice_number'] in unique_invoice_numbers:
            non_unique_invoice_numbers.append(idx)
        else:
            unique_invoice_numbers.append(row['invoice_number'])
    report_helper('duplicate-invoice-number', non_unique_invoice_numbers, 'invoice_number has duplicate invoice numbers in the specified rows.')
    add_to_flags(3, non_unique_invoice_numbers)

    # invoices without purchase orders
    empty_purchase_orders_cols = 'po_number'
    empty_purchase_orders = empty_string_helper(empty_purchase_orders_cols)
    report_helper('empty-purchase-orders', empty_purchase_orders, 'po_number column has empty values.')
    add_to_flags(4, empty_purchase_orders)

    # negative invoice_net_amount
    negative_invoice_net_amount = df[df['invoice_net_amount'] < 0]['index'].values
    negative_invoice_net_amount = [x for x in negative_invoice_net_amount]
    report_helper('negative_invoice_net_amount', negative_invoice_net_amount, 'invoice_net_amount has negative values in some rows. These are invalid.')
    add_to_flags(5, negative_invoice_net_amount)

    # zero invoice_net_amount
    zero_invoice_net_amount = df[df['invoice_net_amount'] == 0]['index'].values
    zero_invoice_net_amount = [x for x in zero_invoice_net_amount]
    report_helper('zero_invoice_net_amount', zero_invoice_net_amount, 'invoice_net_amount has a value of zero in some rows.')
    add_to_flags(6, zero_invoice_net_amount)

    # payment date less than invoice date
    payment_date_less_invoice_date = df[df['invoice_paid_date'] < df['invoice_date']]['index'].values
    payment_date_less_invoice_date = [x for x in payment_date_less_invoice_date]
    report_helper('invoice-payment-date-less-than-invoice-date', payment_date_less_invoice_date, 'invoice_paid_date has a date which is prior to invoice_date for some rows.')
    add_to_flags(7, payment_date_less_invoice_date)

    # payment date greater than due date
    payment_date_greater_due_date = df[df['invoice_paid_date'] > df['invoice_due_date']]['index'].values
    payment_date_greater_due_date = [x for x in payment_date_greater_due_date]
    report_helper('invoice-payment-date-greater-than-due-date', payment_date_greater_due_date, 'invoice_paid_date has a date which is after the invoice_due_date for some rows.')
    add_to_flags(8, payment_date_greater_due_date)

    current_date = datetime.datetime.today().strftime('%Y-%m-%d')

    # payment date greater than current date
    payment_date_greater_current_date = df[df['invoice_paid_date'] > current_date]['index'].values
    payment_date_greater_current_date = [x for x in payment_date_greater_due_date]
    report_helper('invoice-payment-date-greater-than-current-date', payment_date_greater_current_date, 'invoice_paid_date has a date which is after the current date for some rows. This is invalid.')
    add_to_flags(9, payment_date_greater_current_date)

    # due date less than invoice date
    due_date_less_invoice_date = df[df['invoice_due_date'] < df['invoice_date']]['index'].values
    due_date_less_invoice_date = [x for x in due_date_less_invoice_date]
    report_helper('invoice-due-date-less-than-invoice-date', due_date_less_invoice_date, 'invoice_due_date has a date which is prior to invoice_date for some rows. This is invalid.')
    add_to_flags(10, due_date_less_invoice_date)

    # due date greater than current date

    # invoice date greater than current date
    invoice_date_greater_current_date = df[df['invoice_date'] > current_date]['index'].values
    invoice_date_greater_current_date = [x for x in invoice_date_greater_current_date]
    report_helper('invoice-date-greater-than-current-date', invoice_date_greater_current_date, 'invoice_date has a date which is after the current date for some rows.')
    add_to_flags(11, invoice_date_greater_current_date)

    # payment date is holiday

    # payment date is a weekend

    df['flags'] = flags

    # data_set = {}
    # for col in df.columns:
    #     data_set[col] = df[col]

    # data_set = json.dumps(df)
    data_set = df.to_json(orient='records')

    report = json.dumps(report)

    return jsonify({"success": True, "report": report, "data": data_set})
