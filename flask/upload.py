from flask import Flask, Blueprint, render_template, abort, jsonify, request
import pandas as pd
import sys
import os
import psycopg2
from sqlalchemy import create_engine
sys.path.append('./flask')

upload = Blueprint('upload', __name__, template_folder='templates')

engine = create_engine('')

dataModel = [{"name": "invoice_number", "required": True, "type": "string"},
{"name": "invoice_net_amount", "required": True, "type": "number"},
{"name": "invoice_gross_amount", "required": False, "type": "number"},
{"name": "invoice_shipping_cost", "required": False, "type": "number"},
{"name": "invoice_insurance_charge", "required": False, "type": "number"},
{"name": "invoice_discounts", "required": False, "type": "number"},
{"name": "invoice_tax", "required": False, "type": "number"},
{"name": "invoice_other_charge", "required": False, "type": "number"},
{"name": "vendor_number", "required": False, "type": "string"},
{"name": "vendor_invoice_number", "required": False, "type": "string"},
{"name": "po_flag", "required": True, "type": "string"},
{"name": "po_number", "required": True, "type": "string"},
{"name": "match_type", "required": True, "type": "string"},
{"name": "invoice_date", "required": False, "type": "string"},
{"name": "invoice_due_date", "required": False, "type": "string"},
{"name": "invoice_paid_date", "required": False, "type": "string"},
{"name": "vendor_payment_terms", "required": False, "type": "string"},
{"name": "invoice_status", "required": False, "type": "string"},
{"name": "invoice_type", "required": False, "type": "string"},
{"name": "gl_account", "required": False, "type": "string"},
{"name": "company", "required": True, "type": "string"},
{"name": "business_unit", "required": False, "type": "string"},
{"name": "currency_code", "required": True, "type": "string"},
{"name": "source", "required": True, "type": "string"}
];

@upload.route('/upload', methods = ['POST', 'GET'])
def show():

    file = request.get_json()

    df = pd.read_csv(file['filePath'])
    rows = df.shape[0]

    errors = []

    columns = df.columns
    null_columns=df.columns[df.isnull().any()]

    for col in dataModel:
        if col["required"] == True and col["name"] not in columns:
            resp = {"type": "required-column-missing", "msg": "Could not find required column " + col["name"] + "."}
            errors.append(resp)
        elif col["required"] == True and col["name"] in null_columns:
            resp = {"type": "required-column-null", "msg": "Required column " + col["name"] + " has missing values."}
            errors.append(resp)

    for col in dataModel:
        if col["type"] == "string":
            try:
                df[col["name"]] = df[col["name"]].astype(str)
                if col["required"] == True and 'nan' in df[col["name"]].values:
                    resp = {"type": "required-convert-string", "msg": "Required column " + col["name"] + " got a NaN value when converting to string."}
                    errors.append(resp)
            except:
                resp = {"type": "convert-string", "msg": "Could not convert column " + col["name"] + " to string." }
                errors.append(resp)
        elif col["type"] == "number":
            try:
                df[col["name"]] = pd.to_numeric(df[col["name"]], errors='raise')
                if df[col["name"]].isnull().any() and col["required"] == True:
                    resp = {"type": "required-convert-string", "msg": "Required column " + col["name"] + " got a NaN value when converting to number."}
                    errors.append(resp)
            except:
                resp = {"type": "convert-number", "msg": "Could not convert column " + col["name"] + " to number." }
                errors.append(resp)

    if errors != []:
        response = {"success": False, "errors": errors, "msg": "File could not be uploaded. Please check error log and make ammendments before try again."}
        return jsonify(response)
    else:
        try:
            df.to_sql(file['table_ref'], engine)
        except:
            resp = {"type": "database-write-error", "msg": "Could not write to database."}
            errors.append(resp)

    if errors == []:
        response = {"success": True, "msg": "File uploaded and processed successfully.", "rows":rows}
        return jsonify(response)
    else:
        response = {"success": False, "errors": errors, "msg": "File could not be uploaded. Please check error log and make ammendments before try again."}
        return jsonify(response)
